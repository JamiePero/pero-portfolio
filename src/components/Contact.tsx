import { motion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { site } from "../data/site";
import { MagneticButton } from "./MagneticButton";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

/**
 * TODO: Pero to provide a form destination.
 *
 * Set this to a Formspree (or similar) endpoint — e.g.
 *   "https://formspree.io/f/xxxxxxx"
 * While it stays null the form composes a pre-filled email in the visitor's
 * mail client instead, so the section is never a dead end.
 */
const FORM_ENDPOINT: string | null = null;

type Status = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState("");

  // The pricing builder hands its configured brief over here.
  useEffect(() => {
    const onQuote = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      setMessage(detail);
      // Wait for the smooth scroll to land before pulling focus.
      window.setTimeout(() => messageRef.current?.focus({ preventScroll: true }), 900);
    };

    window.addEventListener("pero:quote", onQuote);
    return () => window.removeEventListener("pero:quote", onQuote);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const body = String(data.get("message") ?? "");

    if (!FORM_ENDPOINT) {
      // Fallback: hand off to the visitor's mail client.
      const subject = encodeURIComponent(`Project enquiry from ${name || "your site"}`);
      const mailBody = encodeURIComponent(`${body}\n\nFrom ${name}\n${email}`);
      window.location.href = `mailto:${site.email}?subject=${subject}&body=${mailBody}`;
      setStatus("sent");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      if (!response.ok) throw new Error(`Form responded ${response.status}`);
      setStatus("sent");
      form.reset();
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="06 / Contact"
          title="Got something you want built?"
          lead="I take freelance and client work across any of it: 3D, branding, hardware, web. Tell me what you're trying to make and I'll tell you straight whether I'm the right person for it."
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <Reveal>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" name="name" type="text" autoComplete="name" required />
                <Field label="Email" name="email" type="email" autoComplete="email" required />
              </div>

              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  Message
                </span>
                <textarea
                  ref={messageRef}
                  name="message"
                  required
                  rows={7}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="What are you building?"
                  className="mt-2 w-full resize-y rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
                />
              </label>

              <div className="flex flex-wrap items-center gap-4">
                <MagneticButton type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send message"}
                </MagneticButton>

                {status === "sent" ? (
                  <motion.p
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-accent"
                  >
                    {FORM_ENDPOINT
                      ? "Sent. I'll get back to you."
                      : "Your mail app should be opening."}
                  </motion.p>
                ) : null}

                {status === "error" ? (
                  <p className="text-sm text-muted">
                    Didn't go through. Email me directly at{" "}
                    <a href={`mailto:${site.email}`} className="link-underline text-accent">
                      {site.email}
                    </a>
                    .
                  </p>
                ) : null}
              </div>

              {!FORM_ENDPOINT ? (
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted opacity-50">
                  {/* TODO: Pero to set FORM_ENDPOINT above (Formspree or similar). */}
                  Form service pending setup
                </p>
              ) : null}
            </form>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="space-y-8">
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  Direct
                </h3>
                <a
                  href={`mailto:${site.email}`}
                  data-cursor="hover"
                  className="link-underline mt-3 inline-block font-display text-lg font-medium break-all sm:text-xl"
                >
                  {site.email}
                </a>
              </div>

              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  Elsewhere
                </h3>
                <ul className="mt-3 space-y-2.5">
                  <li>
                    <a
                      href={site.x.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-cursor="hover"
                      className="group inline-flex items-center gap-2.5 text-ink transition-colors hover:text-accent"
                    >
                      <XIcon />
                      <span className="link-underline">{site.x.handle}</span>
                    </a>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-line bg-elevated p-6">
                <p className="flex items-center gap-2.5 text-sm text-ink">
                  <span aria-hidden className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                  </span>
                  Available for new work
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">
                  Based in {site.location}, working with clients anywhere. I usually reply within a
                  day.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="mt-2 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
      />
    </label>
  );
}

function XIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.82-5.96 6.82H1.67l7.73-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23Zm-1.16 17.52h1.83L7.01 4.13H5.05l12.03 15.64Z" />
    </svg>
  );
}
