# Pero — Portfolio

Single-page portfolio site. React + Vite + TypeScript, Tailwind v4, Framer Motion, Lenis,
and a small three.js scene in the hero.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build to dist/
npm run preview  # serve the built output
```

Deploy: push to a Git repo and import into Vercel. It auto-detects Vite — no config needed.

---

## What still needs your input

Everything below is marked `TODO: Pero to provide` in the code. The site runs fine without
them; placeholders are visibly marked so nothing looks accidentally broken.

### Content

| What | Where |
| --- | --- |
| Screenshots for FlashX, gheasy, Jexi | `src/data/projects.ts` → set `src` on each `images` entry |
| **Jexi's three module names + what each does** | `src/data/projects.ts` → the `highlights` and `impact` arrays under `jexi` |
| Live URLs for FlashX / gheasy | `src/data/projects.ts` → `liveUrl` |
| 4C_Curls_22 artwork + other design pieces | `src/data/gallery.ts` → set `src` on each piece |
| Bio copy (drafted — review the tone) | `src/components/About.tsx` → the `BIO` array |

### Pricing

`src/data/pricing.ts` holds **placeholder numbers**. Every price is a `[low, high]` range.
Replace the numbers, then set `PRICING_IS_PLACEHOLDER = false` to hide the warning banner
on the site. Switch `currency` to GHS there if you'd rather quote locally. No component
changes needed — the builder reads the data file directly.

### Contact form

`src/components/Contact.tsx` → set `FORM_ENDPOINT` to a Formspree (or similar) URL.
Until then the form composes a pre-filled email to the address in `src/data/site.ts`
instead, so it's never a dead end. Confirm that address is the one you want.

### Domain + social image

Once the domain is live, update it in `index.html` (canonical, OG, Twitter, JSON-LD),
`public/robots.txt` and `public/sitemap.xml`. Drop a 1200×630 share image at `public/og.jpg`.

### Images

Put real assets in `public/` (e.g. `public/work/flashx/dashboard.png`) and reference them
as `/work/flashx/dashboard.png`. They're lazy-loaded automatically.

---

## Notes on a few decisions

**Theme switching uses the View Transitions API**, not CSS transitions — see
`src/hooks/useTheme.ts`. Chromium won't re-run a `transition` on a property whose value
comes from `var(--token)` when only the token changes, which left the page half-themed.
A view transition cross-fades a snapshot of the whole page instead. Browsers without it
get an instant, correct swap.

**`body` uses `overflow-x: clip`, not `hidden`.** `hidden` turns body into a scroll
container, which breaks Lenis's scroll math and the `position: sticky` case-study columns.

**Reduced motion** is respected throughout: Lenis doesn't initialise, the custom cursor and
hero spotlight don't mount, and reveal animations render their content statically rather
than animating it.

## The hero ribbon

`src/components/HeroRibbon.tsx` — a real-time folded glass ribbon built with React Three
Fiber and drei's `MeshTransmissionMaterial`, sitting to the right of the copy.

**Shape.** A rounded slab cross-section swept along a closed three-lobed spine, with a
twist angle that varies along the sweep. The twist is the point: it rolls the sheet
edge-on then face-on as it travels, which is what produces layered folds and thin lit
edges. An earlier version displaced a sphere instead — no amount of subdivision makes a
sphere express that topology, it just reads as a lumpy form.

Two things in the sweep are easy to get wrong and are load-bearing:

- **Frames are parallel-transported, not Frenet.** A Frenet frame flips through curve
  inflection points, snapping the sheet 180° mid-sweep.
- **Holonomy is corrected.** Parallel transport around a closed loop returns rotated by
  some angle — measured here at up to 150°, which left a 0.92-unit gap between the
  ribbon's first and last ring, wider than the ribbon (0.88). The angle is measured and
  unwound linearly across the sweep, closing the seam to 0.

**Smooth shading is not automatic.** `IcosahedronGeometry` (and any `PolyhedronGeometry`)
is non-indexed, so `computeVertexNormals()` on it yields *face* normals — flat shading,
which looks like a cut gem. This geometry is built indexed from the start so normals
average across adjoining faces. If you swap the geometry, verify it's indexed or weld it
with `mergeVertices` first.

The sweep is rebuilt every other frame while rotation runs every frame — the reshape plus
`computeVertexNormals` is the expensive half, and the morph is slow enough that the halved
rate is invisible.

**Lighting.** Coloured `Lightformer`s inside `<Environment>` rather than an HDR file, so
the scene needs no extra network request and no external asset host. The violet, magenta,
orange and teal lightformers are what produce the iridescent glints; `chromaticAberration`
supplies the edge fringing.

**Glow must live in the scene.** A transmission material refracts whatever the renderer
draws into its transmission buffer, and it can only sample the 3D scene — never the DOM.
The page's CSS glow divs sit behind a transparent canvas, so with those alone the glass
refracted an empty buffer and read as flat plastic. `GlowField` puts additively-blended
coloured sprites *behind* the ribbon in 3D; that's what makes it look like glass and what
bleeds colour through the form.

**Cost, and how it's contained.** This is by far the heaviest thing on the site — a
955 kB / **259 kB gzip** lazy chunk, and a transmission material re-renders the scene into
an offscreen buffer every frame. So:

- It's `React.lazy`-imported and only mounts after `requestIdleCallback`, so it never
  blocks first paint. The main bundle is unaffected at ~138 kB gzip.
- `canRenderGlass()` in `Hero.tsx` refuses on reduced-motion, on phones (coarse pointer
  under 900px), under 4 GB `deviceMemory`, under 4 cores, and when WebGL is missing —
  checked *before* the chunk is fetched.
- The frameloop stops entirely (`frameloop="never"`) once the hero scrolls out of view.
- DPR is capped at 1.5; transmission `samples` and `resolution` are kept low.

Everything that fails those checks gets `HeroBlobFallback.tsx` instead — three blurred
gradient lobes in the same palette, at effectively zero cost.

**Light mode.** The blob adapts rather than staying dark: thinner glass, higher roughness,
paler attenuation and dimmer lightformers, driven by the `pero:themechange` event.

---

## Brand colours

Iridescent violet and magenta over a deep purple-black, matched to the hero blob's glass.
The base is deliberately not pure `#000` — it carries violet, per the reference. All
defined as tokens at the top of `src/index.css`; change them there and the whole site
follows, including the blob, which reads the theme at runtime.

