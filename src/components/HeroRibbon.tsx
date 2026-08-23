import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * The hero's folded glass ribbon.
 *
 * Default export, imported lazily from Hero.tsx — three + R3F + drei is the
 * heaviest dependency on the site and a transmission material re-renders the
 * scene into an offscreen buffer every frame, so none of it may block paint.
 *
 * Shape: a rounded cross-section swept along a closed 3D curve, with a twist
 * angle that varies along the sweep. The twist is the whole point — it turns
 * the sheet edge-on and then face-on as it travels, which is what produces the
 * layered folds and the thin bright lit edges in the reference. A displaced
 * sphere cannot express that topology at any subdivision level.
 */

/** Samples along the ribbon's length. Tight folds need the density. */
const SEGMENTS = 660;
/**
 * Segments per semicircular end of the cross-section.
 *
 * This matters more than it looks: the rounded ends are the ribbon's thin
 * edges, which is precisely where the bright specular rim runs. At 5 segments
 * each arc step was 36° and the highlight broke into visible facets. At 12 it's
 * 15°, and the edge reads as a continuous line of light.
 */
const CAP_SEGMENTS = 12;

const HALF_WIDTH = 0.44;
const HALF_THICK = 0.038;

/**
 * Cross-section outline: a "stadium" — a flat slab with semicircular ends.
 * Rounded rather than a sharp rectangle so the edges catch a thin specular
 * highlight instead of aliasing into a hard line.
 */
function buildSection(): { pos: Array<[number, number]>; nrm: Array<[number, number]> } {
  const pos: Array<[number, number]> = [];
  const nrm: Array<[number, number]> = [];
  const push = (centre: number, a: number) => {
    pos.push([centre + Math.cos(a) * HALF_THICK, Math.sin(a) * HALF_THICK]);
    // Each cap is a circular arc about `centre`, so its outward normal is just
    // the arc direction. Having this analytically is what lets the per-frame
    // rebuild skip computeVertexNormals entirely.
    nrm.push([Math.cos(a), Math.sin(a)]);
  };
  for (let i = 0; i <= CAP_SEGMENTS; i++) {
    push(HALF_WIDTH, -Math.PI / 2 + (Math.PI * i) / CAP_SEGMENTS);
  }
  for (let i = 0; i <= CAP_SEGMENTS; i++) {
    push(-HALF_WIDTH, Math.PI / 2 + (Math.PI * i) / CAP_SEGMENTS);
  }
  return { pos, nrm };
}

const SECTION = buildSection();
const RING = SECTION.pos.length;

// Flattened into typed arrays. The inner sweep loop runs RING × SEGMENTS times
// per frame — ~17k iterations — and destructuring `const [u,v] = arr[j]` from an
// array-of-arrays that many times a frame is measurably slower than indexing a
// Float32Array.
const SEC_P = new Float32Array(RING * 2);
const SEC_N = new Float32Array(RING * 2);
for (let j = 0; j < RING; j++) {
  SEC_P[j * 2] = SECTION.pos[j][0];
  SEC_P[j * 2 + 1] = SECTION.pos[j][1];
  SEC_N[j * 2] = SECTION.nrm[j][0];
  SEC_N[j * 2 + 1] = SECTION.nrm[j][1];
}

/** The spine the ribbon follows: a three-lobed rose, drooping through z. */
function spinePoint(t: number, phase: number, out: THREE.Vector3): THREE.Vector3 {
  const a = t * Math.PI * 2;
  const r = 1.15 + 0.42 * Math.cos(3 * a + phase * 0.6);
  return out.set(
    r * Math.cos(a),
    r * Math.sin(a) * 0.82,
    0.62 * Math.sin(2 * a + phase * 0.7) + 0.22 * Math.cos(3 * a - phase * 0.4),
  );
}

/** How far the sheet has rotated about its own spine at position t. */
function twistAt(t: number, phase: number): number {
  const a = t * Math.PI * 2;
  return 1.7 * Math.sin(2 * a + phase * 0.5) + 0.6 * Math.cos(3 * a - phase * 0.3);
}

