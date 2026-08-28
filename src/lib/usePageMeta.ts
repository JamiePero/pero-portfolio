import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import pageMeta from "../data/page-meta.json";
import { site } from "../data/site";

type Meta = { title: string; description: string };
const META = pageMeta as Record<string, Meta>;

/** Creates the tag if the document doesn't already carry it. */
function upsert(selector: string, create: () => HTMLElement): Element {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

function setMeta(attr: "name" | "property", key: string, value: string) {
  const el = upsert(`meta[${attr}="${key}"]`, () => {
    const tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    return tag;
  });
  el.setAttribute("content", value);
}

/**
 * Keeps the document head in step with the current route.
 *
 * Every route previously served the same title, description, canonical and
 * og:url, all pointing at the homepage. Telling search engines that ten
 * distinct pages all canonicalise to "/" invites them to treat the other nine
 * as duplicates, and every social share showed the homepage title whatever was
 * actually shared.
 *
 * The copy lives in page-meta.json rather than here so the build-time
 * prerender step reads the same file. If the two drifted, a crawler and a
 * visitor would see different things.
 */
export function usePageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Trailing slashes aside, unknown paths fall back to the homepage entry,
    // which matches the catch-all route.
    const key = pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
    const meta = META[key] ?? META["/"];
    const url = `${site.url}${key === "/" ? "/" : key}`;

    document.title = meta.title;
    setMeta("name", "description", meta.description);

    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", url);

    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.description);

    const canonical = upsert('link[rel="canonical"]', () => {
      const link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      return link;
    });
    canonical.setAttribute("href", url);
  }, [pathname]);
}
