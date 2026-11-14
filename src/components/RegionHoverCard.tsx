"use client";

import { useEffect, useRef, useState } from "react";
import { Compass, Globe2 } from "lucide-react";
import { resolveCoordinatePlace, type ResolvedPlace } from "@/lib/geoResolver";
import { formatDMS } from "@/lib/nasaPowerClient";

export interface GlobeHoverTarget {
  x: number;
  y: number;
  lat: number;
  lon: number;
  countryName: string | null;
  isTouchPinned?: boolean;
}

interface RegionHoverCardProps {
  target: GlobeHoverTarget | null;
  containerSize: { width: number; height: number };
}

const CARD_EST_WIDTH = 284;
const CARD_EST_HEIGHT = 114;
const DEBOUNCE_MS = 400;

/** Floating glassmorphism hover card showing country boundary, coordinates, and debounced place name. */
export default function RegionHoverCard({
  target,
  containerSize,
}: RegionHoverCardProps) {
  const [resolved, setResolved] = useState<{
    key: string;
    place: ResolvedPlace;
  } | null>(null);
  const seqRef = useRef(0);

  const quantLat = target ? Math.round(target.lat * 4) / 4 : 0;
  const quantLon = target ? Math.round(target.lon * 4) / 4 : 0;
  const lookupKey = target
    ? `${quantLat.toFixed(2)},${quantLon.toFixed(2)},${target.countryName ?? "ocean"}`
    : null;

  useEffect(() => {
    if (!target || !lookupKey) {
      seqRef.current += 1;
      return;
    }

    const activeSeq = ++seqRef.current;
    const reqLat = target.lat;
    const reqLon = target.lon;
    const reqKey = lookupKey;

    const timer = window.setTimeout(() => {
      void resolveCoordinatePlace(reqLat, reqLon).then((place) => {
        if (seqRef.current !== activeSeq) return;
        setResolved({ key: reqKey, place });
      });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [lookupKey, target]);

  if (!target || containerSize.width <= 0 || containerSize.height <= 0) {
    return null;
  }

  const placeInfo = resolved?.key === lookupKey ? resolved.place : null;
  const isResolving = !placeInfo;

  // Auto-flip away from right/bottom viewport edges so the card stays inside bounds.
  const placeRight = target.x + 18 + CARD_EST_WIDTH <= containerSize.width - 12;
  const left = placeRight
    ? Math.max(12, target.x + 18)
    : Math.max(12, target.x - CARD_EST_WIDTH - 14);

  const placeBelow = target.y + 18 + CARD_EST_HEIGHT <= containerSize.height - 12;
  const top = placeBelow
    ? Math.max(12, target.y + 18)
    : Math.max(12, target.y - CARD_EST_HEIGHT - 14);

  const isLand = Boolean(target.countryName);
  const headingText = target.countryName ?? "Open Ocean Basin";
  const resolvedLabel = placeInfo
    ? placeInfo.country && placeInfo.country !== headingText
      ? placeInfo.name === headingText
        ? placeInfo.country
        : `${placeInfo.name} · ${placeInfo.country}`
      : placeInfo.name
    : "";

  return (
    <div
      role="status"
      aria-live="polite"
      style={{ left: `${left}px`, top: `${top}px` }}
      className="glass-panel pointer-events-none absolute z-30 w-[280px] max-w-[calc(100%-24px)] rounded-xl px-3.5 py-2.5 text-left select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden="true"
            className={`w-2 h-2 rounded-full shrink-0 ${
              isLand ? "bg-drought-orange" : "bg-dipole-cyan"
            }`}
          />
          <p className="font-sans text-xs font-semibold text-ink-primary truncate">
            {headingText}
          </p>
        </div>
        <span className="font-mono text-[10px] tabular-nums text-ink-secondary shrink-0">
          {formatDMS(target.lat, target.lon)}
        </span>
      </div>

      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ink-secondary min-h-[18px]">
        {isLand ? (
          <Compass className="w-3 h-3 text-drought-orange shrink-0" aria-hidden="true" />
        ) : (
          <Globe2 className="w-3 h-3 text-dipole-cyan shrink-0" aria-hidden="true" />
        )}
        <span
          className={`truncate ${
            isResolving ? "text-ink-muted animate-pulse motion-reduce:animate-none" : ""
          }`}
        >
          {isResolving ? "Resolving city / regional grid…" : resolvedLabel}
        </span>
      </div>

      <p className="mt-1.5 border-t border-white/10 pt-1.5 font-mono text-[9.5px] leading-snug text-ink-muted">
        Boundaries: Natural Earth · Place: BigDataCloud · Climate: NASA POWER v2 (click to probe)
      </p>
    </div>
  );
}
