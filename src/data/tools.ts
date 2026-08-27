export type Tool = {
  id: string;
  name: string;
  /** One line on what it does, in plain terms. */
  description: string;
  /** Longer detail, shown under the description. */
  detail?: string;
  /** Where the live tool opens. Leave undefined to render as not yet public. */
  url?: string;
  /** An in-site page for the tool, if it has one. Takes precedence over url. */
  href?: string;
  /** What it's built with, shown as small pills. */
  stack: string[];
  /** Free-text state, e.g. "Live", "In testing", "Private beta". */
  status: string;
};

export const tools: Tool[] = [
  {
    id: "dca-bot",
    name: "DCA Bot",
    description: "A dollar-cost-averaging trading bot that buys on a schedule instead of on a hunch.",
    detail:
      "Dollar-cost averaging works because it removes the decision. The bot places the same buy on a fixed schedule whether the market is up or down, which is the part most people get wrong when they're doing it by hand.",
    // TODO: Pero to provide the live URL. Renders as "link pending" until set.
    url: undefined,
    href: "/tools/dca-bot",
    stack: ["Node.js", "Solana RPC", "Firestore"],
    status: "Live",
  },
];
