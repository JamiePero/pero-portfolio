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
    <SectionPage
      title="About"
      description="Pero is a builder based in Ghana, working across 3D modelling, brand design, embedded hardware and web development."
    >
      <About />
    </SectionPage>
  );
}

export function WorkPage() {
  return (
    <SectionPage
      title="Work"
      description="Case studies on FlashX, gheasy and Jexi: a Wi-Fi hotspot platform, a no-login data bundle service, and an award-winning connected waste bin."
    >
      <Projects />
    </SectionPage>
  );
}

export function DesignPage() {
  return (
    <SectionPage
      title="Design"
      description="3D product renders, identity systems and packaging, including the full 4C_Curls_22 brand build for JU Cosmetics."
    >
      <Gallery />
    </SectionPage>
  );
}

export function ServicesPage() {
  return (
    <SectionPage
      title="Services"
      description="3D modelling, logo and brand design, Arduino and ESP32 development, and web builds with technical SEO."
    >
      <Services />
    </SectionPage>
  );
}

export function PricingPage() {
  return (
    <SectionPage
      title="Pricing"
      description="Tell me what you're building and get an indicative price range before either of us commits to a call."
    >
      <PricingBuilder />
    </SectionPage>
  );
}

export function ContactPage() {
  return (
    <SectionPage
      title="Contact"
      description="Freelance and client work across 3D, branding, hardware and web. Tell me what you're trying to make."
    >
      <Contact />
    </SectionPage>
  );
}
