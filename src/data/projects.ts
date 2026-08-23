export type ProjectImage = {
  /** Leave undefined to render the marked placeholder frame instead. */
  src?: string;
  /** Retina variant. Produced alongside `src` by `npm run optimize:images`. */
  src2x?: string;
  alt: string;
  caption: string;
  /**
   * Shape of the placeholder frame, and a note to whoever exports the asset
   * about what shape is expected. Real images render at their natural ratio,
   * so this only drives the pending state. Defaults to wide for the primary
   * image and landscape for the rest.
   */
  aspect?: "wide" | "landscape" | "portrait" | "square";
};

export type Project = {
  id: string;
  index: string;
  name: string;
  tagline: string;
  year: string;
  status: string;
  /** Sticky-column copy: the narrative half of the case study. */
  problem: string;
  solution: string;
  /** Bullet list rendered under the solution. */
  highlights: string[];
  tech: string[];
  impact: { value: string; label: string }[];
  liveUrl?: string;
  images: ProjectImage[];
};

export const projects: Project[] = [
  {
    id: "flashx",
    index: "01",
    name: "FlashX",
    tagline: "Multi-tenant Wi-Fi hotspot SaaS + data reseller platform",
    year: "Since 2024",
    status: "Live",
    problem:
      "Reliable internet in underserved parts of Ghana is either unavailable or priced for people who aren't there. Small operators who want to run a hotspot have the hardware, but no billing layer, no way to take mobile money, and no dashboard telling them what's actually happening on their network.",
    solution:
      "FlashX fills that gap. An operator plugs in a MikroTik router, connects their tenant account, and can be selling access within minutes. They sell vouchers, time-based bundles or data packages, and take payment on the rails people in Ghana actually use. I built the whole stack: the captive portal, the tenant isolation model, the payment reconciliation, and the USSD flow for customers who don't have a smartphone.",
    highlights: [
      "Multi-tenant architecture, so every operator gets isolated data, pricing and branding",
      "Paystack and Mobile Money checkout, with vouchers provisioned automatically once payment confirms",
      "USSD fallback so feature-phone users can buy access without a data connection",
      "MikroTik RouterOS integration for live session control and bandwidth policy",
      "An operator dashboard covering revenue, active sessions and per-package performance",
    ],
    tech: [
      "MikroTik RouterOS",
      "Node.js",
      "Express",
      "Firebase",
      "Paystack",
      "USSD / MoMo",
      "Railway",
    ],
    impact: [
      { value: "Multi-tenant", label: "Operators run independently on one platform" },
      { value: "USSD + MoMo", label: "Works without a smartphone or card" },
      { value: "Minutes", label: "From router plugged in to first sale" },
    ],
    // TODO: Pero to provide the live FlashX URL if it's public.
    liveUrl: undefined,
    images: [
      {
        src: "/work/flashx/mobile-app.webp",
        alt: "FlashX mobile app interface showing plan status and quick actions",
        caption: "The customer app, showing plan status, live usage and quick actions",
      },
      {
        src: "/work/flashx/admin-overview.webp",
        alt: "FlashX admin dashboard showing revenue and user analytics",
        caption: "The admin workspace, with revenue, users and active plans on one screen",
      },
      {
        src: "/work/flashx/admin-analytics.webp",
        alt: "FlashX admin analytics showing revenue trend, plan performance and sales channel breakdown",
        caption: "Behind the scenes: 14-day revenue trend, plan performance and channel mix",
      },
    ],
  },
  {
    id: "gheasy",
    index: "02",
    name: "gheasy",
    tagline: "No-login data bundles, an agent network, and a games suite",
    year: "Since 2024",
    status: "Live",
    problem:
      "Buying a data bundle online in Ghana usually means an account, a password, and four screens before you get to pay. Most people give up somewhere in the middle. And the resellers, who are the ones actually moving volume, run their whole business out of WhatsApp threads and notebooks.",
    solution:
      "gheasy cuts the purchase down to three things: phone number, bundle, pay. There's no account to make and nothing to log into. Sitting on top of that is an agent and reseller tier with its own margins, wallets and order tracking, plus Easy Games, a set of small games that give people a reason to come back between top-ups.",
    highlights: [
      "Zero-login checkout, so a bundle is three taps from landing on the page",
      "Agent and reseller tier with wallet balances, custom margins and order history",
      "Easy Games, a light game layer that brings people back between purchases",
      "Order pipeline with real-time status, built to survive flaky mobile connections",
      "Admin tooling for pricing, reconciliation and agent management",
    ],
    tech: ["React", "Vite", "TypeScript", "Node.js", "Express", "Firebase", "Vercel", "Railway"],
    impact: [
      { value: "0 logins", label: "Checkout requires no account" },
      { value: "Agent network", label: "Resellers with wallets and margins" },
      { value: "Easy Games", label: "Gamification driving repeat orders" },
    ],
    // TODO: Pero to provide the live gheasy URL if it's public.
    liveUrl: undefined,
    images: [
      // TODO: Pero to provide real screenshots — /public/work/gheasy/
      { alt: "gheasy bundle purchase screen", caption: "No-login checkout: number, bundle, pay" },
      { alt: "gheasy agent dashboard", caption: "The agent dashboard, with wallet and order pipeline" },
      { alt: "Easy Games suite", caption: "Easy Games, the layer that brings people back" },
    ],
  },
  {
    id: "jexi",
    index: "03",
    name: "Jexi",
    tagline: "Smart waste management, designed in Figma and shipped with Lovable",
    year: "2025",
    status: "In build",
    problem:
      "Waste collection mostly runs on guesswork. Trucks drive fixed routes past empty bins and miss the full ones, residents have no idea when pickup is coming, and whoever is coordinating it is working off phone calls and paper.",
    solution:
      "Jexi is a mobile app that puts collection, tracking and coordination in one place. I designed the full product in Figma first, including the flows and the component library, then handed that system to Lovable.dev to build against. It went from static frames to a working app without losing the design intent along the way.",
    highlights: [
      // TODO: Pero to provide the three module names + what each one does, then
      // expand the "three modules" line below into one row per module.
      // Kept deliberately neutral rather than as visible TODO text — these
      // render as body copy on the live site.
      "Full product designed in Figma first, covering flows, component library and states",
      "Structured as three modules",
      "Handed to Lovable.dev to build against, going from static frames to a working app without losing the design intent",
      "Mobile-first, because it's built for the people doing the collecting rather than for a desk",
    ],
    tech: ["Figma", "Lovable.dev", "Design systems", "Mobile UX"],
    impact: [
      { value: "3", label: "Modules making up the product" },
      { value: "Figma → build", label: "Design-led handoff to Lovable.dev" },
      { value: "Mobile-first", label: "Built for the people doing the collecting" },
    ],
    liveUrl: undefined,
    images: [
      {
        src: "/work/jexi/color-variants.webp",
        src2x: "/work/jexi/color-variants@2x.webp",
        alt: "Jexi smart bin shown in three colour variants, black, grey and white",
        caption: "Three colourways, modelled in Fusion 360",
        aspect: "landscape",
      },
      // TODO: Pero to add in-context.png and exploded-parts.png to
      // public/work/jexi/, then run `npm run optimize:images` and point these at
      // the .webp pair it produces. They render as pending frames until then.
      {
        alt: "Jexi smart bin styled in a home setting",
        caption: "In context, where it actually has to sit",
        aspect: "wide",
      },
      {
        alt: "Exploded view of the Jexi smart bin showing lid, sensor mechanism and body components",
        caption: "Exploded: lid, sensor mechanism and body",
        aspect: "wide",
      },
      // TODO: Pero to supply app screenshots and a Figma board, then set `src`
      // on the three below. They render as pending frames until then.
      //   app-home.webp       phone screenshot, portrait
      //   app-modules.webp    phone screenshot, portrait
      //   figma-system.webp   Figma board, wide
      {
        alt: "Jexi app home screen showing the collection schedule",
        caption: "Home, with the collection schedule up front",
        aspect: "portrait",
      },
      {
        alt: "Jexi app screens showing the three modules",
        caption: "The three modules",
        aspect: "portrait",
      },
      {
        alt: "Jexi Figma design system with components and flows",
        caption: "The Figma design system handed to Lovable.dev",
        aspect: "wide",
      },
    ],
  },
];
