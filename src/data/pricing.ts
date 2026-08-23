/* ===========================================================================
   PRICING — ALL NUMBERS BELOW ARE PLACEHOLDERS.
   TODO: Pero to provide real tiers. Every `range` is [low, high] in the
   currency set by `currency` below. The UI reads these directly, so replacing
   the numbers here is the only change needed — no component edits.
   =========================================================================== */

export const currency = {
  // TODO: Pero to confirm — switch to { code: "GHS", symbol: "₵" } if quoting locally.
  code: "USD",
  symbol: "$",
} as const;

/** Flip to false once real pricing lands — hides the "placeholder" banner. */
export const PRICING_IS_PLACEHOLDER = true;

export type PriceRange = [number, number];

export type SiteType = {
  id: string;
  label: string;
  description: string;
  range: PriceRange;
  /** What every build of this type includes, shown in the result summary. */
  includes: string[];
  /** Rough delivery window at standard pace. */
  weeks: string;
};

export type Extra = {
  id: string;
  label: string;
  description: string;
  range: PriceRange;
};

export type Timeline = {
  id: string;
  label: string;
  description: string;
  /** Multiplier applied to the running total. */
  multiplier: number;
};

export const siteTypes: SiteType[] = [
  {
    id: "landing",
    label: "Landing Page",
    description: "One focused page built to convert. Product launch, campaign, or waitlist.",
    range: [400, 800],
    includes: ["Single page, custom design", "Mobile-first responsive build", "Contact / signup form", "Basic on-page SEO", "Deployment + domain setup"],
    weeks: "1–2 weeks",
  },
  {
    id: "business",
    label: "Business Site",
    description: "A multi-page site that explains what you do and brings in enquiries.",
    range: [900, 1800],
    includes: ["Up to 6 custom pages", "Mobile-first responsive build", "Contact + enquiry routing", "On-page SEO across all pages", "Deployment + domain setup", "One round of post-launch tweaks"],
    weeks: "2–4 weeks",
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    description: "Storefront, cart and checkout — including mobile money and card rails.",
    range: [1800, 4000],
    includes: ["Product catalogue + collections", "Cart and checkout flow", "Payment integration (Paystack / MoMo / card)", "Order management", "Product-level SEO", "Deployment + domain setup"],
    weeks: "4–7 weeks",
  },
  {
    id: "webapp",
    label: "Web App",
    description: "Custom product with accounts, dashboards and real logic behind it.",
    range: [3000, 9000],
    includes: ["Custom frontend + backend", "Auth and user accounts", "Database + API design", "Admin dashboard", "Deployment and monitoring"],
    weeks: "6–12 weeks",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "A site that makes your work the point. Designed around the work itself.",
    range: [500, 1200],
    includes: ["Custom design around your work", "Project / case study layouts", "Image optimisation + lightbox", "Contact routing", "Deployment + domain setup"],
    weeks: "1–3 weeks",
  },
];

export const extras: Extra[] = [
  {
    id: "seo",
    label: "SEO Setup",
    description: "Technical SEO, schema markup, sitemap, Core Web Vitals pass and Search Console.",
    range: [250, 600],
  },
  {
    id: "copy",
    label: "Copywriting",
    description: "Written from scratch for every page — headlines, body, CTAs.",
    range: [200, 700],
  },
  {
    id: "motion",
    label: "Animations",
    description: "Scroll choreography, micro-interactions and page transitions. Like this site.",
    range: [300, 900],
  },
  {
    id: "cms",
    label: "CMS / Admin Panel",
    description: "Edit your own content without touching code.",
    range: [400, 1200],
  },
  {
    id: "payments",
    label: "Booking / Payments",
    description: "Take bookings or payments — Paystack, Mobile Money or Stripe.",
    range: [350, 1000],
  },
  {
    id: "brand",
    label: "Logo & Brand",
    description: "Identity work bundled in — mark, colour system and type scale.",
    range: [300, 900],
  },
];

export const timelines: Timeline[] = [
  {
    id: "standard",
    label: "Standard",
    description: "Normal pace. Proper scoping, revisions and a calm handover.",
    multiplier: 1,
  },
  {
    id: "rush",
    label: "Rush",
    description: "Front of the queue, compressed schedule. Priority on my end costs more.",
    multiplier: 1.35,
  },
];

/** Rounds to the nearest 50 so quotes read as estimates, not invoices. */
export function roundQuote(value: number): number {
  return Math.round(value / 50) * 50;
}

export function formatMoney(value: number): string {
  return `${currency.symbol}${roundQuote(value).toLocaleString("en-US")}`;
}
