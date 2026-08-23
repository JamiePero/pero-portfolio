import { motion, useReducedMotion } from "framer-motion";
import { useRef, type MouseEvent } from "react";
import { skills } from "../data/services";
import { Reveal, RevealWords } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

/* TODO: Pero to review the bio copy below — tone is drafted, not final. */
const BIO = [
  "I'm Pero, a builder based in Ghana. I started out taking things apart to see how they worked and never really stopped — that's how I ended up doing 3D modelling, brand design, embedded hardware and web development instead of picking one.",
  "In practice that means I can model a product in Fusion 360, design the packaging it ships in, write the firmware that runs inside it, and build the site that sells it. Most of what I make is a mix of all four.",
  "Right now I'm running FlashX and gheasy — real platforms with real users, not side projects. I like problems where the constraint is the interesting part: unreliable connections, no card payments, feature phones. Build for that and everything else is easy.",
];

const STATS = [
  { value: "4+", label: "Disciplines shipped in" },
  { value: "3", label: "Platforms running live" },
  { value: "Ghana", label: "Where it's all built" },
];

export function About() {
  return (
    <section id="about" className="relative scroll-mt-24 py-24 md:py-36">
      <div className="section-shell">
        <SectionHeading eyebrow="01 / About" title="I build across the whole stack. Literally." />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div className="space-y-6">
            {BIO.map((paragraph, index) => (
              <RevealWords
                key={index}
                text={paragraph}
                stagger={0.008}
                delay={index * 0.05}
                className="max-w-[62ch] text-base leading-[1.75] text-muted sm:text-lg"
              />
            ))}
          </div>

          <Reveal delay={0.15}>
            <dl className="grid grid-cols-3 gap-4 rounded-2xl border border-line bg-elevated p-6 lg:grid-cols-1 lg:gap-6 lg:p-8">
              {STATS.map((stat) => (
                // col-reverse puts the value above its label visually while
                // keeping the required dt-before-dd source order.
                <div key={stat.label} className="flex flex-col-reverse gap-1">
                  <dt className="text-xs leading-snug text-muted lg:text-sm">{stat.label}</dt>
                  <dd className="font-display text-2xl font-semibold text-ink lg:text-4xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-16">
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            What I work with
          </h3>
        </Reveal>

        <ul className="mt-6 flex flex-wrap gap-2.5">
          {skills.map((skill, index) => (
            <SkillPill key={skill} label={skill} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Pill that tilts toward the cursor and picks up an accent glow on hover. */
function SkillPill({ label, index }: { label: string; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduced = useReducedMotion();

  function handleMove(event: MouseEvent<HTMLLIElement>) {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(500px) rotateX(${-relY * 16}deg) rotateY(${relX * 16}deg) translateZ(6px)`;
  }

  function handleLeave() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <motion.li
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      data-cursor="hover"
      initial={reduced ? undefined : { opacity: 0, y: 14 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.035, 0.5) }}
      className="cursor-default rounded-full border border-line bg-surface px-4 py-2 text-sm text-muted transition-[transform,border-color,color,box-shadow] duration-300 ease-out hover:border-accent hover:text-ink hover:shadow-[0_0_24px_-6px_var(--glow)]"
    >
      {label}
    </motion.li>
  );
}
