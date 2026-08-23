import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/\\[]{}*#%$@!?01";

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
      // Each character gets its own reveal window so the word resolves
      // left-to-right with a ragged edge rather than all at once.
      const schedule = Array.from({ length }, (_, i) => ({
        start: i * 2 + Math.floor(Math.random() * 6),
        end: i * 2 + 14 + Math.floor(Math.random() * 14),
      }));

      let tick = 0;

      const render = () => {
        if (cancelled) return;
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
            // the word — "3D Modeler" rendering as "3D ModelerG" for a good ten
            // frames after it otherwise looks finished.
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

        tick++;
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
