import type {
  EcosystemType,
  NasaVariableCode,
  NasaVariableMeta,
  SymptomId,
  SymptomPreset,
} from "@/types/climate";

export const NASA_VARIABLES: Record<NasaVariableCode, NasaVariableMeta> = {
  ALLSKY_SFC_SW_DWN: {
    code: "ALLSKY_SFC_SW_DWN",
    label: "All-Sky Surface Shortwave Downward Irradiance",
    shortLabel: "Solar Irradiance",
    unit: "MJ/m²/day",
    physicalRole: "Energy Driver",
    studentDefinition:
      "Total solar energy reaching the ground. When cloud cover drops during El Niño or positive IOD phases, extra sunlight rapidly heats soil and increases evaporation demand.",
    nasaInstrumentHeritage: "NASA CERES / MERRA-2 Radiation Assimilation",
  },
  GWETROOT: {
    code: "GWETROOT",
    label: "Root-Zone Soil Wetness (0–100 cm)",
    shortLabel: "Root Soil Wetness",
    unit: "fraction (0–1)",
    physicalRole: "Silent Stress Indicator",
    studentDefinition:
      "Moisture stored in the top 1 meter of soil where crops and peatland roots drink. It often declines months before rainfall charts reveal an agricultural drought.",
    nasaInstrumentHeritage: "NASA GLDAS / MERRA-2 Land Surface Model",
  },
  TS: {
    code: "TS",
    label: "Earth Skin Surface Temperature",
    shortLabel: "Skin Temperature",
    unit: "°C",
    physicalRole: "Thermal Feedback",
    studentDefinition:
      "Temperature of the Earth's topmost land or sea skin. As soil dries out, evaporative cooling collapses and surface skin heats up much faster than ambient air.",
    nasaInstrumentHeritage: "NASA MODIS / AIRS / MERRA-2 Thermal Skin",
  },
  PRECTOTCORR: {
    code: "PRECTOTCORR",
    label: "Bias-Corrected Total Precipitation",
    shortLabel: "Precipitation",
    unit: "mm/day",
    physicalRole: "Hydrological Output",
    studentDefinition:
      "Satellite-calibrated daily rainfall rate. Paired opposite-sign trends in precipitation confirm large-scale atmospheric teleconnections like IOD and ENSO.",
    nasaInstrumentHeritage: "NASA GPM IMERG / MERRA-2 Bias-Corrected",
  },
  T2M: {
    code: "T2M",
    label: "Air Temperature at 2 Meters",
    shortLabel: "Air Temp (2m)",
    unit: "°C",
    physicalRole: "Cross-Validation",
    studentDefinition:
      "Standard weather-station height air temperature used to benchmark regional warming rates against the official NASA GISTEMP v4 global surface record.",
    nasaInstrumentHeritage: "NASA MERRA-2 / GISTEMP v4 Reference",
  },
};

export const SYMPTOM_PRESETS: Record<SymptomId, SymptomPreset> = {
  coastal_drought: {
    id: "coastal_drought",
    label: "Coastal & Agricultural Drought",
    shortLabel: "Coastal Drought",
    description:
      "Detects paired rainfall deficit and root-zone drying driven by Indian Ocean Dipole (IOD) & ENSO seesaws.",
    defaultEcosystem: "maritime_tropics",
    primaryVariable: "PRECTOTCORR",
    mappedVariables: ["ALLSKY_SFC_SW_DWN", "GWETROOT", "TS", "PRECTOTCORR"],
  },
  peatland_drying: {
    id: "peatland_drying",
    label: "Peatland Fire & Silent Soil Drying",
    shortLabel: "Peatland Drying",
    description:
      "Prioritizes sub-surface GWETROOT depletion occurring months before total precipitation drops significantly.",
    defaultEcosystem: "tropical_peatland",
    primaryVariable: "GWETROOT",
    mappedVariables: ["ALLSKY_SFC_SW_DWN", "GWETROOT", "TS", "PRECTOTCORR"],
  },
  extreme_flood_dipole: {
    id: "extreme_flood_dipole",
    label: "Extreme Rainfall & Flood Dipole",
    shortLabel: "Flood Dipole",
    description:
      "Isolates inverse precipitation surges across coupled ocean-atmosphere basins.",
    defaultEcosystem: "coastal_delta",
    primaryVariable: "PRECTOTCORR",
    mappedVariables: ["PRECTOTCORR", "GWETROOT", "TS", "ALLSKY_SFC_SW_DWN"],
  },
  custom_exploration: {
    id: "custom_exploration",
    label: "Custom Multi-Variable Exploration",
    shortLabel: "Custom",
    description:
      "Open surface thermal and hydrological telemetry for arbitrary user-clicked coordinates worldwide.",
    defaultEcosystem: "semi_arid_basin",
    primaryVariable: "TS",
    mappedVariables: ["ALLSKY_SFC_SW_DWN", "GWETROOT", "TS", "PRECTOTCORR"],
  },
};

export const ECOSYSTEM_OPTIONS: Array<{ id: EcosystemType; label: string }> = [
  { id: "maritime_tropics", label: "Maritime Tropics" },
  { id: "tropical_peatland", label: "Tropical Peatland" },
  { id: "semi_arid_basin", label: "Semi-Arid Basin" },
  { id: "coastal_delta", label: "Coastal Delta" },
];

export const WINDOW_OPTIONS: Array<{
  id: string;
  label: string;
  startYear: number;
  endYear: number;
}> = [
  { id: "40Y", label: "40Y (1985–2025)", startYear: 1985, endYear: 2025 },
  { id: "30Y", label: "30Y (1995–2025)", startYear: 1995, endYear: 2025 },
  { id: "20Y", label: "20Y (2005–2025)", startYear: 2005, endYear: 2025 },
];

export const NASA_CHALLENGE_RESOURCES = [
  { name: "NASA POWER API v2 (MERRA-2 / CERES / GPM)", url: "https://power.larc.nasa.gov/" },
  { name: "NASA GISTEMP v4 Surface Temperature", url: "https://data.giss.nasa.gov/gistemp/" },
  { name: "NASA Giovanni Time-Series Explorer", url: "https://giovanni.gsfc.nasa.gov/" },
  { name: "NASA AppEEARS & GES DISC Hydrology", url: "https://appeears.earthdatacloud.nasa.gov/" },
  { name: "NASA / CNES / CSA SWOT Water Mission", url: "https://www.asc-csa.gc.ca/eng/satellites/swot/" },
  { name: "KNMI Climate Explorer & NOAA CDO", url: "https://climexp.knmi.nl/" },
];
