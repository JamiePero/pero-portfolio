import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost";

const variantClasses: Record<Variant, string> = {
  // The gradient CTA. `.gradient-button` supplies the background, the masked
  // gradient border and the hover animation; the pill geometry stays here, and
  // ::before picks it up via border-radius: inherit.
  //
  // Note there's deliberately no `transition-colors` on this variant. Tailwind
  // utilities sit in a later cascade layer than the components layer, so a
  // transition utility here would replace .gradient-button's own transition of
  // the --pos/--color/--stop properties and freeze the animation.
  solid: "gradient-button text-white",
  outline:
    "border border-line-strong text-ink transition-colors duration-300 hover:border-accent hover:text-accent",
  ghost:
    "border border-transparent text-muted transition-colors duration-300 hover:text-ink",
};

/**
 * Button that drifts toward the cursor while hovered. Pure decoration, so it
 * degrades to a plain button under reduced-motion or on touch (no pointer
 * events to drive it there anyway).
 */
export function MagneticButton({
  children,
  onClick,
  href,
  type = "button",
  disabled = false,
  variant = "solid",
  className = "",
  strength = 0.28,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: Variant;
  className?: string;
  strength?: number;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });

  function handleMove(event: MouseEvent) {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  // cn (twMerge), not string concatenation: a caller passing `text-base` or
  // `px-8` needs it to actually replace the defaults below. Raw concatenation
  // leaves both classes in the list and lets Tailwind's generated order decide,
  // which silently ignored caller overrides.
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-tight disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    className,
  );

  const motionProps = {
    style: reduced ? undefined : { x: springX, y: springY },
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    whileTap: reduced ? undefined : { scale: 0.96 },
    "data-cursor": "hover" as const,
    className: classes,
  };

  if (href) {
    return (
      <motion.a
        {...motionProps}
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        aria-label={ariaLabel}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      {...motionProps}
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  );
}
