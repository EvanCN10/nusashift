"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { LocateFixed, Minus, Plus } from "lucide-react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countriesTopo from "world-atlas/countries-110m.json";
import {
  AmbientLight,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Points,
  PointsMaterial,
  SRGBColorSpace,
  TextureLoader,
  type Texture,
} from "three";
import { usePrefersReducedMotion } from "@/components/LenisProvider";
import RegionHoverCard, {
  type GlobeHoverTarget,
} from "@/components/RegionHoverCard";
import type { DualRegionAnalysisReport } from "@/types/climate";

interface CountryProperties {
  name?: string;
}

interface CountryFeature {
  id?: string | number;
  properties?: CountryProperties;
  geometry: unknown;
}

const LAND_FEATURES: CountryFeature[] = (() => {
  const topo = countriesTopo as unknown as Topology<{
    countries: GeometryCollection<CountryProperties>;
  }>;
  const fc = feature(topo, topo.objects.countries);
  return "features" in fc ? (fc.features as unknown as CountryFeature[]) : [];
})();

export type GlobeFocus = "pair" | "regionA";

interface GlobeViewportProps {
  report: DualRegionAnalysisReport;
  focus: GlobeFocus;
  horizontalOffset?: number;
  verticalOffset?: number;
  onMapClickCoordinate: (lat: number, lon: number) => void;
  onUnsupported: () => void;
}

const COLOR_A = "#FB923C";
const COLOR_B = "#22D3EE";

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
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
    return { lat: lat1, lng: lon1, separationDeg };
  }
  return {
    lat: toDeg(Math.asin(m[2] / len)),
    lng: toDeg(Math.atan2(m[1], m[0])),
    separationDeg,
  };
}

/** Deterministic PRNG so the starfield renders predictably across reloads. */
function createStarfieldPoints(count = 1800): Points {
  let seed = 42197;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const u = rand() * 2 - 1;
    const phi = rand() * Math.PI * 2;
    const r = 340 + rand() * 220;
    const sinTheta = Math.sqrt(Math.max(0, 1 - u * u));

    positions[i * 3] = r * sinTheta * Math.cos(phi);
    positions[i * 3 + 1] = r * u;
    positions[i * 3 + 2] = r * sinTheta * Math.sin(phi);

    // Subtle spectral mix: crisp white, faint ice-blue, occasional warm amber star.
    const tint = rand();
    const brightness = 0.42 + rand() * 0.58;
    const idx = i * 3;
    if (tint < 0.72) {
      colors[idx] = brightness;
      colors[idx + 1] = brightness;
      colors[idx + 2] = Math.min(1, brightness * 1.05);
    } else if (tint < 0.9) {
      colors[idx] = brightness * 0.78;
      colors[idx + 1] = brightness * 0.9;
      colors[idx + 2] = brightness;
    } else {
      colors[idx] = brightness;
      colors[idx + 1] = brightness * 0.88;
      colors[idx + 2] = brightness * 0.72;
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));

  const material = new PointsMaterial({
    size: 1.5,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });

  const starPoints = new Points(geometry, material);
  starPoints.name = "nusashift-starfield";
  return starPoints;
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
    "pointer-events-none -translate-y-7 max-w-[148px] sm:max-w-[186px] truncate whitespace-nowrap rounded-full border bg-canvas-950/92 backdrop-blur-md px-2 sm:px-2.5 py-0.5 font-mono text-[9.5px] sm:text-[10px] text-ink-primary shadow-[0_6px_18px_rgba(0,0,0,0.85)] flex items-center gap-1.5";
  el.style.borderColor =
    d.tag === "A" ? "rgba(251,146,60,0.75)" : "rgba(34,211,238,0.75)";
  const dot = document.createElement("span");
  dot.className = "w-1.5 h-1.5 rounded-full shrink-0";
  dot.style.backgroundColor = d.color;
  const text = document.createElement("span");
  text.className = "truncate";
  text.textContent = d.label;
  el.append(dot, text);
  return el;
}

