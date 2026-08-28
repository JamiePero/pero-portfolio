/**
 * Writes a real HTML file per route, each carrying that route's own title,
 * description, canonical and Open Graph tags.
 *
 * Why this exists
 * ---------------
 * The app is a client-rendered SPA, so every path was served the same
 * index.html. That meant every route reported canonical and og:url as "/", which
 * tells search engines the other nine pages are duplicates of the homepage, and
 * meant every link preview in iMessage, WhatsApp or Slack showed the homepage
 * title no matter what was shared. Unfurlers do not run JavaScript, so fixing it
 * at runtime alone would not have reached them.
 *
 * What it does not do
 * -------------------
 * This bakes head tags, not body content. The body is still an empty root div
 * until React runs. Google renders JavaScript, so the pages index; a crawler
 * that does not would still see no copy. Full prerendering of content needs a
 * headless browser at build time (react-snap, vite-react-ssg), which is a much
 * larger change and a real dependency. Worth doing only if body-level indexing
 * turns out to matter.
 *
 * Runs after vite build. Vercel checks the filesystem before applying the SPA
 * rewrite, so dist/work/index.html is served for /work and the rewrite only
 * catches paths that have no file.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const ORIGIN = "https://www.jamiepero.com";

const meta = JSON.parse(readFileSync("src/data/page-meta.json", "utf8"));
const shell = readFileSync(join(DIST, "index.html"), "utf8");

/** Escapes text going into an HTML attribute. */
const attr = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** Replaces a tag's content attribute, or reports if the tag is missing. */
function setContent(html, matcher, value, label) {
  const re = new RegExp(`(<meta[^>]*${matcher}[^>]*content=")([^"]*)(")`, "i");
  if (!re.test(html)) {
    console.warn(`  ! ${label} not found in shell, skipped`);
    return html;
  }
  return html.replace(re, `$1${attr(value)}$3`);
}


/**
 * Extra structured data for routes that warrant it.
 *
 * The shell already carries Person, WebSite and ProfessionalService, which are
 * site-wide entities. This adds page-level schema only where there is a real
 * thing to describe, rather than decorating every route for its own sake.
 */
async function extraSchema(route) {
  if (route === "/work") {
    // Imported from the real source rather than copied into a second file, so
    // the schema cannot drift from what the page actually shows. Node strips the
    // types; projects.ts has no imports of its own, so it loads standalone.
    const { projects } = await import("../src/data/projects.ts");
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${ORIGIN}/work#page`,
      name: "Work",
      about: projects.map((p) => ({
        "@type": "CreativeWork",
        name: p.name,
        description: p.tagline,
        creator: { "@id": `${ORIGIN}/#pero` },
        dateCreated: p.year,
        keywords: p.tech.join(", "),
        ...(p.liveUrl ? { url: p.liveUrl } : {}),
        ...(p.award ? { award: `${p.award.title}. ${p.award.detail}` } : {}),
      })),
    };
  }
  return null;
}

let written = 0;

for (const [route, { title, description }] of Object.entries(meta)) {
  let html = shell;

  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${attr(title)}</title>`);
  html = setContent(html, 'name="description"', description, "description");
  html = setContent(html, 'property="og:title"', title, "og:title");
  html = setContent(html, 'property="og:description"', description, "og:description");
  html = setContent(html, 'name="twitter:title"', title, "twitter:title");
  html = setContent(html, 'name="twitter:description"', description, "twitter:description");

  const url = `${ORIGIN}${route}`;
  html = setContent(html, 'property="og:url"', url, "og:url");
  html = html.replace(
    /(<link rel="canonical" href=")([^"]*)(")/i,
    `$1${attr(url)}$3`,
  );

  const schema = await extraSchema(route);
  if (schema) {
    html = html.replace(
      "</head>",
      `    <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
    </script>
  </head>`,
    );
  }

  // The homepage shell is dist/index.html itself; the rest get a directory.
  const out = route === "/" ? join(DIST, "index.html") : join(DIST, route, "index.html");
  if (route !== "/") mkdirSync(join(DIST, route), { recursive: true });
  writeFileSync(out, html);

  written += 1;
  console.log(`  ${route.padEnd(16)} -> ${out.replace(/\\/g, "/")}`);
}

console.log(`\n${written} route(s) written with their own head tags.`);
