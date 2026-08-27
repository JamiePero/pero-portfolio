import { useEffect, type ReactNode } from "react";
import { site } from "../data/site";

/**
 * Wrapper for the pages that were sections of the old single scroll page.
 *
 * The section components already carry their own vertical rhythm and heading,
 * so this adds only what being a standalone page requires: clearance for the
 * fixed nav, and a page-specific title and description.
 *
 * Titles and descriptions are set imperatively rather than through a head
 * library. This is a static SPA with no SSR, so nothing is prerendered either
 * way; this keeps it to a few lines with no extra dependency.
 */
export function SectionPage({
  title,
  description,
  children,
}: {
  /** Page-specific part of the title, before the site name. */
  title: string;
  description: string;
  children: ReactNode;
}) {
  useEffect(() => {
    document.title = `${title} | ${site.name}`;

    const meta = document.querySelector('meta[name="description"]');
    const previous = meta?.getAttribute("content") ?? null;
    meta?.setAttribute("content", description);

    // Restore on unmount so a page doesn't leave its description behind on the
    // next route.
    return () => {
      if (meta && previous !== null) meta.setAttribute("content", previous);
    };
  }, [title, description]);

  // pt-16 clears the fixed nav; the sections supply the rest of the spacing.
  return <div className="pt-16 md:pt-20">{children}</div>;
}