const emptyPolygonSideColor = () => "";

interface GlobeCanvasProps {
  globeRef: MutableRefObject<GlobeMethods | undefined>;
  width: number;
  height: number;
  horizontalOffset: number;
  verticalOffset: number;
  globeMaterial: MeshPhongMaterial;
  basePolygonCapMaterial: MeshBasicMaterial;
  hoverPolygonCapMaterial: MeshBasicMaterial;
  hoveredPolygon: CountryFeature | null;
  reducedMotion: boolean;
  arcs: Array<{ startLat: number; startLng: number; endLat: number; endLng: number }>;
  markers: MarkerDatum[];
  onGlobeReady: () => void;
  onCoordinate: (coords: { lat: number; lng: number }) => void;
  onPolygonHover: (poly: object | null) => void;
}

/** Isolated WebGL canvas so 60fps hover tooltip movement never triggers React <Globe> diffs. */
const GlobeCanvas = memo(function GlobeCanvas({
  globeRef,
  width,
  height,
  horizontalOffset,
  verticalOffset,
  globeMaterial,
  basePolygonCapMaterial,
  hoverPolygonCapMaterial,
  hoveredPolygon,
  reducedMotion,
  arcs,
  markers,
  onGlobeReady,
  onCoordinate,
  onPolygonHover,
}: GlobeCanvasProps) {
  const getPolygonCapMaterial = useCallback(
    (d: object) =>
      d === hoveredPolygon ? hoverPolygonCapMaterial : basePolygonCapMaterial,
    [hoveredPolygon, hoverPolygonCapMaterial, basePolygonCapMaterial]
  );

  const getPolygonStrokeColor = useCallback(
    (d: object) =>
      d === hoveredPolygon
        ? "rgba(251, 146, 60, 0.92)"
        : "rgba(255, 255, 255, 0.36)",
    [hoveredPolygon]
  );

  const getPolygonAltitude = useCallback(
    (d: object) => (d === hoveredPolygon ? 0.012 : 0.004),
    [hoveredPolygon]
  );

  return (
    <Globe
      ref={globeRef}
      width={width}
      height={height}
      globeOffset={[horizontalOffset, verticalOffset]}
      backgroundColor="rgba(0,0,0,0)"
      globeImageUrl={null}
      globeMaterial={globeMaterial}
      showGraticules={false}
      showAtmosphere
      atmosphereColor="#5FA8D3"
      atmosphereAltitude={0.15}
      onGlobeReady={onGlobeReady}
      onGlobeClick={onCoordinate}
      showPointerCursor={false}
      // Country boundary fracture lines over NASA Blue Marble
      polygonsData={LAND_FEATURES}
      polygonCapMaterial={getPolygonCapMaterial}
      polygonSideColor={emptyPolygonSideColor}
      polygonStrokeColor={getPolygonStrokeColor}
      polygonAltitude={getPolygonAltitude}
      polygonsTransitionDuration={reducedMotion ? 0 : 150}
      onPolygonHover={onPolygonHover}
      onPolygonClick={(_p, _e, coords) => onCoordinate(coords)}
      // Dipole arc
      arcsData={arcs}
      arcColor={() => [COLOR_A, COLOR_B]}
      arcStroke={0.8}
      arcAltitudeAutoScale={0.44}
      arcDashLength={0.45}
      arcDashGap={0.14}
      arcDashAnimateTime={reducedMotion ? 0 : 2600}
      arcsTransitionDuration={reducedMotion ? 0 : 900}
      onArcClick={(_a, _e, coords) => onCoordinate(coords)}
      // Target points
      pointsData={markers}
      pointColor={(d) => (d as MarkerDatum).color}
      pointAltitude={0.02}
      pointRadius={reducedMotion ? 1.25 : 0.9}
      pointsTransitionDuration={reducedMotion ? 0 : 700}
      onPointClick={(_p, _e, coords) => onCoordinate(coords)}
      // Radar pulse rings
      ringsData={reducedMotion ? [] : markers}
      ringColor={(d: object) => {
        const rgb = (d as MarkerDatum).tag === "A" ? "251,146,60" : "34,211,238";
        return (t: number) => `rgba(${rgb},${(1 - t).toFixed(3)})`;
      }}
      ringMaxRadius={7}
      ringPropagationSpeed={2.2}
      ringRepeatPeriod={1100}
      // DMS coordinate pills
      htmlElementsData={markers}
      htmlAltitude={0.026}
      htmlElement={(d: object) => buildPillElement(d as MarkerDatum)}
    />
  );
});

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
      className="glass-panel w-8 h-8 rounded-lg flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-panel-800/80 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange"
    >
      {children}
    </button>
  );
}

