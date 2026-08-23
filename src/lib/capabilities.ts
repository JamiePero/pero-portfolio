/**
 * Shared capability checks for the two heavy WebGL features on the page: the
 * hero's glass ribbon and the Smart Bin viewer in the Jexi case study.
 *
 * These used to be inlined in Hero.tsx. They're here so both features refuse
 * under the same conditions and can't drift apart, and so there's one place to
 * relax the rules.
 */

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Metered or slow connections. A large share of this site's audience is on
 * mobile in Ghana, where data is often both. Neither WebGL feature is worth
 * several hundred kilobytes of someone's bundle.
 */
export function hasSlowConnection(): boolean {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (!connection) return false;
  if (connection.saveData) return true;
  // Note "3g" is deliberately not in this list. effectiveType is a heuristic
  // derived from observed round-trip time, not the actual radio technology, and
  // Chrome reports "3g" routinely on ordinary broadband with middling latency —
  // which was blocking the 3D on machines perfectly capable of running it.
  // Genuinely slow connections still report 2g or slow-2g.
  return ["slow-2g", "2g"].includes(connection.effectiveType ?? "");
}

/** Low RAM or few cores. Best-effort: both hints are absent in some browsers. */
export function isLowPoweredDevice(): boolean {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof memory === "number" && memory < 4) return true;
  return Boolean(navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
}

/** Confirms WebGL works before pulling in ~240 kB of renderer. */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * The hero's glass ribbon. Strictest gate on the page, because it is pure
 * decoration: it also refuses on phones, where the CSS stand-in reads nearly
 * the same at that size and costs nothing.
 */
export function canRenderHeroGlass(): boolean {
  if (prefersReducedMotion()) return false;
  const isPhone =
    window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 900;
  if (isPhone) return false;
  if (isLowPoweredDevice()) return false;
  if (hasSlowConnection()) return false;
  return hasWebGL();
}

/**
 * The Smart Bin viewer. Same connection, power and WebGL rules as the hero, but
 * deliberately *not* gated on being a phone: this one is portfolio content
 * rather than decoration, and a phone on wi-fi should get to inspect the model.
 * 40k triangles across 33 draw calls is comfortable on a modern handset.
 */
export function canRenderModelViewer(): boolean {
  if (prefersReducedMotion()) return false;
  if (isLowPoweredDevice()) return false;
  if (hasSlowConnection()) return false;
  return hasWebGL();
}

/**
 * Why a given visitor did or didn't get the 3D, readable from the console.
 *
 * These gates depend on the visitor's own hardware, connection and OS settings,
 * so a fallback can't be reproduced or diagnosed from anywhere else. Run
 * `__peroCaps()` in the console on the live site to see which check failed.
 */
export function capabilityReport() {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;

  return {
    heroGlass: canRenderHeroGlass(),
    modelViewer: canRenderModelViewer(),
    blockedBy: {
      reducedMotion: prefersReducedMotion(),
      phone: window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 900,
      lowPowered: isLowPoweredDevice(),
      slowConnection: hasSlowConnection(),
      noWebGL: !hasWebGL(),
    },
    raw: {
      deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      effectiveType: connection?.effectiveType,
      saveData: connection?.saveData,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      pointerCoarse: window.matchMedia("(pointer: coarse)").matches,
    },
  };
}

if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__peroCaps = capabilityReport;
}
