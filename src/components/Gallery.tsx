import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { curlsCaseStudy, galleryPieces, type GalleryPiece } from "../data/gallery";
import { GalleryLightbox } from "./GalleryLightbox";
import { Placeholder } from "./Placeholder";
import { Reveal, RevealWords } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="gallery" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="03 / Design"
          title="Renders, marks and packaging."
          lead="The visual half of the work. 3D product modelling, identity systems, and packaging taken all the way through to production artwork."
        />

        {/* 4C_Curls_22 gets a framed intro — it's a full brand build, not a one-off. */}
        <Reveal delay={0.1}>
          <div className="mt-14 rounded-2xl border border-line bg-elevated p-7 md:p-10">
            <span className="eyebrow">{curlsCaseStudy.kicker}</span>
            <RevealWords
              as="h3"
              text={curlsCaseStudy.title}
              delay={0.05}
              className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl"
            />
            <RevealWords
              text={curlsCaseStudy.blurb}
              stagger={0.012}
              delay={0.1}
              className="mt-4 max-w-[62ch] text-base leading-relaxed text-muted"
            />
            <ul className="mt-6 flex flex-wrap gap-2">
              {curlsCaseStudy.tools.map((tool) => (
                <li
                  key={tool}
                  className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-[11px] text-muted"
                >
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* CSS columns give a true masonry flow without a layout library. */}
        <div className="mt-10 gap-5 [column-count:1] sm:[column-count:2] lg:[column-count:3]">
          {galleryPieces.map((piece, index) => (
            <GalleryCard
              key={piece.id}
              piece={piece}
              index={index}
              onOpen={() => setActiveIndex(index)}
            />
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-muted opacity-60">
            {/* TODO: Pero to drop real assets into /public/gallery/ and set `src` in src/data/gallery.ts */}
            Gallery artwork pending upload
          </p>
        </Reveal>
      </div>

      <GalleryLightbox
        pieces={galleryPieces}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </section>
  );
}

function GalleryCard({
  piece,
  index,
  onOpen,
}: {
  piece: GalleryPiece;
  index: number;
  onOpen: () => void;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 24 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.07, 0.4), ease: [0.22, 1, 0.36, 1] }}
      className="mb-5 break-inside-avoid"
    >
      <button
        type="button"
        onClick={onOpen}
        data-cursor="hover"
        aria-label={`View ${piece.title} full size`}
        className="group block w-full text-left"
      >
        <div className="relative overflow-hidden rounded-xl">
          {piece.src ? (
            <img
              src={piece.src}
              alt={piece.alt}
              loading="lazy"
              decoding="async"
              className="w-full rounded-xl border border-line object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <Placeholder
              label={piece.alt}
              aspect={piece.aspect}
              className="transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          )}

          {/* Expand affordance, revealed on hover/focus */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-3 top-3 grid h-8 w-8 translate-y-1 place-items-center rounded-full border border-line-strong bg-bg/70 opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 text-ink"
            >
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </span>

          {piece.featured ? (
            <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-on-accent">
              Featured
            </span>
          ) : null}
        </div>

        <h3 className="mt-3 text-sm font-medium text-ink transition-colors group-hover:text-accent">
          {piece.title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">{piece.caption}</p>
        <p className="mt-1.5 font-mono text-[10px] text-muted opacity-70">
          {piece.tools.join(" · ")}
        </p>
      </button>
    </motion.div>
  );
}
