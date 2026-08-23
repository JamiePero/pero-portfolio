/**
 * Pure-CSS stand-in for the 3D blob.
 *
 * Shown when WebGL is unavailable, the device looks too weak to carry a
 * transmission material, or the visitor prefers reduced motion. It's three
 * overlapping blurred gradient lobes in the same palette, so the hero keeps its
 * iridescent character at effectively zero cost.
 */
export function HeroBlobFallback({ animated = true }: { animated?: boolean }) {
  return (
    <div aria-hidden className="relative h-full w-full">
      <div
        className={`absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#c98bff,#7b34c4_45%,transparent_70%)] blur-2xl ${
          animated ? "animate-[blob-a_14s_ease-in-out_infinite]" : ""
        }`}
      />
      <div
        className={`absolute left-1/2 top-1/2 h-[54%] w-[54%] -translate-x-[62%] -translate-y-[38%] rounded-full bg-[radial-gradient(circle_at_60%_60%,#ff8ec4,#c2255c_45%,transparent_70%)] opacity-80 blur-2xl ${
          animated ? "animate-[blob-b_18s_ease-in-out_infinite]" : ""
        }`}
      />
      <div
        className={`absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-[34%] -translate-y-[62%] rounded-full bg-[radial-gradient(circle_at_40%_60%,#9df0ff,#3fb0c8_40%,transparent_68%)] opacity-55 blur-2xl ${
          animated ? "animate-[blob-c_16s_ease-in-out_infinite]" : ""
        }`}
      />
      {/* Specular sheen so it reads as a glossy body rather than a flat glow.
          White-on-white is invisible, so light mode gets a deep violet
          highlight instead of a white one. */}
      <div className="absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_38%_26%,rgb(255_255_255/0.5),transparent_38%)] blur-md light:bg-[radial-gradient(circle_at_38%_26%,rgb(76_29_149/0.35),transparent_42%)]" />
    </div>
  );
}
