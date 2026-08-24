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
    "I built an entire hair care brand from the ground up. I modelled the bottle in 3D, designed the label and the identity on it, and rendered the product across a set of scenes for the launch campaign.",
  tools: ["Fusion 360", "Blender", "Illustrator", "Canva"],
};

/**
 * The 4c Curls render series, all shot from the same 3D bottle.
 *
 * Ordered deliberately rather than by filename: the gallery collapses to the
 * first six, so the strongest and most varied scenes lead and the rest sit
 * behind the view-more control.
 */
const curlsScenes: { file: string; caption: string }[] = [
  { file: "curls-29", caption: "Tilted hero shot on a plain lilac backdrop" },
  { file: "curls-31", caption: "Three bottles staggered across blue steps" },
  { file: "curls-30", caption: "Styled on a desk with a monstera, phone and earbuds" },
  { file: "curls-27", caption: "Resting on a stack of books beside a pothos" },
  { file: "curls-14", caption: "Framed by soft white metaballs" },
  { file: "curls-13", caption: "Against gold and blue geometric blocks" },

  { file: "curls-05", caption: "On a podium inside a lit ring" },
  { file: "curls-26", caption: "Suspended under a glowing disc" },
  { file: "curls-12", caption: "With a cactus and frosted spheres" },
  { file: "curls-24", caption: "A pair on blue podiums with leaves and glass" },
  { file: "curls-20", caption: "Seen through a frosted glass sphere" },
  { file: "curls-19", caption: "Alone in a dark blue corridor of light" },
  { file: "curls-22", caption: "Bottles arced across a blue curve" },
  { file: "curls-23", caption: "A row of bottles receding into purple" },
  { file: "curls-28", caption: "Floating with glass spheres on deep blue" },
  { file: "curls-08", caption: "Arranged inside a set of chrome rings" },
  { file: "curls-10", caption: "Two bottles inside a large ring" },
  { file: "curls-09", caption: "Drifting among dark glass spheres" },
  { file: "curls-15", caption: "Balanced on a bar with dark spheres" },
  { file: "curls-16", caption: "Behind a tilted glass disc" },
  { file: "curls-17", caption: "On a podium beneath a curved arch" },
  { file: "curls-18", caption: "Balanced on striped abstract forms" },
  { file: "curls-21", caption: "Against sharp geometric planes" },
  { file: "curls-03", caption: "Two bottles along a lit diagonal" },
  { file: "curls-04", caption: "Three bottles on orange and blue colour blocks" },
  { file: "curls-06", caption: "A crossed pair under magenta light" },
  { file: "curls-07", caption: "Two bottles on a purple gradient" },
  { file: "curls-11", caption: "Lit by a single gold slash" },
  { file: "curls-25", caption: "Set against a gold organic texture" },
  { file: "curls-02", caption: "Scattered with green spheres" },
  { file: "curls-01", caption: "Racked in a dark display" },
];

export const galleryPieces: GalleryPiece[] = [
  ...curlsScenes.map((scene, index) => ({
    id: scene.file,
    title: "4c Curls",
    caption: scene.caption,
    tools: ["Blender", "Illustrator"],
    alt: `4c Curls hair oil by JU Cosmetics. ${scene.caption}.`,
    aspect: "square" as const,
    featured: index === 0,
    src: `/gallery/${scene.file}.webp`,
    src2x: `/gallery/${scene.file}@2x.webp`,
  })),

  // TODO: Pero to provide these two, then run `npm run optimize:images public/gallery`.
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
