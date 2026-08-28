import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { MagneticButton } from "../components/MagneticButton";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";
import { dcaBot, solscanUrl, tiers } from "../data/dca";

type Streak =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "error" }
  | {
      status: "ready";
      streak: number;
      live: boolean;
      lastBuy: string | null;
      buyDays: number;
      firstBuy: string | null;
    };

function useStreak(): Streak {
  const [state, setState] = useState<Streak>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const query = dcaBot.wallet ? `?wallet=${encodeURIComponent(dcaBot.wallet)}` : "";

    fetch(`/api/dca-streak${query}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((data) => {
        if (cancelled) return;
        if (!data.configured) return setState({ status: "unconfigured" });
        if (data.error) return setState({ status: "error" });
        setState({
          status: "ready",
          streak: data.streak,
          live: data.live,
          lastBuy: data.lastBuy,
          buyDays: data.buyDays,
          firstBuy: data.firstBuy,
        });
      })
      .catch(() => !cancelled && setState({ status: "error" }));

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function DcaBotPage() {
  const streak = useStreak();

  return (
    <section className="relative pb-24 pt-32 md:pb-32 md:pt-40">
      <div className="section-shell">
        <Reveal>
          <Link
            to="/tools"
            data-cursor="hover"
            className="link-underline font-mono text-[11px] uppercase tracking-[0.16em] text-muted"
          >
            ← Tools
          </Link>
        </Reveal>

        <div className="mt-6">
          <SectionHeading title={dcaBot.tagline} lead={dcaBot.summary} />
        </div>

        {/* The streak is the argument, so it goes first and biggest. */}
        <StreakPanel state={streak} />

        {/* Directly under the streak, because that panel is what prompts the
            question of whether a user's own buys would be published too. */}
        <Reveal delay={0.08}>
          <p className="mt-6 max-w-[62ch] border-l-2 border-accent/40 pl-5 text-base leading-[1.75] text-ink/80">
            {dcaBot.privacyNote}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-12 max-w-[62ch] text-base leading-[1.75] text-muted sm:text-lg">
            {dcaBot.why}
          </p>
        </Reveal>

        <Waitlist />
        <Pricing />
      </div>
    </section>
  );
}

function StreakPanel({ state }: { state: Streak }) {
  const reduced = useReducedMotion();

  return (
    <Reveal delay={0.05}>
      <div className="mt-12 overflow-hidden rounded-2xl border border-line bg-elevated">
        <div className="grid gap-px bg-line sm:grid-cols-3">
          <div className="bg-elevated p-7 sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Current streak
            </p>
            <div className="mt-3 flex items-baseline gap-2.5">
              {state.status === "ready" ? (
                <motion.span
                  initial={reduced ? undefined : { opacity: 0, y: 8 }}
                  animate={reduced ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-5xl font-semibold text-ink sm:text-6xl"
                >
                  {state.streak}
                </motion.span>
              ) : (
                <span className="font-display text-5xl font-semibold text-muted/40 sm:text-6xl">
                  {state.status === "loading" ? "··" : "—"}
                </span>
              )}
              <span className="text-lg text-muted">days</span>
            </div>

            {state.status === "ready" ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                <span aria-hidden className="relative flex h-2 w-2">
                  {state.live ? (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                  ) : null}
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      state.live ? "bg-accent" : "bg-muted/50"
                    }`}
                  />
                </span>
                {state.live ? "Running" : "Paused"}
                {state.lastBuy ? ` · last buy ${state.lastBuy}` : ""}
              </p>
            ) : null}
          </div>

          <div className="bg-elevated p-7 sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Days bought
            </p>
            <p className="mt-3 font-display text-5xl font-semibold text-ink sm:text-6xl">
              {state.status === "ready" ? state.buyDays : <span className="text-muted/40">—</span>}
            </p>
            {state.status === "ready" && state.firstBuy ? (
              <p className="mt-3 text-sm text-muted">since {state.firstBuy}</p>
            ) : null}
          </div>

          <div className="bg-elevated p-7 sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Put in
            </p>
            <p className="mt-3 font-display text-5xl font-semibold text-ink sm:text-6xl">
              {state.status === "ready" ? (
                `$${state.buyDays * dcaBot.dailyUsd}`
              ) : (
                <span className="text-muted/40">—</span>
              )}
            </p>
            {/* Said plainly, because the chain gives timing rather than dollars
                and this page shouldn't imply more precision than it has. */}
            <p className="mt-3 text-sm text-muted">
              {state.status === "ready"
                ? `${state.buyDays} buys × $${dcaBot.dailyUsd}`
                : `$${dcaBot.dailyUsd} a day`}
            </p>
          </div>
        </div>

        <div className="border-t border-line px-7 py-5 sm:px-8">
          {state.status === "unconfigured" ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted opacity-70">
              {/* TODO: set dcaBot.wallet in src/data/dca.ts and DCA_WALLET in Vercel. */}
              Streak not connected yet
            </p>
          ) : state.status === "error" ? (
            <p className="text-sm text-muted">
              Couldn't read the chain just now. The wallet is still public, so you can check it
              yourself.
            </p>
          ) : (
            <p className="text-sm text-muted">
              My wallet, read live off Solana. Nothing here is typed in by hand.
            </p>
          )}

          {dcaBot.wallet ? (
            <a
              href={solscanUrl(dcaBot.wallet)}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="hover"
              className="link-underline mt-2 inline-flex items-center gap-2 break-all font-mono text-xs text-accent"
            >
              Verify on Solscan
              <ExternalIcon />
            </a>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}

function Waitlist() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "invalid" | "error">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("sending");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          company: data.get("company"), // honeypot
          source: "dca-bot",
        }),
      });

      if (response.ok) {
        setStatus("done");
        form.reset();
      } else if (response.status === 400) {
        setStatus("invalid");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <Reveal delay={0.1}>
      <div className="mt-20 rounded-2xl border border-line bg-elevated p-7 md:p-10">
        <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Want it for your own wallet?
        </h3>
        <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-muted">
          It runs on my wallet for now. Leave your email and I'll tell you when you can point it at
          yours.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex max-w-lg flex-wrap gap-3">
          <label className="sr-only" htmlFor="waitlist-email">
            Email address
          </label>
          <input
            id="waitlist-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="min-w-0 flex-1 rounded-full border border-line bg-surface px-5 py-3 text-sm text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
          {/* Hidden from people, and from screen readers. Bots fill it anyway. */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="pointer-events-none absolute h-0 w-0 opacity-0"
          />
          <MagneticButton type="submit" disabled={status === "sending"} className="px-7">
            {status === "sending" ? "Adding…" : "Join the waitlist"}
          </MagneticButton>
        </form>

        <div aria-live="polite" className="mt-4 min-h-[1.25rem]">
          {status === "done" ? (
            <p className="text-sm text-accent">You're on the list.</p>
          ) : status === "invalid" ? (
            <p className="text-sm text-muted">That email doesn't look right.</p>
          ) : status === "error" ? (
            <p className="text-sm text-muted">
              Didn't save. Try again, or reach me on{" "}
              <a
                href={dcaBot.proofUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline text-accent"
              >
                X
              </a>
              .
            </p>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}

function Pricing() {
  return (
    <div className="mt-20">
      <Reveal>
        <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          What it'll cost
        </h3>
        <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-muted">
          None of this is buyable yet. Here's the plan so you know what you'd be waiting for.
        </p>
      </Reveal>

      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {tiers.map((tier, index) => (
          <li key={tier.id}>
            <Reveal delay={index * 0.06}>
              <div
                className={`flex h-full flex-col rounded-2xl border p-6 sm:p-7 ${
                  tier.highlight ? "border-accent/40 bg-accent/[0.05]" : "border-line bg-elevated"
                }`}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  {tier.name}
                </p>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold text-ink">{tier.price}</span>
                  {tier.cadence ? <span className="text-sm text-muted">{tier.cadence}</span> : null}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                      <span
                        aria-hidden
                        className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-accent"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
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
      className="h-3.5 w-3.5"
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}
