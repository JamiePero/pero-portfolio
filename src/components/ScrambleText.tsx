import { useEffect, useRef, useState } from "react";

/**
 * Letters and digits only, deliberately. An earlier set included brackets and
 * punctuation, which rendered mid-transition as things like "!}?PO!BY*" — that
 * reads as corrupted text rather than as an effect, and it's the first thing a
 * visitor sees.
 */
/**
 * Lowercase and digits, no capitals.
 *
 * The roles being cycled are Title Case, so a capital landing mid-word made a
 * half-resolved word read as corrupted text rather than as an effect:
 * "Hardware Tinkerer" passing through "Hardware TinkVUFA" looks like a
 * rendering fault. Lowercase glyphs preserve the word's shape while it settles.
 */
const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789";

/** Scramble steps per second. Independent of the display's frame rate. */
const TICK_HZ = 30;

/**
 * Hard ceiling on a single transition. If frames are being starved badly enough
 * that the schedule hasn't finished by now, snap to the target rather than leave
 * a garbled word on screen.
 */
const MAX_TRANSITION_MS = 1600;

/**
 * Cycles a list of words, resolving each one character-by-character out of
 * random glyphs. Nods at the "hardware tinkerer" side of the brand without
 * being a novelty font.
 *
 * Reduced motion gets a plain cross-fade of the same words instead.
 */
export function ScrambleText({
  words,
  holdMs = 2200,
  className = "",
}: {
  words: readonly string[];
  holdMs?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(words[0]);
  const indexRef = useRef(0);
  const frameRef = useRef(0);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      const interval = window.setInterval(() => {
        indexRef.current = (indexRef.current + 1) % words.length;
        setDisplay(words[indexRef.current]);
      }, holdMs + 600);
      return () => window.clearInterval(interval);
    }

    let cancelled = false;

    function scrambleTo(target: string) {
      const from = words[indexRef.current];
      const length = Math.max(from.length, target.length);

      // Windows are in ticks (1/30s), not frames. Each character gets its own
      // reveal window so the word resolves left-to-right with a ragged edge
      // rather than all at once. The longest role settles around 0.95s.
      const schedule = Array.from({ length }, (_, i) => ({
        start: i * 0.9 + Math.random() * 3,
        end: i * 0.9 + 7 + Math.random() * 7,
      }));

      const startedAt = performance.now();
      let lastWholeTick = -1;

      const settle = () => {
        setDisplay(target);
        timeoutRef.current = window.setTimeout(next, holdMs);
      };

      const render = (now?: number) => {
        if (cancelled) return;

        // Elapsed time drives the animation, not the frame count. Previously
        // `tick++` per frame meant a device rendering at 20fps stretched the
        // same transition from under a second to nearly three, so a phone under
        // load sat on scrambled glyphs long enough to look broken.
        const elapsed = (now ?? performance.now()) - startedAt;

        if (elapsed > MAX_TRANSITION_MS) {
          settle();
          return;
        }

        const tick = (elapsed / 1000) * TICK_HZ;
        const wholeTick = Math.floor(tick);

        // Skip repaint work when the tick hasn't advanced. At 60fps this halves
        // the React renders, which matters most on the slow devices where the
        // effect was worst.
        if (wholeTick === lastWholeTick) {
          frameRef.current = requestAnimationFrame(render);
          return;
        }
        lastWholeTick = wholeTick;

        let output = "";
        let settled = 0;

        for (let i = 0; i < length; i++) {
          const char = target[i] ?? "";
          const { start, end } = schedule[i];

          if (tick >= end) {
            output += char;
            settled++;
          } else if (tick >= start) {
            // Only scramble positions the target actually reaches. Going from a
            // longer word to a shorter one, the tail positions have nothing to
            // resolve to, and glyphing them parks visible junk past the end of
            // the word.
            output += char ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : "";
          } else {
            output += from[i] ?? "";
          }
        }

        setDisplay(output);

        if (settled === length) {
          timeoutRef.current = window.setTimeout(next, holdMs);
          return;
        }

        frameRef.current = requestAnimationFrame(render);
      };

      render();
    }

    function next() {
      const nextIndex = (indexRef.current + 1) % words.length;
      const target = words[nextIndex];
      scrambleTo(target);
      indexRef.current = nextIndex;
    }

    timeoutRef.current = window.setTimeout(next, holdMs);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRef.current);
      window.clearTimeout(timeoutRef.current);
    };
  }, [words, holdMs]);

  return (
    <span className={className}>
      {/* Screen readers get the stable list, not the scrambling glyphs. */}
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden className="font-mono">
        {display}
      </span>
    </span>
  );
}
