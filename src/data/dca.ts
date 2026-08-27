/**
 * Everything the DCA bot page needs that isn't fetched live.
 *
 * The streak, the buy count and the dates all come off the chain at request
 * time. Only the things the chain can't tell us live here.
 */

export const dcaBot = {
  name: "DCA Bot",
  /**
   * TODO: Pero to provide the bot's wallet address.
   *
   * Also set DCA_WALLET in Vercel so the API has it server-side. Until both are
   * set the page says the streak isn't connected yet rather than showing a
   * number, which on a page whose whole argument is verifiability matters more
   * than looking finished.
   */
  wallet: "" as string,

  token: "$stkr",
  chain: "Solana",
  /** Current daily buy. Total spent is derived from this; see the note below. */
  dailyUsd: 5,

  /** Where the bot posts proof of each buy. */
  proofUrl: "https://x.com/Itz_Pero",

  tagline: "DCA for small Solana token buys.",
  summary:
    "It buys $5 of $stkr every day on Solana and posts proof of every buy to X. Nothing to watch, nothing to time, and every purchase is on-chain where you can check it.",
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
    features: ["Up to $5 a day", "Daily buys", "Public proof posts"],
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
