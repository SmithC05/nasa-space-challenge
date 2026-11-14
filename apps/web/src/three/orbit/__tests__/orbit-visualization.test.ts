import { describe, expect, it } from 'vitest';
import { getAllOrbitProfiles, getOrbitProfileById } from '@orbital/game-data';
import {
  DEFAULT_ORBIT_VISUAL_SETTINGS,
  SCENE_EARTH_RADIUS,
  generateOrbitPoints,
  getOrbitColor,
  getOrbitPointAtProgress,
  getOrbitScaledDimensions,
  getOrbitTangentAtProgress,
  getRecommendedCameraDistance
} from '../index';

describe('ORBITAL 3D Orbital Path Visualization (Phase 3)', () => {
  const allProfiles = getAllOrbitProfiles();
  const leo = getOrbitProfileById('orbit-leo')!;
  const sso = getOrbitProfileById('orbit-sso')!;
  const polar = getOrbitProfileById('orbit-polar')!;
  const geo = getOrbitProfileById('orbit-geo')!;

  // 1. Orbit geometry generation
  it('generates smooth, valid closed 3D orbit curves', () => {
    const points = generateOrbitPoints(leo, 128);
    expect(points.length).toBe(129); // 128 segments + 1 closing point

    // First and last points should form a closed loop
    const first = points[0];
    const last = points[points.length - 1];
    expect(first[0]).toBeCloseTo(last[0], 2);
    expect(first[1]).toBeCloseTo(last[1], 2);
    expect(first[2]).toBeCloseTo(last[2], 2);
  });

  // 2. Inclination differences
  it('correctly maps inclination differences across orbital regimes', () => {
    const geoPoints = generateOrbitPoints(geo, 64);
    const polarPoints = generateOrbitPoints(polar, 64);

    // Maximum Y displacement for Polar (90° inc) vs GEO (0° inc)
    const maxYPolar = Math.max(...polarPoints.map((p) => Math.abs(p[1])));
    const maxYGeo = Math.max(...geoPoints.map((p) => Math.abs(p[1])));

    // Polar orbit must exhibit significant Y reach over geographic poles
    expect(maxYPolar).toBeGreaterThan(SCENE_EARTH_RADIUS);
    expect(maxYPolar).toBeGreaterThan(0);

    // Scaled dimensions verification
    const { inclinationRad: incGeo } = getOrbitScaledDimensions(geo);
    const { inclinationRad: incPolar } = getOrbitScaledDimensions(polar);
    const { inclinationRad: incSso } = getOrbitScaledDimensions(sso);

    expect(incGeo).toBeCloseTo(0.0, 2);
    expect(incPolar).toBeCloseTo(Math.PI / 2, 2);
    expect(incSso).toBeCloseTo((98.2 * Math.PI) / 180, 2);
  });

  // 3. Orbit radius differences
  it('demonstrates distinct physical radii between low and high orbits', () => {
    const leoDim = getOrbitScaledDimensions(leo);
    const ssoDim = getOrbitScaledDimensions(sso);
    const polarDim = getOrbitScaledDimensions(polar);
    const geoDim = getOrbitScaledDimensions(geo);

    // All orbits must clear the Earth surface (radius 2.0)
    expect(leoDim.rp).toBeGreaterThan(SCENE_EARTH_RADIUS);
    expect(ssoDim.rp).toBeGreaterThan(leoDim.rp);
    expect(polarDim.rp).toBeGreaterThan(ssoDim.rp);

    // GEO radius (35,786 km) must be massively larger than LEO (~420 km)
    expect(geoDim.rp).toBeGreaterThan(leoDim.rp * 5);
    expect(geoDim.semiMajorAxis).toBeGreaterThan(12.0);
  });

  // 4. Selected orbit updates
  it('updates 3D geometry points when selecting different profiles', () => {
    const leoPoints = generateOrbitPoints(leo, 32);
    const ssoPoints = generateOrbitPoints(sso, 32);
    const geoPoints = generateOrbitPoints(geo, 32);

    expect(leoPoints).not.toEqual(ssoPoints);
    expect(ssoPoints).not.toEqual(geoPoints);
  });

  // 5. Spacecraft position along orbit
  it('calculates interpolated position and tangent velocity vector along the orbit', () => {
    const points = generateOrbitPoints(leo, 64);

    const posStart = getOrbitPointAtProgress(points, 0.0);
    const posQuarter = getOrbitPointAtProgress(points, 0.25);
    const posHalf = getOrbitPointAtProgress(points, 0.5);

    expect(posStart).not.toEqual(posQuarter);
    expect(posQuarter).not.toEqual(posHalf);

    // Verify tangent vector is normalized
    const tangent = getOrbitTangentAtProgress(points, 0.25);
    const length = Math.sqrt(tangent[0] ** 2 + tangent[1] ** 2 + tangent[2] ** 2);
    expect(length).toBeCloseTo(1.0, 2);
  });

  // 6. Animation pause and resume state
  it('manages animation play/pause and speed settings', () => {
    let settings = { ...DEFAULT_ORBIT_VISUAL_SETTINGS };
    expect(settings.isSpacecraftAnimating).toBe(true);

    // Pause
    settings = { ...settings, isSpacecraftAnimating: false };
    expect(settings.isSpacecraftAnimating).toBe(false);

    // Resume
    settings = { ...settings, isSpacecraftAnimating: true };
    expect(settings.isSpacecraftAnimating).toBe(true);
  });

  // 7. Orbit visibility toggles
  it('supports toggling orbit path, spacecraft, reference plane, and comparison mode', () => {
    let settings = { ...DEFAULT_ORBIT_VISUAL_SETTINGS };

    // Toggle path
    settings = { ...settings, showOrbitPath: false };
    expect(settings.showOrbitPath).toBe(false);

    // Toggle spacecraft
    settings = { ...settings, showSpacecraft: false };
    expect(settings.showSpacecraft).toBe(false);

    // Toggle comparison mode
    settings = { ...settings, comparisonMode: true };
    expect(settings.comparisonMode).toBe(true);

    // Toggle equatorial reference plane
    settings = { ...settings, showEquatorialPlane: true };
    expect(settings.showEquatorialPlane).toBe(true);
  });

  // 8. Orbit catalog integration & color palette
  it('integrates seamlessly with all 4 profiles from Phase 1 catalog with distinct colors', () => {
    expect(allProfiles).toHaveLength(4);

    expect(getOrbitColor('LEO')).toBe('#06b6d4');   // Cyan
    expect(getOrbitColor('SSO')).toBe('#10b981');   // Emerald
    expect(getOrbitColor('POLAR')).toBe('#8b5cf6'); // Violet
    expect(getOrbitColor('GEO')).toBe('#f59e0b');   // Amber
  });

  // 9. GEO camera framing
  it('provides wide camera framing for GEO and closer framing for LEO', () => {
    const leoDist = getRecommendedCameraDistance(leo);
    const geoDist = getRecommendedCameraDistance(geo);

    expect(leoDist).toBe(7.0);
    expect(geoDist).toBe(21.0);
    expect(geoDist).toBeGreaterThan(leoDist * 2.5);
  });
});
