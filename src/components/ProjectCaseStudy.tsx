import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import type { Project, ProjectImage } from "../data/projects";
import { MagneticButton } from "./MagneticButton";
import { Placeholder } from "./Placeholder";
import { Reveal, RevealWords } from "./Reveal";

/**
 * One flagship case study.
 *
 * On desktop the narrative column pins while the visuals scroll past it — the
 * sticky treatment from the brief. On mobile it collapses to a single column,
 * because pinning inside a phone viewport just eats the screen.
 */
export function ProjectCaseStudy({
  project,
  extra,
}: {
  project: Project;
  /** Rendered at the foot of the visuals column. See the note at its usage. */
  extra?: ReactNode;
}) {
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

          {project.highlights?.length ? (
            <Reveal delay={0.1}>
              <ul className="mt-8 space-y-3">
                {project.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3 text-sm leading-relaxed text-muted">
                    <span
                      aria-hidden
                      className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-accent"
                    />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

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
              {/* The same solid button the hero uses. This was a small
                  underlined text link, which read as a footnote next to the
                  case study rather than the thing you're meant to click.
                  MagneticButton sets target and rel itself for an external
                  href. */}
              <div className="mt-8">
                <MagneticButton
                  href={project.liveUrl}
                  ariaLabel={`Visit the live ${project.name} site, opens in a new tab`}
                >
                  Visit {project.name}
                  <ExternalIcon />
                </MagneticButton>
              </div>
            </Reveal>
          ) : (
            // TODO: Pero to supply a live URL — this note disappears once liveUrl is set.
            <Reveal delay={0.14}>
              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-muted opacity-60">
                Live link pending
              </p>
            </Reveal>
          )}
        </div>

        {/* ---------- Visual column (scrolls past the pinned copy) ---------- */}
        <div className="flex flex-col gap-6 lg:gap-10">
          {/* Sits above the hero image rather than in the pinned column: this is
              the strongest credibility signal on the page and shouldn't scroll
              away with the narrative. */}
          {project.award ? (
            <Reveal>
              <p className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-accent/40 bg-accent/[0.07] px-4 py-2">
                <TrophyIcon />
                <span className="font-display text-sm font-semibold text-ink">
                  {project.award.title}
                </span>
                <span className="font-mono text-[11px] leading-relaxed text-muted">
                  {project.award.detail}
                </span>
              </p>
            </Reveal>
          ) : null}

          {project.images.map((image, index) => (
            <ParallaxFrame key={image.caption} index={index}>
              <CaseStudyImage
                image={image}
                fallbackAspect={image.aspect ?? (index === 0 ? "wide" : "landscape")}
              />
              <figcaption className="mt-3 font-mono text-[11px] leading-relaxed text-muted">
                {image.caption}
              </figcaption>
            </ParallaxFrame>
          ))}

          {/* Optional extra panel below the visuals. Jexi passes the interactive
              Smart Bin viewer here; the other case studies pass nothing, so this
              component stays generic. */}
          {extra}
        </div>
      </div>

      <ExtendedSections project={project} />
    </article>
  );
}

/**
 * The optional deep-detail sections, rendered full width below the pinned
 * narrative.
 *
 * These live outside the two-column grid on purpose: a spec table or a
 * three-stage roadmap squeezed into the narrow pinned column would be unusable.
 * Every section is opt-in, so a project that doesn't supply the data renders
 * nothing extra and keeps the original compact layout.
 */