/** Realistic NASA Blue Marble globe with ocean specular, SRTM relief, starfield, and render gating. */
export default function GlobeViewport({
  report,
  focus,
  horizontalOffset = 0,
  verticalOffset = 0,
  onMapClickCoordinate,
  onUnsupported,
}: GlobeViewportProps) {
  const [webglOk] = useState(detectWebGL);
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const starfieldRef = useRef<Points | null>(null);
  const hoveredCountryRef = useRef<CountryFeature | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number; lat: number; lon: number } | null>(
    null
  );
  const rafRef = useRef<number | null>(null);
  const touchTimerRef = useRef<number | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
  const [texturesSettled, setTexturesSettled] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [recenterTick, setRecenterTick] = useState(0);
  const [hoveredPolygon, setHoveredPolygon] = useState<CountryFeature | null>(null);
  const [hoverTarget, setHoverTarget] = useState<GlobeHoverTarget | null>(null);

  const basePolygonCapMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: DoubleSide,
      }),
    []
  );

  const hoverPolygonCapMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: "#f8fafc",
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
        side: DoubleSide,
      }),
    []
  );

  useEffect(() => {
    return () => {
      basePolygonCapMaterial.dispose();
      hoverPolygonCapMaterial.dispose();
    };
  }, [basePolygonCapMaterial, hoverPolygonCapMaterial]);

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

  // Pause WebGL RAF when hero scrolls out of view or browser tab is hidden.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.02 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !isReady) return;
    if (isInViewport && isTabVisible) {
      globe.resumeAnimation();
    } else {
      globe.pauseAnimation();
    }
  }, [isReady, isInViewport, isTabVisible]);

  const globeMaterial = useMemo(
    () =>
      new MeshPhongMaterial({
        color: new Color("#0E1522"),
        specular: new Color("#4F7396"),
        shininess: 18,
        bumpScale: 0.045,
      }),
    []
  );

  // Lazy-load NASA Blue Marble textures cleanly with safe cleanup and graceful fallback.
  useEffect(() => {
    if (!webglOk) return;
    let cancelled = false;
    const loader = new TextureLoader();
    const loaded: Texture[] = [];
    let pending = 3;

    const markOneSettled = () => {
      pending -= 1;
      if (pending <= 0 && !cancelled) {
        setTexturesSettled(true);
      }
    };

    loader.load(
      "/textures/day.jpg",
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        tex.colorSpace = SRGBColorSpace;
        loaded.push(tex);
        globeMaterial.color.set("#ffffff");
        globeMaterial.map = tex;
        globeMaterial.needsUpdate = true;
        markOneSettled();
      },
      undefined,
      markOneSettled
    );

    loader.load(
      "/textures/bump.jpg",
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        loaded.push(tex);
        globeMaterial.bumpMap = tex;
        globeMaterial.needsUpdate = true;
        markOneSettled();
      },
      undefined,
      markOneSettled
    );

    loader.load(
      "/textures/specular.jpg",
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        loaded.push(tex);
        globeMaterial.specularMap = tex;
        globeMaterial.needsUpdate = true;
        markOneSettled();
      },
      undefined,
      markOneSettled
    );

    return () => {
      cancelled = true;
      for (const tex of loaded) tex.dispose();
      globeMaterial.dispose();
    };
  }, [webglOk, globeMaterial]);

  // Cleanup starfield scene resources on unmount.
  useEffect(() => {
    const globe = globeRef.current;
    return () => {
      const stars = starfieldRef.current;
      if (stars) {
        globe?.scene()?.remove(stars);
        stars.geometry.dispose();
        (stars.material as PointsMaterial).dispose();
        starfieldRef.current = null;
      }
    };
  }, []);

  const { regionA, regionB } = report;

  const markers = useMemo<MarkerDatum[]>(
    () => [
      {
        lat: regionA.lat,
        lng: regionA.lon,
        color: COLOR_A,
        tag: "A",
        label: `A · ${regionA.name.split(" (")[0]}`,
      },
      {
        lat: regionB.lat,
        lng: regionB.lon,
        color: COLOR_B,
        tag: "B",
        label: `B · ${regionB.name.split(" (")[0]}`,
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

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !isReady) return;
    const duration = reducedMotion ? 0 : 1400;
    if (focus === "regionA") {
      globe.pointOfView({ lat: regionA.lat, lng: regionA.lon, altitude: 0.9 }, duration);
      return;
    }
    const mid = greatCircleMidpoint(regionA.lat, regionA.lon, regionB.lat, regionB.lon);
    const baseAltitude = Math.max(1.38, Math.min(2.45, 1.05 + (mid.separationDeg / 180) * 1.45));
    const altitude =
      size.width > 0 && size.width < 1260 && size.width >= 1024
        ? baseAltitude * 1.18
        : baseAltitude;
    globe.pointOfView({ lat: mid.lat, lng: mid.lng, altitude }, duration);
  }, [isReady, focus, regionA, regionB, reducedMotion, recenterTick, size.width]);

  const zoomBy = useCallback(
    (factor: number) => {
      const globe = globeRef.current;
      if (!globe) return;
      const pov = globe.pointOfView();
      const altitude = Math.max(0.4, Math.min(3.8, pov.altitude * factor));
      globe.pointOfView({ ...pov, altitude }, reducedMotion ? 0 : 450);
    },
    [reducedMotion]
  );

  const handleGlobeReady = useCallback(() => {
    const globe = globeRef.current;
    if (globe) {
      globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      globe.pointOfView({ lat: 0, lng: 20, altitude: 2.75 }, 0);

      // Balanced orbital lighting: crisp sunlit relief + subtle dark terminator limb.
      const ambient = new AmbientLight(0xdbeafe, 0.9);
      const sunKey = new DirectionalLight(0xfff7ed, 2.0);
      sunKey.position.set(-2.6, 1.4, 2.8);
      const rim = new DirectionalLight(0x38bdf8, 0.35);
      rim.position.set(2.8, -1.0, -2.0);
      globe.lights([ambient, sunKey, rim]);

      const scene = globe.scene();
      if (scene && !starfieldRef.current) {
        const stars = createStarfieldPoints(1800);
        starfieldRef.current = stars;
        scene.add(stars);
      }

      const controls = globe.controls();
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      // Wheel zoom stays off so page scroll flows naturally past the hero.
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

  const handlePolygonHover = useCallback((poly: object | null) => {
    const featurePoly = poly as CountryFeature | null;
    hoveredCountryRef.current = featurePoly;
    setHoveredPolygon(featurePoly);

    const last = lastPointerRef.current;
    if (!last) return;

    const coords = globeRef.current?.toGlobeCoords(last.x, last.y);
    if (!coords && !featurePoly) {
      setHoverTarget(null);
      return;
    }
    const lat = coords ? Number(coords.lat.toFixed(2)) : last.lat;
    const lon = coords ? Number(coords.lng.toFixed(2)) : last.lon;
    lastPointerRef.current = { x: last.x, y: last.y, lat, lon };
    setHoverTarget({
      x: last.x,
      y: last.y,
      lat,
      lon,
      countryName: featurePoly?.properties?.name ?? null,
    });
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    if (e.buttons !== 0) {
      // Suppress floating hover card while actively dragging the globe.
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setHoverTarget(null);
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const globe = globeRef.current;
      if (!globe) return;

      const coords = globe.toGlobeCoords(relX, relY);
      const activeCountry = hoveredCountryRef.current;
      if (!coords && !activeCountry) {
        lastPointerRef.current = null;
        setHoverTarget(null);
        return;
      }

      const lat = coords
        ? Number(coords.lat.toFixed(2))
        : lastPointerRef.current?.lat ?? 0;
      const lon = coords
        ? Number(coords.lng.toFixed(2))
        : lastPointerRef.current?.lon ?? 0;

      lastPointerRef.current = { x: relX, y: relY, lat, lon };
      setHoverTarget({
        x: relX,
        y: relY,
        lat,
        lon,
        countryName: activeCountry?.properties?.name ?? null,
      });
    });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    if (e.pointerType === "touch") {
      const coords = globeRef.current?.toGlobeCoords(relX, relY);
      if (coords) {
        if (touchTimerRef.current !== null) {
          window.clearTimeout(touchTimerRef.current);
        }
        setHoverTarget({
          x: relX,
          y: relY,
          lat: Number(coords.lat.toFixed(2)),
          lon: Number(coords.lng.toFixed(2)),
          countryName: hoveredCountryRef.current?.properties?.name ?? null,
          isTouchPinned: true,
        });
        touchTimerRef.current = window.setTimeout(() => {
          setHoverTarget(null);
        }, 3200);
      }
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    hoveredCountryRef.current = null;
    lastPointerRef.current = null;
    setHoveredPolygon(null);
    setHoverTarget(null);
  }, []);

  // Allow keyboard Escape to dismiss active region hover card (WCAG 1.4.13).
  useEffect(() => {
    if (!hoverTarget) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHoverTarget(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hoverTarget]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      if (touchTimerRef.current !== null) window.clearTimeout(touchTimerRef.current);
    };
  }, []);

  if (!webglOk) return null;

  const isFullyReady = isReady && texturesSettled;

  return (
    <div
      ref={containerRef}
      role="application"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      aria-label={`3D teleconnection Earth globe comparing ${regionA.name} and ${regionB.name}. Drag to rotate, hover borders for region info, click to set a region, or use zoom buttons.`}
      className="absolute inset-0 cursor-crosshair select-none"
    >
      {size.width > 0 && size.height > 0 ? (
        <GlobeCanvas
          globeRef={globeRef}
          width={size.width}
          height={size.height}
          horizontalOffset={horizontalOffset}
          verticalOffset={verticalOffset}
          globeMaterial={globeMaterial}
          basePolygonCapMaterial={basePolygonCapMaterial}
          hoverPolygonCapMaterial={hoverPolygonCapMaterial}
          hoveredPolygon={hoveredPolygon}
          reducedMotion={reducedMotion}
          arcs={arcs}
          markers={markers}
          onGlobeReady={handleGlobeReady}
          onCoordinate={handleCoordinate}
          onPolygonHover={handlePolygonHover}
        />
      ) : null}

      <RegionHoverCard target={hoverTarget} containerSize={size} />

      {isFullyReady ? (
        <div
          role="group"
          aria-label="Globe camera controls"
          className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 lg:bottom-[76px] lg:left-8 lg:right-auto"
        >
          <CameraButton label="Zoom in" onClick={() => zoomBy(0.75)}>
            <Plus className="w-4 h-4" aria-hidden="true" />
          </CameraButton>
          <CameraButton label="Zoom out" onClick={() => zoomBy(1.33)}>
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

      {!isFullyReady ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[11px] tracking-[0.14em] text-ink-muted animate-pulse">
            INITIALIZING 3D GLOBE…
          </span>
        </div>
      ) : null}
    </div>
  );
}
