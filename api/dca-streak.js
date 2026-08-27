/**
 * Live buy streak for the DCA bot, read straight off the chain.
 *
 * Not from Solscan. Their free public API is gone (404) and the Pro API answers
 * 401 "Token is missing", so it would mean a key and a quota. The public Solana
 * RPC needs neither: it answered without credentials and reported
 * x-ratelimit-tier=free at 250 rps, which is far more headroom than a page
 * cached for half an hour will ever use. Solscan still gets the outbound link,
 * because a human clicking through to verify is the entire point of the page.
 *
 * The response is edge-cached, so visitors don't each trigger an RPC call.
 */

const RPC = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

/** Base58, 32 bytes, so 32 to 44 characters and no 0/O/I/l. */
const ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function utcDay(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

/** Days between two YYYY-MM-DD strings. */
function daysBetween(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

async function rpc(method, params) {
  const response = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) throw new Error(`RPC ${response.status}`);
  const json = await response.json();
  if (json.error) throw new Error(json.error.message ?? "RPC error");
  return json.result;
}

/**
 * Counts back from the most recent buy while each previous day is present.
 *
 * Today is not required: a bot that buys at 23:00 UTC would otherwise appear to
 * break its streak for most of the following day. So a streak stays alive while
 * the last buy was today or yesterday, and is reported as broken beyond that.
 */
function computeStreak(days) {
  if (days.length === 0) return { streak: 0, live: false, lastBuy: null };

  const today = new Date().toISOString().slice(0, 10);
  const gapToLast = daysBetween(days[0], today);
  const live = gapToLast <= 1;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (daysBetween(days[i], days[i - 1]) !== 1) break;
    streak++;
  }

  return { streak, live, lastBuy: days[0] };
}

export default async function handler(request, response) {
  const wallet = String(request.query.wallet ?? process.env.DCA_WALLET ?? "").trim();

  if (!wallet) {
    // Not an error: the page renders a "not configured yet" state, which is
    // honest and better than a fabricated number on a page about transparency.
    response.setHeader("cache-control", "public, s-maxage=60");
    return response.status(200).json({ configured: false });
  }

  if (!ADDRESS.test(wallet)) {
    return response.status(400).json({ error: "Not a Solana address" });
  }

  try {
    // One call covers years of history for a bot buying once a day.
    const signatures = await rpc("getSignaturesForAddress", [wallet, { limit: 1000 }]);

    const days = [
      ...new Set(
        signatures
          .filter((entry) => entry.blockTime && !entry.err)
          .map((entry) => utcDay(entry.blockTime)),
      ),
    ].sort((a, b) => b.localeCompare(a)); // newest first

    const { streak, live, lastBuy } = computeStreak(days);

    response.setHeader("cache-control", "public, s-maxage=1800, stale-while-revalidate=3600");
    return response.status(200).json({
      configured: true,
      wallet,
      streak,
      live,
      lastBuy,
      buyDays: days.length,
      firstBuy: days[days.length - 1] ?? null,
      // The chain gives timing, not dollars. Working out what each buy cost in
      // USD would mean fetching and parsing every transaction, so the page
      // multiplies by the configured daily amount and says that it does.
      truncated: signatures.length >= 1000,
    });
  } catch (error) {
    response.setHeader("cache-control", "public, s-maxage=60");
    return response.status(200).json({ configured: true, error: String(error.message ?? error) });
  }
}
