import { describe, it, expect } from 'vitest';
import { MISSION_SCENARIOS } from '@orbital/game-data';
import {
  CAMPAIGN_DISPLAY_CONFIGS,
  getCampaignDisplayConfig
} from '../data/mission-display-config';

describe('Feature B: Interactive Mission Selection', () => {
  it('should define UI presentation configurations for all 4 canonical scenarios', () => {
    expect(Object.keys(CAMPAIGN_DISPLAY_CONFIGS)).toHaveLength(4);

    MISSION_SCENARIOS.forEach((scenario) => {
      const config = getCampaignDisplayConfig(scenario.id);
      expect(config).toBeDefined();
      expect(config.scenarioId).toBe(scenario.id);
      expect(config.displayTitle).toBeTruthy();
      expect(config.tagline).toBeTruthy();
      expect(config.scientificObjective).toBeTruthy();
      expect(config.estimatedPlaytime).toBeTruthy();
      expect(config.primaryChallenges.length).toBeGreaterThanOrEqual(2);
      expect(config.artworkUrl).toBeTruthy();
    });
  });

  it('should ensure Earth Sentinel is the only AVAILABLE playable campaign', () => {
    const earthConfig = getCampaignDisplayConfig('scenario-earth-sentinel');
    expect(earthConfig.displayTitle).toBe('EARTH SENTINEL');
    expect(earthConfig.tagline).toBe('PROTECT OUR PLANET');
    expect(earthConfig.displayDifficulty).toBe('BEGINNER');
    expect(earthConfig.destination).toBe('EARTH');
    expect(earthConfig.availability).toBe('AVAILABLE');
    expect(earthConfig.scientificObjective).toContain('Earth-observation');

    const lunarConfig = getCampaignDisplayConfig('scenario-artemis-prospector');
    expect(lunarConfig.displayTitle).toBe('LUNAR FRONTIER');
    expect(lunarConfig.availability).toBe('COMING_SOON');
    expect(lunarConfig.displayDifficulty).toBe('INTERMEDIATE');

    const marsConfig = getCampaignDisplayConfig('scenario-ares-recon');
    expect(marsConfig.displayTitle).toBe('MARS ODYSSEY');
    expect(marsConfig.availability).toBe('COMING_SOON');
    expect(marsConfig.displayDifficulty).toBe('ADVANCED');

    const asteroidConfig = getCampaignDisplayConfig('scenario-nea-interceptor');
    expect(asteroidConfig.displayTitle).toBe('ASTEROID WATCH');
    expect(asteroidConfig.availability).toBe('COMING_SOON');
    expect(asteroidConfig.displayDifficulty).toBe('ADVANCED');
    expect(asteroidConfig.destination).toBe('DEEP SPACE');
  });

  it('should preserve canonical scenario contracts without mutation', () => {
    const canonicalEarth = MISSION_SCENARIOS.find((s) => s.id === 'scenario-earth-sentinel');
    expect(canonicalEarth).toBeDefined();
    expect(canonicalEarth?.code).toBe('OPS-2601');
    expect(canonicalEarth?.budgetMUSD).toBe(140);
    expect(canonicalEarth?.maxMassKg).toBe(1200);

    const canonicalLunar = MISSION_SCENARIOS.find((s) => s.id === 'scenario-artemis-prospector');
    expect(canonicalLunar).toBeDefined();
    expect(canonicalLunar?.code).toBe('LUNAR-2604');
  });
});

