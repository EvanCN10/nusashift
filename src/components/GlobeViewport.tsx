"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { LocateFixed, Minus, Plus } from "lucide-react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { MeshPhongMaterial } from "three";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countriesTopo from "world-atlas/countries-110m.json";
import { formatDMS } from "@/lib/nasaPowerClient";
import type { DualRegionAnalysisReport } from "@/types/climate";

export type GlobeFocus = "pair" | "regionA";

interface GlobeViewportProps {
  report: DualRegionAnalysisReport;
  focus: GlobeFocus;
  /** Shift the globe up/down (px) so it centers in the space left between overlay panels. */
  verticalOffset?: number;
  onMapClickCoordinate: (lat: number, lon: number) => void;
  onUnsupported: () => void;
}

const COLOR_A = "#F97316";
const COLOR_B = "#06B6D4";

const LAND_FEATURES = (() => {
  const topo = countriesTopo as unknown as Topology<{ countries: GeometryCollection }>;
  return feature(topo, topo.objects.countries).features;
})();

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(cb: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Great-circle midpoint and angular separation (degrees) of two coordinates. */
function greatCircleMidpoint(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { lat: number; lng: number; separationDeg: number } {
  const v = (lat: number, lon: number) => [
    Math.cos(toRad(lat)) * Math.cos(toRad(lon)),
    Math.cos(toRad(lat)) * Math.sin(toRad(lon)),
    Math.sin(toRad(lat)),
  ];
  const a = v(lat1, lon1);
  const b = v(lat2, lon2);
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const separationDeg = toDeg(Math.acos(dot));
  const m = [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const len = Math.hypot(m[0], m[1], m[2]);
  if (len < 1e-6) {
    // Antipodal points: any midpoint is valid, fall back to region A.
    return { lat: lat1, lng: lon1, separationDeg };
  }
  return {
    lat: toDeg(Math.asin(m[2] / len)),
    lng: toDeg(Math.atan2(m[1], m[0])),
    separationDeg,
  };
}

interface MarkerDatum {
  lat: number;
  lng: number;
  color: string;
  label: string;
  tag: "A" | "B";
}

function buildPillElement(d: MarkerDatum): HTMLElement {
  const el = document.createElement("div");
  el.style.pointerEvents = "none";
  el.className =
    "pointer-events-none -translate-y-7 max-w-[240px] truncate whitespace-nowrap rounded-full border bg-canvas-900/95 px-2.5 py-0.5 font-mono text-[10px] text-ink-primary shadow-lg flex items-center gap-1";
  el.style.borderColor = d.tag === "A" ? "rgba(249,115,22,0.55)" : "rgba(6,182,212,0.55)";
  const dot = document.createElement("span");
  dot.className = "w-1.5 h-1.5 rounded-full shrink-0";
  dot.style.backgroundColor = d.color;
  const text = document.createElement("span");
  text.className = "truncate";
  // textContent (not innerHTML): region names can come from a reverse geocoder.
  text.textContent = d.label;
  el.append(dot, text);
  return el;
}

function CameraButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="hud-panel-float w-8 h-8 rounded-lg flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-panel-800 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-drought-orange"
    >
      {children}
    </button>
  );
}

export default function GlobeViewport({
  report,
  focus,
  verticalOffset = 0,
  onMapClickCoordinate,
  onUnsupported,
}: GlobeViewportProps) {
  const [webglOk] = useState(detectWebGL);
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
  const [recenterTick, setRecenterTick] = useState(0);

  useEffect(() => {
    if (!webglOk) onUnsupported();
  }, [webglOk, onUnsupported]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const globeMaterial = useMemo(
    () =>
      new MeshPhongMaterial({
        color: "#0E1116",
        emissive: "#090B0E",
        shininess: 6,
      }),
    []
  );

  const { regionA, regionB } = report;

  const markers = useMemo<MarkerDatum[]>(
    () => [
      {
        lat: regionA.lat,
        lng: regionA.lon,
        color: COLOR_A,
        tag: "A",
        label: `A: ${formatDMS(regionA.lat, regionA.lon)} · ${regionA.name.split(" (")[0]}`,
      },
      {
        lat: regionB.lat,
        lng: regionB.lon,
        color: COLOR_B,
        tag: "B",
        label: `B: ${formatDMS(regionB.lat, regionB.lon)} · ${regionB.name.split(" (")[0]}`,
      },
    ],
    [regionA, regionB]
  );

  const arcs = useMemo(
    () => [
      {
        startLat: regionA.lat,
        startLng: regionA.lon,
        endLat: regionB.lat,
        endLng: regionB.lon,
      },
    ],
    [regionA, regionB]
  );

  // Camera: fly to the A–B pair (or zoom onto Region A for the lag-cascade view).
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !isReady) return;
    const duration = reducedMotion ? 0 : 1400;
    if (focus === "regionA") {
      globe.pointOfView({ lat: regionA.lat, lng: regionA.lon, altitude: 0.85 }, duration);
      return;
    }
    const mid = greatCircleMidpoint(regionA.lat, regionA.lon, regionB.lat, regionB.lon);
    const altitude = Math.max(1.25, Math.min(2.9, 0.9 + (mid.separationDeg / 180) * 2.4));
    globe.pointOfView({ lat: mid.lat, lng: mid.lng, altitude }, duration);
  }, [isReady, focus, regionA, regionB, reducedMotion, recenterTick]);

  const zoomBy = useCallback(
    (factor: number) => {
      const globe = globeRef.current;
      if (!globe) return;
      const pov = globe.pointOfView();
      const altitude = Math.max(0.35, Math.min(4, pov.altitude * factor));
      globe.pointOfView({ ...pov, altitude }, reducedMotion ? 0 : 450);
    },
    [reducedMotion]
  );

  const handleGlobeReady = useCallback(() => {
    const globe = globeRef.current;
    if (globe) {
      // Start zoomed out so the first fly-in reads as an intro.
      globe.pointOfView({ lat: 0, lng: 0, altitude: 3.6 }, 0);
      const controls = globe.controls();
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      // Wheel zoom is off so the page can still scroll past the full-bleed
      // globe; zoom lives on the +/- buttons instead.
      controls.enableZoom = false;
    }
    setIsReady(true);
  }, []);

  const handleCoordinate = useCallback(
    (coords: { lat: number; lng: number }) => {
      onMapClickCoordinate(Number(coords.lat.toFixed(2)), Number(coords.lng.toFixed(2)));
    },
    [onMapClickCoordinate]
  );

  if (!webglOk) return null;

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label={`3D teleconnection globe comparing ${regionA.name} and ${regionB.name}. Drag to rotate, scroll to zoom, click to set a region.`}
      className="absolute inset-0 cursor-crosshair select-none"
    >
      {size.width > 0 && size.height > 0 ? (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          globeOffset={[0, verticalOffset]}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={null}
          globeMaterial={globeMaterial}
          showGraticules
          showAtmosphere
          atmosphereColor="#3A8FA3"
          atmosphereAltitude={0.14}
          onGlobeReady={handleGlobeReady}
          onGlobeClick={handleCoordinate}
          showPointerCursor={false}
          // Land
          polygonsData={LAND_FEATURES}
          polygonCapColor={() => "#1A1F29"}
          polygonSideColor={() => "rgba(26,31,41,0.6)"}
          polygonStrokeColor={() => "#2E3747"}
          polygonAltitude={0.006}
          polygonsTransitionDuration={0}
          onPolygonClick={(_p, _e, coords) => handleCoordinate(coords)}
          // Dipole arc
          arcsData={arcs}
          arcColor={() => [COLOR_A, COLOR_B]}
          arcStroke={0.55}
          arcAltitudeAutoScale={0.42}
          arcDashLength={0.42}
          arcDashGap={0.12}
          arcDashAnimateTime={reducedMotion ? 0 : 2600}
          arcsTransitionDuration={reducedMotion ? 0 : 900}
          onArcClick={(_a, _e, coords) => handleCoordinate(coords)}
          // Target points
          pointsData={markers}
          pointColor={(d) => (d as MarkerDatum).color}
          pointAltitude={0.012}
          pointRadius={reducedMotion ? 1.1 : 0.7}
          pointsTransitionDuration={reducedMotion ? 0 : 700}
          onPointClick={(_p, _e, coords) => handleCoordinate(coords)}
          // Radar pulse rings (static points stand in when reduced motion is on)
          ringsData={reducedMotion ? [] : markers}
          ringColor={(d: object) => {
            const rgb = (d as MarkerDatum).tag === "A" ? "249,115,22" : "6,182,212";
            return (t: number) => `rgba(${rgb},${(1 - t).toFixed(3)})`;
          }}
          ringMaxRadius={6}
          ringPropagationSpeed={2.2}
          ringRepeatPeriod={1100}
          // DMS coordinate pills
          htmlElementsData={markers}
          htmlAltitude={0.02}
          htmlElement={(d: object) => buildPillElement(d as MarkerDatum)}
        />
      ) : null}

      {isReady ? (
        <div
          role="group"
          aria-label="Globe camera controls"
          className="absolute top-2 right-2 z-20 flex flex-col gap-1 xl:top-1/2 xl:-translate-y-1/2 xl:right-[calc(var(--hud-side-r)+1.5rem)]"
        >
          <CameraButton label="Zoom in" onClick={() => zoomBy(0.7)}>
            <Plus className="w-4 h-4" aria-hidden="true" />
          </CameraButton>
          <CameraButton label="Zoom out" onClick={() => zoomBy(1.4)}>
            <Minus className="w-4 h-4" aria-hidden="true" />
          </CameraButton>
          <CameraButton
            label="Recenter on region pair"
            onClick={() => setRecenterTick((t) => t + 1)}
          >
            <LocateFixed className="w-4 h-4" aria-hidden="true" />
          </CameraButton>
        </div>
      ) : null}

      {!isReady ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[11px] tracking-[0.12em] text-ink-muted animate-pulse">
            INITIALIZING 3D GLOBE…
          </span>
        </div>
      ) : null}
    </div>
  );
}
