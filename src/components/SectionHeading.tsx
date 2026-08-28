import { RevealWords } from "./Reveal";

/**
 * The heading block every page opens with.
 *
 * There used to be a numbered label above the title, "01 / About" and so on. It
 * made sense when these were sections of one scrolling page and the number told
 * you where you were in a sequence. Now that each is its own route the nav
 * already marks the current page, so the label was the same information twice.
 * Removed from the component rather than from each caller, so a page can't
 * reintroduce one.
 */
export function SectionHeading({
  title,
  lead,
  align = "left",
  as = "h1",
}: {
  title: string;
  lead?: string;
  align?: "left" | "center";
  /**
   * h1 by default. These were sections of one scrolling page, where h2 under
   * the hero's h1 was right. Each is now its own route and this is the only
   * top-level heading on it, so every page except the homepage was shipping
   * without an h1 at all. Override for a genuine sub-heading.
   */
  as?: "h1" | "h2";
}) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col ${alignment}`}>
      <RevealWords
        as={as}
        text={title}
        className="max-w-[18ch] text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl"
      />

      {lead ? (
        <RevealWords
          text={lead}
          stagger={0.012}
          delay={0.12}
          className="mt-6 max-w-[58ch] text-base leading-relaxed text-muted sm:text-lg"
        />
      ) : null}
    </div>
  );
}
