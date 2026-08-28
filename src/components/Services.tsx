import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { services, type Service } from "../data/services";
import { Link, useNavigate } from "react-router-dom";
import { MagneticButton } from "./MagneticButton";
import { SectionHeading } from "./SectionHeading";

export function Services() {
  const navigate = useNavigate();
  return (
    <section id="services" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="section-shell">
        <SectionHeading
          title="What you can hire me for."
          lead="Four things I do properly. Most projects end up needing two or three of them at once, which is usually the point of hiring one person instead of three."
        />

        <ul className="mt-14 grid gap-4 sm:grid-cols-2">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <MagneticButton onClick={() => navigate("/pricing")}>
            Price up a project
          </MagneticButton>
          {/* The obvious next question after reading a services list is whether
              he has actually done any of it, so point at the proof. */}
          <p className="text-sm text-muted">
            Or see{" "}
            <Link to="/work" className="link-underline text-accent">
              what I've built
            </Link>{" "}
            with them.
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Card whose detail copy is revealed on hover/focus. The detail is also
 * tap-toggleable so touch users — who never get a hover state — can read it.
 */
function ServiceCard({ service, index }: { service: Service; index: number }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  return (
    <motion.li
      initial={reduced ? undefined : { opacity: 0, y: 26 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-expanded={open}
        data-cursor="hover"
        className="group relative h-full w-full overflow-hidden rounded-2xl border border-line bg-elevated p-7 text-left transition-colors duration-300 hover:border-accent md:p-9"
      >
        {/* Accent wash that sweeps up from the bottom on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-accent/10 to-transparent transition-[height] duration-500 ease-out group-hover:h-full"
        />

        <span className="relative flex items-start justify-between gap-4">
          <span className="font-mono text-xs text-accent">{service.index}</span>
          <span
            aria-hidden
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-muted transition-all duration-300 group-hover:rotate-45 group-hover:border-accent group-hover:text-accent"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="h-3.5 w-3.5"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </span>

        <h3 className="relative mt-5 font-display text-2xl font-semibold tracking-tight">
          {service.title}
        </h3>
        <p className="relative mt-2.5 text-sm leading-relaxed text-muted">{service.summary}</p>

        <motion.span
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative block overflow-hidden"
        >
          <span className="mt-4 block border-t border-line pt-4 text-sm leading-relaxed text-muted">
            {service.detail}
          </span>
        </motion.span>

        <ul className="relative mt-5 flex flex-wrap gap-2">
          {service.tools.map((tool) => (
            <li
              key={tool}
              className="rounded-md border border-line bg-surface px-2 py-0.5 font-mono text-[10px] text-muted"
            >
              {tool}
            </li>
          ))}
        </ul>
      </button>
    </motion.li>
  );
}
