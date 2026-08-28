/* ===========================================================================
   Pricing. Every `range` is [low, high] in the currency set below, and the
   builder reads these directly, so changing a number here is the only edit
   needed. Keep values as multiples of 50: formatMoney rounds to the nearest
   50 for display, so anything else shows a different figure than it stores.
   =========================================================================== */

export const currency = {
  code: "USD",
  symbol: "$",
} as const;

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
  /** Marks the common starting point. Purely presentational; no pricing effect. */
  recommended?: boolean;
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
    range: [200, 500],
    includes: ["Single page, custom design", "Mobile-first responsive build", "Contact / signup form", "Basic on-page SEO", "Deployment + domain setup"],
    weeks: "1 to 2 weeks",
  },
  {
    id: "business",
    label: "Business Site",
    recommended: true,
    description: "A multi-page site that explains what you do and brings in enquiries.",
    range: [500, 1500],
    includes: ["Up to 6 custom pages", "Mobile-first responsive build", "Contact + enquiry routing", "On-page SEO across all pages", "Deployment + domain setup", "One round of post-launch tweaks"],
    weeks: "2 to 4 weeks",
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    description: "Storefront, cart and checkout, including mobile money and card rails.",
    range: [1500, 2500],
    includes: ["Product catalogue + collections", "Cart and checkout flow", "Payment integration (Paystack / MoMo / card)", "Order management", "Product-level SEO", "Deployment + domain setup"],
    weeks: "4 to 7 weeks",
  },
  {
    id: "webapp",
    label: "Web App",
    description: "Custom product with accounts, dashboards and real logic behind it.",
    range: [2000, 3000],
    includes: ["Custom frontend + backend", "Auth and user accounts", "Database + API design", "Admin dashboard", "Deployment and monitoring"],
    weeks: "6 to 12 weeks",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "A site that makes your work the point. Designed around the work itself.",
    range: [350, 900],
    includes: ["Custom design around your work", "Project / case study layouts", "Image optimisation + lightbox", "Contact routing", "Deployment + domain setup"],
    weeks: "1 to 3 weeks",
  },
];

export const extras: Extra[] = [
  {
    id: "seo",
    label: "SEO Setup",
    description: "Technical SEO, schema markup, sitemap, Core Web Vitals pass and Search Console.",
    range: [100, 300],
  },
  {
    id: "copy",
    label: "Copywriting",
    description: "Written from scratch for every page: headlines, body, CTAs.",
    range: [100, 250],
  },
  {
    id: "motion",
    label: "Animations",
    description: "Scroll choreography, micro-interactions and page transitions. Like this site.",
    range: [100, 300],
  },
  {
    id: "cms",
    label: "CMS / Admin Panel",
    description: "Edit your own content without touching code.",
    range: [150, 300],
  },
  {
    id: "payments",
    label: "Booking / Payments",
    description: "Take bookings or payments through Paystack, Mobile Money or Stripe.",
    range: [150, 300],
  },
  {
    id: "brand",
    label: "Logo & Brand",
    description: "Identity work bundled in: mark, colour system and type scale.",
    range: [100, 300],
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
    multiplier: 1.3,
  },
];

/** Rounds to the nearest 50 so quotes read as estimates, not invoices. */
export function roundQuote(value: number): number {
  return Math.round(value / 50) * 50;
}

export function formatMoney(value: number): string {
  return `${currency.symbol}${roundQuote(value).toLocaleString("en-US")}`;
}
