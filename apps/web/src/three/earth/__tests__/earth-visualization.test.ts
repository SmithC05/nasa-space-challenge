import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CAMERA_POSITION,
  DEFAULT_CAMERA_TARGET,
  DEFAULT_EARTH_VISUALIZATION_STATE,
  createEarthCloudTexture,
  createEarthDayTexture,
  createEarthSpecularMap,
  loadEarthCloudTexture,
  loadEarthDayTexture,
  loadEarthNormalTexture,
  loadEarthSpecularTexture
} from '../index';

describe('ORBITAL 3D Earth Environment (Phase 2 & 2.1)', () => {
  it('initializes default visualization options with all layers enabled', () => {
    expect(DEFAULT_EARTH_VISUALIZATION_STATE.showEarth).toBe(true);
    expect(DEFAULT_EARTH_VISUALIZATION_STATE.showAtmosphere).toBe(true);
    expect(DEFAULT_EARTH_VISUALIZATION_STATE.showClouds).toBe(true);
    expect(DEFAULT_EARTH_VISUALIZATION_STATE.showStars).toBe(true);
    expect(DEFAULT_EARTH_VISUALIZATION_STATE.isRotating).toBe(true);
  });

  it('provides default camera position and target avoiding Earth penetration', () => {
    expect(DEFAULT_CAMERA_POSITION).toEqual([3.8, 3.2, 5.0]);
    expect(DEFAULT_CAMERA_TARGET).toEqual([0, 0, 0]);

    // Calculate camera distance from origin
    const distance = Math.sqrt(
      DEFAULT_CAMERA_POSITION[0] ** 2 +
      DEFAULT_CAMERA_POSITION[1] ** 2 +
      DEFAULT_CAMERA_POSITION[2] ** 2
    );
    // Earth radius is 2.0; camera distance should be comfortably outside (approx 7.0 units)
    expect(distance).toBeGreaterThan(2.0);
    expect(distance).toBeGreaterThanOrEqual(6.0);
  });

  it('generates procedural Earth day texture fallback', () => {
    const texture = createEarthDayTexture(256, 128);
    expect(texture).toBeDefined();
    expect(texture.isTexture).toBe(true);
  });

  it('generates procedural Earth cloud texture fallback', () => {
    const cloudTexture = createEarthCloudTexture(256, 128);
    expect(cloudTexture).toBeDefined();
    expect(cloudTexture.isTexture).toBe(true);
  });

  it('generates procedural Earth specular map fallback', () => {
    const specular = createEarthSpecularMap(256, 128);
    expect(specular).toBeDefined();
    expect(specular.isTexture).toBe(true);
  });

  it('loads or falls back for high-resolution NASA textures', () => {
    const day = loadEarthDayTexture();
    expect(day).toBeDefined();
    expect(day.isTexture).toBe(true);

    const clouds = loadEarthCloudTexture();
    expect(clouds).toBeDefined();
    expect(clouds.isTexture).toBe(true);

    const spec = loadEarthSpecularTexture();
    expect(spec).toBeDefined();
    expect(spec.isTexture).toBe(true);

    const norm = loadEarthNormalTexture();
    expect(norm).toBeDefined();
    expect(norm.isTexture).toBe(true);
  });

  it('correctly toggles visualization options state', () => {
    let state = { ...DEFAULT_EARTH_VISUALIZATION_STATE };

    // Toggle rotation
    state = { ...state, isRotating: !state.isRotating };
    expect(state.isRotating).toBe(false);

    // Toggle clouds
    state = { ...state, showClouds: !state.showClouds };
    expect(state.showClouds).toBe(false);

    // Toggle atmosphere
    state = { ...state, showAtmosphere: !state.showAtmosphere };
    expect(state.showAtmosphere).toBe(false);

    // Toggle stars
    state = { ...state, showStars: !state.showStars };
    expect(state.showStars).toBe(false);

    // Toggle Earth
    state = { ...state, showEarth: !state.showEarth };
    expect(state.showEarth).toBe(false);
  });
});
