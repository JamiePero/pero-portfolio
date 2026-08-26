/**
 * Fetches and parses a YouTube channel's public RSS feed.
 *
 * Shared by the Vercel function in this directory and by the dev-server
 * middleware in vite.config.ts, so local development hits the exact same code
 * path as production rather than a stub that can drift.
 *
 * The feed is public and needs no API key, which is the whole point: no quota
 * to exhaust and no secret to leak. It returns roughly the 15 most recent
 * uploads and nothing else, so view counts are not available here.
 */

const FEED_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=";

/** XML entities that turn up in video titles. */
function decodeXml(value) {
  if (!value) return "";
  return (
    value
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
      // Ampersand last, otherwise "&amp;lt;" would decode twice.
      .replace(/&amp;/g, "&")
      .trim()
  );
}

function pick(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? match[1] : "";
}

/**
 * Turns the raw feed XML into plain video records.
 *
 * Deliberately hand-rolled rather than pulling in an XML parser: this is one
 * well-defined, stable feed with four fields per entry, and the function is
 * small enough that a dependency would cost more than it saves.
 */
export function parseFeed(xml) {
  return xml
    .split("<entry>")
    .slice(1) // everything before the first <entry> is channel metadata
    .map((block) => ({
      videoId: decodeXml(pick(block, "yt:videoId")),
      title: decodeXml(pick(block, "title")),
      published: decodeXml(pick(block, "published")),
    }))
    .filter((video) => video.videoId);
}

/**
 * Works out whether a video is a Short.
 *
 * The feed doesn't say, and we're deliberately not using the Data API, so this
 * asks YouTube directly: /shorts/{id} stays put and returns 200 for a Short, and
 * 303-redirects to /watch for anything else. Measured across the whole channel
 * it classified every video with nothing left over.
 *
 * HEAD only, and never fatal: if YouTube is slow or blocks the probe the video
 * is treated as a regular upload, so it still shows up in Recent rather than
 * disappearing from both tabs.
 */
async function isShort(videoId) {
  try {
    const response = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(4000),
      headers: { "user-agent": "Mozilla/5.0 (compatible; pero-portfolio/1.0)" },
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

export async function fetchChannelVideos(channelId, limit = 12) {
  if (!/^UC[\w-]{22}$/.test(channelId)) {
    throw new Error("Invalid channel id");
  }

  const response = await fetch(`${FEED_URL}${channelId}`, {
    headers: { "user-agent": "pero-portfolio/1.0 (+https://jamiepero.com)" },
  });

  if (!response.ok) {
    throw new Error(`Feed responded ${response.status}`);
  }

  const videos = parseFeed(await response.text()).slice(0, limit);

  // In parallel, not in sequence. Individually these probes run 0.2s to 2.4s;
  // one after another that's over 20 seconds, which would exceed the function's
  // timeout. Together they cost about as long as the slowest one.
  const flags = await Promise.all(videos.map((video) => isShort(video.videoId)));

  return videos.map((video, index) => ({ ...video, isShort: flags[index] }));
}
