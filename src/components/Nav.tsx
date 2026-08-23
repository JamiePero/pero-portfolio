import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { navSections, site } from "../data/site";
import { scrollToSection } from "../hooks/useSmoothScroll";
import { useActiveSection } from "../hooks/useActiveSection";
import { ThemeToggle } from "./ThemeToggle";
import type { Theme } from "../hooks/useTheme";

const sectionIds = navSections.map((section) => section.id);

export function Nav({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const active = useActiveSection(sectionIds);

  // The nav only materialises once the hero is behind you.
  useMutedScrollState(scrollY, setScrolled);

  function goTo(id: string) {
    setMenuOpen(false);
    scrollToSection(id);
  }

  return (
    <>
      <a
        href="#about"
        onClick={(event) => {
          event.preventDefault();
          goTo("about");
        }}
        className="sr-only rounded-full bg-accent px-4 py-2 text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110]"
      >
        Skip to content
      </a>

      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
        className={`fixed inset-x-0 top-0 z-50 ${
          scrolled
            ? "border-b border-line bg-bg/80 backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className="section-shell flex h-16 items-center justify-between gap-4 md:h-[72px]"
        >
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            data-cursor="hover"
            className="group flex items-center gap-2 font-display text-lg font-semibold tracking-tight"
            aria-label="Back to top"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-accent font-mono text-xs font-bold text-on-accent">
              P
            </span>
            <span className="hidden sm:inline">{site.name}</span>
          </button>

          <ul className="hidden items-center gap-8 md:flex">
            {navSections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => goTo(section.id)}
                  data-active={active === section.id}
                  data-cursor="hover"
                  className="link-underline text-sm text-muted transition-colors duration-300 hover:text-ink data-[active=true]:text-ink"
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink md:hidden"
            >
              <span className="relative block h-3 w-4">
                <motion.span
                  animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute left-0 top-0 block h-px w-4 bg-current"
                />
                <motion.span
                  animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-1.5 block h-px w-4 bg-current"
                />
                <motion.span
                  animate={menuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute left-0 top-3 block h-px w-4 bg-current"
                />
              </span>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              id="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-line bg-bg/95 backdrop-blur-xl md:hidden"
            >
              <ul className="section-shell flex flex-col py-4">
                {navSections.map((section, index) => (
                  <motion.li
                    key={section.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * index, duration: 0.3 }}
                  >
                    <button
                      type="button"
                      onClick={() => goTo(section.id)}
                      className="w-full border-b border-line py-3.5 text-left font-display text-lg text-ink"
                    >
                      <span className="mr-3 font-mono text-xs text-accent">
                        0{index + 1}
                      </span>
                      {section.label}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.header>
    </>
  );
}

/** Flips the scrolled flag once past ~70vh, with hysteresis to avoid flicker. */
function useMutedScrollState(
  scrollY: ReturnType<typeof useScroll>["scrollY"],
  setScrolled: (value: boolean) => void,
) {
  useMotionValueEvent(scrollY, "change", (latest) => {
    const threshold = window.innerHeight * 0.7;
    setScrolled(latest > threshold);
  });
}
