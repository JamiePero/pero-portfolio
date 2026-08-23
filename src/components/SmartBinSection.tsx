import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { canRenderModelViewer } from "@/lib/capabilities";
import { Placeholder } from "./Placeholder";
import { Reveal } from "./Reveal";

// three, R3F, GLTFLoader, DRACOLoader and the decoder are all pulled in by this
// import. It must stay lazy and must only resolve once the section is on
// screen, or it lands on initial page load.
const SmartBinViewer = lazy(() => import("./SmartBinViewer"));

/**
 * The interactive Smart Bin model in the Jexi case study.
 *
 * Three separate gates, in order:
 *  1. Capability — connection speed, device power, WebGL, reduced motion.
 *     Anyone who fails gets the static render instead and downloads nothing.
 *  2. Intersection — even when capable, nothing loads until the section is
 *     actually approaching the viewport.
 *  3. Suspense — the chunk resolving, then the model itself decoding.
 *
 * Cost when it does load is roughly 660 kB: 414 kB model, 245 kB Draco decoder,
 * plus the loaders. three.js itself is already cached from the hero.
 */
export function SmartBinSection() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [capable, setCapable] = useState(false);
  const [inView, setInView] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    setCapable(canRenderModelViewer());
  }, []);

  useEffect(() => {
    if (!capable) return;
    const host = hostRef.current;
    if (!host) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      // Start fetching a little before it's actually visible so the model has
      // a head start, without reaching so far that a passing scroll triggers it.
      { rootMargin: "300px 0px" },
    );

    observer.observe(host);
    return () => observer.disconnect();
  }, [capable]);

  return (
    <Reveal>
      <div className="mt-16 border-t border-line pt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            The model
          </h4>
          {capable ? (
            <p className="font-mono text-[10px] text-muted">
              {modelLoaded ? "Drag to rotate · scroll to zoom" : "Loading model…"}
            </p>
          ) : null}
        </div>

        <p className="mt-3 max-w-[54ch] text-sm leading-[1.75] text-muted sm:text-base">
          The Smart Bin as it was modelled, 40,000 triangles of it. Have a look
          around it.
        </p>

        <div
          ref={hostRef}
          className="relative mt-6 aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-elevated sm:aspect-[16/10]"
        >
          {capable && inView ? (
            <Suspense fallback={<ViewerSkeleton />}>
              <SmartBinViewer onLoaded={() => setModelLoaded(true)} />
            </Suspense>
          ) : capable ? (
            <ViewerSkeleton />
          ) : (
            // TODO: Pero to drop a still render at /public/work/jexi/smart-bin-hero.webp
            // and this becomes an <img> instead of a placeholder frame.
            <div className="absolute inset-0 grid place-items-center p-4">
              <Placeholder
                label="Jexi Smart Bin, static render shown in place of the interactive model"
                aspect="landscape"
                className="max-h-full"
              />
            </div>
          )}

          {!modelLoaded && capable && inView ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 grid place-items-center">
              <span className="rounded-full border border-line bg-bg/70 px-3 py-1 font-mono text-[10px] text-muted backdrop-blur">
                Decoding 414 kB model…
              </span>
            </div>
          ) : null}
        </div>

        {!capable ? (
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted">
            Interactive model skipped on slow or metered connections. Static
            render shown instead.
          </p>
        ) : null}
      </div>
    </Reveal>
  );
}

/** Quiet placeholder while the chunk and model come down. */
function ViewerSkeleton() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="h-16 w-16 animate-pulse rounded-full bg-accent/10 blur-xl" />
    </div>
  );
}
