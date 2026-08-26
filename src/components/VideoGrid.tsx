import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { shortThumbnailUrl, thumbnailUrl, watchUrl, type Video } from "../data/youtube";

export function VideoGrid({
  videos,
  variant = "wide",
}: {
  videos: Video[];
  /** Shorts are 9:16, so they get a taller card and a denser grid. */
  variant?: "wide" | "short";
}) {
  return (
    <ul
      className={
        variant === "short"
          ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
          : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {videos.map((video, index) => (
        <VideoCard key={video.videoId} video={video} index={index} variant={variant} />
      ))}
    </ul>
  );
}

function VideoCard({
  video,
  index,
  variant,
}: {
  video: Video;
  index: number;
  variant: "wide" | "short";
}) {
  const reduced = useReducedMotion();
  // maxresdefault doesn't exist for every upload, so fall back to hqdefault,
  // which YouTube always generates.
  const [size, setSize] = useState<"max" | "hq">("max");
  // oardefault is the only variant that returns a Short's real vertical frame;
  // if it ever 404s, drop back to the 16:9 thumbnail rather than a broken image.
  const [verticalFailed, setVerticalFailed] = useState(false);
  const isShort = variant === "short" && !verticalFailed;

  return (
    <motion.li
      initial={reduced ? undefined : { opacity: 0, y: 24 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.35), ease: [0.22, 1, 0.36, 1] }}
    >
      <a
        href={watchUrl(video.videoId)}
        target="_blank"
        rel="noreferrer noopener"
        data-cursor="hover"
        className="group block"
      >
        <div
          className={`relative overflow-hidden rounded-xl border border-line bg-elevated ${
            variant === "short" ? "aspect-[9/16]" : "aspect-video"
          }`}
        >
          <img
            src={isShort ? shortThumbnailUrl(video.videoId) : thumbnailUrl(video.videoId, size)}
            onError={() => (isShort ? setVerticalFailed(true) : setSize("hq"))}
            alt={video.title ? `Thumbnail for ${video.title}` : "YouTube video thumbnail"}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />

          {/* Play affordance. Sits above the image and lifts on hover. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 grid place-items-center bg-bg/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full border border-line-strong bg-bg/70 backdrop-blur">
              <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-5 w-5 text-ink">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </div>

        {video.title ? (
          <h3 className="mt-3 line-clamp-2 text-sm font-medium leading-snug text-ink transition-colors group-hover:text-accent">
            {video.title}
          </h3>
        ) : null}

        {video.published ? (
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted opacity-70">
            {new Date(video.published).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        ) : null}
      </a>
    </motion.li>
  );
}
