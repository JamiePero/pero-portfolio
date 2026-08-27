import { useEffect, useRef, useState } from "react";

/**
 * Custom cursor: a dot that tracks exactly, plus a lagging ring that expands
 * over anything interactive.
 *
 * Deliberately free of React state and of any JS animation loop.
 *
 * The earlier version drove both elements through Framer Motion — a motion
 * value for the dot and a spring for the ring. Both are flushed inside Framer's
 * requestAnimationFrame loop, which the hero's transmission material starves:
 * the 3D scene re-renders itself into an offscreen buffer every frame, the rAF
 * queue runs late, and the cursor visibly trails the pointer over the hero
 * while tracking fine everywhere else.
 *
 * So: the dot's transform is written synchronously in the pointermove handler,
 * and the ring gets the same transform with a CSS transition. Transitions are
 * driven by the compositor, so the ring keeps its smooth trail without
 * depending on a main-thread frame loop at all.
 *
 * Only mounts on devices with a fine pointer and motion enabled.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // `(pointer: fine)` on its own is not enough. Plenty of Android and hybrid
    // devices report a fine pointer, for a stylus or a paired mouse or for no
    // good reason at all, and then the custom cursor mounts on a phone.
    // `(hover: hover)` is the honest test: a touchscreen can point precisely but
    // it cannot hover, so requiring both keeps this off touch devices.
    const pointerDevice = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (pointerDevice && !reduced) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.body.dataset.customCursor = "true";

    let visible = false;
    let hovering = false;
    // Cached so the ancestor walk below can be skipped while the pointer stays
    // within one element.
    let lastTarget: Element | null = null;

    const HOVER_SELECTOR = 'a, button, input, textarea, select, [data-cursor="hover"]';

    const onMove = (event: PointerEvent) => {
      // A tap fires pointermove with pointerType "touch". Without this check
      // that reveals the cursor and parks it at the tap coordinates, and because
      // pointerleave never fires for touch it then stays there for good. That's
      // the "stray dot": not an artefact, but the cursor stranded wherever the
      // screen was last touched, which is why it turned up in a new place each
      // time. Only a real mouse drives it.
      if (event.pointerType !== "mouse") return;

      const transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
      dot.style.transform = transform;
      ring.style.transform = transform;

      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "";
      }

      // closest() walks the ancestor chain against a compound selector. Running
      // it on every pointermove was pure waste — the pointer spends most of its
      // time inside the same element, so only re-test when the target changes.
      const target = event.target as Element | null;
      if (target !== lastTarget) {
        lastTarget = target;
        const next = Boolean(target?.closest(HOVER_SELECTOR));
        if (next !== hovering) {
          hovering = next;
          const value = next ? "true" : "false";
          dot.dataset.hover = value;
          ring.dataset.hover = value;
        }
      }
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    // Belt and braces on a hybrid device: if someone with a mouse attached also
    // touches the screen, retire the cursor rather than leaving it behind at the
    // mouse's last position.
    window.addEventListener("touchstart", onLeave, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("touchstart", onLeave);
      delete document.body.dataset.customCursor;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      {/* Exact tracking: no transition on transform, so it pins to the pointer. */}
      <div
        ref={dotRef}
        data-hover="false"
        style={{ transform: "translate3d(-100px, -100px, 0)", opacity: 0 }}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-accent transition-[opacity,scale] duration-200 data-[hover=true]:scale-0"
      />
      {/* The trail. transform is transitioned, so the compositor animates it and
          main-thread load can't make it stutter. */}
      <div
        ref={ringRef}
        data-hover="false"
        style={{ transform: "translate3d(-100px, -100px, 0)", opacity: 0 }}
        className="absolute left-0 top-0 h-[26px] w-[26px] rounded-full border border-accent opacity-45 transition-[transform,width,height,opacity,background-color] duration-200 ease-out data-[hover=true]:h-11 data-[hover=true]:w-11 data-[hover=true]:bg-[var(--glow)] data-[hover=true]:opacity-100"
      />
    </div>
  );
}
