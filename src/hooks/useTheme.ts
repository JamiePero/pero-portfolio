import { useCallback, useLayoutEffect, useState } from "react";
import { flushSync } from "react-dom";

export type Theme = "dark" | "light";

const STORAGE_KEY = "pero-theme";

/** Mirrors the pre-paint script in index.html so the two can't drift. */
function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  // No stored choice: dark is the brand default, but respect an explicit
  // system preference for light.
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  // Layout effect, not a passive one: the flushSync below relies on the class
  // landing on <html> synchronously inside the view-transition callback.
  useLayoutEffect(() => {
    const root = document.documentElement;

    // Suppress transitions while the tokens change — see the .theme-switching
    // note in index.css. Without this, every element with `transition-colors`
    // stays locked to the previous theme's colours.
    root.classList.add("theme-switching");
    root.classList.toggle("light", theme === "light");
    root.style.colorScheme = theme;
    // Force a style/layout flush so the new colours are committed while
    // transitions are still off.
    void root.offsetHeight;

    const restore = window.setTimeout(() => root.classList.remove("theme-switching"), 60);
    return () => window.clearTimeout(restore);
  }, [theme]);

  useLayoutEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme);
    // Escape hatch for any non-React consumer that needs to react to the theme.
    window.dispatchEvent(new CustomEvent<Theme>("pero:themechange", { detail: theme }));
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // A plain CSS transition can't do this job: Chromium won't re-run a
    // transition on a property whose value is var(--token) when only the token
    // changes, so the page ends up half-themed. A view transition cross-fades a
    // snapshot of the entire page instead, which is both correct and smoother.
    if (reduced || !document.startViewTransition) {
      setThemeState(next);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => setThemeState(next));
    });
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggle };
}
