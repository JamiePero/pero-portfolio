import { motion, useReducedMotion } from "framer-motion";
import { clientSites, type ClientSite } from "../data/clients";
import { Placeholder } from "./Placeholder";
import { Reveal, RevealWords } from "./Reveal";

/**
 * Client site builds, sitting under the flagship case studies.
 *
 * Deliberately lighter than a case study: a preview, a name, a line, and a way
 * out to the live site. These were paid builds rather than products I own, so
 * there's no problem/solution narrative to tell and pretending otherwise would
 * pad the page.
 */
export function ClientSites() {
  return (
    <div className="mt-24 border-t border-line pt-16 md:mt-32 md:pt-24">
      <RevealWords
        as="h3"
        text="Sites I've built for clients."
        className="max-w-[20ch] font-display text-3xl font-semibold leading-[1.1] sm:text-4xl"
      />
      <RevealWords
        text="Freelance work, mostly for small businesses that needed a site that brings in enquiries rather than one that just exists. This is the web development side of what I do."
        stagger={0.012}
        delay={0.12}
        className="mt-5 max-w-[58ch] text-base leading-relaxed text-muted sm:text-lg"
      />

      <ul className="mt-12 grid gap-5 sm:grid-cols-2">
        {clientSites.map((site, index) => (
          <ClientCard key={site.id} site={site} index={index} />
        ))}
      </ul>
    </div>
  );
}

function ClientCard({ site, index }: { site: ClientSite; index: number }) {
  const reduced = useReducedMotion();

  return (
    <motion.li
      initial={reduced ? undefined : { opacity: 0, y: 24 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      {/* The whole card is the link, so there's no separate call to action to
          hunt for. Matches the border-on-hover treatment used by Tools. */}
      <a
        href={site.url}
        target="_blank"
        rel="noreferrer noopener"
        data-cursor="hover"
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-elevated transition-colors duration-300 hover:border-accent"
      >
        <div className="relative aspect-[16/9] overflow-hidden border-b border-line bg-bg">
          {site.src ? (
            <img
              src={site.src}
              srcSet={site.src2x ? `${site.src} 1x, ${site.src2x} 2x` : undefined}
              alt={site.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <Placeholder label={site.alt} aspect="wide" className="h-full rounded-none border-0" />
          )}
        </div>

        <div className="flex flex-1 flex-col p-6 md:p-7">
          <div className="flex items-baseline justify-between gap-3">
            <h4 className="font-display text-lg font-semibold text-ink transition-colors group-hover:text-accent">
              {site.name}
            </h4>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {site.kind}
            </span>
          </div>

          <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">{site.description}</p>

          <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
            Visit site
            <ArrowIcon />
          </span>
        </div>
      </a>
    </motion.li>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

/** Kept beside the grid so the pending previews explain themselves. */
export function ClientSitesNote() {
  const pending = clientSites.filter((site) => !site.src).length;
  if (pending === 0) return null;

  return (
    <Reveal delay={0.1}>
      <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-muted opacity-60">
        {pending} of {clientSites.length} previews pending
      </p>
    </Reveal>
  );
}