function Ribbon({ light }: { light: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  /** Carries the previous frame's holonomy so it can be unwrapped, not flipped. */
  const prevHolonomy = useRef(0);

  // Index buffer and attribute arrays are allocated once; only vertex positions
  // and normals are rewritten as the form animates.
  const { geometry, scratch } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertexCount = (SEGMENTS + 1) * RING;
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3),
    );
    geo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3));

    const indices: number[] = [];
    for (let i = 0; i < SEGMENTS; i++) {
      for (let j = 0; j < RING; j++) {
        const a = i * RING + j;
        const b = i * RING + ((j + 1) % RING);
        const c = (i + 1) * RING + ((j + 1) % RING);
        const d = (i + 1) * RING + j;
        indices.push(a, b, d, b, c, d);
      }
    }
    geo.setIndex(indices);
    // Fixed and generous: the spine never exceeds ~1.6 plus half the section,
    // so this always contains the form. Set once so the per-frame rebuild
    // doesn't have to recompute it (another full pass over every vertex).
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 2.6);

    return {
      geometry: geo,
      scratch: {
        p: new THREE.Vector3(),
        pNext: new THREE.Vector3(),
        tangent: new THREE.Vector3(),
        normal: new THREE.Vector3(),
        binormal: new THREE.Vector3(),
        up: new THREE.Vector3(0, 0, 1),
        // Held here rather than constructed inside rebuild(): allocating
        // Vector3s every frame churns the heap and the resulting GC pauses show
        // up as exactly the kind of intermittent hitch this animation had.
        endN: new THREE.Vector3(),
        endB: new THREE.Vector3(),
        // Frames recorded on the first pass so the closing seam can be
        // corrected before vertices are written on the second.
        pts: new Float32Array((SEGMENTS + 1) * 3),
        tans: new Float32Array((SEGMENTS + 1) * 3),
        nrms: new Float32Array((SEGMENTS + 1) * 3),
      },
    };
  }, []);

  /**
   * Rewrites the ribbon for a given phase.
   *
   * Frames are carried along the curve by parallel transport rather than
   * Frenet frames: a Frenet frame flips through curve inflection points, which
   * would snap the sheet 180° mid-sweep.
   */
  function rebuild(phase: number) {
    const pos = geometry.attributes.position.array as Float32Array;
    const nrm = geometry.attributes.normal.array as Float32Array;
    const { p, pNext, tangent, normal, binormal, up, pts, tans, nrms, endN, endB } = scratch;

    // ---- Pass 1: transport a frame along the spine, recording it ----
    spinePoint(0, phase, p);
    spinePoint(0.0015, phase, pNext);
    tangent.subVectors(pNext, p).normalize();
    normal.copy(up).cross(tangent);
    if (normal.lengthSq() < 1e-6) normal.set(1, 0, 0);
    normal.normalize();

    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      spinePoint(t, phase, p);
      spinePoint(t + 0.0015, phase, pNext);
      tangent.subVectors(pNext, p).normalize();

      // Parallel transport: project the previous normal onto the plane
      // perpendicular to the new tangent, then re-orthonormalise.
      normal.addScaledVector(tangent, -normal.dot(tangent));
      if (normal.lengthSq() < 1e-8) {
        normal.set(-tangent.y, tangent.x, 0);
        if (normal.lengthSq() < 1e-8) normal.set(1, 0, 0);
      }
      normal.normalize();

      const k = i * 3;
      pts[k] = p.x; pts[k + 1] = p.y; pts[k + 2] = p.z;
      tans[k] = tangent.x; tans[k + 1] = tangent.y; tans[k + 2] = tangent.z;
      nrms[k] = normal.x; nrms[k + 1] = normal.y; nrms[k + 2] = normal.z;
    }

    // ---- Holonomy ----
    // Parallel transport around a closed loop does not return to its starting
    // frame; it comes back rotated by some angle. Left uncorrected the ribbon's
    // end meets its start at a different roll and shows a seam or pinch. Measure
    // that angle and unwind it linearly across the sweep.
    const e = SEGMENTS * 3;
    normal.set(nrms[0], nrms[1], nrms[2]);
    tangent.set(tans[e], tans[e + 1], tans[e + 2]);
    endN.set(nrms[e], nrms[e + 1], nrms[e + 2]);
    endB.crossVectors(tangent, endN).normalize();
    let holonomy = Math.atan2(normal.dot(endB), normal.dot(endN));

    // atan2 is discontinuous at ±π. As the form animates the holonomy drifts
    // across that boundary and flips sign — and because it's applied as
    // `holonomy * t` along the whole sweep, that flip snapped the entire ribbon
    // by nearly a full turn in a single frame. Unwrap it against the previous
    // frame's value so it stays continuous.
    const prev = prevHolonomy.current;
    holonomy += Math.round((prev - holonomy) / (Math.PI * 2)) * Math.PI * 2;
    prevHolonomy.current = holonomy;

    // ---- Pass 2: place the cross-section using the corrected roll ----
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      const k = i * 3;
      p.set(pts[k], pts[k + 1], pts[k + 2]);
      tangent.set(tans[k], tans[k + 1], tans[k + 2]);
      normal.set(nrms[k], nrms[k + 1], nrms[k + 2]);
      binormal.crossVectors(tangent, normal).normalize();

      const angle = twistAt(t, phase) + holonomy * t;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const base = i * RING;
      for (let j = 0; j < RING; j++) {
        const u = SEC_P[j * 2];
        const v = SEC_P[j * 2 + 1];
        const nu = SEC_N[j * 2];
        const nv = SEC_N[j * 2 + 1];
        // Rotate the cross-section within its own frame, then place it.
        const su = u * cos - v * sin;
        const sv = u * sin + v * cos;
        const idx = (base + j) * 3;
        pos[idx] = p.x + normal.x * su + binormal.x * sv;
        pos[idx + 1] = p.y + normal.y * su + binormal.y * sv;
        pos[idx + 2] = p.z + normal.z * su + binormal.z * sv;

        // Analytic normal: the section's own outward normal carried into the
        // frame. Exact for a swept surface, and it replaces a
        // computeVertexNormals() pass over 34k triangles every frame — which is
        // what made the animation stutter once subdivision went up.
        const snu = nu * cos - nv * sin;
        const snv = nu * sin + nv * cos;
        nrm[idx] = normal.x * snu + binormal.x * snv;
        nrm[idx + 1] = normal.y * snu + binormal.y * snv;
        nrm[idx + 2] = normal.z * snu + binormal.z * snv;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;
  }

  // Build once up-front so the first frame is already correct.
  useMemo(() => rebuild(0), []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;

    mesh.rotation.y = t * 0.1;
    mesh.rotation.z = Math.sin(t * 0.14) * 0.12;

    // Every frame now. This used to run at half rate to afford
    // computeVertexNormals, but that made the morph step at 30fps while the
    // rotation ran at 60 — the two desynchronising is what read as judder. With
    // normals computed analytically the rebuild is cheap enough to run in step.
    rebuild(t * 0.28);
  });

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    if (import.meta.env.DEV && meshRef.current) {
      (window as unknown as Record<string, unknown>).__ribbon = meshRef.current;
    }
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} scale={1.28}>
      <MeshTransmissionMaterial
        backside
        backsideThickness={light ? 0.7 : 0.55}
        // Transmission re-renders the scene into an offscreen buffer, and
        // `backside` makes that two passes. At 512/6 that was overrunning the
        // frame budget on integrated graphics and showing up as stutter. 256/4
        // is visually near-identical here because the buffer is only ever
        // sampled through a refracting surface, never seen directly.
        samples={4}
        resolution={256}
        backsideResolution={256}
        transmission={1}
        // Light mode needs *thicker* glass with a shorter attenuation distance,
        // not thinner. Near-clear glass on a near-white page is a ghost; the
        // form only reads if the body absorbs enough to carry a visible violet.
        thickness={light ? 1.5 : 0.9}
        roughness={light ? 0.06 : 0.03}
        ior={1.6}
        chromaticAberration={light ? 0.5 : 0.7}
        anisotropicBlur={0.25}
        distortion={0.15}
        distortionScale={0.3}
        temporalDistortion={0.04}
        // Thin-film interference — this is what throws the rainbow shifts
        // across the sheet in the reference, distinct from the edge fringing
        // that chromaticAberration provides.
        iridescence={1}
        iridescenceIOR={1.32}
        iridescenceThicknessRange={[120, 780]}
        attenuationColor={light ? "#6d28d9" : "#7b2fd6"}
        attenuationDistance={light ? 1.6 : 2.2}
        background={new THREE.Color(light ? "#f7f4fb" : "#08040e")}
        envMapIntensity={light ? 2.4 : 3.2}
        color="#ffffff"
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * Soft radial sprite, generated on a 2D canvas so there's no asset to ship.
 */
