import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { thumbnailUrl, watchUrl, type Video } from "../data/youtube";

export function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video, index) => (
        <VideoCard key={video.videoId} video={video} index={index} />
      ))}
    </ul>
  );
}

function VideoCard({ video, index }: { video: Video; index: number }) {
  const reduced = useReducedMotion();
  // maxresdefault doesn't exist for every upload, so fall back to hqdefault,
  // which YouTube always generates.
  const [size, setSize] = useState<"max" | "hq">("max");

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
        <div className="relative aspect-video overflow-hidden rounded-xl border border-line bg-elevated">
          <img
            src={thumbnailUrl(video.videoId, size)}
            onError={() => setSize("hq")}
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
