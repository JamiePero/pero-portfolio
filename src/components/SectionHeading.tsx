import { Reveal, RevealWords } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
}) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col ${alignment}`}>
      <Reveal>
        <span className="eyebrow flex items-center gap-3">
          <span aria-hidden className="inline-block h-px w-8 bg-accent" />
          {eyebrow}
        </span>
      </Reveal>

      <RevealWords
        as="h2"
        text={title}
        delay={0.08}
        className="mt-5 max-w-[18ch] text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl"
      />

      {lead ? (
        <RevealWords
          text={lead}
          stagger={0.012}
          delay={0.2}
          className="mt-6 max-w-[58ch] text-base leading-relaxed text-muted sm:text-lg"
        />
      ) : null}
    </div>
  );
}
