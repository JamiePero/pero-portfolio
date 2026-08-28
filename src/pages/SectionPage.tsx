import type { ReactNode } from "react";

/**
 * Wrapper for the pages that were sections of the old single scroll page.
 *
 * The section components already carry their own vertical rhythm and heading,
 * so this adds only what being a standalone page requires: clearance for the
 * fixed nav.
 *
 * Titles and descriptions used to be set here per page. They now come from
 * usePageMeta in the shell, which reads the same page-meta.json the build-time
 * prerender uses, so a route cannot end up with one title in the DOM and a
 * different one in the HTML a crawler is served.
 */
export function SectionPage({ children }: { children: ReactNode }) {
  // pt-16 clears the fixed nav; the sections supply the rest of the spacing.
  return <div className="pt-16 md:pt-20">{children}</div>;
}
