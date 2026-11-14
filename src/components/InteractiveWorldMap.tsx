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
  globeHorizontalOffset?: number;
  globeVerticalOffset?: number;
  onMapClickCoordinate: (lat: number, lon: number) => void;
  on3dUnsupported: () => void;
}

/** Full-bleed map viewport: 3D globe by default, legacy 2D SVG map as fallback. */
export default function InteractiveWorldMap({
  report,
  mapMode,
  globeFocus,
  globeHorizontalOffset,
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
          horizontalOffset={globeHorizontalOffset}
          verticalOffset={globeVerticalOffset}
          onMapClickCoordinate={onMapClickCoordinate}
          onUnsupported={on3dUnsupported}
        />
      ) : (
        <div className="h-full w-full lg:flex lg:items-center lg:justify-center lg:px-8">
          <div className="relative h-full w-full lg:h-[64%] lg:w-[54%] lg:max-w-[780px] lg:overflow-hidden lg:rounded-xl lg:border lg:border-white/10">
            <FlatMapViewport report={report} onMapClickCoordinate={onMapClickCoordinate} />
          </div>
        </div>
      )}
    </div>
  );
}
