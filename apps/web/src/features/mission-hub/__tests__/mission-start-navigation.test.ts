import { describe, it, expect, beforeEach } from 'vitest';
import { MISSION_SCENARIOS } from '@orbital/game-data';
import { useGameStore } from '../../../store/gameStore';
import {
  validateMissionStart,
  MissionStartValidationResult
} from '../utils/validate-mission-start';
import { missionStartService } from '../services/mission-start.service';
import { getCampaignDisplayConfig } from '../data/mission-display-config';

describe('Feature F: Mission Start and Navigation Integration', () => {
  const earthScenario = MISSION_SCENARIOS.find((s) => s.id === 'scenario-earth-sentinel')!;
  const lunarScenario = MISSION_SCENARIOS.find((s) => s.id === 'scenario-artemis-prospector')!;
  const marsScenario = MISSION_SCENARIOS.find((s) => s.id === 'scenario-ares-recon')!;
  const asteroidScenario = MISSION_SCENARIOS.find((s) => s.id === 'scenario-nea-interceptor')!;

  beforeEach(() => {
    // Reset store before each test
    const store = useGameStore.getState();
    store.selectScenario(earthScenario);
    store.setGameMode('single');
    store.resetMissionInitialization();
  });

  describe('1. Centralized Mission Start Validation', () => {
    it('should validate Earth Sentinel in single-player as READY_TO_START', () => {
      const result = validateMissionStart(earthScenario, 'single');
      expect(result.isValid).toBe(true);
      expect(result.status).toBe('READY_TO_START');
      expect(result.statusLabel).toBe('Ready to Start');
      expect(result.canProceedToLab).toBe(true);
      expect(result.scenarioId).toBe(earthScenario.id);
      expect(result.gameMode).toBe('single');
    });

    it('should reject validation when scenario is missing', () => {
      const result = validateMissionStart(null, 'single');
      expect(result.isValid).toBe(false);
      expect(result.status).toBe('MISSING_SCENARIO');
      expect(result.canProceedToLab).toBe(false);
    });

    it('should reject validation when scenario does not exist in canonical catalog', () => {
      const fakeScenario: any = { id: 'scenario-jupiter-storm', code: 'JUP-9999' };
      const result = validateMissionStart(fakeScenario, 'single');
      expect(result.isValid).toBe(false);
      expect(result.status).toBe('INVALID_SCENARIO');
      expect(result.canProceedToLab).toBe(false);
    });

    it('should reject mission start for Coming Soon campaigns without silent redirection', () => {
      const lunarResult = validateMissionStart(lunarScenario, 'single');
      expect(lunarResult.isValid).toBe(false);
      expect(lunarResult.status).toBe('MISSION_UNAVAILABLE');
      expect(lunarResult.canProceedToLab).toBe(false);
      expect(lunarResult.message).toContain('pre-flight development');

      const marsResult = validateMissionStart(marsScenario, 'single');
      expect(marsResult.isValid).toBe(false);
      expect(marsResult.status).toBe('MISSION_UNAVAILABLE');

      const asteroidResult = validateMissionStart(asteroidScenario, 'single');
      expect(asteroidResult.isValid).toBe(false);
      expect(asteroidResult.status).toBe('MISSION_UNAVAILABLE');
    });

    it('should reject validation when game mode is missing or invalid', () => {
      const result = validateMissionStart(earthScenario, null as any);
      expect(result.isValid).toBe(false);
      expect(result.status).toBe('MISSING_GAME_MODE');
      expect(result.canProceedToLab).toBe(false);
    });

    it('should reject multiplayer start when no active room is established', () => {
      const result = validateMissionStart(earthScenario, 'multiplayer', {
        activeRoomId: null,
        isRoomConnected: false
      });
      expect(result.isValid).toBe(false);
      expect(result.status).toBe('MULTIPLAYER_NOT_READY');
      expect(result.canProceedToLab).toBe(false);
    });

    it('should approve multiplayer start when active room is valid', () => {
      const result = validateMissionStart(earthScenario, 'multiplayer', {
        activeRoomId: 'RM-7742',
        isRoomConnected: true
      });
      expect(result.isValid).toBe(true);
      expect(result.status).toBe('READY_TO_START');
      expect(result.canProceedToLab).toBe(true);
      expect(result.gameMode).toBe('multiplayer');
    });

    it('should reject start when Spacecraft Lab module is explicitly unavailable', () => {
      const result = validateMissionStart(earthScenario, 'single', {
        isLabModuleAvailable: false
      });
      expect(result.isValid).toBe(false);
      expect(result.status).toBe('SPACECRAFT_DESIGN_UNAVAILABLE');
      expect(result.canProceedToLab).toBe(false);
    });
  });

  describe('2. Scenario Resolution and Route Synchronization', () => {
    it('should resolve scenario by exact ID', () => {
      const resolved = missionStartService.resolveScenario('scenario-earth-sentinel');
      expect(resolved).toBeDefined();
      expect(resolved?.id).toBe(earthScenario.id);
    });

    it('should resolve scenario by code', () => {
      const resolved = missionStartService.resolveScenario('OPS-2601');
      expect(resolved).toBeDefined();
      expect(resolved?.id).toBe(earthScenario.id);
    });

    it('should resolve scenario by slug name', () => {
      const resolved = missionStartService.resolveScenario('earth-sentinel');
      expect(resolved).toBeDefined();
      expect(resolved?.id).toBe(earthScenario.id);
    });

    it('should return null for non-existent scenario identifier', () => {
      const resolved = missionStartService.resolveScenario('non-existent-campaign-xyz');
      expect(resolved).toBeNull();
    });
  });

  describe('3. Application State Preservation', () => {
    it('should preserve selected scenario and reset initialization on campaign switch', () => {
      const store = useGameStore.getState();
      expect(store.selectedScenario.id).toBe('scenario-earth-sentinel');

      store.selectScenario(lunarScenario);
      expect(useGameStore.getState().selectedScenario.id).toBe('scenario-artemis-prospector');
      expect(useGameStore.getState().isMissionInitialized).toBe(false);
    });

    it('should preserve gameMode and update initialization status on initializeMission', () => {
      const store = useGameStore.getState();
      store.selectScenario(earthScenario);

      const validation = store.initializeMission('single', earthScenario);
      expect(validation.isValid).toBe(true);
      expect(useGameStore.getState().isMissionInitialized).toBe(true);
      expect(useGameStore.getState().missionInitializationStatus).toBe('READY_TO_START');
      expect(useGameStore.getState().gameMode).toBe('single');
    });

    it('should refuse to initialize an unavailable campaign into gameplay', () => {
      const store = useGameStore.getState();
      const validation = store.initializeMission('single', marsScenario);

      expect(validation.isValid).toBe(false);
      expect(validation.status).toBe('MISSION_UNAVAILABLE');
      expect(useGameStore.getState().isMissionInitialized).toBe(false);
      expect(useGameStore.getState().missionInitializationStatus).toBe('MISSION_UNAVAILABLE');
    });
  });

  describe('4. Mission Handoff to Spacecraft Design Lab', () => {
    it('should execute successful single-player handoff targeting Spacecraft Lab', () => {
      const handoff = missionStartService.prepareHandoff(earthScenario, 'single');
      expect(handoff.success).toBe(true);
      expect(handoff.targetTab).toBe('lab');
      expect(handoff.targetRoute).toBe('/spacecraft-design');
      expect(useGameStore.getState().activeTab).toBe('lab');
      expect(useGameStore.getState().selectedScenario.id).toBe(earthScenario.id);
    });

    it('should block handoff for Coming Soon campaign and preserve scenario for preview', () => {
      const handoff = missionStartService.prepareHandoff(lunarScenario, 'single');
      expect(handoff.success).toBe(false);
      expect(handoff.result.status).toBe('MISSION_UNAVAILABLE');
      expect(handoff.targetRoute).toBe(`/missions/${lunarScenario.id}/mode`);
    });
  });
});

