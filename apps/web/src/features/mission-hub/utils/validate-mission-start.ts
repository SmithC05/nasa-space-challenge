import { MissionScenario } from '@orbital/contracts';
import { MISSION_SCENARIOS } from '@orbital/game-data';
import { getCampaignDisplayConfig } from '../data/mission-display-config';

export type MissionStartValidationStatus =
  | 'READY_TO_START'
  | 'MISSING_SCENARIO'
  | 'INVALID_SCENARIO'
  | 'MISSION_UNAVAILABLE'
  | 'MISSING_GAME_MODE'
  | 'MULTIPLAYER_NOT_READY'
  | 'SPACECRAFT_DESIGN_UNAVAILABLE';

export interface MissionStartValidationOptions {
  activeRoomId?: string | null;
  isRoomConnected?: boolean;
  isLabModuleAvailable?: boolean;
}

export interface MissionStartValidationResult {
  isValid: boolean;
  status: MissionStartValidationStatus;
  statusLabel: string;
  message: string;
  canProceedToLab: boolean;
  scenarioId?: string;
  gameMode?: 'single' | 'multiplayer';
}

/**
 * Centralized mission start validation for ORBITAL Feature F.
 * Validates scenario presence, canonical catalog existence, availability tier,
 * gameplay mode configuration, multiplayer session readiness, and module availability.
 */
export function validateMissionStart(
  scenario: MissionScenario | null | undefined,
  gameMode: 'single' | 'multiplayer' | null | undefined,
  options: MissionStartValidationOptions = {}
): MissionStartValidationResult {
  const {
    activeRoomId,
    isRoomConnected = true,
    isLabModuleAvailable = true
  } = options;

  // 1. Check if scenario is provided
  if (!scenario || !scenario.id) {
    return {
      isValid: false,
      status: 'MISSING_SCENARIO',
      statusLabel: 'Missing Scenario',
      message: 'No mission scenario has been selected. Please choose a campaign from Mission Selection.',
      canProceedToLab: false
    };
  }

  // 2. Check if scenario exists in canonical game-data catalog
  const canonicalScenario = MISSION_SCENARIOS.find((s) => s.id === scenario.id);
  if (!canonicalScenario) {
    return {
      isValid: false,
      status: 'INVALID_SCENARIO',
      statusLabel: 'Invalid Scenario',
      message: `Scenario "${scenario.id}" does not exist in the canonical mission catalog.`,
      canProceedToLab: false,
      scenarioId: scenario.id
    };
  }

  // 3. Check campaign availability (Only Earth Sentinel is AVAILABLE in release 1)
  const displayConfig = getCampaignDisplayConfig(scenario.id);
  if (displayConfig.availability !== 'AVAILABLE') {
    return {
      isValid: false,
      status: 'MISSION_UNAVAILABLE',
      statusLabel: 'Mission Unavailable',
      message: `The "${displayConfig.displayTitle}" campaign is in pre-flight development and is not yet playable in the Spacecraft Design Lab.`,
      canProceedToLab: false,
      scenarioId: scenario.id
    };
  }

  // 4. Check game mode selection
  if (!gameMode || (gameMode !== 'single' && gameMode !== 'multiplayer')) {
    return {
      isValid: false,
      status: 'MISSING_GAME_MODE',
      statusLabel: 'Missing Game Mode',
      message: 'A gameplay mode (Single-Player or Multiplayer) must be selected before starting the mission.',
      canProceedToLab: false,
      scenarioId: scenario.id
    };
  }

  // 5. Check multiplayer session readiness if in multiplayer mode
  if (gameMode === 'multiplayer') {
    if (!activeRoomId || !isRoomConnected) {
      return {
        isValid: false,
        status: 'MULTIPLAYER_NOT_READY',
        statusLabel: 'Multiplayer Session Not Ready',
        message: 'A multiplayer mission room must be established or joined before proceeding to the crew lab.',
        canProceedToLab: false,
        scenarioId: scenario.id,
        gameMode: 'multiplayer'
      };
    }
  }

  // 6. Check Spacecraft Design Lab module availability
  if (!isLabModuleAvailable) {
    return {
      isValid: false,
      status: 'SPACECRAFT_DESIGN_UNAVAILABLE',
      statusLabel: 'Spacecraft Design Module Unavailable',
      message: 'Developer 02 Spacecraft Design Lab is currently awaiting module integration.',
      canProceedToLab: false,
      scenarioId: scenario.id,
      gameMode
    };
  }

  // All validation checks passed
  return {
    isValid: true,
    status: 'READY_TO_START',
    statusLabel: 'Ready to Start',
    message: `Mission "${displayConfig.displayTitle}" is validated and ready for Spacecraft Assembly.`,
    canProceedToLab: true,
    scenarioId: scenario.id,
    gameMode
  };
}

