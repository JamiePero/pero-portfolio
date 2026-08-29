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

/**
 * Low RAM or few cores. Best-effort: both hints are absent in some browsers.
 *
 * The memory test is `<= 4`, not `< 4`. Chrome reports deviceMemory rounded
 * down to a power of two and capped at 8, so a mid-range Android with 4GB or
 * 6GB both report exactly 4 and sailed through a `< 4` check. The core count
 * doesn't catch them either: mid-range big.LITTLE SoCs report 8 cores, they're
 * just slow ones. That combination was the hole a mid-range phone fell through.
 *
 * The cost of being wrong is asymmetric. A capable device wrongly excluded
 * loses some decoration; a weak one wrongly included gets a slow page.
 */
export function isLowPoweredDevice(): boolean {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof memory === "number" && memory <= 4) return true;
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
 * True for phone-sized touch devices: coarse pointer AND a narrow viewport, so
 * a touchscreen laptop isn't caught by it.
 *
 * Refuses the hero ribbon outright. Still also selects the reduced-quality tier
 * inside HeroRibbon, which now only applies to the Smart Bin viewer, since that
 * one is content rather than decoration and phones may still reach it.
 */
export function isCompactDevice(): boolean {
  return window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 900;
}

/**
 * A touch device whose capability we can't actually measure.
 *
 * Safari doesn't implement deviceMemory at all, so on iPhone and iPad the RAM
 * threshold can never fire, and an iPad at 1024px also clears the phone-width
 * check. It was passing every gate by having nothing to fail.
 *
 * Widening the width check isn't the fix: it would catch touchscreen laptops
 * too, and rotating an iPad would flip the result on one device. The honest
 * signal is that a coarse pointer with no memory hint means a mobile-class
 * device we can't verify, so we don't hand it the expensive path. Windows
 * touchscreen laptops still report deviceMemory under Chrome, so they pass.
 */
export function isUnverifiableTouchDevice(): boolean {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return window.matchMedia("(pointer: coarse)").matches && typeof memory !== "number";
}

/**
 * The hero's glass ribbon.
 *
 * Phones don't get it, and that's deliberate rather than conservative.
 *
 * It was briefly served to phones at a reduced quality tier, on the reasoning
 * that the ribbon is the most distinctive thing on the page and phones are most
 * of the traffic. Measurement retired that. The reduced tier trims segment
 * count, samples and frame rate, but it keeps MeshTransmissionMaterial, and the
 * transmission pass is the expensive part: the scene is re-rendered into an
 * offscreen buffer on every frame. Reducing everything around it doesn't reduce
 * that. On top of the frame cost it pulls roughly 234 kB of renderer, on the
 * audience least likely to be on an unmetered connection.
 *
 * The CSS stand-in in HeroBlobFallback costs nothing, keeps the same palette
 * and motion, and is what phones get.
 */
export function canRenderHeroGlass(): boolean {
  if (prefersReducedMotion()) return false;
  if (isCompactDevice()) return false;
  if (isUnverifiableTouchDevice()) return false;
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
      lowPowered: isLowPoweredDevice(),
      unverifiableTouch: isUnverifiableTouchDevice(),
      slowConnection: hasSlowConnection(),
      noWebGL: !hasWebGL(),
    },
    // Blocks the hero ribbon; the model viewer still allows it.
    compactDevice: isCompactDevice(),
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
