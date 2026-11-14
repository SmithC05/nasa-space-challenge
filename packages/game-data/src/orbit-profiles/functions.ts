import { MissionScenario } from '@orbital/contracts';
import { DetailedOrbitProfile, OrbitCategory } from './types';
import { ORBIT_PROFILES_CATALOG } from './catalog';

/**
 * Returns all validated orbital profiles in the catalog.
 */
export function getAllOrbitProfiles(): DetailedOrbitProfile[] {
  return [...ORBIT_PROFILES_CATALOG];
}

/**
 * Looks up an orbital profile by ID or alias.
 * Returns undefined if no profile matches.
 */
export function getOrbitProfileById(id: string): DetailedOrbitProfile | undefined {
  if (!id || typeof id !== 'string') return undefined;

  const normalized = id.trim().toLowerCase();
  return ORBIT_PROFILES_CATALOG.find(
    (profile) =>
      profile.id.toLowerCase() === normalized ||
      profile.aliases?.some((alias) => alias.toLowerCase() === normalized)
  );
}

/**
 * Filters orbital profiles by mission suitability or mission type.
 * Matches against recommended mission types, primary applications, or target scenarios.
 */
export function getOrbitProfilesByMissionSuitability(missionType: string): DetailedOrbitProfile[] {
  if (!missionType || typeof missionType !== 'string') return [];

  const query = missionType.trim().toLowerCase();

  return ORBIT_PROFILES_CATALOG.filter((profile) => {
    // Check if query matches Earth Sentinel specifically
    if (
      query.includes('earth sentinel') ||
      query.includes('sentinel') ||
      query.includes('ops-2601')
    ) {
      return profile.missionSuitability.suitableForEarthSentinel;
    }

    // Match recommended mission types
    const matchRecommended = profile.missionSuitability.recommendedMissionTypes.some((type) =>
      type.toLowerCase().includes(query)
    );
    if (matchRecommended) return true;

    // Match primary applications
    const matchApp = profile.missionSuitability.primaryApplications.some((app) =>
      app.toLowerCase().includes(query)
    );
    if (matchApp) return true;

    // Match target scenarios
    const matchScenario = profile.missionSuitability.targetScenarios.some((s) =>
      s.toLowerCase().includes(query)
    );
    if (matchScenario) return true;

    return false;
  });
}

/**
 * Filters orbital profiles by category or type (e.g. 'LEO', 'SSO', 'POLAR', 'GEO').
 * Case-insensitive comparison.
 */
export function getOrbitProfilesByCategory(category: OrbitCategory | string): DetailedOrbitProfile[] {
  if (!category || typeof category !== 'string') return [];

  const query = category.trim().toUpperCase();

  return ORBIT_PROFILES_CATALOG.filter(
    (profile) =>
      profile.category.toUpperCase() === query ||
      profile.type.toUpperCase() === query
  );
}

/**
 * Checks whether an orbital profile with the specified ID exists in the catalog.
 */
export function isOrbitProfileAvailable(profileId: string): boolean {
  return getOrbitProfileById(profileId) !== undefined;
}

/**
 * Returns recommended orbital profiles for a given mission scenario or scenario identifier.
 * Analyzes scenario targetBody, targetOrbitType, and scenario id to rank profiles appropriately.
 *
 * For the Earth Sentinel campaign:
 * Highlights Sun-Synchronous Orbit (SSO) as prime and Low Earth Orbit (LEO) / Polar as viable,
 * while excluding Geostationary Orbit (GEO).
 */
export function getRecommendedOrbitProfiles(
  missionScenario: MissionScenario | string
): DetailedOrbitProfile[] {
  if (!missionScenario) return [];

  const scenarioId = typeof missionScenario === 'string' ? missionScenario : missionScenario.id;
  const targetOrbitType =
    typeof missionScenario === 'object' && missionScenario.targetOrbitType
      ? missionScenario.targetOrbitType
      : typeof missionScenario === 'string'
        ? missionScenario.toUpperCase()
        : undefined;

  // Earth Sentinel Campaign logic
  if (
    scenarioId === 'scenario-earth-sentinel' ||
    scenarioId.toLowerCase().includes('sentinel') ||
    targetOrbitType === 'SSO'
  ) {
    // SSO is prime candidate; LEO and Polar are suitable candidates; GEO is excluded
    return ORBIT_PROFILES_CATALOG.filter(
      (profile) => profile.missionSuitability.suitableForEarthSentinel
    ).sort((a, b) => {
      // Prioritize SSO first for Earth Sentinel
      if (a.category === 'SSO') return -1;
      if (b.category === 'SSO') return 1;
      // Then LEO/Polar
      return 0;
    });
  }

  // If a specific target orbit type was provided (e.g. GEO, LEO)
  if (targetOrbitType) {
    const matching = getOrbitProfilesByCategory(targetOrbitType);
    if (matching.length > 0) {
      return matching;
    }
  }

  // Fallback: match by scenario ID or target scenario field
  const scenarioMatches = ORBIT_PROFILES_CATALOG.filter((profile) =>
    profile.missionSuitability.targetScenarios.some((s) => s.toLowerCase() === scenarioId.toLowerCase())
  );

  return scenarioMatches.length > 0 ? scenarioMatches : getAllOrbitProfiles();
}
