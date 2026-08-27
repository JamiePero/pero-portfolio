import { useEffect } from "react";
import { Hero } from "../components/Hero";
import { site } from "../data/site";

/**
 * The homepage is the hero alone.
 *
 * Everything that used to sit below it now has its own route. That's the point
 * of the split: visitors said the single page ran too long, and the fix was to
 * stop making them scroll past six sections to reach one.
 */
export function HomePage() {
  useEffect(() => {
    document.title = `${site.name} | Builder, 3D Modeler & Web Developer in Ghana`;
  }, []);

  return <Hero />;
}
