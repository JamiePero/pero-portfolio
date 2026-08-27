import { Link } from "react-router-dom";
import { navRoutes, site } from "../data/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line py-12">
      <div className="section-shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center"
              aria-label="Back to home"
            >
              <img
                src="/brand/mark-dark.webp"
                srcSet="/brand/mark-dark.webp 1x, /brand/mark-dark@2x.webp 2x"
                width={50}
                height={44}
                alt=""
                decoding="async"
                className="h-9 w-auto light:hidden"
              />
              <img
                src="/brand/mark-light.webp"
                srcSet="/brand/mark-light.webp 1x, /brand/mark-light@2x.webp 2x"
                width={50}
                height={44}
                alt=""
                decoding="async"
                className="hidden h-9 w-auto light:block"
              />
            </Link>
            <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-muted">
              Building across hardware, software and design from {site.location}.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5 sm:grid-cols-3 md:grid-cols-2">
              {navRoutes.map((route) => (
                <li key={route.path}>
                  <Link
                    to={route.path}
                    data-cursor="hover"
                    className="link-underline text-sm text-muted transition-colors hover:text-ink"
                  >
                    {route.label}
                  </Link>
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
