import { describe, it, expect } from 'vitest';
import { MISSION_SCENARIOS } from '@orbital/game-data';
import {
  CAMPAIGN_DISPLAY_CONFIGS,
  getCampaignDisplayConfig
} from '../data/mission-display-config';

describe('Feature C: Mission Briefing Verification', () => {
  const earthScenario = MISSION_SCENARIOS.find((s) => s.id === 'scenario-earth-sentinel')!;
  const lunarScenario = MISSION_SCENARIOS.find((s) => s.id === 'scenario-artemis-prospector')!;
  const marsScenario = MISSION_SCENARIOS.find((s) => s.id === 'scenario-ares-recon')!;
  const asteroidScenario = MISSION_SCENARIOS.find((s) => s.id === 'scenario-nea-interceptor')!;

  it('1. should verify Earth Sentinel canonical scenario data is accurate', () => {
    expect(earthScenario).toBeDefined();
    expect(earthScenario.code).toBe('OPS-2601');
    expect(earthScenario.targetBody).toBe('Earth');
    expect(earthScenario.difficulty).toBe('Beginner');
    expect(earthScenario.budgetMUSD).toBe(140);
    expect(earthScenario.maxMassKg).toBe(1200);
    expect(earthScenario.targetOrbitType).toBe('SSO');
    expect(earthScenario.minSciencePoints).toBe(600);
    expect(earthScenario.minBandwidthMbps).toBe(50);
    expect(earthScenario.durationDays).toBe(365);
  });

  it('2. should verify mandatory objectives match canonical primaryObjectives', () => {
    expect(earthScenario.primaryObjectives).toEqual([
      'Map polar ice thickness with Synthetic Aperture Radar (SAR) or LiDAR.',
      'Maintain continuous orbital downlink to ground stations.',
      'Achieve positive power balance across high-latitude solar eclipses.'
    ]);
  });

  it('3. should verify optional objectives match canonical secondaryObjectives', () => {
    expect(earthScenario.secondaryObjectives).toEqual([
      'Detect localized methane leaks over major industrial corridors.',
      'Maintain battery depth-of-discharge below 60%.'
    ]);
  });

  it('4. should verify bonus objectives are not invented when not configured', () => {
    // Current contracts do not define a separate bonusObjectives field;
    // Briefing accurately communicates "NO BONUS OBJECTIVES CONFIGURED".
    expect((earthScenario as any).bonusObjectives).toBeUndefined();
  });

  it('5. should verify environmental hazards match canonical scenario data', () => {
    expect(earthScenario.environmentalHazards).toEqual([
      'Frequent 35-minute orbital eclipses over polar night sectors.',
      'Atomic oxygen erosion in low Earth orbit.'
    ]);
  });

  it('6. should verify recommended instruments match canonical scenario data', () => {
    expect(earthScenario.recommendedInstruments).toEqual([
      'Synthetic Aperture Radar',
      'Multispectral Imager',
      'Fourier Spectrometer'
    ]);
  });

  it('7. should verify availability rules for Earth Sentinel vs Coming Soon campaigns', () => {
    const earthConfig = getCampaignDisplayConfig(earthScenario.id);
    expect(earthConfig.availability).toBe('AVAILABLE');

    const lunarConfig = getCampaignDisplayConfig(lunarScenario.id);
    expect(lunarConfig.availability).toBe('COMING_SOON');

    const marsConfig = getCampaignDisplayConfig(marsScenario.id);
    expect(marsConfig.availability).toBe('COMING_SOON');

    const asteroidConfig = getCampaignDisplayConfig(asteroidScenario.id);
    expect(asteroidConfig.availability).toBe('COMING_SOON');
  });

  it('8. should verify all 4 scenarios provide valid numerical requirements without missing fields', () => {
    [earthScenario, lunarScenario, marsScenario, asteroidScenario].forEach((scenario) => {
      expect(scenario.budgetMUSD).toBeGreaterThan(0);
      expect(scenario.maxMassKg).toBeGreaterThan(0);
      expect(scenario.durationDays).toBeGreaterThan(0);
      expect(scenario.minSciencePoints).toBeGreaterThan(0);
      expect(scenario.minBandwidthMbps).toBeGreaterThan(0);
      expect(scenario.primaryObjectives.length).toBeGreaterThanOrEqual(2);
      expect(scenario.secondaryObjectives.length).toBeGreaterThanOrEqual(1);
      expect(scenario.environmentalHazards.length).toBeGreaterThanOrEqual(2);
      expect(scenario.recommendedInstruments.length).toBeGreaterThanOrEqual(2);
    });
  });
});
