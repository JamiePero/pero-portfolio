export type GalleryPiece = {
  id: string;
  title: string;
  /** One-line description of the piece. */
  caption: string;
  tools: string[];
  /** Leave undefined to render the marked placeholder frame. */
  src?: string;
  /** Retina variant. Produced alongside `src` by `npm run optimize:images`. */
  src2x?: string;
  alt: string;
  /** Drives the masonry span so the grid doesn't read as a uniform block. */
  aspect: "portrait" | "square" | "landscape";
  /** Set on the hero piece of a series — renders with the featured treatment. */
  featured?: boolean;
};

/**
 * 4C_Curls_22 is framed as a mini case study inside the gallery, because it's a
 * full brand build rather than a one-off graphic.
 */
export const curlsCaseStudy = {
  title: "4C_Curls_22",
  kicker: "Brand build",
  blurb:
    "I built an entire hair care brand from the ground up. I modelled the bottle in 3D, designed the label and the identity on it, and rendered the whole product range across a set of scenes for the launch campaign.",
  tools: ["Fusion 360", "Blender", "Illustrator", "Canva"],
};

/**
 * The 4c Curls render series.
 *
 * TODO: Pero to drop the source files in `public/gallery/` using the ids below
 * as filenames, then run `npm run optimize:images public/gallery`. That writes
 * the .webp pair each entry expects and deletes the heavy source. Until then
 * every entry renders as a marked pending frame.
 *
 * All of these are the same product shot in different scenes, so they share a
 * square crop and the same tools. Only the scene description changes.
 */
const curlsScenes: { id: string; caption: string }[] = [
  { id: "curls-purple-spheres", caption: "Single bottle among dark glass spheres" },
  { id: "curls-blue-podiums", caption: "Three bottles staggered across blue podiums" },
  { id: "curls-desk-scene", caption: "Styled on a desk with a monstera, phone and earbuds" },
  { id: "curls-hero-tilt", caption: "Tilted hero shot on a plain lilac backdrop" },
  { id: "curls-floating-blue", caption: "Bottles floating against deep blue" },
  { id: "curls-books-plant", caption: "Resting on a stack of books beside a pothos" },
  { id: "curls-spotlight", caption: "Suspended between two lit discs" },
  { id: "curls-twin-podium", caption: "A pair on blue cylinders with glass spheres" },
  { id: "curls-lineup", caption: "A row of bottles receding into purple" },
  { id: "curls-arc", caption: "Bottles arced across a blue curve" },
  { id: "curls-geometric", caption: "Against sharp geometric planes in dark blue" },
  { id: "curls-frosted-sphere", caption: "Seen through a frosted glass sphere" },
  { id: "curls-corridor", caption: "Alone in a dark blue corridor of light" },
  { id: "curls-striped", caption: "Balanced on striped abstract forms" },
  { id: "curls-metaballs", caption: "Framed by soft white metaballs" },
  { id: "curls-gold", caption: "Two bottles across gold and blue blocks" },
];

export const galleryPieces: GalleryPiece[] = [
  ...curlsScenes.map((scene, index) => ({
    id: scene.id,
    title: "4c Curls",
    caption: scene.caption,
    tools: ["Blender", "Illustrator"],
    alt: `4c Curls hair oil by JU Cosmetics. ${scene.caption}.`,
    aspect: "square" as const,
    // The first render carries the featured badge as the series hero.
    featured: index === 0,
    // TODO: uncomment once the files exist and the optimizer has run.
    // src: `/gallery/${scene.id}.webp`,
    // src2x: `/gallery/${scene.id}@2x.webp`,
  })),

  // TODO: Pero to provide these two as well, same process as above.
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
