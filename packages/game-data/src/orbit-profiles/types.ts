import { OrbitProfile } from '@orbital/contracts';

export type OrbitCategory = 'LEO' | 'SSO' | 'POLAR' | 'GEO';

export interface OrbitCoverageCharacteristics {
  groundTrackPattern: string;
  repeatCycleDays?: number;
  latitudinalCoverage: {
    minDeg: number;
    maxDeg: number;
  };
  revisitTimeHours: number;
  globalCoverage: boolean;
  polarCoverage: boolean;
  description: string;
}

export interface OrbitMissionSuitability {
  primaryApplications: string[];
  recommendedMissionTypes: string[];
  targetScenarios: string[];
  suitableForEarthSentinel: boolean;
  suitabilityDescription: string;
}

export interface OrbitConfigurationRestrictions {
  minBatteryEnduranceMin: number;
  minDeltaVMps: number;
  recommendedInstrumentTypes: string[];
  thermalNotes: string;
  radiationProtectionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  specialRequirements: string[];
}

export interface OrbitVisualizationParameters {
  orbitRadiusReference: number;
  inclinationDeg: number;
  orbitColor: string;
  orbitPathVisibility: boolean;
  spacecraftAnimationSpeed: number;
  referencePlane: 'EQUATORIAL' | 'ECLIPTIC';
  visualizationScale: number;
  lineWidth?: number;
  dashPattern?: number[];
  glowIntensity?: number;
}

export interface OrbitEducationalAssumptions {
  modelType: 'SIMPLIFIED_CIRCULAR' | 'SIMPLIFIED_KEPLERIAN' | 'PREDEFINED_GEOMETRY';
  notes: string[];
  fidelityDisclaimer: string;
}

/**
 * DetailedOrbitProfile extends the shared OrbitProfile contract from @orbital/contracts.
 * It provides rich engineering data, mission suitability mapping, configuration restrictions,
 * educational assumptions, and Three.js visualization parameters.
 */
export interface DetailedOrbitProfile extends OrbitProfile {
  category: OrbitCategory;
  coverageCharacteristics: OrbitCoverageCharacteristics;
  missionSuitability: OrbitMissionSuitability;
  advantages: string[];
  disadvantages: string[];
  configurationRestrictions: OrbitConfigurationRestrictions;
  visualizationParameters: OrbitVisualizationParameters;
  educationalAssumptions: OrbitEducationalAssumptions;
  aliases?: string[];
}
