"use client";

import dynamic from "next/dynamic";
import FlatMapViewport from "@/components/FlatMapViewport";
import type { GlobeFocus } from "@/components/GlobeViewport";
import type { MapRenderMode } from "@/components/MapControlsBar";
import type { DualRegionAnalysisReport } from "@/types/climate";

// three.js touches `window` on import, so the globe is client-only and code-split.
const GlobeViewport = dynamic(() => import("@/components/GlobeViewport"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="font-mono text-[11px] tracking-[0.12em] text-ink-muted animate-pulse">
        LOADING 3D GLOBE…
      </span>
    </div>
  ),
});

interface InteractiveWorldMapProps {
  report: DualRegionAnalysisReport;
  mapMode: MapRenderMode;
  globeFocus: GlobeFocus;
  globeVerticalOffset?: number;
  onMapClickCoordinate: (lat: number, lon: number) => void;
  on3dUnsupported: () => void;
}

/** Full-bleed map viewport: 3D globe by default, legacy 2D SVG map as fallback. */
export default function InteractiveWorldMap({
  report,
  mapMode,
  globeFocus,
  globeVerticalOffset,
  onMapClickCoordinate,
  on3dUnsupported,
}: InteractiveWorldMapProps) {
  return (
    <div
      aria-label="Interactive teleconnection map"
      className="absolute inset-0 overflow-hidden"
    >
      {mapMode === "3d" ? (
        <GlobeViewport
          report={report}
          focus={globeFocus}
          verticalOffset={globeVerticalOffset}
          onMapClickCoordinate={onMapClickCoordinate}
          onUnsupported={on3dUnsupported}
        />
      ) : (
        <FlatMapViewport report={report} onMapClickCoordinate={onMapClickCoordinate} />
      )}
    </div>
  );
}
