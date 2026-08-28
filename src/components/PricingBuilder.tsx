import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  PRICING_IS_PLACEHOLDER,
  extras,
  extras as allExtras,
  formatMoney,
  siteTypes,
  timelines,
  type PriceRange,
} from "../data/pricing";
import { useNavigate } from "react-router-dom";
import { MagneticButton } from "./MagneticButton";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  { id: "type", label: "Project" },
  { id: "extras", label: "Extras" },
  { id: "timeline", label: "Timeline" },
  { id: "result", label: "Estimate" },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

export function PricingBuilder() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  // Tracks which way the panels should slide.
  const [direction, setDirection] = useState(1);

  const [typeId, setTypeId] = useState<string | null>(null);
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [timelineId, setTimelineId] = useState<string>(timelines[0].id);

  const selectedType = siteTypes.find((type) => type.id === typeId) ?? null;
  const selectedExtras = extras.filter((extra) => extraIds.includes(extra.id));
  const selectedTimeline = timelines.find((t) => t.id === timelineId) ?? timelines[0];

  const quote = useMemo<PriceRange | null>(() => {
    if (!selectedType) return null;
    const [low, high] = selectedExtras.reduce<PriceRange>(
      ([l, h], extra) => [l + extra.range[0], h + extra.range[1]],
      [selectedType.range[0], selectedType.range[1]],
    );
    return [low * selectedTimeline.multiplier, high * selectedTimeline.multiplier];
  }, [selectedType, selectedExtras, selectedTimeline]);

  function go(nextStep: number) {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  }

  function reset() {
    setDirection(-1);
    setStep(0);
    setTypeId(null);
    setExtraIds([]);
    setTimelineId(timelines[0].id);
  }

  /** Hands the configured brief to the contact form. */
  function requestQuote() {
    if (!selectedType || !quote) return;
    const summary = [
      `Project type: ${selectedType.label}`,
      `Extras: ${selectedExtras.length ? selectedExtras.map((e) => e.label).join(", ") : "None"}`,
      `Timeline: ${selectedTimeline.label}`,
      `Indicative range: ${formatMoney(quote[0])} to ${formatMoney(quote[1])}`,
      "",
      "Hey Pero, I used the builder on your site and got the above. Can we talk about it?",
    ].join("\n");

    window.dispatchEvent(new CustomEvent<string>("pero:quote", { detail: summary }));
    navigate("/contact");
  }

  const canAdvance = step === 0 ? Boolean(typeId) : true;

  return (
    <section id="pricing" className="relative scroll-mt-24 overflow-hidden py-24 md:py-32">
      <div aria-hidden className="grid-backdrop pointer-events-none absolute inset-0 -z-10" />

      <div className="section-shell">
        <SectionHeading
          title="Want a website? Let's build one."
          lead="Answer three questions and you'll get an indicative range in about twenty seconds. It's a starting point for a conversation, not a final invoice."
        />

        {PRICING_IS_PLACEHOLDER ? (
          // TODO: Pero to supply real tiers in src/data/pricing.ts, then set
          // PRICING_IS_PLACEHOLDER to false to remove this banner.
          <Reveal delay={0.1}>
            <p className="mt-8 inline-flex items-start gap-2.5 rounded-lg border border-dashed border-line-strong bg-elevated px-4 py-3 font-mono text-[11px] leading-relaxed text-muted">
              <span aria-hidden className="mt-px text-accent">
                ⚠
              </span>
              <span>
                PLACEHOLDER PRICING. The numbers below are examples only.
                <br />
                TODO: Pero to provide real tiers in <code>src/data/pricing.ts</code>.
              </span>
            </p>
          </Reveal>
        ) : null}

        <Reveal delay={0.14}>
          <div className="mt-10 rounded-3xl border border-line bg-elevated p-6 sm:p-9 md:p-12">
            {!started ? (
              <StartPanel onStart={() => setStarted(true)} />
            ) : (
              <>
                <ProgressBar step={step} />

                <div className="relative mt-9 min-h-[22rem]">
                  {/* Keyed on the step, so changing step remounts the panel and
                      replays its enter animation. Deliberately not wrapped in
                      AnimatePresence: `mode="wait"` stalls on a custom child
                      component and leaves the previous step on screen. */}
                  <StepPanel key={STEPS[step].id} direction={direction}>
                      {step === 0 ? (
                        <OptionStep
                          question="What kind of site do you need?"
                          hint="Pick the closest fit. We can adjust on a call."
                        >
                          {siteTypes.map((type) => (
                            <OptionCard
                              key={type.id}
                              selected={typeId === type.id}
                              title={type.label}
                              description={type.description}
                              meta={`${formatMoney(type.range[0])} to ${formatMoney(type.range[1])} · ${type.weeks}`}
                              badge={type.recommended ? "Most common" : undefined}
                              onSelect={() => {
                                setTypeId(type.id);
                                // Choosing a type is unambiguous — move on for them.
                                window.setTimeout(() => go(1), 220);
                              }}
                            />
                          ))}
                        </OptionStep>
                      ) : null}

                      {step === 1 ? (
                        <OptionStep
                          question="Anything extra?"
                          hint="Pick as many as you like, or none at all."
                        >
                          {extras.map((extra) => (
                            <OptionCard
                              key={extra.id}
                              selected={extraIds.includes(extra.id)}
                              multi
                              title={extra.label}
                              description={extra.description}
                              meta={`+${formatMoney(extra.range[0])} to ${formatMoney(extra.range[1])}`}
                              onSelect={() =>
                                setExtraIds((current) =>
                                  current.includes(extra.id)
                                    ? current.filter((id) => id !== extra.id)
                                    : [...current, extra.id],
                                )
                              }
                            />
                          ))}
                        </OptionStep>
                      ) : null}

                      {step === 2 ? (
                        <TimelineStep
                          timelineId={timelineId}
                          onChange={setTimelineId}
                          standardWeeks={selectedType?.weeks ?? "the standard window"}
                        />
                      ) : null}

                      {step === 3 && selectedType && quote ? (
                        <ResultPanel
                          quote={quote}
                          typeLabel={selectedType.label}
                          weeks={selectedType.weeks}
                          includes={selectedType.includes}
                          extras={selectedExtras.map((e) => e.label)}
                          timelineLabel={selectedTimeline.label}
                          onRequest={requestQuote}
                          onReset={reset}
                        />
                      ) : null}
                  </StepPanel>
                </div>

                {step < 3 ? (
                  <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-6">
                    <button
                      type="button"
                      onClick={() => (step === 0 ? setStarted(false) : go(step - 1))}
                      className="link-underline text-sm text-muted transition-colors hover:text-ink"
                    >
                      ← Back
                    </button>

                    <MagneticButton
                      onClick={() => canAdvance && go(step + 1)}
                      variant={canAdvance ? "solid" : "outline"}
                      className={canAdvance ? "" : "pointer-events-none opacity-40"}
                    >
                      {step === 2
                        ? "See the number"
                        : step === 1 && extraIds.length === 0
                          ? "Skip extras"
                          : "Continue"}
                    </MagneticButton>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ pieces */

function StartPanel({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-start gap-6 py-6 md:flex-row md:items-center md:justify-between md:py-10"
    >
      <div>
        <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Three questions. One number.
        </h3>
        <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-muted sm:text-base">
          Tell me what you're building and I'll show you roughly what it costs, before either of
          us spends time on a call.
        </p>
      </div>
      <MagneticButton onClick={onStart} className="shrink-0">
        Build Yours
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
      </MagneticButton>
    </motion.div>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div>
      <ol className="flex items-center gap-2 sm:gap-4">
        {STEPS.map((item, index) => {
          const state = index < step ? "done" : index === step ? "current" : "todo";
          return (
            <li key={item.id} className="flex flex-1 items-center gap-2 sm:gap-3">
              <span
                aria-current={state === "current" ? "step" : undefined}
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[10px] transition-colors duration-300 ${
                  state === "todo"
                    ? "border-line text-muted"
                    : "border-accent bg-accent text-on-accent"
                }`}
              >
                {state === "done" ? "✓" : index + 1}
              </span>
              <span
                className={`hidden text-xs transition-colors duration-300 sm:inline ${
                  state === "todo" ? "text-muted" : "text-ink"
                }`}
              >
                {item.label}
              </span>
              {index < STEPS.length - 1 ? (
                <span className="relative h-px flex-1 bg-line">
                  <motion.span
                    className="absolute inset-y-0 left-0 bg-accent"
                    initial={false}
                    animate={{ width: index < step ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StepPanel({
  children,
  direction,
}: {
  children: React.ReactNode;
  direction: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, x: direction * 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function OptionStep({
  question,
  hint,
  children,
}: {
  question: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
        {question}
      </legend>
      <p className="mt-2 text-sm text-muted">{hint}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

/**
 * Timeline step, as a real switch rather than two cards.
 *
 * There are exactly two options and they're opposites, which is what a toggle
 * is for. Two selectable cards asked the reader to compare when the choice is
 * really one lever. The state it drives is unchanged: it still sets timelineId
 * from the same `timelines` data, so the multiplier maths is untouched.
 */
function TimelineStep({
  timelineId,
  onChange,
  standardWeeks,
}: {
  timelineId: string;
  onChange: (id: string) => void;
  standardWeeks: string;
}) {
  const reduced = useReducedMotion();
  const [standard, rush] = timelines;
  const isRush = timelineId === rush.id;
  const active = isRush ? rush : standard;
  const uplift = Math.round((rush.multiplier - 1) * 100);

  return (
    <fieldset>
      <legend className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
        How fast do you need it?
      </legend>
      <p className="mt-2 text-sm text-muted">
        Rush means you jump the queue and I clear other work to fit you in.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
        <span
          className={`text-sm transition-colors duration-200 ${
            isRush ? "text-muted" : "font-medium text-ink"
          }`}
        >
          {standard.label}
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={isRush}
          aria-label={`Rush delivery, adds ${uplift} percent`}
          onClick={() => onChange(isRush ? standard.id : rush.id)}
          data-cursor="hover"
          className={`relative h-8 w-[3.75rem] shrink-0 rounded-full border transition-colors duration-300 ${
            isRush ? "border-accent bg-accent/25" : "border-line-strong bg-surface"
          }`}
        >
          <motion.span
            aria-hidden
            layout
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 34 }}
            className={`absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full shadow-sm ${
              isRush ? "right-1 bg-accent" : "left-1 bg-line-strong"
            }`}
          />
        </button>

        <span
          className={`text-sm transition-colors duration-200 ${
            isRush ? "font-medium text-ink" : "text-muted"
          }`}
        >
          {rush.label}{" "}
          <span className={isRush ? "text-accent" : "text-muted"}>+{uplift}%</span>
        </span>
      </div>

      {/* One card that rewrites itself, so the consequence of the switch is
          visible without making the reader hold two descriptions in mind. */}
      <motion.div
        key={active.id}
        initial={reduced ? undefined : { opacity: 0, y: 8 }}
        animate={reduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="mx-auto mt-8 max-w-sm rounded-2xl border border-line bg-surface p-6 text-center"
      >
        <p className="font-display text-lg font-semibold text-ink">{active.label}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{active.description}</p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
          {isRush ? `Adds ${uplift}% to the total` : `Roughly ${standardWeeks}`}
        </p>
      </motion.div>
    </fieldset>
  );
}

function OptionCard({
  selected,
  title,
  description,
  meta,
  onSelect,
  multi = false,
  badge,
}: {
  selected: boolean;
  title: string;
  description: string;
  meta: string;
  onSelect: () => void;
  multi?: boolean;
  /** Small pill on the card, e.g. the most common starting point. */
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      data-cursor="hover"
      className={`group relative flex flex-col rounded-xl border p-4 text-left transition-all duration-300 sm:p-5 ${
        selected
          ? "border-accent bg-accent/[0.07] shadow-[0_0_28px_-10px_var(--glow)]"
          : "border-line bg-surface hover:border-line-strong"
      }`}
    >
      {badge ? (
        <span className="absolute -top-2.5 left-4 rounded-full border border-accent/50 bg-elevated px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-accent">
          {badge}
        </span>
      ) : null}

      <span className="flex items-start justify-between gap-3">
        <span className="font-medium text-ink">{title}</span>
        <span
          aria-hidden
          className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center border transition-colors duration-200 ${
            multi ? "rounded" : "rounded-full"
          } ${selected ? "border-accent bg-accent" : "border-line-strong"}`}
        >
          {selected ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-2.5 w-2.5 text-on-accent"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : null}
        </span>
      </span>

      <span className="mt-1.5 text-xs leading-relaxed text-muted">{description}</span>
      <span className="mt-3 font-mono text-[11px] text-accent">{meta}</span>
    </button>
  );
}

/** Included. */
function Tick() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-[0.15em] h-4 w-4 shrink-0 text-accent"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** Not included. Muted so the ticks stay the thing you notice. */
function Cross() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-[0.15em] h-4 w-4 shrink-0 text-muted/50"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ResultPanel({
  quote,
  typeLabel,
  weeks,
  includes,
  extras: extraLabels,
  timelineLabel,
  onRequest,
  onReset,
}: {
  quote: PriceRange;
  typeLabel: string;
  weeks: string;
  includes: string[];
  extras: string[];
  timelineLabel: string;
  onRequest: () => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          Starting at
        </p>

        {/* The number carries the panel, so it gets the size. The upper bound
            and the qualifier sit under it rather than competing on the line. */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="mt-2 font-display text-6xl font-bold leading-[0.95] tracking-tight text-ink sm:text-7xl"
        >
          {formatMoney(quote[0])}
        </motion.p>

        <p className="mt-3 text-base text-muted">
          up to <span className="font-medium text-ink">{formatMoney(quote[1])}</span>, depending on
          scope
        </p>

        <p className="mt-5 max-w-[38ch] text-sm leading-relaxed text-muted">
          A {typeLabel.toLowerCase()} on a {timelineLabel.toLowerCase()} schedule, roughly{" "}
          {weeks}. The exact number is what the call is for.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <MagneticButton onClick={onRequest}>Request exact quote</MagneticButton>
          <MagneticButton variant="outline" onClick={onReset}>
            Start over
          </MagneticButton>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          What's included
        </h4>
        <ul className="mt-4 space-y-2.5">
          {includes.map((item, index) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + index * 0.05 }}
              className="flex items-start gap-2.5 text-sm text-muted"
            >
              <Tick />
              {item}
            </motion.li>
          ))}
        </ul>

        <h4 className="mt-6 border-t border-line pt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          Add-ons
        </h4>
        <ul className="mt-4 space-y-2.5">
          {allExtras.map((extra, index) => {
            const taken = extraLabels.includes(extra.label);
            return (
              <motion.li
                key={extra.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.3 + index * 0.04 }}
                className={`flex items-start gap-2.5 text-sm ${
                  taken ? "text-ink" : "text-muted/55"
                }`}
              >
                {taken ? <Tick /> : <Cross />}
                {extra.label}
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