| | Dark (default) | Light |
| --- | --- | --- |
| Background | `#0B0710` purple-black | `#F7F4FB` lavender-white |
| Text | `#F4F0F8` | `#1A1224` |
| Muted | `#A294B5` | `#675A78` |
| Accent | `#B06BFF` violet | `#7C3AED` violet |
| Accent 2 | `#FF5CA8` magenta | `#C2255C` |

Light mode drops to a deeper violet — the vivid dark-mode one can't carry text contrast on
a near-white page. Measured in-browser, every pair clears WCAG AA and most clear AAA
(dark: body 17.7, accent 6.1, muted 7.1; light: body 16.7, accent 5.2, muted 5.8).

## The gradient buttons

`src/components/ui/gradient-button.tsx` is the standalone primitive. The site's primary
CTAs get the same look through `MagneticButton`'s `solid` variant, which applies the
`.gradient-button` class over the site's pill geometry so they keep the magnetic hover
motion. Secondary actions (Get in Touch, Start over, a not-yet-enabled Continue) stay
`outline` on purpose.

Two things worth knowing before editing:

- **Don't add a `transition-*` utility to a gradient button.** Tailwind utilities sit in a
  later cascade layer than the components layer, so a transition utility replaces
  `.gradient-button`'s own transition of the `--pos`/`--color`/`--stop` properties and
  freezes the animation. This is why `transition-colors` lives on the `outline`/`ghost`
  variants rather than the shared base classes.
- The animated variables are registered with `@property` at the top of `index.css`, outside
  any `@layer` — `@property` is not a layerable rule in Tailwind v4's native cascade layers.
