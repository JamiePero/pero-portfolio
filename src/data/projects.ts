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
  /** Bullet list rendered under the solution. Omit for a project that carries
   *  its detail in the extended sections below instead. */
  highlights?: string[];
  tech: string[];
  impact: { value: string; label: string }[];
  liveUrl?: string;
  images: ProjectImage[];

  /* ---------------------------------------------------------------------
     Everything below is optional and renders full width beneath the pinned
     narrative. Added for Jexi, which has genuine engineering detail worth
     showing, but nothing here is Jexi-specific: a project that doesn't set
     a field simply doesn't render that section.
     --------------------------------------------------------------------- */

  /** Competition win or similar. Rendered as a badge beside the hero image. */
  award?: { title: string; detail: string };
  /** What it does, as a grid rather than a wall of prose. */
  features?: { title: string; body: string }[];
  /** Bill of materials. Rendered as a spec table. */
  hardware?: { part: string; role: string }[];
  /** Ordered sequence describing one full cycle of operation. */
  flow?: string[];
  /** Pulled-out point, sitting apart from the body copy. */
  callout?: { label: string; body: string };
  /** Where it goes next, one column per stage. */
  roadmap?: { stage: string; label: string; items: string[] }[];
  /** Closing line under the roadmap. */
  outlook?: string;
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
      {
        src: "/work/gheasy/mobile-app.webp",
        src2x: "/work/gheasy/mobile-app@2x.webp",
        alt: "The gheasy mobile app shown on two phones: the easy splash screen, and the home screen with the buy data call to action, network support, agent signup and the games tab",
        caption: "The app: instant delivery, mobile money, and every network",
        aspect: "landscape",
      },
      {
        src: "/work/gheasy/agent-dashboard.webp",
        src2x: "/work/gheasy/agent-dashboard@2x.webp",
        alt: "The gheasy agent dashboard showing earnings balance and order count, a personal store link, price markup controls, a referral code with points, a WhatsApp support number field and a cashout request",
        caption: "The agent side: your own storefront, your own prices, your own cashout",
        aspect: "wide",
      },
      {
        src: "/work/gheasy/easy-games.webp",
        src2x: "/work/gheasy/easy-games@2x.webp",
        alt: "The Easy Games suite on two phones: easy Wheel, a spin-to-win wheel with data prizes from 100MB to 1GB, and Jumpy Bear, a platform jumper scored against a personal best",
        caption: "Easy Games: spin the wheel, win data, come back tomorrow",
        aspect: "landscape",
      },
    ],
  },
  {
    id: "jexi",
    index: "03",
    name: "Jexi",
    tagline: "A connected bin that reports how full it actually is",
    year: "2025",
    status: "V1 built",
    award: {
      title: "National Champion",
      detail: "Speak Out for Engineering '25, IMechE",
    },
    problem:
      "Bins overflow before the truck is scheduled to arrive. Meanwhile that same truck drives a fixed route and stops at bins barely half full, burning fuel and hours on collections nobody needed. With an ordinary bin there is no way to tell the two apart, because nothing about it reports anything. You end up with waste on the pavement in one street and a wasted trip in the next.",
    solution:
      "Jexi is a bin that measures its own fill level and tells you about it. An ultrasonic sensor reads how much room is left, an ESP32 processes that and pushes it to a dashboard, and when the bin hits capacity it sends an SMS. Collection stops being a fixed schedule and becomes a decision. Rather than sending a truck to every bin on the route, the team sees Bin 01 at 87 percent and goes there first.",
    tech: [
      "ESP32",
      "C++",
      "HC-SR04",
      "MG996R servo",
      "SIM900 GSM",
      "Blynk IoT",
      "TinyGPSPlus",
      "Fusion 360",
    ],
    impact: [
      { value: "Real time", label: "Fill level straight to the dashboard" },
      { value: "SMS", label: "Alert the moment a bin is full" },
      { value: "ESP32", label: "One controller running the whole bin" },
    ],
    features: [
      {
        title: "Automatic lid",
        body: "A servo lifts the lid when someone walks up, so nobody has to touch it.",
      },
      {
        title: "Waste level monitoring",
        body: "An ultrasonic sensor measures how much room is left inside the bin.",
      },
      {
        title: "Remote monitoring",
        body: "Bin status goes up to a cloud dashboard as it changes.",
      },
      {
        title: "Full bin alert",
        body: "An SMS goes out the moment the bin reaches capacity.",
      },
      {
        title: "GPS tracking",
        body: "Reports where the bin is, along with speed and altitude.",
      },
      {
        title: "IoT dashboard",
        body: "Built on Blynk, so the data is readable from anywhere.",
      },
    ],
    hardware: [
      { part: "ESP32 38-pin dev board", role: "Main controller" },
      { part: "HC-SR04 ultrasonic sensor", role: "Measures waste level" },
      { part: "MG996R servo motor", role: "Drives the automatic lid" },
      { part: "SIM900 GSM module", role: "SMS and network communication" },
      { part: "GPS module", role: "Position tracking" },
      { part: "Blynk IoT", role: "Remote monitoring dashboard" },
      { part: "TinyGPSPlus", role: "GPS data processing" },
    ],
    flow: [
      "Someone approaches the bin",
      "The servo lifts the lid",
      "Waste goes in and the lid closes",
      "The ultrasonic sensor reads the new level",
      "The ESP32 processes that reading",
      "Status is pushed to the Blynk dashboard",
      "If the bin has hit capacity, an SMS goes out",
    ],
    callout: {
      label: "Why it matters",
      body: "Collecting every bin regardless of how full it is costs fuel, hours and vehicle wear on trips that did not need to happen. Monitor first, then send the truck only where it is needed. On one bin that is a small saving. Across a fleet it is most of the operating cost.",
    },
    roadmap: [
      {
        stage: "V1",
        label: "Built",
        items: [
          "ESP32 with ultrasonic and GPS sensors",
          "Servo-driven automatic lid",
          "Blynk dashboard and SMS alerts",
        ],
      },
      {
        stage: "V2",
        label: "Next",
        items: [
          "Dedicated PCB in place of the dev board",
          "Proper waterproofing and a tougher enclosure",
          "Solar and battery power",
          "Better sensors and cellular IoT",
        ],
      },
      {
        stage: "V3",
        label: "Where it goes",
        items: [
          "Fleet platform with many bins on one dashboard",
          "Automatic collection prioritisation",
          "Route optimisation and analytics",
          "Municipal and company accounts",
        ],
      },
    ],
    outlook:
      "The end of this is not a smart bin. It is a network of them, where the route plans itself around what the bins are actually doing.",
    liveUrl: undefined,
    images: [
      {
        src: "/work/jexi/color-variants.webp",
        src2x: "/work/jexi/color-variants@2x.webp",
        alt: "Jexi smart bin shown in three colour variants, black, grey and white",
        caption: "Three colourways, modelled in Fusion 360",
        aspect: "landscape",
      },
      {
        src: "/work/jexi/in-context.webp",
        src2x: "/work/jexi/in-context@2x.webp",
        alt: "Jexi smart bin styled in a home setting",
        caption: "In context, where it actually has to sit",
        aspect: "wide",
      },
      {
        src: "/work/jexi/exploded-parts.webp",
        src2x: "/work/jexi/exploded-parts@2x.webp",
        alt: "Exploded view of the Jexi smart bin showing lid, sensor mechanism and body components",
        caption: "Exploded: lid, sensor mechanism and body",
        aspect: "wide",
      },
      {
        src: "/work/jexi/technical-drawing.webp",
        src2x: "/work/jexi/technical-drawing@2x.webp",
        alt: "Third angle projection of the Jexi smart bin with dimensions, showing front, side and plan views alongside an isometric render",
        caption: "Third angle projection, dimensioned for manufacture",
        aspect: "wide",
      },
      {
        src: "/work/jexi/electronics.webp",
        src2x: "/work/jexi/electronics@2x.webp",
        alt: "System diagram of the Jexi electronics, showing the ESP32 wired to ultrasonic sensors, a servo, a GPS module and a SIM900 GSM module, with data flowing to the cloud and an SMS alert to a phone",
        caption: "How the electronics hang together, from sensor to SMS",
        aspect: "wide",
      },
      // TODO: Pero to supply the Blynk dashboard screenshot, then run
      // `npm run optimize:images public/work/jexi` and point this at the .webp
      // pair it produces. Renders as a pending frame until then.
      {
        alt: "The Blynk dashboard showing live fill level and location for a Jexi bin",
        caption: "The Blynk dashboard, reading a bin live",
        aspect: "wide",
      },
    ],
  },
];
