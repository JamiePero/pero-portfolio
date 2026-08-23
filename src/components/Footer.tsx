import { navSections, site } from "../data/site";
import { scrollToSection } from "../hooks/useSmoothScroll";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line py-12">
      <div className="section-shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight"
              aria-label="Back to top"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-accent font-mono text-xs font-bold text-on-accent">
                P
              </span>
              {site.name}
            </button>
            <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-muted">
              Building across hardware, software and design from {site.location}.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5 sm:grid-cols-3 md:grid-cols-2">
              {navSections.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    data-cursor="hover"
                    className="link-underline text-sm text-muted transition-colors hover:text-ink"
                  >
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-muted">
            © {year} {site.name}. Built from scratch.
          </p>
          <a
            href={site.x.url}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="hover"
            className="link-underline font-mono text-[11px] text-muted transition-colors hover:text-accent"
          >
            {site.x.handle}
          </a>
        </div>
      </div>
    </footer>
  );
}
