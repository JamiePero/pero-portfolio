import { useEffect, useState } from "react";
import { capabilityReport } from "../lib/capabilities";

/**
 * Visible readout of the WebGL capability gates, shown only when the URL has
 * `?debug=caps`.
 *
 * The gates depend on the visitor's own hardware, connection and OS settings, so
 * a fallback can't be reproduced from any other machine. `__peroCaps()` covers
 * this on desktop, but reading a console on Android means plugging into
 * chrome://inspect, which is a lot of friction for one line of output.
 */
export function CapabilityDebug() {
  const [report, setReport] = useState<ReturnType<typeof capabilityReport> | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("debug") !== "caps") return;
    // Delay past the idle-callback that mounts the 3D, so the reading reflects
    // the state the page actually settled into.
    const handle = window.setTimeout(() => setReport(capabilityReport()), 2600);
    return () => window.clearTimeout(handle);
  }, []);

  if (!report) return null;

  const blocked = Object.entries(report.blockedBy).filter(([, failed]) => failed);

  return (
    <div className="fixed inset-x-3 bottom-3 z-[200] max-h-[70svh] overflow-auto rounded-xl border border-line bg-bg/95 p-4 font-mono text-[11px] leading-relaxed text-ink shadow-2xl backdrop-blur">
      <p className="mb-2 font-bold text-accent">capability report</p>

      <Row label="hero ribbon" value={report.heroGlass ? "ON" : "fallback"} good={report.heroGlass} />
      <Row
        label="model viewer"
        value={report.modelViewer ? "ON" : "fallback"}
        good={report.modelViewer}
      />

      <p className="mt-3 mb-1 opacity-60">blocked by</p>
      {blocked.length === 0 ? (
        <p className="text-accent">nothing</p>
      ) : (
        blocked.map(([name]) => (
          <p key={name} className="text-[#ff8f8f]">
            {name}
          </p>
        ))
      )}

      <p className="mt-3 mb-1 opacity-60">device</p>
      {Object.entries(report.raw).map(([key, value]) => (
        <Row key={key} label={key} value={String(value)} />
      ))}
      <Row label="compactDevice" value={String(report.compactDevice)} />
    </div>
  );
}

function Row({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="opacity-70">{label}</span>
      <span className={good === undefined ? "" : good ? "text-accent" : "text-[#ff8f8f]"}>
        {value}
      </span>
    </div>
  );
}
