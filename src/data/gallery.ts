export type GalleryPiece = {
  id: string;
  title: string;
  /** One-line description of the piece. */
  caption: string;
  tools: string[];
  /** Leave undefined to render the marked placeholder frame. */
  src?: string;
  alt: string;
  /** Drives the masonry span so the grid doesn't read as a uniform block. */
  aspect: "portrait" | "square" | "landscape";
  /** Set on the hero piece of a series — renders with the featured treatment. */
  featured?: boolean;
};

/**
 * 4C_Curls_22 is framed as a mini case study inside the gallery — it's a full
 * brand build, not a one-off graphic.
 */
export const curlsCaseStudy = {
  title: "4C_Curls_22",
  kicker: "Brand build",
  blurb:
    "Designed and built an entire hair care brand from the ground up — 3D modelled the bottles, designed the labels, and took the packaging through to production-ready artwork.",
  tools: ["Fusion 360", "Blender", "Canva", "Illustrator"],
};

export const galleryPieces: GalleryPiece[] = [
  // TODO: Pero to provide real images. Drop files in /public/gallery/ and set
  // `src` on each piece — placeholder frames render until then.
  {
    id: "curls-bottle-render",
    title: "4C_Curls_22 — Bottle render",
    caption: "Product bottle modelled in Fusion 360, rendered in Blender",
    tools: ["Fusion 360", "Blender"],
    alt: "3D render of the 4C_Curls_22 hair care bottle",
    aspect: "portrait",
    featured: true,
  },
  {
    id: "curls-label",
    title: "4C_Curls_22 — Label design",
    caption: "Label artwork and typographic system for the product line",
    tools: ["Illustrator", "Canva"],
    alt: "4C_Curls_22 product label design",
    aspect: "square",
  },
  {
    id: "curls-packaging",
    title: "4C_Curls_22 — Packaging",
    caption: "Full packaging build — carton, sleeve and production artwork",
    tools: ["Illustrator", "Blender"],
    alt: "4C_Curls_22 packaging design",
    aspect: "landscape",
  },
  {
    id: "curls-logo",
    title: "4C_Curls_22 — Identity",
    caption: "Wordmark, monogram and the brand's colour system",
    tools: ["Illustrator"],
    alt: "4C_Curls_22 logo and identity system",
    aspect: "square",
  },
  {
    id: "logo-suite",
    title: "Logo suite",
    caption: "Selected marks and wordmarks from client identity work",
    tools: ["Illustrator", "Canva"],
    alt: "Collection of logo designs",
    aspect: "landscape",
  },
  {
    id: "product-render",
    title: "Product renders",
    caption: "Hard-surface product modelling and lighting studies",
    tools: ["Fusion 360", "Blender"],
    alt: "Product design renders",
    aspect: "portrait",
  },
];
