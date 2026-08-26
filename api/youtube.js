import { fetchChannelVideos } from "./_feed.js";

/**
 * Serverless proxy for the YouTube RSS feed.
 *
 * The feed sends no CORS headers, so a static site can't read it from the
 * browser. A public CORS proxy would work, but it's a third party that can rate
 * limit, disappear, or see every visitor's request. This is a few lines of
 * Vercel function instead, with no key and nothing to rotate.
 *
 * Cached at the edge for 30 minutes and served stale for a day while it
 * revalidates, so a burst of visitors hits Vercel rather than YouTube, and a
 * feed outage shows the last good response instead of an empty grid.
 */
export default async function handler(request, response) {
  const channelId = String(request.query.channelId ?? "");
  const limit = Math.min(Number(request.query.limit) || 12, 15);

  try {
    const videos = await fetchChannelVideos(channelId, limit);
    response.setHeader(
      "Cache-Control",
      "public, s-maxage=1800, stale-while-revalidate=86400",
    );
    response.status(200).json({ videos });
  } catch (error) {
    response.setHeader("Cache-Control", "no-store");
    response.status(502).json({ error: String(error.message ?? error), videos: [] });
  }
}
