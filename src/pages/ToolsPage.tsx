import { motion, useReducedMotion } from "framer-motion";
import { MagneticButton } from "../components/MagneticButton";
import { SectionHeading } from "../components/SectionHeading";
import { tools, type Tool } from "../data/tools";

export function ToolsPage() {

  return (
    <section className="relative scroll-mt-24 pb-24 pt-32 md:pb-32 md:pt-40">
      <div className="section-shell">
        <SectionHeading
          title="Things you can actually use."
          lead="Small utilities I built for myself and then cleaned up enough to share. These are meant to be opened and used, not just read about."
        />

        <ul className="mt-14 grid gap-5 lg:grid-cols-2">
          {tools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const reduced = useReducedMotion();

  return (
    <motion.li
      initial={reduced ? undefined : { opacity: 0, y: 24 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <article className="flex h-full flex-col rounded-2xl border border-line bg-elevated p-7 transition-colors duration-300 hover:border-accent md:p-9">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
            {tool.name}
          </h3>
          <span className="shrink-0 rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            {tool.status}
          </span>
        </div>

        <p className="mt-4 text-base leading-relaxed text-ink/85">{tool.description}</p>

        {tool.detail ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">{tool.detail}</p>
        ) : null}

        <ul className="mt-6 flex flex-wrap gap-2">
          {tool.stack.map((item) => (
            <li
              key={item}
              className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-[11px] text-muted"
            >
              {item}
            </li>
          ))}
        </ul>

        {/* Pushed to the bottom so cards of different heights line their CTAs up. */}
        <div className="mt-8 pt-1 [margin-top:auto]">
          {/* An in-site page wins over an external URL: a tool with its own page
              should send people there, where the case for it is actually made. */}
          {tool.href ? (
            <MagneticButton to={tool.href} className="px-7">
              Read more
              <ArrowIcon />
            </MagneticButton>
          ) : tool.url ? (
            <MagneticButton href={tool.url} className="px-7">
              Open tool
              <ExternalIcon />
            </MagneticButton>
          ) : (
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted opacity-60">
              {/* TODO: Pero to add the live URL in src/data/tools.ts */}
              Link pending
            </p>
          )}
        </div>
      </article>
    </motion.li>
  );
}

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
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

function ArrowIcon() {
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
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
