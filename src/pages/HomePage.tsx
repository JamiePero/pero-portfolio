import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { About } from "../components/About";
import { Contact } from "../components/Contact";
import { Gallery } from "../components/Gallery";
import { Hero } from "../components/Hero";
import { PricingBuilder } from "../components/PricingBuilder";
import { Projects } from "../components/Projects";
import { Services } from "../components/Services";
import { scrollToSection } from "../hooks/useSmoothScroll";
import { site } from "../data/site";

export function HomePage() {
  const { hash } = useLocation();

  useEffect(() => {
    document.title = `${site.name} | Builder, 3D Modeler & Web Developer in Ghana`;
  }, []);

  // Arriving from another route with a hash, e.g. /#work after clicking Work in
  // the nav from the Tools page. The sections need a frame to lay out before a
  // scroll target means anything.
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const raf = requestAnimationFrame(() => scrollToSection(id));
    return () => cancelAnimationFrame(raf);
  }, [hash]);

  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Gallery />
      <Services />
      <PricingBuilder />
      <Contact />
    </>
  );
}
