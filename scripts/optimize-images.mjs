/**
 * Converts raw PNG/JPG renders and screenshots into WebP at 1x and 2x.
 *
 *   npm run optimize:images                  # everything under public/work
 *   npm run optimize:images public/gallery   # or a specific folder
 *
 * Case study images render around 600px wide on desktop, so 760/1520 covers
 * standard and retina displays without shipping a multi-megabyte render. Source
 * files are deleted once converted so both formats never ship together.
 *
 * Exports from Fusion 360 and Blender routinely land at 1-2 MB each. A large
 * share of this site's audience is on mobile in Ghana, where that is real money,
 * so nothing raw should reach `public/` unconverted.
 */
import sharp from "sharp";
import { readdirSync, statSync, unlinkSync } from "node:fs";
import { join, extname, basename, dirname } from "node:path";

const WIDTHS = { "": 760, "@2x": 1520 };
const SOURCE_EXT = new Set([".png", ".jpg", ".jpeg"]);

function collect(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...collect(full));
    else if (SOURCE_EXT.has(extname(entry.name).toLowerCase())) found.push(full);
  }
  return found;
}

const root = process.argv[2] ?? "public/work";
const sources = collect(root);

if (sources.length === 0) {
  console.log(`Nothing to convert under ${root}. Raw PNG/JPG sources only.`);
  process.exit(0);
}

let totalBefore = 0;
let totalAfter = 0;

for (const src of sources) {
  const name = basename(src, extname(src));
  const dir = dirname(src);
  const before = statSync(src).size;
  const meta = await sharp(src).metadata();

  let after = 0;
  const made = [];
  for (const [suffix, width] of Object.entries(WIDTHS)) {
    const out = join(dir, `${name}${suffix}.webp`);
    const w = Math.min(width, meta.width); // never upscale past the source
    await sharp(src)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(out);
    const size = statSync(out).size;
    after += size;
    made.push(`${w}w ${(size / 1024).toFixed(0)}kB`);
  }

  totalBefore += before;
  totalAfter += after;
  unlinkSync(src);

  console.log(
    `${name.padEnd(20)} ${`${meta.width}x${meta.height}`.padEnd(12)} ` +
      `${`${(before / 1024).toFixed(0)} kB`.padEnd(10)} -> ${made.join(" + ").padEnd(26)} ` +
      `${(100 - (after / before) * 100).toFixed(1)}% smaller`,
  );
}

console.log(
  `\n${sources.length} file(s): ${(totalBefore / 1024).toFixed(0)} kB -> ` +
    `${(totalAfter / 1024).toFixed(0)} kB, ` +
    `${(100 - (totalAfter / totalBefore) * 100).toFixed(1)}% smaller overall`,
);
