import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { MagneticButton } from "../components/MagneticButton";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";
import { VideoGrid } from "../components/VideoGrid";
import { channel, mostWatched, RECENT_LIMIT, type Video } from "../data/youtube";

type Tab = "recent" | "most-watched";
type FeedState =
  | { status: "loading" }
  | { status: "ready"; videos: Video[] }
  | { status: "error" };

const CACHE_KEY = "pero-yt-recent";

/**
 * Reads the recent uploads once per session.
 *
 * The response is already edge-cached for 30 minutes, so this is only about not
 * re-requesting when someone tabs back and forth between Recent and Most
 * Watched, or navigates away and returns.
 */
function useRecentVideos(): FeedState {
  const [state, setState] = useState<FeedState>({ status: "loading" });

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        setState({ status: "ready", videos: JSON.parse(cached) as Video[] });
        return;
      } catch {
        sessionStorage.removeItem(CACHE_KEY);
      }
    }

    let cancelled = false;
    fetch(`/api/youtube?channelId=${channel.id}&limit=${RECENT_LIMIT}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((data: { videos?: Video[] }) => {
        if (cancelled) return;
        const videos = data.videos ?? [];
        if (videos.length === 0) {
          setState({ status: "error" });
          return;
        }
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(videos));
        setState({ status: "ready", videos });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function YouTubePage() {
  const [tab, setTab] = useState<Tab>("recent");
  const recent = useRecentVideos();
  const reduced = useReducedMotion();

  useEffect(() => {
    document.title = "Videos | Pero";
  }, []);

  return (
    <section className="relative scroll-mt-24 pb-24 pt-32 md:pb-32 md:pt-40">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Youtube"
          title="Things I've filmed."
          lead="Builds, breakdowns and whatever I happened to be making at the time. New uploads land here on their own."
        />

        <Reveal delay={0.1}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <MagneticButton href={channel.url} className="px-7">
              Visit my channel
              <ExternalIcon />
            </MagneticButton>
          </div>
        </Reveal>

        {/* Tabs */}
        <Reveal delay={0.15}>
          <div
            role="tablist"
            aria-label="Video categories"
            className="mt-12 inline-flex rounded-full border border-line bg-elevated p-1"
          >
            {(
              [
                { id: "recent", label: "Recent" },
                { id: "most-watched", label: "Most Watched" },
              ] as const
            ).map((item) => {
              const selected = tab === item.id;
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`panel-${item.id}`}
                  id={`tab-${item.id}`}
                  type="button"
                  onClick={() => setTab(item.id)}
                  data-cursor="hover"
                  className="relative rounded-full px-5 py-2 text-sm transition-colors duration-200"
                >
                  {/* The moving pill sits behind the label and animates between
                      tabs via a shared layoutId. */}
                  {selected ? (
                    <motion.span
                      layoutId="yt-tab-pill"
                      transition={
                        reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }
                      }
                      className="absolute inset-0 rounded-full bg-accent"
                    />
                  ) : null}
                  <span
                    className={`relative ${selected ? "font-medium text-on-accent" : "text-muted"}`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={reduced ? undefined : { opacity: 0, y: 10 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              role="tabpanel"
              id={`panel-${tab}`}
              aria-labelledby={`tab-${tab}`}
            >
              {tab === "recent" ? <RecentPanel state={recent} /> : <MostWatchedPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function RecentPanel({ state }: { state: FeedState }) {
  if (state.status === "loading") {
    return (
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <li key={index}>
            <div className="aspect-video animate-pulse rounded-xl border border-line bg-elevated" />
            <div className="mt-3 h-3.5 w-3/4 animate-pulse rounded bg-elevated" />
          </li>
        ))}
      </ul>
    );
  }

  if (state.status === "error") {
    return (
      <EmptyNote>
        Couldn't reach the feed just now. You can still watch everything on{" "}
        <a
          href={channel.url}
          target="_blank"
          rel="noreferrer noopener"
          className="link-underline text-accent"
        >
          the channel
        </a>
        .
      </EmptyNote>
    );
  }

  return <VideoGrid videos={state.videos} />;
}

function MostWatchedPanel() {
  if (mostWatched.length === 0) {
    return (
      <EmptyNote>
        {/* TODO: Pero to add his best-performing video URLs to `mostWatchedUrls`
            in src/data/youtube.ts. */}
        Hand-picked list coming shortly. Recent uploads are in the other tab.
      </EmptyNote>
    );
  }
  return <VideoGrid videos={mostWatched} />;
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <Reveal>
      <p className="rounded-2xl border border-dashed border-line-strong bg-elevated px-6 py-10 text-center text-sm leading-relaxed text-muted">
        {children}
      </p>
    </Reveal>
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
