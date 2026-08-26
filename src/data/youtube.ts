export const channel = {
  id: "UCoW9wtFkAbnWW-B0unohe2Q",
  url: "https://www.youtube.com/channel/UCoW9wtFkAbnWW-B0unohe2Q",
} as const;

/**
 * How many recent uploads to request. The feed returns 15 at most, and that
 * pool now feeds two tabs once Shorts are split out, so take all of it.
 */
export const RECENT_LIMIT = 15;

export type Video = {
  videoId: string;
  title: string;
  published?: string;
  /** Set by the feed proxy, which probes YouTube to classify each upload. */
  isShort?: boolean;
};

/**
 * Pulls the video id out of any YouTube URL shape.
 *
 * Handles watch links, youtu.be short links, /shorts/, /embed/, and a bare id
 * pasted on its own, so the curated list below can just take whatever gets
 * copied out of the address bar.
 */
export function toVideoId(input: string): string | null {
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return value;

  try {
    const url = new URL(value);
    const fromQuery = url.searchParams.get("v");
    if (fromQuery && /^[\w-]{11}$/.test(fromQuery)) return fromQuery;

    const path = url.pathname.split("/").filter(Boolean);
    // youtu.be/ID, /shorts/ID, /embed/ID, /live/ID
    const candidate = path[path.length - 1];
    if (candidate && /^[\w-]{11}$/.test(candidate)) return candidate;
  } catch {
    // Not a URL, and not a bare id.
  }
  return null;
}

/**
 * YouTube generates maxresdefault only for uploads that were high enough
 * resolution, so it 404s on plenty of videos. hqdefault always exists, so the
 * grid starts at maxres and falls back on error.
 */
export function thumbnailUrl(videoId: string, size: "max" | "hq" = "max"): string {
  const file = size === "max" ? "maxresdefault" : "hqdefault";
  return `https://img.youtube.com/vi/${videoId}/${file}.jpg`;
}

/**
 * Vertical thumbnail for a Short.
 *
 * The usual variants are all 16:9, so a Short comes back letterboxed or centre
 * cropped. `oardefault` is the original aspect ratio: 720x1280 for a Short, and
 * a 404 for anything filmed 16:9, which is why it's only used on Shorts.
 */
export function shortThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/oardefault.jpg`;
}

export function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/* ===========================================================================
   MOST WATCHED — hand-picked.

   The public RSS feed carries no view counts, and pulling them would mean the
   Data API, a key and a quota. Curating instead keeps the page's only external
   dependency the free feed.

   Add or reorder freely. Any YouTube URL shape works; toVideoId sorts it out.
   If this is ever emptied, the tab explains itself rather than rendering an
   empty grid.
   =========================================================================== */
export const mostWatchedPicks: { url: string; title: string }[] = [
  {
    url: "https://youtu.be/pBP37e3BkTA",
    title: "How to Cancel Your Starlink Order (Step-by-Step Guide)",
  },
  {
    url: "https://youtu.be/S2Mxp-02-Bk",
    title: "From Fusion 360 to Blender: Designing and Rendering a Smart Bin",
  },
  {
    url: "https://youtu.be/vAJdHrDTtRM",
    title: "Arduino Smart Bin Tutorial: Build a DIY Smart Trash Bin at Home",
  },
];

/** The curated list, resolved to ids and with anything unparseable dropped. */
export const mostWatched: Video[] = mostWatchedPicks
  .map((pick) => {
    const videoId = toVideoId(pick.url);
    return videoId ? { videoId, title: pick.title } : null;
  })
  .filter((video): video is Video => video !== null);
