import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { navRoutes } from "../data/site";
import { ThemeToggle } from "./ThemeToggle";
import type { Theme } from "../hooks/useTheme";

export function Nav({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onHome = pathname === "/";

  // On the homepage the nav only materialises once the hero is behind you. On
  // every other route there's no hero to sit over, so it's solid immediately.
  useMutedScrollState(scrollY, setScrolled);
  const solid = scrolled || !onHome;

  // Scroll-spy is gone: the current route says which item is active, which is
  // both cheaper and correct, since a section is now a page rather than a
  // position on one.

  return (
    <>
      {/* Targets the page's own <main>, which is the content on every route,
          rather than a section that now only exists on /about. */}
      <a
        href="#main"
        className="sr-only rounded-full bg-accent px-4 py-2 text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110]"
      >
        Skip to content
      </a>

      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
        className={`fixed inset-x-0 top-0 z-50 ${
          solid
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
            {/* The full mark, orb included. Two files rather than one recoloured
                with CSS: a filter can't turn white strokes into charcoal ones
                cleanly, and the orb is a full-colour render that any filter
                would wreck. Both are emitted into the same box, so the mark
                doesn't shift or resize when the theme toggles.

                Sized for the orb to read rather than to disguise how detached it
                sits from the strokes. Without a wordmark beside it there's room,
                and the orb carries the only colour in the mark. */}
            <img
              src={theme === "dark" ? "/brand/mark-dark.webp" : "/brand/mark-light.webp"}
              srcSet={
                theme === "dark"
                  ? "/brand/mark-dark.webp 1x, /brand/mark-dark@2x.webp 2x"
                  : "/brand/mark-light.webp 1x, /brand/mark-light@2x.webp 2x"
              }
              width={50}
              height={44}
              alt=""
              decoding="async"
              className="h-10 w-auto md:h-11"
            />
          </button>

          {/* gap-5 at md, widening at lg: eight destinations is a lot to fit
              between the logo and the theme toggle on a narrow laptop. */}
          <ul className="hidden items-center gap-5 md:flex lg:gap-7">
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
                {navRoutes.map((route, index) => (
                  <motion.li
                    key={route.path}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * index, duration: 0.3 }}
                  >
                    <Link
                      to={route.path}
                      onClick={() => setMenuOpen(false)}
                      aria-current={pathname === route.path ? "page" : undefined}
                      className="block w-full border-b border-line py-3.5 text-left font-display text-lg text-ink aria-[current=page]:text-accent"
                    >
                      <span className="mr-3 font-mono text-xs text-accent">
                        {String(index + 1).padStart(2, "0")}
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
