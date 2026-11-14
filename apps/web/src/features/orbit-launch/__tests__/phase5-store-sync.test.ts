import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '../../../store/gameStore';
import { LAUNCH_VEHICLES, MISSION_SCENARIOS, ORBIT_PROFILES } from '@orbital/game-data';
import { getDetailedLaunchValidation } from '@orbital/simulation-engine';

describe('Phase 5 Store State Synchronization & Review Clearance Gates (12 Audit Scenarios)', () => {
  const coreVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-core')!;
  const superHeavyVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-superheavy')!;
  const ssoOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-sso')!;
  const polarOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-polar')!;
  const earthSentinel = MISSION_SCENARIOS.find((s) => s.id === 'scenario-earth-sentinel')!;

  beforeEach(() => {
    // Reset store state to Earth Sentinel + SSO + Core
    const state = useGameStore.getState();
    state.selectScenario(earthSentinel);
    state.selectOrbit(ssoOrbit);
    state.selectVehicle(coreVehicle);
  });

  it('1. ORBITAL-Core selected: all state sections show Core', () => {
    const state = useGameStore.getState();
    expect(state.selectedVehicle.id).toBe('vehicle-orbital-core');
    expect(state.selectedVehicle.name).toBe('ORBITAL-Core');
    expect(state.launchConfig.vehicleId).toBe('vehicle-orbital-core');

    const validation = getDetailedLaunchValidation(
      state.selectedVehicle,
      state.selectedOrbit,
      state.currentDesign.resources.totalMassKg,
      state.selectedScenario.budgetMUSD,
      state.currentDesign.resources.totalCostMUSD,
      undefined,
      state.selectedScenario
    );
    expect(validation.boosterCostMUSD).toBe(54.0);
    expect(validation.totalMissionCostMUSD).toBe(121.4);
  });

  it('2. ORBITAL-SuperHeavy selected: all state sections show SuperHeavy', () => {
    const state = useGameStore.getState();
    state.selectVehicle(superHeavyVehicle);

    const updatedState = useGameStore.getState();
    expect(updatedState.selectedVehicle.id).toBe('vehicle-orbital-superheavy');
    expect(updatedState.selectedVehicle.name).toContain('ORBITAL-SuperHeavy');
    expect(updatedState.launchConfig.vehicleId).toBe('vehicle-orbital-superheavy');
  });

  it('3. Switching vehicles updates the total mission cost', () => {
    const state = useGameStore.getState();
    state.selectVehicle(coreVehicle);
    expect(useGameStore.getState().launchConfig.totalCostMUSD).toBe(121.4);

    state.selectVehicle(superHeavyVehicle);
    expect(useGameStore.getState().launchConfig.totalCostMUSD).toBe(242.4);
  });

  it('4. Switching vehicles updates the budget validation', () => {
    const state = useGameStore.getState();
    state.selectVehicle(coreVehicle);
    expect(useGameStore.getState().launchConfig.validationSummary?.isBudgetCleared).toBe(true);

    state.selectVehicle(superHeavyVehicle);
    expect(useGameStore.getState().launchConfig.validationSummary?.isBudgetCleared).toBe(false);
  });

  it('5. An over-budget configuration is marked BLOCKED', () => {
    const state = useGameStore.getState();
    state.selectVehicle(superHeavyVehicle);

    const updatedState = useGameStore.getState();
    expect(updatedState.launchConfig.isCompatible).toBe(false);
    expect(updatedState.launchConfig.status).toBe('BLOCKED');
    expect(updatedState.launchConfig.validationSummary?.overallStatus).toBe('BLOCKED');
  });

  it('6. A valid configuration is marked VALID', () => {
    const state = useGameStore.getState();
    state.selectVehicle(coreVehicle);

    const updatedState = useGameStore.getState();
    expect(updatedState.launchConfig.isCompatible).toBe(true);
    expect(updatedState.launchConfig.status).toBe('VALIDATED');
    expect(updatedState.launchConfig.validationSummary?.overallStatus).toBe('VALID');
  });

  it('7. The review modal and checklist derive identical validation statuses from the store', () => {
    const state = useGameStore.getState();
    state.selectVehicle(superHeavyVehicle);

    const currentVehicle = useGameStore.getState().selectedVehicle;
    const currentOrbit = useGameStore.getState().selectedOrbit;
    const currentDesign = useGameStore.getState().currentDesign;
    const currentScenario = useGameStore.getState().selectedScenario;

    // Both checklist and review modal evaluate getDetailedLaunchValidation against store state
    const validation = getDetailedLaunchValidation(
      currentVehicle,
      currentOrbit,
      currentDesign.resources.totalMassKg,
      currentScenario.budgetMUSD,
      currentDesign.resources.totalCostMUSD,
      undefined,
      currentScenario
    );

    expect(validation.overallStatus).toBe('BLOCKED');
    expect(validation.totalMissionCostMUSD).toBe(242.4);
    expect(validation.maxBudgetWithBufferMUSD).toBe(161.0);
    expect(useGameStore.getState().launchConfig.validationSummary?.overallStatus).toBe(validation.overallStatus);
    expect(useGameStore.getState().launchConfig.totalCostMUSD).toBe(validation.totalMissionCostMUSD);
  });

  it('8. An invalid configuration cannot be confirmed', () => {
    const state = useGameStore.getState();
    state.selectVehicle(superHeavyVehicle);

    const confirmResult = state.confirmLaunchConfiguration();
    expect(confirmResult).toBe(false);
    expect(state.getLaunchHandoff()).toBeNull();
    expect(useGameStore.getState().launchConfig.status).toBe('BLOCKED');
  });

  it('9. A valid configuration can be confirmed', () => {
    const state = useGameStore.getState();
    state.selectVehicle(coreVehicle);

    const confirmResult = state.confirmLaunchConfiguration();
    expect(confirmResult).toBe(true);
    expect(useGameStore.getState().launchConfig.status).toBe('CONFIRMED');
    expect(state.getLaunchHandoff()).not.toBeNull();
  });

  it('10. Changing orbit or vehicle preserves the remaining draft selections', () => {
    const state = useGameStore.getState();
    state.selectVehicle(coreVehicle);
    const designBefore = state.currentDesign;

    // Change orbit to Polar
    state.selectOrbit(polarOrbit);
    const stateAfterOrbit = useGameStore.getState();
    expect(stateAfterOrbit.selectedOrbit.id).toBe('orbit-polar');
    expect(stateAfterOrbit.selectedVehicle.id).toBe('vehicle-orbital-core');
    expect(stateAfterOrbit.currentDesign.id).toBe(designBefore.id);
    expect(stateAfterOrbit.currentDesign.resources.totalMassKg).toBe(designBefore.resources.totalMassKg);

    // Change vehicle to SuperHeavy
    state.selectVehicle(superHeavyVehicle);
    const stateAfterVehicle = useGameStore.getState();
    expect(stateAfterVehicle.selectedOrbit.id).toBe('orbit-polar');
    expect(stateAfterVehicle.selectedVehicle.id).toBe('vehicle-orbital-superheavy');
    expect(stateAfterVehicle.currentDesign.id).toBe(designBefore.id);
  });

  it('11. Developer 04 receives the correct selected vehicle and validated configuration', () => {
    const state = useGameStore.getState();
    state.selectVehicle(coreVehicle);
    state.confirmLaunchConfiguration();

    const handoff = state.getLaunchHandoff();
    expect(handoff).not.toBeNull();
    expect(handoff?.vehicle.id).toBe('vehicle-orbital-core');
    expect(handoff?.configuration.vehicleId).toBe('vehicle-orbital-core');
    expect(handoff?.configuration.totalCostMUSD).toBe(121.4);
    expect(handoff?.configuration.status).toBe('CONFIRMED');
    expect(handoff?.isReadyForOperations).toBe(true);
  });

  it('12. Reopening or re-evaluating the review modal displays the latest state, not stale data', () => {
    const state = useGameStore.getState();

    // 1. Initially Core
    state.selectVehicle(coreVehicle);
    expect(useGameStore.getState().selectedVehicle.id).toBe('vehicle-orbital-core');

    // 2. Switched to SuperHeavy
    state.selectVehicle(superHeavyVehicle);
    const latestState = useGameStore.getState();
    expect(latestState.selectedVehicle.id).toBe('vehicle-orbital-superheavy');
    expect(latestState.launchConfig.totalCostMUSD).toBe(242.4);

    // Evaluation for modal reflects latest store vehicle
    const liveModalValidation = getDetailedLaunchValidation(
      latestState.selectedVehicle,
      latestState.selectedOrbit,
      latestState.currentDesign.resources.totalMassKg,
      latestState.selectedScenario.budgetMUSD,
      latestState.currentDesign.resources.totalCostMUSD,
      undefined,
      latestState.selectedScenario
    );
    expect(liveModalValidation.boosterCostMUSD).toBe(175.0);
    expect(liveModalValidation.totalMissionCostMUSD).toBe(242.4);
    expect(liveModalValidation.overallStatus).toBe('BLOCKED');
  });
});
