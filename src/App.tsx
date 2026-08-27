import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { CapabilityDebug } from "./components/CapabilityDebug";
import { Cursor } from "./components/Cursor";
import { Footer } from "./components/Footer";
import { Nav } from "./components/Nav";
import {
  AboutPage,
  ContactPage,
  DesignPage,
  PricingPage,
  ServicesPage,
  WorkPage,
} from "./pages/ContentPages";
import { HomePage } from "./pages/HomePage";
import { DcaBotPage } from "./pages/DcaBotPage";
import { ToolsPage } from "./pages/ToolsPage";
import { YouTubePage } from "./pages/YouTubePage";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { useTheme } from "./hooks/useTheme";

/**
 * Sends you to the top when the route changes, but not when only the hash does.
 * A hash change is a request to scroll somewhere specific, and HomePage handles
 * that; jumping to the top first would fight it.
 */
function ScrollToTopOnRouteChange() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}

function Shell() {
  const { theme, toggle } = useTheme();
  useSmoothScroll();

  return (
    <>
      <ScrollToTopOnRouteChange />
      <Cursor />
      <Nav theme={theme} onToggleTheme={toggle} />
      <main id="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/design" element={<DesignPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/youtube" element={<YouTubePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/dca-bot" element={<DcaBotPage />} />
          {/* Anything unrecognised falls back to the main page rather than a
              dead end. */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
      {/* Renders only for ?debug=caps */}
      <CapabilityDebug />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
