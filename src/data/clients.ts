export type ClientSite = {
  id: string;
  name: string;
  /** One line on what the site is for. */
  description: string;
  url: string;
  /** Shown under the name, e.g. the sector or the kind of build. */
  kind: string;
  /** Preview image. Undefined renders the marked pending frame. */
  src?: string;
  src2x?: string;
  alt: string;
};

/**
 * Freelance site builds, shown as a light grid under the flagship case studies.
 *
 * Previews are each site's own OG image, downloaded and self-hosted rather than
 * hotlinked. Two of the four are Google Cloud signed URLs that expired back in
 * March, so those render the pending frame until real screenshots exist. See
 * the note in WorkPage about that.
 */
export const clientSites: ClientSite[] = [
  {
    id: "california-sheds",
    name: "California Sheds",
    kind: "Sacramento, CA",
    description:
      "Custom sheds, barns and garages for a family business that has been building since 1981.",
    url: "https://www.californiasheds.com",
    src: "/work/clients/california-sheds.webp",
    src2x: "/work/clients/california-sheds@2x.webp",
    alt: "The California Sheds website",
  },
  {
    id: "mtf-hub",
    name: "MTFHub",
    kind: "Tax strategy",
    // TODO: Pero to confirm the description. Taken from the site's own meta
    // description, "Make taxes fair with strategic moves".
    description: "Make Taxes Fair: a platform for planning tax strategy rather than reacting to it.",
    url: "https://mtf-hub.lovable.app",
    // Their OG image is only 400x210, so there's no 2x worth generating. Fine at
    // card size, a little soft on a retina screen.
    src: "/work/clients/mtf-hub.webp",
    alt: "The MTFHub website",
  },
  {
    id: "nor-cal-plumbing",
    name: "Nor-Cal Plumbing",
    kind: "Plumbing services",
    description: "Repairs and installs for a local plumbing outfit, built to bring in call-outs.",
    url: "https://nor-cal-plumbing.com",
    // TODO: preview pending. The site's own og:image is a signed Google Cloud
    // URL that expired on 2026-03-14 and now returns 403, so there was nothing
    // to download. A screenshot would fix both this and the site's own broken
    // social previews.
    alt: "The Nor-Cal Plumbing website",
  },
  {
    id: "boss-don-nft",
    name: "Boss Don NFT",
    kind: "NFT collection",
    description:
      "A limited run of 111 pieces in the SkillStacker ecosystem, where access is earned rather than bought.",
    url: "https://boss-don-nft.lovable.app",
    // TODO: preview pending. Same as Nor-Cal: the site's og:image signature
    // expired on 2026-03-10 and returns 403.
    alt: "The Boss Don NFT website",
  },
];
