"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { formatDMS } from "@/lib/nasaPowerClient";

export interface GeocodedPlace {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  label: string;
}

interface LocationSearchProps {
  activePinMode: "A" | "B";
  onSelectLocation: (
    location: { name: string; country: string; lat: number; lon: number },
    targetPin: "A" | "B"
  ) => void;
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-drought-orange";

export default function LocationSearch({
  activePinMode,
  onSelectLocation,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodedPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/places?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = (await res.json()) as { results?: GeocodedPlace[] };
        setResults(data.results ?? []);
        setIsOpen((data.results?.length ?? 0) > 0);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedIndex(-1);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (val.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      void fetchResults(val);
    }, 280);
  };

  const handleSelect = (place: GeocodedPlace, pin: "A" | "B") => {
    onSelectLocation(
      {
        name: place.label,
        country: place.country,
        lat: place.latitude,
        lon: place.longitude,
      },
      pin
    );
    setIsOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex], activePinMode);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (evt: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(evt.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full space-y-1">
      <div className="flex items-center justify-between">
        <label
          htmlFor="location-search-input"
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted flex items-center gap-1.5"
        >
          <MapPin className="w-3 h-3 text-drought-orange" aria-hidden="true" />
          <span>Global Teleconnection Search</span>
        </label>
        <span className="font-mono text-[9px] text-ink-muted">
          Active: <strong className={activePinMode === "A" ? "text-drought-orange" : "text-dipole-cyan"}>Pin {activePinMode}</strong>
        </span>
      </div>

      <div className="relative">
        <input
          id="location-search-input"
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search biome or city (e.g. Surabaya, Turkana, Nairobi, Lima)..."
          aria-label="Search global location or city"
          aria-expanded={isOpen}
          aria-controls="location-search-listbox"
          aria-autocomplete="list"
          role="combobox"
          className={`w-full h-8 pl-8 pr-7 rounded-lg text-[11px] font-sans bg-canvas-900 border border-panel-700 text-ink-primary placeholder:text-ink-muted/70 transition ${focusRing}`}
        />
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted pointer-events-none"
          aria-hidden="true"
        />
        {loading ? (
          <Loader2
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-drought-orange animate-spin pointer-events-none"
            aria-hidden="true"
          />
        ) : query.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            aria-label="Clear location search"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-ink-muted hover:text-ink-primary rounded"
          >
            <X className="w-3 h-3" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {isOpen && results.length > 0 && (
        <div
          id="location-search-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 z-50 max-h-56 overflow-y-auto glass-panel glass-scroll rounded-lg border border-panel-700 p-1 shadow-2xl bg-canvas-950/95 backdrop-blur-md"
        >
          {results.map((place, idx) => {
            const isHighlighted = idx === selectedIndex;
            return (
              <div
                key={`${place.id}-${idx}`}
                role="option"
                aria-selected={isHighlighted}
                className={`p-2 rounded-md flex items-center justify-between gap-2 text-left transition ${
                  isHighlighted ? "bg-white/10" : "hover:bg-white/[0.05]"
                }`}
              >
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => handleSelect(place, activePinMode)}
                >
                  <div className="text-[11px] font-medium text-ink-primary truncate">
                    {place.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-ink-secondary">
                    <span className="truncate">{place.country}</span>
                    <span>•</span>
                    <span className="text-ink-muted tabular-nums">
                      {formatDMS(place.latitude, place.longitude)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(place, "A");
                    }}
                    title="Assign to Region A (Drying/Telemetry Probe)"
                    className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-drought-orange/20 text-drought-orange border border-drought-orange/40 hover:bg-drought-orange/30 transition cursor-pointer"
                  >
                    Set A
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(place, "B");
                    }}
                    title="Assign to Region B (Dipole Counterpart Probe)"
                    className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-dipole-cyan/20 text-dipole-cyan border border-dipole-cyan/40 hover:bg-dipole-cyan/30 transition cursor-pointer"
                  >
                    Set B
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