function makeGlowTexture(): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Coloured glows placed behind the ribbon, in 3D.
 *
 * This is what makes the material read as glass. A transmission material
 * refracts whatever the renderer draws into its transmission buffer, and it can
 * only sample the 3D scene — never the DOM. The page's CSS glows sit behind a
 * transparent canvas, so without these the glass was refracting an empty buffer
 * and came out looking like flat plastic. Additively blended so they add light
 * without occluding the page showing through the canvas.
 */
function GlowField({ light }: { light: boolean }) {
  const texture = useMemo(makeGlowTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);

  // Two palettes. On the dark page these are additive lights. On the light page
  // additive blending clips straight to white — every glow turned into a pale
  // smear and the glass had nothing to refract — so light mode composites
  // normally with deeper, saturated pigments instead.
  const lobes: Array<{
    pos: [number, number, number];
    scale: number;
    dark: string;
    lightC: string;
    opacity: number;
  }> = [
    { pos: [-1.6, 0.9, -2.4], scale: 5.5, dark: "#b06bff", lightC: "#7c3aed", opacity: 0.95 },
    { pos: [1.9, -1.1, -2.2], scale: 4.8, dark: "#ff5ca8", lightC: "#c2255c", opacity: 0.8 },
    { pos: [1.6, 1.7, -3.0], scale: 3.6, dark: "#ff9a3c", lightC: "#d97706", opacity: 0.5 },
    { pos: [-2.0, -1.7, -2.8], scale: 3.8, dark: "#3fd0e8", lightC: "#0e7490", opacity: 0.45 },
    { pos: [0, 0, -3.6], scale: 7.5, dark: "#4a1d7a", lightC: "#5b21b6", opacity: 0.7 },
  ];

  return (
    <group>
      {lobes.map((lobe, i) => (
        <mesh key={i} position={lobe.pos} scale={lobe.scale}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={texture}
            color={light ? lobe.lightC : lobe.dark}
            transparent
            opacity={light ? lobe.opacity * 0.5 : lobe.opacity}
            blending={light ? THREE.NormalBlending : THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Coloured area lights the glass picks up as highlights. Built from
 * Lightformers rather than an HDR so the scene needs no extra network request.
 */
function Rig({ light }: { light: boolean }) {
  // The coloured lights stay strong in light mode — they're what gives the
  // glass its hue against a near-white page. It's the white fill that has to
  // come down; previously it was set *brighter* in light mode, which bleached
  // out the very highlights it was meant to shape.
  const k = light ? 0.85 : 1;
  return (
    <Environment resolution={256}>
      <Lightformer form="circle" intensity={6 * k} color="#c98bff" position={[-4, 2, 4]} scale={5} />
      <Lightformer form="circle" intensity={5 * k} color="#ff5ca8" position={[4, -1.5, 3]} scale={4} />
      {/* Warm and cool rim accents — the orange and cyan glints in the reference */}
      <Lightformer form="ring" intensity={4.5 * k} color="#ff9a3c" position={[3.2, 3.2, -2]} scale={3} />
      <Lightformer form="ring" intensity={4 * k} color="#3fd0e8" position={[-3.4, -2.6, -1.5]} scale={3} />
      <Lightformer
        form="rect"
        intensity={light ? 0.9 : 1.6}
        color="#ffffff"
        position={[0, 5, 1]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={8}
      />
    </Environment>
  );
}

/** Tracks the site theme without threading a prop through the lazy boundary. */
function useIsLight() {
  const [light, setLight] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("light"),
  );
  useEffect(() => {
    const onChange = (event: Event) => setLight((event as CustomEvent<string>).detail === "light");
    window.addEventListener("pero:themechange", onChange);
    return () => window.removeEventListener("pero:themechange", onChange);
  }, []);
  return light;
}

export default function HeroRibbon() {
  const light = useIsLight();
  const [visible, setVisible] = useState(true);
  const hostRef = useRef<HTMLDivElement>(null);

  // Stop rendering once the hero scrolls away — a transmission material is far
  // too costly to keep running off-screen.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(host);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={hostRef} aria-hidden className="blob-canvas h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 5.4], fov: 42 }}
        // Cap DPR: a decorative background gains nothing from a 3x render, and
        // transmission cost scales with pixel count.
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={visible ? "always" : "never"}
        style={{ background: "transparent" }}
      >
        {/* The glows must exist in the scene for the ribbon's transmission pass
            to have anything to refract. */}
        <GlowField light={light} />
        <Ribbon light={light} />
        <Rig light={light} />
      </Canvas>
    </div>
  );
}
