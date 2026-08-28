import { About } from "../components/About";
import { Contact } from "../components/Contact";
import { Gallery } from "../components/Gallery";
import { PricingBuilder } from "../components/PricingBuilder";
import { Projects } from "../components/Projects";
import { Services } from "../components/Services";
import { SectionPage } from "./SectionPage";

/**
 * The six pages carved out of the old single scroll page.
 *
 * Each one is just its original section under a SectionPage wrapper, so the
 * scroll reveals, parallax and theme handling inside them are untouched. They
 * were driven by whileInView rather than by absolute scroll position, which is
 * why they keep working unchanged now that each section owns a page.
 *
 * Grouped in one file because every page is three lines; separate files would
 * be more ceremony than content.
 */

export function AboutPage() {
  return (
    <SectionPage>
      <About />
    </SectionPage>
  );
}

export function WorkPage() {
  return (
    <SectionPage>
      <Projects />
    </SectionPage>
  );
}

export function DesignPage() {
  return (
    <SectionPage>
      <Gallery />
    </SectionPage>
  );
}

export function ServicesPage() {
  return (
    <SectionPage>
      <Services />
    </SectionPage>
  );
}

export function PricingPage() {
  return (
    <SectionPage>
      <PricingBuilder />
    </SectionPage>
  );
}

export function ContactPage() {
  return (
    <SectionPage>
      <Contact />
    </SectionPage>
  );
}
