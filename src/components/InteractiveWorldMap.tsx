"use client";

import { useMemo, useRef } from "react";
import { Globe2, Loader2, MapPin, Waves } from "lucide-react";
import { CURATED_CASES } from "@/data/cachedCases";
import { formatDMS } from "@/lib/nasaPowerClient";
import type { DualRegionAnalysisReport } from "@/types/climate";

interface InteractiveWorldMapProps {
  report: DualRegionAnalysisReport;
  activePinMode: "A" | "B";
  isAnalyzing: boolean;
  onPinModeChange: (mode: "A" | "B") => void;
  onSelectCase: (caseId: string) => void;
  onMapClickCoordinate: (lat: number, lon: number) => void;
}

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 500;
const LAT_MAX = 82;
const LAT_MIN = -60;
const LAT_SPAN = LAT_MAX - LAT_MIN;

function projectLonLat(lon: number, lat: number): [number, number] {
  const x = ((lon + 180) / 360) * SVG_WIDTH;
  const y = ((LAT_MAX - lat) / LAT_SPAN) * SVG_HEIGHT;
  return [x, y];
}

function toSvgPath(coords: ReadonlyArray<readonly [number, number]>): string {
  return (
    coords
      .map(([lon, lat], idx) => {
        const [x, y] = projectLonLat(lon, lat);
        return `${idx === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + " Z"
  );
}

// Cartographically anchored continent & archipelago polygons [lon, lat]
const WORLD_POLYGONS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  // North & Central America
  [
    [-168, 65], [-160, 71], [-140, 70], [-125, 71], [-110, 73], [-95, 74],
    [-82, 68], [-78, 62], [-64, 60], [-55, 52], [-60, 46], [-70, 42],
    [-76, 35], [-81, 25], [-83, 29], [-90, 29], [-97, 26], [-96, 19],
    [-87, 21], [-88, 16], [-83, 14], [-83, 9], [-78, 8], [-80, 9],
    [-85, 11], [-92, 14], [-105, 20], [-110, 24], [-114, 31], [-117, 32],
    [-124, 41], [-125, 49], [-136, 58], [-152, 60], [-162, 55], [-166, 60],
  ],
  // Greenland
  [
    [-56, 76], [-38, 82], [-18, 81], [-21, 70], [-43, 60], [-52, 67],
  ],
  // South America (highlighting Piura / Peru west bulge & Amazon)
  [
    [-78, 9], [-72, 12], [-62, 10], [-50, 1], [-35, -6], [-38, -14],
    [-41, -22], [-48, -26], [-53, -33], [-62, -41], [-67, -50], [-68, -55],
    [-74, -53], [-75, -43], [-72, -33], [-70, -18], [-77, -12], [-81, -5],
    [-80, 1],
  ],
  // Europe + UK/Scandinavia
  [
    [-9, 37], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [6, 58],
    [10, 64], [20, 70], [30, 71], [40, 67], [30, 60], [22, 59], [18, 55],
    [14, 54], [21, 55], [28, 60], [32, 46], [28, 41], [23, 38], [16, 38],
    [12, 44], [6, 43], [3, 41], [-5, 36],
  ],
  // UK & Ireland
  [
    [-6, 50], [-5, 58], [-1, 58], [1, 52], [-3, 50],
  ],
  // Africa (highlighting East Africa / Turkana Kenya)
  [
    [-17, 15], [-16, 28], [-6, 36], [10, 37], [12, 33], [25, 32], [32, 31],
    [35, 26], [43, 12], [51, 12], [45, 2], [40, -5], [40, -15], [35, -24],
    [28, -33], [18, -35], [14, -22], [12, -12], [9, 4], [2, 6], [-8, 5],
    [-15, 11],
  ],
  // Madagascar
  [
    [49, -12], [50, -18], [47, -25], [44, -24], [44, -17],
  ],
  // Eurasia + India + Arabia + Indochina + East Asia
  [
    [27, 41], [36, 37], [35, 31], [40, 21], [44, 13], [59, 22], [56, 26],
    [49, 29], [56, 27], [67, 25], [73, 19], [77, 8], [81, 16], [89, 22],
    [93, 19], [98, 15], [100, 12], [103, 2], [104, 10], [109, 13], [107, 21],
    [114, 22], [121, 25], [122, 31], [119, 36], [122, 40], [127, 35],
    [129, 41], [135, 44], [141, 53], [156, 52], [162, 60], [176, 66],
    [160, 70], [135, 72], [105, 76], [80, 72], [60, 69], [40, 67], [35, 46],
  ],
  // Japan
  [
    [130, 32], [136, 34], [141, 38], [145, 44], [140, 44], [137, 37], [131, 34],
  ],
  // Philippines
  [
    [120, 18], [123, 14], [126, 8], [123, 6], [121, 12],
  ],
  // Indonesia: Sumatra
  [
    [95, 5], [99, 3], [104, -2], [106, -6], [103, -5], [98, 1],
  ],
  // Indonesia: Java (Surabaya / East Java / Brantas Basin!)
  [
    [105.5, -6.1], [111.5, -6.8], [114.5, -7.8], [114.2, -8.7], [108.5, -7.8], [105.5, -7.0],
  ],
  // Indonesia: Kalimantan / Borneo (Palangkaraya!)
  [
    [109, 1.5], [114.5, 4.5], [118.5, 6.2], [118.8, 1.5], [116.5, -3.5], [112.0, -3.4], [109.5, -1.5],
  ],
  // Indonesia: Sulawesi
  [
    [119, -5], [121.5, -2.5], [125, 1.5], [122.5, 1.2], [122.5, -4.5], [120, -5.2],
  ],
  // New Guinea / Papua
  [
    [131, -2], [137, -2], [145, -5], [150, -10], [143, -9], [136, -5], [132, -4],
  ],
  // Australia
  [
    [114, -22], [122, -17], [131, -12], [137, -15], [142, -11], [146, -18],
    [153, -27], [150, -37], [140, -38], [135, -34], [125, -33], [115, -34],
    [113, -26],
  ],
  // New Zealand
  [
    [173, -35], [178, -38], [172, -44], [167, -46], [170, -41],
  ],
];

const SHORT_CASE_LABELS: Record<string, string> = {
  "indo-chile-dipole": "Case 1: Merauke ↔ Chile [ENSO Dipole]",
  "silent-murray-kalimantan": "Case 2: Murray-Darling ↔ Kalimantan [Silent Stress]",
  "java-water-energy": "Case 3: East Java ↔ West Java [Water-Energy]",
};

function getFloatingPillStyle(
  x: number,
  y: number,
  placeBelow = false
): React.CSSProperties {
  const xPct = Math.max(4, Math.min(96, (x / SVG_WIDTH) * 100));
  const rawYPct = Math.max(8, Math.min(86, (y / SVG_HEIGHT) * 100));
  const topPct = placeBelow
    ? rawYPct > 76
      ? rawYPct - 11
      : rawYPct + 11
    : rawYPct < 22
    ? rawYPct + 11
    : rawYPct - 11;

  if (xPct > 64) {
    return {
      right: `${Math.max(2, 100 - xPct - 2).toFixed(1)}%`,
      top: `${topPct.toFixed(1)}%`,
      transform: "translateY(-50%)",
    };
  }
  if (xPct < 36) {
    return {
      left: `${Math.max(2, xPct - 2).toFixed(1)}%`,
      top: `${topPct.toFixed(1)}%`,
      transform: "translateY(-50%)",
    };
  }
  return {
    left: `${xPct.toFixed(1)}%`,
    top: `${topPct.toFixed(1)}%`,
    transform: "translate(-50%, -50%)",
  };
}

export default function InteractiveWorldMap({
  report,
  activePinMode,
  isAnalyzing,
  onPinModeChange,
  onSelectCase,
  onMapClickCoordinate,
}: InteractiveWorldMapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const worldPaths = useMemo(() => WORLD_POLYGONS.map(toSvgPath), []);

  const [ax, ay] = projectLonLat(report.regionA.lon, report.regionA.lat);
  const [bx, by] = projectLonLat(report.regionB.lon, report.regionB.lat);

  // Curved quadratic Bezier control point arching gracefully above or between pins
  const midX = (ax + bx) / 2;
  const dist = Math.hypot(bx - ax, by - ay);
  const arcLift = Math.max(24, Math.min(115, dist * 0.28));
  const ctrlY = Math.max(18, (ay + by) / 2 - arcLift);

  const sameLatitudeBand = Math.abs(ay - by) < 95;
  const pillStyleA = getFloatingPillStyle(
    ax,
    ay,
    sameLatitudeBand ? ay >= by : false
  );
  const pillStyleB = getFloatingPillStyle(
    bx,
    by,
    sameLatitudeBand ? ay < by : false
  );

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const relX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const relY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

    const lon = Number((relX * 360 - 180).toFixed(2));
    const lat = Number((LAT_MAX - relY * LAT_SPAN).toFixed(2));
    onMapClickCoordinate(lat, lon);
  };

  return (
    <section
      aria-label="Interactive teleconnection world map"
      className="hud-panel rounded-xl p-3.5 flex flex-col gap-3"
    >
      {/* Top Overlay Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2">
        {/* Curated Case Quick-Pills */}
        <div
          role="toolbar"
          aria-label="Curated climate teleconnection case studies"
          className="flex flex-wrap items-center gap-1.5"
        >
          {CURATED_CASES.map((c) => {
            const active = report.caseId === c.caseId;
            return (
              <button
                key={c.caseId}
                type="button"
                aria-pressed={active}
                onClick={() => onSelectCase(c.caseId)}
                className={`min-h-[30px] px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-drought-orange ${
                  active
                    ? "bg-drought-orange/15 text-drought-orange border border-drought-orange/45"
                    : "hud-well text-ink-secondary hover:text-ink-primary hover:bg-panel-800 border border-white/10"
                }`}
              >
                {SHORT_CASE_LABELS[c.caseId] ?? c.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Pin Mode Toggle + Data Source Feed Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Map click target pin"
            className="hud-well p-1 rounded-lg flex items-center gap-1"
          >
            <button
              type="button"
              aria-pressed={activePinMode === "A"}
              onClick={() => onPinModeChange("A")}
              className={`min-h-[26px] px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-drought-orange ${
                activePinMode === "A"
                  ? "bg-panel-800 text-ink-primary border border-drought-orange/45"
                  : "text-ink-secondary hover:text-ink-primary border border-transparent"
              }`}
            >
              <span
                aria-hidden="true"
                className="w-2 h-2 rounded-full bg-drought-orange"
              />
              <span>Set Region A</span>
            </button>

            <button
              type="button"
              aria-pressed={activePinMode === "B"}
              onClick={() => onPinModeChange("B")}
              className={`min-h-[26px] px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-dipole-cyan ${
                activePinMode === "B"
                  ? "bg-panel-800 text-ink-primary border border-dipole-cyan/45"
                  : "text-ink-secondary hover:text-ink-primary border border-transparent"
              }`}
            >
              <span
                aria-hidden="true"
                className="w-2 h-2 rounded-full bg-dipole-cyan"
              />
              <span>Set Region B</span>
            </button>
          </div>

          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-1 rounded-md bg-canvas-950 border border-white/10 text-ink-secondary">
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-drought-orange" aria-hidden="true" />
                <span className="text-drought-orange">QUERYING NASA POWER v2...</span>
              </>
            ) : (
              <>
                <Globe2
                  className={`w-3 h-3 ${
                    report.dataSourceTag === "LIVE_NASA_POWER_V2"
                      ? "text-nominal-green"
                      : "text-dipole-cyan"
                  }`}
                  aria-hidden="true"
                />
                <span>
                  {report.dataSourceTag === "LIVE_NASA_POWER_V2"
                    ? "LIVE NASA POWER V2"
                    : "CACHED NASA POWER V2"}
                </span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Monochrome SVG World Map Viewport */}
      <div className="relative w-full aspect-[2/1] bg-canvas-950 rounded-lg border border-white/10 overflow-hidden select-none">
        <svg
          ref={svgRef}
          role="img"
          aria-label={`Interactive global teleconnection map comparing ${report.regionA.name} and ${report.regionB.name}. Click anywhere to probe live NASA POWER coordinates.`}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          onClick={handleSvgClick}
          className="w-full h-full block cursor-crosshair"
        >
          <defs>
            <linearGradient id="dipoleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>

          {/* Graticule Grid (30° Longitude / Latitude) */}
          {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) => {
            const [gx] = projectLonLat(lon, 0);
            return (
              <line
                key={`lon-${lon}`}
                x1={gx}
                y1={0}
                x2={gx}
                y2={SVG_HEIGHT}
                stroke="rgba(255,255,255,0.045)"
                strokeWidth="1"
              />
            );
          })}
          {[-30, 0, 30, 60].map((lat) => {
            const [, gy] = projectLonLat(0, lat);
            return (
              <line
                key={`lat-${lat}`}
                x1={0}
                y1={gy}
                x2={SVG_WIDTH}
                y2={gy}
                stroke={lat === 0 ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.045)"}
                strokeWidth="1"
                strokeDasharray={lat === 0 ? "4 4" : undefined}
              />
            );
          })}

          {/* Monochrome Matte Graphite Landmasses */}
          <g fill="#1A1F29" stroke="#2B3342" strokeWidth="1">
            {worldPaths.map((d, idx) => (
              <path key={idx} d={d} />
            ))}
          </g>

          {/* Animated Teleconnection Dipole Arc */}
          <path
            d={`M ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${midX.toFixed(1)} ${ctrlY.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`}
            fill="none"
            stroke="url(#dipoleGradient)"
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.9"
          />

          {/* Region A Concentric Radar Target Ring (#F97316 Burnt Orange) */}
          <g transform={`translate(${ax}, ${ay})`}>
            <circle
              r="30"
              fill="rgba(249, 115, 22, 0.16)"
              stroke="#F97316"
              strokeWidth="1.25"
              strokeDasharray="3 3"
            />
            <circle r="13" fill="none" stroke="#F97316" strokeWidth="1.25" opacity="0.8" />
            <circle r="4.5" fill="#F97316" />
          </g>

          {/* Region B Concentric Radar Target Ring (#06B6D4 Telemetry Cyan) */}
          <g transform={`translate(${bx}, ${by})`}>
            <circle
              r="30"
              fill="rgba(6, 182, 212, 0.16)"
              stroke="#06B6D4"
              strokeWidth="1.25"
              strokeDasharray="3 3"
            />
            <circle r="13" fill="none" stroke="#06B6D4" strokeWidth="1.25" opacity="0.8" />
            <circle r="4.5" fill="#06B6D4" />
          </g>
        </svg>

        {/* Floating DMS Coordinate Callout Pills */}
        <div
          style={pillStyleA}
          className="pointer-events-none absolute max-w-[235px] truncate bg-canvas-900/95 border border-drought-orange/50 rounded-full px-2.5 py-0.5 font-mono text-[10px] text-ink-primary shadow-lg whitespace-nowrap flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-drought-orange shrink-0" aria-hidden="true" />
          <span className="truncate">
            A: {formatDMS(report.regionA.lat, report.regionA.lon)} ·{" "}
            {report.regionA.name.split(" (")[0]}
          </span>
        </div>

        <div
          style={pillStyleB}
          className="pointer-events-none absolute max-w-[235px] truncate bg-canvas-900/95 border border-dipole-cyan/50 rounded-full px-2.5 py-0.5 font-mono text-[10px] text-ink-primary shadow-lg whitespace-nowrap flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-dipole-cyan shrink-0" aria-hidden="true" />
          <span className="truncate">
            B: {formatDMS(report.regionB.lat, report.regionB.lon)} ·{" "}
            {report.regionB.name.split(" (")[0]}
          </span>
        </div>

        {/* Bottom-left Map Click Hint */}
        <div className="pointer-events-none absolute bottom-2 left-2.5 bg-canvas-950/85 border border-white/10 rounded px-2 py-0.5 text-[10px] text-ink-secondary flex items-center gap-1">
          <MapPin className="w-3 h-3 text-drought-orange shrink-0" aria-hidden="true" />
          <span>
            Click map to reposition{" "}
            <strong className="text-ink-primary">
              Region {activePinMode}
            </strong>{" "}
            via live NASA POWER API v2
          </span>
        </div>

        {/* Bottom-right Non-Overlapping Dipole Readout */}
        <div className="pointer-events-none absolute bottom-2 right-2.5 bg-canvas-950/95 border border-white/20 rounded px-2 py-0.5 font-mono tabular-nums text-[10px] text-ink-primary shadow">
          Dipole r = {report.dipoleCorrelationR.toFixed(2)} ·{" "}
          <span
            className={
              report.isOppositeDirection ? "text-drought-orange" : "text-dipole-cyan"
            }
          >
            {report.isOppositeDirection ? "OPPOSITE-SIGN" : "COUPLED"}
          </span>
        </div>
      </div>

      {/* Ocean Fallback / Latency Telemetry Notice */}
      {report.oceanFallbackNotice && (
        <div
          role="status"
          className="hud-well rounded-lg px-3 py-2 border border-radar-gold/40 text-xs text-radar-gold flex items-center gap-2"
        >
          <Waves className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{report.oceanFallbackNotice}</span>
        </div>
      )}
    </section>
  );
}
