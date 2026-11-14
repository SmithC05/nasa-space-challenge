import { OrbitProfile } from '@orbital/contracts';

export interface OrbitVisualSettings {
  showOrbitPath: boolean;
  showSpacecraft: boolean;
  isSpacecraftAnimating: boolean;
  spacecraftSpeedMultiplier: number;
  showEquatorialPlane: boolean;
  showEarthEquator: boolean;
  comparisonMode: boolean; // Compare all 4 orbit profiles
}

export const DEFAULT_ORBIT_VISUAL_SETTINGS: OrbitVisualSettings = {
  showOrbitPath: true,
  showSpacecraft: true,
  isSpacecraftAnimating: true,
  spacecraftSpeedMultiplier: 1.0,
  showEquatorialPlane: false,
  showEarthEquator: true,
  comparisonMode: false
};

export type OrbitPaletteCategory = 'LEO' | 'SSO' | 'POLAR' | 'GEO';

export const ORBIT_COLORS: Record<string, string> = {
  LEO: '#06b6d4',   // Cyan
  SSO: '#10b981',   // Emerald / Green (matches Phase 1 catalog)
  POLAR: '#8b5cf6', // Violet / Purple (matches Phase 1 catalog)
  GEO: '#f59e0b',   // Amber / Gold (matches Phase 1 catalog)
  DEFAULT: '#38bdf8'
};

/**
 * Returns canonical display category for an orbit profile ('LEO' | 'SSO' | 'POLAR' | 'GEO')
 */
export function getOrbitDisplayCategory(orbit: OrbitProfile): string {
  if (!orbit) return 'ORBIT';
  if ((orbit as any).category) return (orbit as any).category;
  if (orbit.id === 'orbit-polar' || orbit.name.toLowerCase().includes('polar')) return 'POLAR';
  return orbit.type;
}

/**
 * Returns canonical display name for an orbit profile, ensuring Polar Orbit is labeled correctly.
 */
export function getOrbitDisplayName(orbit: OrbitProfile): string {
  if (!orbit) return 'Orbit';
  if (orbit.id === 'orbit-polar') return 'Polar Orbit';
  return orbit.name;
}

export function getOrbitColor(typeOrCategory: string): string {
  if (!typeOrCategory) return ORBIT_COLORS.DEFAULT;
  const key = typeOrCategory.toUpperCase();
  return ORBIT_COLORS[key] || ORBIT_COLORS.DEFAULT;
}

export function getOrbitColorForProfile(orbit: OrbitProfile): string {
  if (!orbit) return ORBIT_COLORS.DEFAULT;
  return getOrbitColor(getOrbitDisplayCategory(orbit));
}
