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
    alt: "The California Sheds homepage, a shed and garage builder in Sacramento",
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
    src: "/work/clients/nor-cal-plumbing.webp",
    src2x: "/work/clients/nor-cal-plumbing@2x.webp",
    alt: "The Nor-Cal Plumbing homepage, showing a 24/7 emergency call-out banner and jobs completed",
  },
  {
    id: "boss-don-nft",
    name: "Boss Don NFT",
    kind: "NFT collection",
    description:
      "A limited run of 111 pieces in the SkillStacker ecosystem, where access is earned rather than bought.",
    url: "https://boss-don-nft.lovable.app",
    src: "/work/clients/boss-don-nft.webp",
    src2x: "/work/clients/boss-don-nft@2x.webp",
    alt: "The Boss Don NFT site, showing a row of crowned knight artworks above the collection statement",
  },
];
