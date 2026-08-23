import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { Project } from "../data/projects";
import { Placeholder } from "./Placeholder";
import { Reveal, RevealWords } from "./Reveal";

/**
 * One flagship case study.
 *
 * On desktop the narrative column pins while the visuals scroll past it — the
 * sticky treatment from the brief. On mobile it collapses to a single column,
 * because pinning inside a phone viewport just eats the screen.
 */
export function ProjectCaseStudy({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Subtle counter-drift on the section number so the pinned column isn't dead.
  const markY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <article
      ref={ref}
      id={project.id}
      className="scroll-mt-24 border-t border-line py-20 md:py-28"
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16">
        {/* ---------- Narrative column (pinned on desktop) ---------- */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <div className="flex items-center gap-4">
              <motion.span
                style={reduced ? undefined : { y: markY }}
                className="font-mono text-sm text-accent"
              >
                {project.index}
              </motion.span>
              <span className="h-px flex-1 bg-line" />
              <span className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                {project.status}
              </span>
            </div>
          </Reveal>

          <RevealWords
            as="h3"
            text={project.name}
            delay={0.05}
            className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl"
          />

          <RevealWords
            text={project.tagline}
            stagger={0.015}
            delay={0.12}
            className="mt-3 max-w-[42ch] text-lg text-ink/80"
          />

          <Reveal delay={0.16}>
            <p className="mt-2 font-mono text-xs text-muted">{project.year}</p>
          </Reveal>

          <div className="mt-9 space-y-7">
            <Block label="The problem" body={project.problem} />
            <Block label="What I built" body={project.solution} />
          </div>

          <Reveal delay={0.1}>
            <ul className="mt-8 space-y-3">
              {project.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <span aria-hidden className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="mt-8 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <li
                  key={tech}
                  className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-[11px] text-muted"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.12}>
            <dl className="mt-9 grid grid-cols-3 gap-4 border-t border-line pt-7">
              {project.impact.map((item) => (
                // col-reverse puts the value above its label visually while
                // keeping the required dt-before-dd source order.
                <div key={item.label} className="flex flex-col-reverse gap-1.5">
                  <dt className="text-xs leading-snug text-muted">{item.label}</dt>
                  <dd className="font-display text-lg font-semibold leading-tight text-ink sm:text-xl">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {project.liveUrl ? (
            <Reveal delay={0.14}>
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor="hover"
                className="link-underline mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent"
              >
                Visit {project.name}
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </a>
            </Reveal>
          ) : (
            // TODO: Pero to supply a live URL — this note disappears once liveUrl is set.
            <Reveal delay={0.14}>
              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-muted opacity-60">
                Live link — pending
              </p>
            </Reveal>
          )}
        </div>

        {/* ---------- Visual column (scrolls past the pinned copy) ---------- */}
        <div className="flex flex-col gap-6 lg:gap-10">
          {project.images.map((image, index) => (
            <ParallaxFrame key={image.caption} index={index}>
              {image.src ? (
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full rounded-xl border border-line object-cover"
                />
              ) : (
                <Placeholder label={image.alt} aspect={index === 0 ? "wide" : "landscape"} />
              )}
              <figcaption className="mt-3 font-mono text-[11px] leading-relaxed text-muted">
                {image.caption}
              </figcaption>
            </ParallaxFrame>
          ))}
        </div>
      </div>
    </article>
  );
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <Reveal>
        <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{label}</h4>
      </Reveal>
      <RevealWords
        text={body}
        stagger={0.006}
        delay={0.05}
        className="mt-3 max-w-[54ch] text-sm leading-[1.75] text-muted sm:text-base"
      />
    </div>
  );
}

/** Fades a figure in and drifts it slightly against the scroll direction. */
function ParallaxFrame({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [28, -28]);

  return (
    // `y` is driven by scroll, so the entrance animates opacity/scale only —
    // animating y here too would fight the parallax motion value.
    <motion.figure
      ref={ref}
      style={reduced ? undefined : { y }}
      initial={reduced ? undefined : { opacity: 0, scale: 0.97 }}
      whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.figure>
  );
}
