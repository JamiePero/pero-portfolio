/**
 * Marked stand-in for artwork Pero hasn't supplied yet.
 *
 * Swapping in a real asset never touches this file: set `src` on the entry in
 * src/data/projects.ts or src/data/gallery.ts and the consuming component
 * renders an <img> instead.
 */
export function Placeholder({
  label,
  aspect = "landscape",
  className = "",
}: {
  label: string;
  aspect?: "portrait" | "square" | "landscape" | "wide";
  className?: string;
}) {
  const aspectClass = {
    portrait: "aspect-[3/4]",
    square: "aspect-square",
    landscape: "aspect-[4/3]",
    wide: "aspect-[16/9]",
  }[aspect];

  return (
    <div
      role="img"
      aria-label={`Placeholder: ${label}`}
      className={`group/ph relative isolate flex ${aspectClass} w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-line-strong bg-elevated ${className}`}
    >
      {/* Diagonal hatch so it reads as "asset pending" at a glance */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--ink) 0 1px, transparent 1px 10px)",
        }}
      />
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        className="relative mb-3 h-7 w-7 text-muted opacity-60"
        stroke="currentColor"
        strokeWidth="1.25"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="m3 16 5-4 4 3 3-2 6 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="relative max-w-[22ch] px-4 text-center text-xs leading-relaxed text-muted">
        {label}
      </p>
      <p className="relative mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent opacity-70">
        Image pending
      </p>
    </div>
  );
}
