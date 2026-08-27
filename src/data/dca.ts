/**
 * Everything the DCA bot page needs that isn't fetched live.
 *
 * The streak, the buy count and the dates all come off the chain at request
 * time. Only the things the chain can't tell us live here.
 */

export const dcaBot = {
  name: "DCA Bot",
  /**
   * Pero's own bot wallet. Set DCA_WALLET in Vercel to the same value so the
   * API has a server-side default. If either is missing the page says the
   * streak isn't connected rather than showing a number, which on a page whose
   * whole argument is verifiability matters more than looking finished.
   */
  wallet: "7dTnbkDKZhofFDe5coSzSoCjex3dihGopqCCJRujXKvb" as string,

  token: "$stkr",
  chain: "Solana",
  /** Current daily buy. Total spent is derived from this; see the note below. */
  dailyUsd: 5,

  /**
   * Pero's own feed, where he posts about the run by hand. This is not
   * something the bot does and not something a user would get: see
   * privacyNote below.
   */
  proofUrl: "https://x.com/Itz_Pero",

  tagline: "DCA for small Solana token buys.",
  summary:
    "It buys a fixed amount of a token on Solana every day, on a schedule, so there's no decision to get wrong. I run it on my own wallet at $5 of $stkr a day, and the streak below is that wallet's real on-chain record.",
  privacyNote:
    "That streak is my wallet, not a feature. I publish it because a claim like this is worth nothing if you can't check it. If you end up using the bot, your buys are yours: nothing gets posted anywhere, by me or by it.",

  why: "Dollar-cost averaging works because it takes the decision away from you. The tools that do it properly are built for hundreds a day, so if you want to put $1 to $50 into a small Solana token on a schedule, you end up doing it by hand and skipping the days you feel wrong about. That's the gap this fills.",
} as const;

/** Solscan page for a wallet. The link people click to check the claim. */
export function solscanUrl(wallet: string): string {
  return `https://solscan.io/account/${wallet}`;
}

export type Tier = {
  id: string;
  name: string;
  price: string;
  cadence?: string;
  features: string[];
  highlight?: boolean;
};

/**
 * Planned tiers. Nothing is purchasable yet, so the page says so rather than
 * showing buttons that don't do anything.
 */
export const tiers: Tier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    features: ["Up to $5 a day", "Daily buys", "One wallet, one token"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$3",
    cadence: "/month",
    features: ["Up to $50 a day", "Any frequency", "Priority execution"],
    highlight: true,
  },
  {
    id: "team",
    name: "Team",
    price: "$10",
    cadence: "/month",
    features: ["Multiple wallets", "Multiple tokens", "Everything in Pro"],
  },
];
