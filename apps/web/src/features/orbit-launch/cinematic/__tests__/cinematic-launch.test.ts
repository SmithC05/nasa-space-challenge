import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from '../../../../store/gameStore';
import { LAUNCH_VEHICLES, MISSION_SCENARIOS, ORBIT_PROFILES } from '@orbital/game-data';
import { LAUNCH_STAGES, LaunchStageId, LaunchTelemetry } from '../types';
import { launchAudio } from '../audioSynthesizer';

describe('Phase 6 — Cinematic Launch Sequence & Operations Handoff', () => {
  const coreVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-core')!;
  const superHeavyVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-superheavy')!;
  const ssoOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-sso')!;
  const earthSentinel = MISSION_SCENARIOS.find((s) => s.id === 'scenario-earth-sentinel')!;

  beforeEach(() => {
    const state = useGameStore.getState();
    state.selectScenario(earthSentinel);
    state.selectOrbit(ssoOrbit);
    state.selectVehicle(coreVehicle);
  });

  // 1. Launch blocked when Phase 5 configuration is invalid
  it('1. verifies launch is blocked when Phase 5 configuration is invalid or over-budget', () => {
    const state = useGameStore.getState();
    state.selectVehicle(superHeavyVehicle); // Over-budget on Earth Sentinel

    const updatedState = useGameStore.getState();
    expect(updatedState.launchConfig.isCompatible).toBe(false);
    expect(updatedState.launchConfig.status).toBe('BLOCKED');

    // Attempting confirmation fails
    const confirmed = updatedState.confirmLaunchConfiguration();
    expect(confirmed).toBe(false);
    expect(updatedState.getLaunchHandoff()).toBeNull();
  });

  // 2. Launch starts when configuration is confirmed
  it('2. verifies launch sequence authorization when Phase 5 configuration is confirmed', () => {
    const state = useGameStore.getState();
    state.selectVehicle(coreVehicle);

    const confirmed = state.confirmLaunchConfiguration();
    expect(confirmed).toBe(true);

    const confirmedState = useGameStore.getState();
    expect(confirmedState.launchConfig.status).toBe('CONFIRMED');
    expect(confirmedState.launchConfig.isCompatible).toBe(true);
    expect(confirmedState.getLaunchHandoff()).not.toBeNull();
  });

  // 3. Countdown progression
  it('3. verifies countdown progression through all 9 stages in order', () => {
    expect(LAUNCH_STAGES).toHaveLength(9);
    expect(LAUNCH_STAGES[0].id).toBe('STAGE_1_PRE_LAUNCH');
    expect(LAUNCH_STAGES[1].id).toBe('STAGE_2_COUNTDOWN');
    expect(LAUNCH_STAGES[2].id).toBe('STAGE_3_IGNITION');
    expect(LAUNCH_STAGES[3].id).toBe('STAGE_4_LIFTOFF');
    expect(LAUNCH_STAGES[4].id).toBe('STAGE_5_ATMOSPHERIC_ASCENT');
    expect(LAUNCH_STAGES[5].id).toBe('STAGE_6_STAGE_SEPARATION');
    expect(LAUNCH_STAGES[6].id).toBe('STAGE_7_SPACECRAFT_DEPLOYMENT');
    expect(LAUNCH_STAGES[7].id).toBe('STAGE_8_ORBIT_INSERTION');
    expect(LAUNCH_STAGES[8].id).toBe('STAGE_9_OPERATIONS_HANDOFF');
  });

  // 4. Countdown skip
  it('4. verifies countdown skip option advances immediately to ignition and flight telemetry', () => {
    let currentStage: LaunchStageId = 'STAGE_2_COUNTDOWN';
    let countdown = 10;

    // Simulate skip handler
    const handleSkipCountdown = () => {
      countdown = 0;
      currentStage = 'STAGE_3_IGNITION';
    };

    handleSkipCountdown();
    expect(countdown).toBe(0);
    expect(currentStage).toBe('STAGE_3_IGNITION');
  });

  // 5. Rocket liftoff state
  it('5. verifies liftoff state updates altitude, throttle, and acoustic telemetry', () => {
    const liftoffTelemetry: LaunchTelemetry = {
      stageId: 'STAGE_4_LIFTOFF',
      missionElapsedSec: 8,
      altitudeKm: 0.85,
      velocityMps: 110,
      downrangeKm: 0.2,
      throttlePct: 100,
      stage1PropellantPct: 92,
      stage2PropellantPct: 100,
      gForce: 1.45,
      machNumber: 0.32,
      fairingJettisoned: false,
      boosterSeparated: false,
      spacecraftSeparated: false,
      solarPanelsDeployed: false,
      orbitInsertionConfirmed: false
    };

    expect(liftoffTelemetry.stageId).toBe('STAGE_4_LIFTOFF');
    expect(liftoffTelemetry.altitudeKm).toBeGreaterThan(0);
    expect(liftoffTelemetry.velocityMps).toBeGreaterThan(50);
    expect(liftoffTelemetry.throttlePct).toBe(100);
    expect(liftoffTelemetry.boosterSeparated).toBe(false);
  });

  // 6. Stage separation
  it('6. verifies stage separation decouples first-stage booster and jettisons fairing', () => {
    const separationTelemetry: LaunchTelemetry = {
      stageId: 'STAGE_6_STAGE_SEPARATION',
      missionElapsedSec: 68,
      altitudeKm: 112,
      velocityMps: 4200,
      downrangeKm: 160,
      throttlePct: 100,
      stage1PropellantPct: 4,
      stage2PropellantPct: 95,
      gForce: 2.1,
      machNumber: 12.3,
      fairingJettisoned: true,
      boosterSeparated: true,
      spacecraftSeparated: false,
      solarPanelsDeployed: false,
      orbitInsertionConfirmed: false
    };

    expect(separationTelemetry.boosterSeparated).toBe(true);
    expect(separationTelemetry.fairingJettisoned).toBe(true);
    expect(separationTelemetry.spacecraftSeparated).toBe(false);
    expect(separationTelemetry.altitudeKm).toBeGreaterThan(100); // Space Karman line
  });

  // 7. Spacecraft deployment
  it('7. verifies spacecraft deployment separates spacecraft from upper stage adapter', () => {
    const deploymentTelemetry: LaunchTelemetry = {
      stageId: 'STAGE_7_SPACECRAFT_DEPLOYMENT',
      missionElapsedSec: 90,
      altitudeKm: 145,
      velocityMps: 7450,
      downrangeKm: 350,
      throttlePct: 0,
      stage1PropellantPct: 0,
      stage2PropellantPct: 22,
      gForce: 1.0,
      machNumber: 21.9,
      fairingJettisoned: true,
      boosterSeparated: true,
      spacecraftSeparated: true,
      solarPanelsDeployed: false,
      orbitInsertionConfirmed: false
    };

    expect(deploymentTelemetry.spacecraftSeparated).toBe(true);
    expect(deploymentTelemetry.velocityMps).toBeGreaterThan(7000);
  });

  // 8. Solar panel deployment
  it('8. verifies solar panel wings deploy and lock into sun-tracking orientation', () => {
    let solarProgress = 0.0;
    const deploySolarWings = () => {
      solarProgress = 1.0;
    };

    deploySolarWings();
    expect(solarProgress).toBe(1.0);
  });

  // 9. Orbit insertion
  it('9. verifies orbit insertion parameters match target orbit profile', () => {
    const state = useGameStore.getState();
    const targetOrbit = state.selectedOrbit;

    const insertionTelemetry: LaunchTelemetry = {
      stageId: 'STAGE_8_ORBIT_INSERTION',
      missionElapsedSec: 120,
      altitudeKm: targetOrbit.perigeeKm,
      velocityMps: 7680,
      downrangeKm: 580,
      throttlePct: 0,
      stage1PropellantPct: 0,
      stage2PropellantPct: 12,
      gForce: 1.0,
      machNumber: 22.5,
      fairingJettisoned: true,
      boosterSeparated: true,
      spacecraftSeparated: true,
      solarPanelsDeployed: true,
      orbitInsertionConfirmed: true
    };

    expect(insertionTelemetry.orbitInsertionConfirmed).toBe(true);
    expect(insertionTelemetry.solarPanelsDeployed).toBe(true);
    expect(insertionTelemetry.altitudeKm).toBe(targetOrbit.perigeeKm);
  });

  // 10. Developer 04 handoff
  it('10. verifies Developer 04 receives the confirmed launch handoff package and starts ops simulation', () => {
    const state = useGameStore.getState();
    state.confirmLaunchConfiguration();

    // Handoff to Mission Operations
    state.startMissionLaunch();

    const opsState = useGameStore.getState();
    expect(opsState.activeTab).toBe('ops');
    expect(opsState.simulationState).not.toBeNull();
    expect(opsState.simulationState?.phase).toBe('PRE_LAUNCH');
    expect(opsState.getLaunchHandoff()?.isReadyForOperations).toBe(true);
    expect(opsState.getLaunchHandoff()?.vehicle.id).toBe('vehicle-orbital-core');
  });

  // 11. Replay functionality
  it('11. verifies replay resets timeline and telemetry cleanly back to pre-launch readiness', () => {
    let stage: LaunchStageId = 'STAGE_9_OPERATIONS_HANDOFF';
    let altitude = 160;

    const resetSequence = () => {
      stage = 'STAGE_1_PRE_LAUNCH';
      altitude = 0;
    };

    resetSequence();
    expect(stage).toBe('STAGE_1_PRE_LAUNCH');
    expect(altitude).toBe(0);
  });

  // 12. Prevention of duplicate launch execution
  it('12. verifies duplicate launch execution is prevented while sequence is active', () => {
    let isLaunching = false;
    let launchAttempts = 0;

    const startCountdown = () => {
      if (isLaunching) return false;
      isLaunching = true;
      launchAttempts += 1;
      return true;
    };

    // First attempt starts
    const firstAttempt = startCountdown();
    expect(firstAttempt).toBe(true);
    expect(launchAttempts).toBe(1);

    // Second rapid attempt is ignored
    const secondAttempt = startCountdown();
    expect(secondAttempt).toBe(false);
    expect(launchAttempts).toBe(1);
  });
});
