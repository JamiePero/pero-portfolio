import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

let lenisInstance: Lenis | null = null;

/** Height of the sticky nav, so a section doesn't land underneath it. */
const NAV_OFFSET = 72;

/**
 * Scrolls to a section by id. Uses Lenis when it's running so anchor jumps get
 * the same easing as manual scrolling, and falls back to native otherwise.
 */
export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  const startY = window.scrollY;
  const alreadyThere = Math.abs(startY - top) < 8;

  if (!lenisInstance) {
    window.scrollTo({ top, behavior: "smooth" });
    return;
  }

  lenisInstance.scrollTo(top, { duration: 1.2 });

  // Lenis animates on a requestAnimationFrame loop, and it also suppresses
  // native smooth scrolling while active. If that loop isn't ticking — a
  // backgrounded or throttled tab — scrollTo silently does nothing and the nav
  // appears dead. Check that we've actually started moving, and fall back if not.
  if (alreadyThere) return;
  window.setTimeout(() => {
    if (window.scrollY === startY) {
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, 180);
}

export function useSmoothScroll() {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Native touch scrolling feels better than a hijacked one on mobile.
      syncTouch: false,
    });
    lenisInstance = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}
