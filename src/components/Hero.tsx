import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { heroRoles, site } from "../data/site";
import { scrollToSection } from "../hooks/useSmoothScroll";
import { MagneticButton } from "./MagneticButton";
import { ScrambleText } from "./ScrambleText";
import { HeroBlobFallback } from "./HeroBlobFallback";

// three + R3F + drei is the heaviest thing on the site and the ribbon is purely
// decorative, so it must never block first paint.
const HeroRibbon = lazy(() => import("./HeroRibbon"));

const NAME = "Pero".split("");
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Decides whether this device should attempt the real-time glass blob.
 *
 * A transmission material renders the scene into an offscreen buffer every
 * frame, so it's genuinely expensive — this refuses on anything that looks
 * likely to struggle rather than shipping a stuttering hero.
 */
function canRenderGlass(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

  // Coarse pointer on a small screen: phone. The CSS fallback looks close
  // enough at that size and costs nothing.
  const isPhone =
    window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 900;
  if (isPhone) return false;

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof memory === "number" && memory < 4) return false;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return false;

  // Confirm WebGL actually works before loading ~200 kB of renderer.
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    return Boolean(gl);
  } catch {
    return false;
  }
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [useGlass, setUseGlass] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const blobY = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);

  useEffect(() => {
    if (!canRenderGlass()) return;
    // Wait for idle so the text has painted before the renderer loads.
    const mount = () => setUseGlass(true);
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(mount, { timeout: 2500 });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = window.setTimeout(mount, 1200);
    return () => window.clearTimeout(handle);
  }, []);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-24 pb-16"
    >
      {/* Ambient glow, colour-matched to the visual and sitting behind it.
          The main lobe is centred on mobile — anchored right at a 44rem radius
          it fell almost entirely outside a 375px viewport, so most of the
          ambient colour was off-screen. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-30">
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-[0.22] blur-[130px] lg:left-auto lg:right-[2%] lg:h-[44rem] lg:w-[44rem] lg:translate-x-0 lg:opacity-[0.16] lg:blur-[150px]" />
        <div className="absolute right-[4%] top-[18%] h-64 w-64 rounded-full bg-accent2 opacity-[0.18] blur-[110px] lg:right-[18%] lg:top-[22%] lg:h-72 lg:w-72 lg:opacity-[0.13] lg:blur-[120px]" />
        <div className="absolute bottom-[10%] left-[2%] h-56 w-56 rounded-full bg-accent opacity-[0.12] blur-[110px] lg:bottom-[12%] lg:left-[4%] lg:h-72 lg:w-72 lg:opacity-[0.07] lg:blur-[130px]" />
      </div>

      {/* Thin diagonal arcs — depth without distraction, per the reference */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        fill="none"
      >
        <path d="M-100 720 C 380 640, 760 400, 1540 60" stroke="currentColor" strokeWidth="1" className="text-ink opacity-[0.07]" />
        <path d="M-100 830 C 420 760, 880 520, 1540 200" stroke="currentColor" strokeWidth="1" className="text-ink opacity-[0.05]" />
        <path d="M980 -80 C 1080 260, 1220 480, 1560 700" stroke="currentColor" strokeWidth="1" className="text-accent opacity-[0.12]" />
      </svg>

      {/* Blob. Beside the copy from lg; behind it, dimmed, on smaller screens
          so the hero still has the glass character without pushing content down. */}
      {/* On mobile the copy fills roughly 24%–80% of the section, so there's no
          clear area to move this into — it stays full-bleed behind the text and
          is simply allowed to be visible. It used to sit at 40% opacity under a
          near-opaque scrim, which between them wiped it out entirely. */}
      <motion.div
        aria-hidden
        style={reduced ? undefined : { y: blobY }}
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full scale-125 opacity-80 sm:scale-110 sm:opacity-90 lg:left-auto lg:w-[56%] lg:scale-100 lg:opacity-100"
      >
        <div className="h-full w-full">
          {useGlass ? (
            <Suspense fallback={<HeroBlobFallback animated={!reduced} />}>
              <HeroRibbon />
            </Suspense>
          ) : (
            <HeroBlobFallback animated={!reduced} />
          )}
        </div>
      </motion.div>

      {/* Scrim: keeps the headline legible where it crosses the visual.
          Mobile runs a soft vertical veil at partial strength — the copy sits
          top-to-middle there, so knocking back the top is enough and the lower
          half stays clear. The diagonal version only makes sense at lg, where
          the visual is in its own right-hand column. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5] bg-[linear-gradient(180deg,var(--bg)_0%,transparent_88%)] opacity-75 lg:bg-[linear-gradient(100deg,var(--bg)_38%,transparent_62%)] lg:opacity-100"
      />

      <motion.div
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
        className="section-shell relative z-10"
      >
        <div className="max-w-[38rem] lg:max-w-[54%]">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="eyebrow flex items-center gap-3 !text-[0.8rem] sm:!text-sm"
          >
            <span aria-hidden className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Based in {site.location} — open for work
          </motion.p>

          {/* Kinetic name: letters rise out of a clipped mask, one after another */}
          <h1 className="mt-7 flex font-display text-[clamp(4.75rem,13.5vw,11rem)] font-bold leading-[0.82] tracking-[-0.05em]">
            <span className="sr-only">{site.name}</span>
            {NAME.map((letter, index) => (
              <span key={index} aria-hidden className="overflow-hidden pb-[0.08em]">
                <motion.span
                  className="inline-block"
                  initial={{ y: "110%", rotate: 8 }}
                  animate={{ y: "0%", rotate: 0 }}
                  transition={{ duration: 0.9, delay: 0.25 + index * 0.07, ease: EASE }}
                >
                  {letter}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: EASE }}
            className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xl sm:text-2xl md:text-3xl"
          >
            <span className="text-muted">I build as a</span>
            <ScrambleText words={heroRoles} className="font-semibold text-accent" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.78, ease: EASE }}
            className="mt-8 max-w-[42ch] text-lg leading-relaxed text-muted sm:text-xl"
          >
            Hardware, software, design — I don't pick a lane. I model it, brand it,
            wire it up and ship it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
            className="mt-11 flex flex-wrap items-center gap-3.5"
          >
            <MagneticButton
              onClick={() => scrollToSection("work")}
              className="px-8 py-4 text-base"
            >
              View Work
              <ArrowIcon />
            </MagneticButton>
            <MagneticButton
              variant="outline"
              onClick={() => scrollToSection("contact")}
              className="px-8 py-4 text-base"
            >
              Get in Touch
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      <motion.button
        type="button"
        onClick={() => scrollToSection("about")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        aria-label="Scroll to about section"
        className="absolute bottom-7 left-5 z-10 hidden flex-col items-center gap-2 text-muted transition-colors duration-300 hover:text-accent md:left-10 lg:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]">Scroll</span>
        <motion.span
          animate={reduced ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="block h-8 w-px bg-current opacity-50"
        />
      </motion.button>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}
