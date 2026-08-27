/**
 * Single source of truth for identity, contact routing and SEO copy.
 * Everything a deploy needs to be "really Pero's" lives here.
 */

export const site = {
  name: "Pero",
  fullName: "Pero",
  role: "Builder working across hardware, software and design",
  // TODO: Pero to confirm — this is the address the contact form falls back to.
  email: "jamiepero31@gmail.com",
  location: "Ghana",
  x: {
    handle: "@Itz_Pero",
    url: "https://x.com/Itz_Pero",
  },
  // Canonical origin. Mirrored in index.html (canonical/OG/Twitter/JSON-LD),
  // public/robots.txt and public/sitemap.xml — update all four together.
  url: "https://jamiepero.com",
  description:
    "Pero is a builder based in Ghana. He works across 3D modelling, brand identity, Arduino and ESP32 systems, and web development with technical SEO.",
} as const;

/** Roles cycled through by the hero subhead. */
export const heroRoles = [
  "Web Developer",
  "3D Modeler",
  "Hardware Tinkerer",
  "Brand Designer",
  "Founder",
] as const;

/**
 * Nav items that live on their own route rather than being a scroll target on
 * the main page. Rendered after the section links.
 */
/**
 * Every nav destination, in order.
 *
 * These were anchors on one long scrolling page until visitors reported it ran
 * too long. Each is now a real route, so it has its own URL that can be linked,
 * shared and indexed separately.
 */
export const navRoutes = [
  { path: "/about", label: "About" },
  { path: "/work", label: "Work" },
  { path: "/design", label: "Design" },
  { path: "/services", label: "Services" },
  { path: "/pricing", label: "Pricing" },
  { path: "/contact", label: "Contact" },
  { path: "/youtube", label: "Youtube" },
  { path: "/tools", label: "Tools" },
] as const;
