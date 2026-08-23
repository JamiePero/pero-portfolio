import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useSpring, useTransform, useReducedMotion, type SpringOptions } from "framer-motion";
import { cn } from "@/lib/utils";

type SpotlightProps = {
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
};

/**
 * Cursor-tracking spotlight. Attaches itself to its parent element, so drop it
 * inside any `relative` container and it lights that container on hover.
 *
 * Adapted from ibelick/spotlight with two changes: the listener cleanup is
 * fixed (the original passed fresh arrow functions to removeEventListener, so
 * the enter/leave handlers were never actually detached), and it opts out under
 * prefers-reduced-motion.
 */
export function Spotlight({
  className,
  size = 200,
  springOptions = { bounce: 0 },
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`);

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;
    // The spotlight is absolutely positioned against this parent.
    parent.style.position = "relative";
    parent.style.overflow = "hidden";
    setParentElement(parent);
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!parentElement) return;
      const { left, top } = parentElement.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
    },
    [mouseX, mouseY, parentElement],
  );

  useEffect(() => {
    if (!parentElement || reduced) return;

    // Named handlers so cleanup can actually remove them.
    const onEnter = () => setIsHovered(true);
    const onLeave = () => setIsHovered(false);

    parentElement.addEventListener("mousemove", handleMouseMove);
    parentElement.addEventListener("mouseenter", onEnter);
    parentElement.addEventListener("mouseleave", onLeave);

    return () => {
      parentElement.removeEventListener("mousemove", handleMouseMove);
      parentElement.removeEventListener("mouseenter", onEnter);
      parentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [parentElement, handleMouseMove, reduced]);

  if (reduced) return null;

  return (
    <motion.div
      ref={containerRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-20 rounded-full blur-2xl transition-opacity duration-300",
        "bg-[radial-gradient(circle_at_center,var(--spotlight-color),transparent_72%)]",
        isHovered ? "opacity-100" : "opacity-0",
        className,
      )}
      style={{
        width: size,
        height: size,
        left: spotlightLeft,
        top: spotlightTop,
      }}
    />
  );
}
