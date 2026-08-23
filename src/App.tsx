import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { Cursor } from "./components/Cursor";
import { Footer } from "./components/Footer";
import { Gallery } from "./components/Gallery";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { PricingBuilder } from "./components/PricingBuilder";
import { Projects } from "./components/Projects";
import { Services } from "./components/Services";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  const { theme, toggle } = useTheme();
  useSmoothScroll();

  return (
    <>
      <Cursor />
      <Nav theme={theme} onToggleTheme={toggle} />
      <main>
        <Hero />
        <About />
        <Projects />
        <Gallery />
        <Services />
        <PricingBuilder />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
