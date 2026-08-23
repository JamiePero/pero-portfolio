export type ProjectImage = {
  /** Leave undefined to render the marked placeholder frame instead. */
  src?: string;
  alt: string;
  caption: string;
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
    year: "2024 — present",
    status: "Live",
    problem:
      "Reliable internet in underserved parts of Ghana is either unavailable or priced for people who aren't there. Small operators who want to run a hotspot have the hardware but no billing layer, no way to take mobile money, and no dashboard telling them what's actually happening on their network.",
    solution:
      "FlashX is the missing layer. Operators plug in a MikroTik router, connect their tenant account, and start selling access in minutes — vouchers, time-based bundles, and data packages, paid for with the payment rails people in Ghana actually use. I built the whole stack: the captive portal, the tenant isolation model, the payment reconciliation, and the USSD flow for customers with no smartphone.",
    highlights: [
      "Multi-tenant architecture — every operator gets isolated data, pricing and branding",
      "Paystack + Mobile Money checkout, with automatic voucher provisioning on payment confirmation",
      "USSD fallback so feature-phone users can buy access without a data connection",
      "MikroTik RouterOS integration for live session control and bandwidth policy",
      "Operator dashboard: revenue, active sessions, and per-package performance",
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
      // TODO: Pero to provide real screenshots — drop files in /public/work/flashx/
      // and set `src` below. Placeholder frames render until then.
      { alt: "FlashX operator dashboard", caption: "Operator dashboard — revenue and live sessions" },
      { alt: "FlashX captive portal on mobile", caption: "Captive portal — package selection" },
      { alt: "FlashX USSD purchase flow", caption: "USSD flow — buying access on a feature phone" },
    ],
  },
  {
    id: "gheasy",
    index: "02",
    name: "gheasy",
    tagline: "No-login data bundles, an agent network, and a games suite",
    year: "2024 — present",
    status: "Live",
    problem:
      "Buying a data bundle online in Ghana usually means an account, a password, and four screens before you get to pay. Most people abandon somewhere in the middle. Meanwhile resellers — the people actually moving volume — are running their business out of WhatsApp threads and notebooks.",
    solution:
      "gheasy strips the purchase down to phone number, bundle, pay. No login, no account, no friction. On top of that sits an agent and reseller ecosystem with its own margins, wallets and order tracking, plus Easy Games — a gamified suite that turns repeat purchases into something people actually come back for.",
    highlights: [
      "Zero-login checkout — a bundle is three taps from landing on the page",
      "Agent + reseller tier with wallet balances, custom margins and order history",
      "Easy Games: gamified layer driving repeat purchases and retention",
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
      { alt: "gheasy bundle purchase screen", caption: "No-login checkout — number, bundle, pay" },
      { alt: "gheasy agent dashboard", caption: "Agent dashboard — wallet and order pipeline" },
      { alt: "Easy Games suite", caption: "Easy Games — the gamified retention layer" },
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
      "Waste collection runs on guesswork — trucks drive fixed routes past empty bins and miss full ones, residents have no idea when pickup is coming, and the people coordinating it are working from phone calls and paper.",
    solution:
      "Jexi is a mobile app that puts collection, tracking and coordination in one place. I designed the full product in Figma — flows, component library, the lot — then handed the system off to Lovable.dev to build against, which took it from static frames to a working app without losing the design intent.",
    highlights: [
      // TODO: Pero to provide the three module names + what each one does.
      // Replace these three placeholder rows with the real modules.
      "Module 01 — TODO: Pero to provide name + functionality",
      "Module 02 — TODO: Pero to provide name + functionality",
      "Module 03 — TODO: Pero to provide name + functionality",
      "Design system built in Figma first, then handed to Lovable.dev for the build",
    ],
    tech: ["Figma", "Lovable.dev", "Design systems", "Mobile UX"],
    impact: [
      { value: "3 modules", label: "TODO: Pero to name the modules" },
      { value: "Figma → build", label: "Design-led handoff to Lovable.dev" },
      { value: "Mobile-first", label: "Built for the people doing the collecting" },
    ],
    liveUrl: undefined,
    images: [
      // TODO: Pero to provide Figma frames / app screenshots — /public/work/jexi/
      { alt: "Jexi app home screen", caption: "Home — collection schedule at a glance" },
      { alt: "Jexi module screens", caption: "The three modules — TODO: Pero to confirm naming" },
      { alt: "Jexi Figma design system", caption: "Figma design system handed to Lovable.dev" },
    ],
  },
];
