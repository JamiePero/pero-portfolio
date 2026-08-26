export const channel = {
  id: "UCoW9wtFkAbnWW-B0unohe2Q",
  url: "https://www.youtube.com/channel/UCoW9wtFkAbnWW-B0unohe2Q",
} as const;

/** How many recent uploads the grid asks the feed for. */
export const RECENT_LIMIT = 12;

export type Video = {
  videoId: string;
  title: string;
  published?: string;
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

export function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/* ===========================================================================
   MOST WATCHED — hand-picked.

   The public RSS feed carries no view counts, and pulling them would mean the
   Data API, a key and a quota. Curating instead keeps the page's only external
   dependency the free feed.

   TODO: Pero to paste his best-performing video URLs here. Any YouTube URL
   shape works; toVideoId sorts it out. Until this has entries, the Most Watched
   tab explains itself rather than rendering an empty grid.
   =========================================================================== */
export const mostWatchedUrls: string[] = [];

/** The curated list, resolved to ids and with anything unparseable dropped. */
export const mostWatched: Video[] = mostWatchedUrls
  .map((url) => {
    const videoId = toVideoId(url);
    return videoId ? { videoId, title: "" } : null;
  })
  .filter((video): video is Video => video !== null);
