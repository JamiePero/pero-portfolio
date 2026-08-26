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

  return parseFeed(await response.text()).slice(0, limit);
}
