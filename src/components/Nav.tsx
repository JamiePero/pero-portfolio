import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { navRoutes, navSections, site } from "../data/site";
import { scrollToSection } from "../hooks/useSmoothScroll";
import { useActiveSection } from "../hooks/useActiveSection";
import { ThemeToggle } from "./ThemeToggle";
import type { Theme } from "../hooks/useTheme";

const sectionIds = navSections.map((section) => section.id);
// Module-level constant, not an inline []: useActiveSection keys its effect on
// the array identity, so a fresh literal each render would tear down and rebuild
// the IntersectionObserver every time.
const NO_SECTIONS: readonly string[] = [];

export function Nav({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onHome = pathname === "/";
  // Scroll-spy is meaningless off the main page, so don't run it there.
  const active = useActiveSection(onHome ? sectionIds : NO_SECTIONS);

  // The nav only materialises once the hero is behind you.
  useMutedScrollState(scrollY, setScrolled);

  /**
   * Section links have to work from anywhere. On the main page that's a scroll;
   * from another route it's a navigation to `/#id`, and HomePage scrolls once
   * the sections have laid out.
   */
  function goTo(id: string) {
    setMenuOpen(false);
    if (onHome) {
      scrollToSection(id);
    } else {
      navigate(`/#${id}`);
    }
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
            onClick={() => {
              setMenuOpen(false);
              // On a subpage the logo is a way home, not a scroll control.
              if (onHome) window.scrollTo({ top: 0, behavior: "smooth" });
              else navigate("/");
            }}
            data-cursor="hover"
            className="group flex items-center gap-2 font-display text-lg font-semibold tracking-tight"
            aria-label={onHome ? "Back to top" : "Back to home"}
          >
            {/* Two files rather than one recoloured with CSS: the mark's accent
                sphere is a full-colour render, so a filter would wreck it. Both
                are padded to the same box, so the swap doesn't shift the layout. */}
            <img
              src={theme === "dark" ? "/brand/mark-dark.webp" : "/brand/mark-light.webp"}
              srcSet={
                theme === "dark"
                  ? "/brand/mark-dark.webp 1x, /brand/mark-dark@2x.webp 2x"
                  : "/brand/mark-light.webp 1x, /brand/mark-light@2x.webp 2x"
              }
              width={41}
              height={36}
              alt=""
              decoding="async"
              className="h-9 w-auto"
            />
            <span className="hidden sm:inline">{site.name}</span>
          </button>

          <ul className="hidden items-center gap-7 md:flex">
            {navSections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => goTo(section.id)}
                  data-active={onHome && active === section.id}
                  data-cursor="hover"
                  className="link-underline text-sm text-muted transition-colors duration-300 hover:text-ink data-[active=true]:text-ink"
                >
                  {section.label}
                </button>
              </li>
            ))}
            {navRoutes.map((route) => (
              <li key={route.path}>
                <Link
                  to={route.path}
                  onClick={() => setMenuOpen(false)}
                  data-active={pathname === route.path}
                  data-cursor="hover"
                  className="link-underline text-sm text-muted transition-colors duration-300 hover:text-ink data-[active=true]:text-ink"
                >
                  {route.label}
                </Link>
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
                {navRoutes.map((route, index) => (
                  <motion.li
                    key={route.path}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.04 * (navSections.length + index),
                      duration: 0.3,
                    }}
                  >
                    <Link
                      to={route.path}
                      onClick={() => setMenuOpen(false)}
                      className="block w-full border-b border-line py-3.5 text-left font-display text-lg text-ink"
                    >
                      <span className="mr-3 font-mono text-xs text-accent">
                        0{navSections.length + index + 1}
                      </span>
                      {route.label}
                    </Link>
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
