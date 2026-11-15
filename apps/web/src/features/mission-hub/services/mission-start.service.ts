import { MissionScenario } from '@orbital/contracts';
import { MISSION_SCENARIOS } from '@orbital/game-data';
import {
  validateMissionStart,
  MissionStartValidationResult,
  MissionStartValidationOptions
} from '../utils/validate-mission-start';
import { useGameStore } from '../../../store/gameStore';

export interface MissionHandoffResult {
  success: boolean;
  result: MissionStartValidationResult;
  targetTab: 'lab' | 'hub' | 'multiplayer';
  targetRoute: string;
}

export class MissionStartService {
  /**
   * Resolves a scenario ID from route parameter, slug, or code to a canonical MissionScenario.
   */
  resolveScenario(identifier: string | undefined): MissionScenario | null {
    if (!identifier) return null;

    const normalized = identifier.toLowerCase().trim();

    // 1. Direct ID match
    const byId = MISSION_SCENARIOS.find((s) => s.id.toLowerCase() === normalized);
    if (byId) return byId;

    // 2. Code match (e.g., 'ops-2601')
    const byCode = MISSION_SCENARIOS.find((s) => s.code.toLowerCase() === normalized);
    if (byCode) return byCode;

    // 3. Slug match (e.g., 'earth-sentinel' matches 'scenario-earth-sentinel')
    const bySlug = MISSION_SCENARIOS.find(
      (s) => s.id.toLowerCase() === `scenario-${normalized}` || s.id.toLowerCase().includes(normalized)
    );
    if (bySlug) return bySlug;

    return null;
  }

  /**
   * Validates a candidate mission configuration against all aerospace rules.
   */
  validate(
    scenario: MissionScenario | null | undefined,
    gameMode: 'single' | 'multiplayer' | null | undefined,
    options?: MissionStartValidationOptions
  ): MissionStartValidationResult {
    return validateMissionStart(scenario, gameMode, options);
  }

  /**
   * Performs mission preparation and state synchronization before handoff.
   */
  prepareHandoff(
    scenario: MissionScenario,
    mode: 'single' | 'multiplayer',
    options?: MissionStartValidationOptions
  ): MissionHandoffResult {
    const validation = this.validate(scenario, mode, options);

    if (!validation.isValid) {
      return {
        success: false,
        result: validation,
        targetTab: 'hub',
        targetRoute: `/missions/${scenario.id}/mode`
      };
    }

    // Synchronize global store state
    const store = useGameStore.getState();
    store.selectScenario(scenario);
    store.setGameMode(mode);

    if (typeof (store as any).initializeMission === 'function') {
      (store as any).initializeMission(mode, scenario);
    }

    if (mode === 'single') {
      store.setActiveTab('lab');
      return {
        success: true,
        result: validation,
        targetTab: 'lab',
        targetRoute: '/spacecraft-design'
      };
    } else {
      // Multiplayer mode: route to multiplayer lobby or lab depending on room readiness
      store.setActiveTab('multiplayer');
      return {
        success: true,
        result: validation,
        targetTab: 'multiplayer',
        targetRoute: '/multiplayer'
      };
    }
  }
}

export const missionStartService = new MissionStartService();

