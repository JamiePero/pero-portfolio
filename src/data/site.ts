/**
 * Single source of truth for identity, contact routing and SEO copy.
 * Everything a deploy needs to be "really Pero's" lives here.
 */

export const site = {
  name: "Pero",
  fullName: "Pero",
  role: "Builder — hardware, software & design",
  // TODO: Pero to confirm — this is the address the contact form falls back to.
  email: "jamiepero31@gmail.com",
  location: "Ghana",
  x: {
    handle: "@Itz_Pero",
    url: "https://x.com/Itz_Pero",
  },
  // TODO: Pero to provide the production domain, then update index.html's og:url too.
  url: "https://pero.dev",
  description:
    "Pero is a builder based in Ghana working across hardware, software and design — 3D modelling, brand identity, Arduino/ESP32 systems, and web development with technical SEO.",
} as const;

/** Roles cycled through by the hero subhead. */
export const heroRoles = [
  "Web Developer",
  "3D Modeler",
  "Hardware Tinkerer",
  "Brand Designer",
  "Founder",
] as const;

/** Nav + scroll-spy targets. Order matches the section order on the page. */
export const navSections = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "gallery", label: "Design" },
  { id: "services", label: "Services" },
  { id: "pricing", label: "Pricing" },
  { id: "contact", label: "Contact" },
] as const;
