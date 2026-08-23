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
  return ["slow-2g", "2g", "3g"].includes(connection.effectiveType ?? "");
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
