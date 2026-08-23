import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Interactive viewer for the Jexi Smart Bin.
 *
 * Default export, mounted lazily and only once its section is on screen, so
 * none of this touches initial page load. Deliberately plain PBR rather than
 * the hero's transmission glass: this is a product model and should read as a
 * clean product render.
 *
 * The model is Draco-compressed (KHR_draco_mesh_compression is in
 * extensionsRequired, so the decoder is mandatory, not an optimisation).
 * 40,318 triangles across 33 primitives.
 */

const MODEL_URL = "/models/smart-bin.glb";

/**
 * Decoder served from our own origin, copied from
 * three/examples/jsm/libs/draco/gltf into public/draco.
 *
 * Note this three version no longer defaults to the gstatic CDN — it resolves
 * the decoder with `new URL(..., import.meta.url)`, which Vite emits as a local
 * asset. So local serving is the default now. This override is still worth it
 * for size: the default points at the *generic* decoder (285 kB wasm), while
 * the glTF-specific build below is 192 kB and is all a .glb needs.
 *
 * Passed as an object rather than a path string deliberately. The string form
 * also derives a `draco_decoder.js` URL for the no-WebAssembly fallback, which
 * we don't ship; the object form sets that to null so it can never be fetched.
 */
const DRACO_PATHS = {
  js: "/draco/draco_wasm_wrapper.js",
  wasm: "/draco/draco_decoder.wasm",
};

/**
 * Roughness by material name.
 *
 * The export carries metallicFactor 0 and no roughnessFactor, which glTF reads
 * as fully rough — so every surface arrives completely matte, including the
 * ones named "Glossy" and "Satin". These restore the finish the names imply.
 * Matched loosely and case-insensitively; anything unmatched keeps DEFAULT.
 */
const FINISHES: Array<{ match: RegExp; roughness: number; metalness: number }> = [
  { match: /steel|satin|metal|aluminum|aluminium/i, roughness: 0.32, metalness: 0.85 },
  { match: /glossy|gloss/i, roughness: 0.18, metalness: 0 },
  { match: /matte|rubber/i, roughness: 0.9, metalness: 0 },
];
const DEFAULT_FINISH = { roughness: 0.55, metalness: 0.05 };

function applyFinishes(root: THREE.Object3D) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = false;
    object.receiveShadow = false;

    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;
      const finish = FINISHES.find((f) => f.match.test(material.name)) ?? DEFAULT_FINISH;
      material.roughness = finish.roughness;
      material.metalness = finish.metalness;
      material.envMapIntensity = 1.1;
      material.needsUpdate = true;
    }
  });
}

/**
 * Recentres the model on the origin and scales it to a predictable size.
 *
 * The source is a CAD export sitting roughly 145 units off-origin in Y, so
 * dropping it into a scene unmodified puts it far outside the camera frustum.
 * Normalising here means the camera and controls can use fixed numbers instead
 * of being tuned to this particular export.
 */
function normalise(root: THREE.Object3D, targetSize = 2.6) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());

  const largest = Math.max(size.x, size.y, size.z) || 1;
  const scale = targetSize / largest;

  root.position.sub(centre);
  root.scale.setScalar(scale);
  // position was set pre-scale, so scale it to match.
  root.position.multiplyScalar(scale);

  return { size, scale };
}

function Model({ onLoaded }: { onLoaded: () => void }) {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    let cancelled = false;

    const draco = new DRACOLoader();
    draco.setDecoderPath(DRACO_PATHS);
    draco.preload();

    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    loader.load(
      MODEL_URL,
      (gltf) => {
        if (cancelled) {
          draco.dispose();
          return;
        }
        applyFinishes(gltf.scene);
        normalise(gltf.scene);
        setScene(gltf.scene);
        onLoaded();
        draco.dispose();
      },
      undefined,
      (error) => {
        console.error("[SmartBinViewer] failed to load model", error);
        draco.dispose();
      },
    );

    return () => {
      cancelled = true;
    };
  }, [gl, onLoaded]);

  // A slow idle turn so the model reads as three-dimensional before anyone
  // touches it. Stops the moment the pointer goes down.
  const interacted = useRef(false);
  useFrame((_, delta) => {
    if (!groupRef.current || interacted.current) return;
    groupRef.current.rotation.y += delta * 0.25;
  });

  useEffect(() => {
    const stop = () => {
      interacted.current = true;
    };
    window.addEventListener("pointerdown", stop, { once: true });
    return () => window.removeEventListener("pointerdown", stop);
  }, []);

  if (!scene) return null;
  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * Three-point-ish lighting. Plain lights rather than an environment map: the
 * materials are flat colours with no textures, so a full PMREM environment
 * would cost more than it adds here.
 */
function Lighting() {
  return (
    <>
      <hemisphereLight args={["#dfe6ff", "#1a1420", 0.85]} />
      <directionalLight position={[4, 6, 5]} intensity={2.1} color="#ffffff" />
      <directionalLight position={[-5, 2, -3]} intensity={0.9} color="#c9a9ff" />
      <directionalLight position={[0, -4, 2]} intensity={0.45} color="#9fd8ff" />
    </>
  );
}

export default function SmartBinViewer({ onLoaded }: { onLoaded?: () => void }) {
  const handleLoaded = useMemo(() => onLoaded ?? (() => {}), [onLoaded]);

  return (
    <Canvas
      camera={{ position: [2.6, 1.4, 3.4], fov: 40 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Lighting />
      <Model onLoaded={handleLoaded} />
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={2.2}
        maxDistance={7}
        // Stop short of the poles so the model never ends up viewed from
        // directly underneath, where a CAD export has nothing worth seeing.
        minPolarAngle={Math.PI * 0.12}
        maxPolarAngle={Math.PI * 0.86}
        makeDefault
      />
    </Canvas>
  );
}
