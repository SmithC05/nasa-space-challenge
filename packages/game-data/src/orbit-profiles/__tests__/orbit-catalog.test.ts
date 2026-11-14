import { describe, expect, it } from 'vitest';
import {
  getAllOrbitProfiles,
  getOrbitProfileById,
  getOrbitProfilesByCategory,
  getOrbitProfilesByMissionSuitability,
  getRecommendedOrbitProfiles,
  isOrbitProfileAvailable,
  ORBIT_PROFILES,
  ORBIT_PROFILES_CATALOG,
  RAW_ORBIT_PROFILES,
  validateOrbitCatalog,
  validateOrbitProfile,
  DetailedOrbitProfileSchema
} from '../index';
import { MISSION_SCENARIOS } from '../../index';

describe('ORBITAL Orbit Catalog & Shared Data (Phase 1)', () => {
  // 1. All four orbital profiles load.
  it('loads all four orbital profiles', () => {
    const profiles = getAllOrbitProfiles();
    expect(profiles).toHaveLength(4);

    const categories = profiles.map((p) => p.category);
    expect(categories).toContain('LEO');
    expect(categories).toContain('SSO');
    expect(categories).toContain('POLAR');
    expect(categories).toContain('GEO');
  });

  // 2. Every profile has a unique ID.
  it('guarantees every profile has a unique ID', () => {
    const profiles = getAllOrbitProfiles();
    const ids = profiles.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(profiles.length);

    // Also verify aliases do not collide
    const allIdentifiers = new Set<string>();
    for (const profile of profiles) {
      expect(allIdentifiers.has(profile.id)).toBe(false);
      allIdentifiers.add(profile.id);
      if (profile.aliases) {
        for (const alias of profile.aliases) {
          expect(allIdentifiers.has(alias)).toBe(false);
          allIdentifiers.add(alias);
        }
      }
    }
  });

  // 3. Profile lookup works.
  it('looks up orbit profiles by ID and alias successfully', () => {
    // Primary ID lookup
    const leo = getOrbitProfileById('orbit-leo');
    expect(leo).toBeDefined();
    expect(leo?.name).toBe('Low Earth Orbit (LEO)');
    expect(leo?.category).toBe('LEO');

    const sso = getOrbitProfileById('orbit-sso');
    expect(sso).toBeDefined();
    expect(sso?.name).toBe('Sun-Synchronous Polar Orbit (SSO)');
    expect(sso?.category).toBe('SSO');

    const polar = getOrbitProfileById('orbit-polar');
    expect(polar).toBeDefined();
    expect(polar?.name).toBe('Polar Orbit');
    expect(polar?.category).toBe('POLAR');

    const geo = getOrbitProfileById('orbit-geo');
    expect(geo).toBeDefined();
    expect(geo?.name).toBe('Geostationary Orbit (GEO)');
    expect(geo?.category).toBe('GEO');

    // Case-insensitive lookup
    expect(getOrbitProfileById('ORBIT-LEO')).toBeDefined();
    expect(getOrbitProfileById('Orbit-Sso')).toBeDefined();

    // Legacy alias lookup
    const legacyLeo = getOrbitProfileById('orbit-leo-iss');
    expect(legacyLeo).toBeDefined();
    expect(legacyLeo?.id).toBe('orbit-leo');

    const legacySso = getOrbitProfileById('orbit-sso-polar');
    expect(legacySso).toBeDefined();
    expect(legacySso?.id).toBe('orbit-sso');
  });

  // 4. Invalid profile IDs are handled correctly.
  it('handles invalid profile IDs correctly without throwing', () => {
    expect(getOrbitProfileById('non-existent-orbit')).toBeUndefined();
    expect(getOrbitProfileById('')).toBeUndefined();
    expect(getOrbitProfileById(null as unknown as string)).toBeUndefined();
    expect(getOrbitProfileById(undefined as unknown as string)).toBeUndefined();
    expect(isOrbitProfileAvailable('orbit-imaginary')).toBe(false);
    expect(isOrbitProfileAvailable('orbit-leo')).toBe(true);
    expect(isOrbitProfileAvailable('orbit-leo-iss')).toBe(true);
  });

  // 5. Altitude values are valid.
  it('has valid, positive altitude values where perigee <= apogee', () => {
    const profiles = getAllOrbitProfiles();
    for (const profile of profiles) {
      expect(profile.perigeeKm).toBeGreaterThan(0);
      expect(profile.apogeeKm).toBeGreaterThan(0);
      expect(profile.perigeeKm).toBeLessThanOrEqual(profile.apogeeKm);
    }

    // Check specific documented characteristics
    const leo = getOrbitProfileById('orbit-leo')!;
    expect(leo.perigeeKm).toBeGreaterThanOrEqual(160); // Above Karman/atmospheric cutoff
    expect(leo.apogeeKm).toBeLessThanOrEqual(2000);

    const geo = getOrbitProfileById('orbit-geo')!;
    expect(geo.perigeeKm).toBe(35786);
    expect(geo.apogeeKm).toBe(35786);
  });

  // 6. Inclination values are valid.
  it('has valid inclination values between 0 and 180 degrees', () => {
    const profiles = getAllOrbitProfiles();
    for (const profile of profiles) {
      expect(profile.inclinationDeg).toBeGreaterThanOrEqual(0);
      expect(profile.inclinationDeg).toBeLessThanOrEqual(180);
    }

    const geo = getOrbitProfileById('orbit-geo')!;
    expect(geo.inclinationDeg).toBe(0.0); // Equatorial

    const polar = getOrbitProfileById('orbit-polar')!;
    expect(polar.inclinationDeg).toBe(90.0); // True polar

    const sso = getOrbitProfileById('orbit-sso')!;
    expect(sso.inclinationDeg).toBeCloseTo(98.2, 1); // Retrograde near-polar
  });

  // 7. Orbital periods are positive.
  it('has positive orbital periods that match approximate orbital mechanics', () => {
    const profiles = getAllOrbitProfiles();
    for (const profile of profiles) {
      expect(profile.orbitalPeriodMin).toBeGreaterThan(0);
    }

    // LEO is roughly 90 - 100 minutes
    const leo = getOrbitProfileById('orbit-leo')!;
    expect(leo.orbitalPeriodMin).toBeGreaterThan(90);
    expect(leo.orbitalPeriodMin).toBeLessThan(100);

    // SSO is roughly 95 - 105 minutes
    const sso = getOrbitProfileById('orbit-sso')!;
    expect(sso.orbitalPeriodMin).toBeGreaterThan(95);
    expect(sso.orbitalPeriodMin).toBeLessThan(105);

    // Polar is roughly 95 - 105 minutes
    const polar = getOrbitProfileById('orbit-polar')!;
    expect(polar.orbitalPeriodMin).toBeGreaterThan(95);
    expect(polar.orbitalPeriodMin).toBeLessThan(105);

    // GEO is approximately 24 hours (1436.1 minutes sidereal day)
    const geo = getOrbitProfileById('orbit-geo')!;
    expect(geo.orbitalPeriodMin).toBeCloseTo(1436.1, 0);
  });

  // 8. Mission suitability filtering works.
  it('filters orbit profiles by mission suitability and categories', () => {
    // Category filtering
    const leoProfiles = getOrbitProfilesByCategory('LEO');
    expect(leoProfiles.length).toBeGreaterThanOrEqual(1);
    expect(leoProfiles.some((p) => p.id === 'orbit-leo')).toBe(true);

    const ssoProfiles = getOrbitProfilesByCategory('SSO');
    expect(ssoProfiles).toHaveLength(1);
    expect(ssoProfiles[0].id === 'orbit-sso').toBe(true);

    const polarProfiles = getOrbitProfilesByCategory('POLAR');
    expect(polarProfiles).toHaveLength(1);
    expect(polarProfiles[0].id === 'orbit-polar').toBe(true);

    const geoProfiles = getOrbitProfilesByCategory('GEO');
    expect(geoProfiles).toHaveLength(1);
    expect(geoProfiles[0].id === 'orbit-geo').toBe(true);

    // Mission type suitability filtering
    const climateProfiles = getOrbitProfilesByMissionSuitability('Climate & Cryosphere');
    expect(climateProfiles.length).toBeGreaterThanOrEqual(2);
    expect(climateProfiles.some((p) => p.id === 'orbit-sso')).toBe(true);

    const commsProfiles = getOrbitProfilesByMissionSuitability('Communications Relay');
    expect(commsProfiles.some((p) => p.id === 'orbit-geo')).toBe(true);
    expect(commsProfiles.some((p) => p.id === 'orbit-polar')).toBe(false);

    // Empty or non-matching query returns empty array
    expect(getOrbitProfilesByMissionSuitability('NonExistentType')).toEqual([]);
    expect(getOrbitProfilesByCategory('INVALID_CAT')).toEqual([]);
  });

  // 9. LEO and SSO are represented as suitable initial Earth Sentinel candidates.
  it('represents LEO and SSO as suitable initial candidates for the Earth Sentinel campaign', () => {
    const sentinelProfiles = getOrbitProfilesByMissionSuitability('Earth Sentinel');
    const ids = sentinelProfiles.map((p) => p.id);

    // Both LEO and SSO must be included as suitable
    expect(ids).toContain('orbit-leo');
    expect(ids).toContain('orbit-sso');

    // GEO must NOT be included as suitable for Earth Sentinel
    expect(ids).not.toContain('orbit-geo');

    const leo = getOrbitProfileById('orbit-leo')!;
    const sso = getOrbitProfileById('orbit-sso')!;
    const geo = getOrbitProfileById('orbit-geo')!;

    expect(leo.missionSuitability.suitableForEarthSentinel).toBe(true);
    expect(sso.missionSuitability.suitableForEarthSentinel).toBe(true);
    expect(geo.missionSuitability.suitableForEarthSentinel).toBe(false);

    // Check recommendations function
    const earthSentinelScenario = MISSION_SCENARIOS.find((s) => s.id === 'scenario-earth-sentinel')!;
    const recommendations = getRecommendedOrbitProfiles(earthSentinelScenario);

    // SSO should be ranked first as the prime candidate
    expect(recommendations[0].id).toBe('orbit-sso');
    expect(recommendations.map((r) => r.id)).toContain('orbit-leo');
    expect(recommendations.map((r) => r.id)).not.toContain('orbit-geo');
  });

  // 10. Invalid orbital data fails validation.
  it('fails validation on invalid orbital data with understandable errors', () => {
    // Missing required fields
    expect(() => validateOrbitProfile({})).toThrow(/Orbit profile validation failed/);

    // Negative altitude
    const invalidAlt = {
      ...RAW_ORBIT_PROFILES[0],
      perigeeKm: -100
    };
    expect(() => validateOrbitProfile(invalidAlt)).toThrow(/positive/);

    // Invalid inclination (> 180)
    const invalidInc = {
      ...RAW_ORBIT_PROFILES[0],
      inclinationDeg: 210
    };
    expect(() => validateOrbitProfile(invalidInc)).toThrow(/between 0 and 180/);

    // Negative orbital period
    const invalidPeriod = {
      ...RAW_ORBIT_PROFILES[0],
      orbitalPeriodMin: -50
    };
    expect(() => validateOrbitProfile(invalidPeriod)).toThrow(/positive/);

    // Invalid color format
    const invalidColor = {
      ...RAW_ORBIT_PROFILES[0],
      visualizationParameters: {
        ...RAW_ORBIT_PROFILES[0].visualizationParameters,
        orbitColor: 'not-a-hex-color'
      }
    };
    expect(() => validateOrbitProfile(invalidColor)).toThrow(/valid hex/);

    // Duplicate IDs in catalog
    const duplicateCatalog = [
      RAW_ORBIT_PROFILES[0],
      { ...RAW_ORBIT_PROFILES[1], id: RAW_ORBIT_PROFILES[0].id }
    ];
    expect(() => validateOrbitCatalog(duplicateCatalog)).toThrow(/Duplicate profile ID detected/);
  });

  // 11. Visualization parameters exist for every profile.
  it('guarantees visualization parameters exist and are well-formed for every profile', () => {
    const profiles = getAllOrbitProfiles();
    for (const profile of profiles) {
      const vis = profile.visualizationParameters;
      expect(vis).toBeDefined();
      expect(vis.orbitRadiusReference).toBeGreaterThan(0);
      expect(vis.inclinationDeg).toBeGreaterThanOrEqual(0);
      expect(vis.inclinationDeg).toBeLessThanOrEqual(180);
      expect(vis.orbitColor).toMatch(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
      expect(typeof vis.orbitPathVisibility).toBe('boolean');
      expect(vis.spacecraftAnimationSpeed).toBeGreaterThan(0);
      expect(['EQUATORIAL', 'ECLIPTIC']).toContain(vis.referencePlane);
      expect(vis.visualizationScale).toBeGreaterThan(0);
    }
  });

  // 12. Catalog exports work correctly.
  it('correctly exports the catalog and utility functions through packages/game-data', () => {
    expect(ORBIT_PROFILES_CATALOG).toBeDefined();
    expect(ORBIT_PROFILES_CATALOG).toHaveLength(4);
    expect(ORBIT_PROFILES).toBeDefined();
    expect(ORBIT_PROFILES).toBe(ORBIT_PROFILES_CATALOG);
    expect(typeof getAllOrbitProfiles).toBe('function');
    expect(typeof getOrbitProfileById).toBe('function');
    expect(typeof getOrbitProfilesByMissionSuitability).toBe('function');
    expect(typeof getOrbitProfilesByCategory).toBe('function');
    expect(typeof isOrbitProfileAvailable).toBe('function');
    expect(typeof getRecommendedOrbitProfiles).toBe('function');
    expect(typeof validateOrbitProfile).toBe('function');
    expect(typeof validateOrbitCatalog).toBe('function');
    expect(DetailedOrbitProfileSchema).toBeDefined();
  });
});