function ExtendedSections({ project }: { project: Project }) {
  const { features, hardware, flow, callout, roadmap, outlook } = project;
  if (!features && !hardware && !flow && !callout && !roadmap) return null;

  // The deep detail below the feature grid is collapsed by default so a
  // content-heavy case study (Jexi) doesn't tower over the others. Only worth a
  // toggle when that deeper detail actually exists.
  const hasDeepDetail = Boolean(flow?.length || hardware?.length || callout || roadmap?.length);
  const [expanded, setExpanded] = useState(false);
  const showDeep = !hasDeepDetail || expanded;

  // Names the section kinds hidden behind the toggle, so the button says what
  // it opens instead of being a blind "read more".
  const hiddenHint = [
    flow?.length ? "how it works" : null,
    hardware?.length ? "hardware" : null,
    roadmap?.length ? "roadmap" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mt-16 space-y-16 border-t border-line pt-14 md:mt-24 md:space-y-20 md:pt-20">
      {features?.length ? (
        <section>
          <SubHeading>What it does</SubHeading>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <li key={feature.title} className="bg-bg p-6">
                <Reveal delay={index * 0.04}>
                  <h5 className="font-display text-base font-semibold text-ink">
                    {feature.title}
                  </h5>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasDeepDetail && !expanded ? (
        <div className="flex flex-col items-center gap-3">
          <MagneticButton
            variant="outline"
            onClick={() => setExpanded(true)}
            className="px-7"
            ariaLabel={`Read the full ${project.name} breakdown`}
          >
            Read the full breakdown
            <CollapseChevron flipped={false} />
          </MagneticButton>
          {hiddenHint ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted opacity-60">
              {hiddenHint}
            </p>
          ) : null}
        </div>
      ) : null}

      {showDeep && flow?.length ? (
        <section>
          <SubHeading>How it works</SubHeading>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {flow.map((step, index) => (
              <li key={step}>
                <Reveal delay={index * 0.04}>
                  <div className="flex h-full flex-col gap-2 rounded-xl border border-line bg-elevated p-5">
                    <span className="font-mono text-[11px] text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm leading-relaxed text-muted">{step}</span>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {showDeep && hardware?.length ? (
        <section>
          <SubHeading>What's inside</SubHeading>
          <Reveal>
            {/* Scrolls inside its own container so a long part name can never
                push the page sideways on a narrow screen. */}
            <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[30rem] border-collapse text-left">
                <caption className="sr-only">
                  {project.name} hardware components and their roles
                </caption>
                <thead>
                  <tr className="border-b border-line bg-elevated">
                    <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                      Component
                    </th>
                    <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hardware.map((row) => (
                    <tr key={row.part} className="border-b border-line last:border-b-0">
                      <td className="px-5 py-3.5 font-mono text-[12px] text-ink">{row.part}</td>
                      <td className="px-5 py-3.5 text-sm text-muted">{row.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>
      ) : null}

      {showDeep && callout ? (
        <Reveal>
          <aside className="rounded-2xl border border-accent/30 bg-accent/[0.06] p-7 md:p-10">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              {callout.label}
            </h4>
            <p className="mt-4 max-w-[62ch] text-base leading-[1.75] text-ink/85 sm:text-lg">
              {callout.body}
            </p>
          </aside>
        </Reveal>
      ) : null}

      {showDeep && roadmap?.length ? (
        <section>
          <SubHeading>Where it goes next</SubHeading>
          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {roadmap.map((stage, index) => (
              <li key={stage.stage}>
                <Reveal delay={index * 0.06}>
                  <div className="flex h-full flex-col rounded-2xl border border-line bg-elevated p-6">
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-2xl font-semibold text-accent">
                        {stage.stage}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                        {stage.label}
                      </span>
                    </div>
                    <ul className="mt-5 space-y-2.5">
                      {stage.items.map((item) => (
                        <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                          <span
                            aria-hidden
                            className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-accent"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>

          {outlook ? (
            <RevealWords
              text={outlook}
              stagger={0.012}
              delay={0.1}
              className="mt-9 max-w-[58ch] text-base leading-[1.75] text-ink/80 sm:text-lg"
            />
          ) : null}
        </section>
      ) : null}

      {hasDeepDetail && expanded ? (
        <div className="flex justify-center">
          <MagneticButton
            variant="outline"
            onClick={() => setExpanded(false)}
            className="px-7"
            ariaLabel="Collapse the breakdown"
          >
            Show less
            <CollapseChevron flipped />
          </MagneticButton>
        </div>
      ) : null}
    </div>
  );
}

function CollapseChevron({ flipped }: { flipped: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 transition-transform duration-300 ${flipped ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return (
    <Reveal>
      <h4 className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
        <span aria-hidden className="inline-block h-px w-6 bg-accent" />
        {children}
      </h4>
    </Reveal>
  );
}

/** Arrow leaving the box, the usual "this opens elsewhere" cue. */
function ExternalIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-accent"
    >
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h2.5a1 1 0 0 1 1 1 4 4 0 0 1-4 4M7 5H4.5a1 1 0 0 0-1 1 4 4 0 0 0 4 4" />
    </svg>
  );
}

/**
 * A case study image, falling back to the pending frame if the file isn't
 * there.
 *
 * Assets arrive piecemeal on this project, so an entry's `src` often gets set
 * before the file is actually in `public/`. Without this, that gap renders a
 * broken-image icon, which looks worse than an honest placeholder and is easy
 * to ship without noticing. Any load failure quietly reverts to the same frame
 * that shows when `src` is unset.
 */
function CaseStudyImage({
  image,
  fallbackAspect,
}: {
  image: ProjectImage;
  fallbackAspect: "wide" | "landscape" | "portrait" | "square";
}) {
  const [failed, setFailed] = useState(false);

  if (!image.src || failed) {
    return <Placeholder label={image.alt} aspect={fallbackAspect} />;
  }

  return (
    <img
      src={image.src}
      srcSet={image.src2x ? `${image.src} 1x, ${image.src2x} 2x` : undefined}
      alt={image.alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="w-full rounded-xl border border-line object-cover"
    />
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
