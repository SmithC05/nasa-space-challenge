import { describe, expect, it } from 'vitest';
import {
  LAUNCH_VEHICLES,
  MISSION_SCENARIOS,
  ORBIT_PROFILES
} from '@orbital/game-data';
import { SpacecraftDesign } from '@orbital/contracts';
import {
  calculateVehicleOrbitCapacity,
  createLaunchHandoff,
  getDetailedLaunchValidation,
  validateLaunchConfiguration
} from '../index';

describe('ORBITAL Phase 5 Bug Fix: Launch Vehicle State Synchronization & Budget Protection', () => {
  const earthSentinel = MISSION_SCENARIOS.find((s) => s.id === 'scenario-earth-sentinel')!;
  const coreVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-core')!;
  const superHeavyVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-superheavy')!;
  const ssoOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-sso')!;
  const geoOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-geo')!;

  const testSpacecraft: SpacecraftDesign = {
    id: 'design-sentinel-alpha',
    name: 'Sentinel-1 Alpha',
    scenarioId: earthSentinel.id,
    busId: 'bus-smallsat-standard',
    selectedComponentIds: [
      'bus-smallsat-standard',
      'power-solar-standard-wings',
      'power-batt-li-ion',
      'comms-ka-dish',
      'inst-multispectral-imager',
      'aocs-reaction-wheels'
    ],
    resources: {
      totalMassKg: 1320,
      maxMassKg: 1500,
      massMarginKg: 180,
      totalCostMUSD: 67.4,
      budgetMUSD: 140,
      costMarginMUSD: 72.6,
      powerDayGenW: 1200,
      powerConsumptionW: 55,
      dayPowerMarginW: 1145,
      nightPowerDeficitW: 55,
      batteryCapacityWh: 1500,
      batteryEnduranceMin: 60,
      eclipseDurationMin: 35,
      dataRateMbps: 120,
      deltaVAvailableMps: 250,
      averageReliabilityPct: 98
    },
    validation: {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    },
    updatedAt: new Date().toISOString()
  };

  // Scenario budget: $140M base, 15% buffer ceiling = $161.0M
  const baseBudget = earthSentinel.budgetMUSD; // 140
  const budgetCeiling = Math.round(baseBudget * 1.15 * 10) / 10; // 161.0

  it('1. verifies selecting ORBITAL-Core calculates nominal costs and valid status', () => {
    const valCore = getDetailedLaunchValidation(
      coreVehicle,
      ssoOrbit,
      testSpacecraft.resources.totalMassKg,
      baseBudget,
      testSpacecraft.resources.totalCostMUSD,
      undefined,
      earthSentinel
    );

    expect(coreVehicle.id).toBe('vehicle-orbital-core');
    expect(valCore.spacecraftCostMUSD).toBe(67.4);
    expect(valCore.boosterCostMUSD).toBe(54.0);
    expect(valCore.totalMissionCostMUSD).toBe(121.4);
    expect(valCore.maxBudgetWithBufferMUSD).toBe(161.0);
    expect(valCore.budgetStatus).toBe('WITHIN_BUDGET');
    expect(valCore.isBudgetCleared).toBe(true);
    expect(valCore.isOverallCleared).toBe(true);
    expect(valCore.overallStatus).toBe('VALID');
  });

  it('2. verifies selecting ORBITAL-SuperHeavy recalculates total cost to $242.4M and exceeds $161M ceiling', () => {
    const valSuperHeavy = getDetailedLaunchValidation(
      superHeavyVehicle,
      ssoOrbit,
      testSpacecraft.resources.totalMassKg,
      baseBudget,
      testSpacecraft.resources.totalCostMUSD,
      undefined,
      earthSentinel
    );

    expect(superHeavyVehicle.id).toBe('vehicle-orbital-superheavy');
    expect(valSuperHeavy.spacecraftCostMUSD).toBe(67.4);
    expect(valSuperHeavy.boosterCostMUSD).toBe(175.0);
    // 67.4 + 175.0 = 242.4M
    expect(valSuperHeavy.totalMissionCostMUSD).toBe(242.4);
    expect(valSuperHeavy.maxBudgetWithBufferMUSD).toBe(161.0);
    // Overrun: 242.4 - 161.0 = +81.4M
    expect(valSuperHeavy.totalMissionCostMUSD).toBeGreaterThan(budgetCeiling);
    expect(valSuperHeavy.budgetStatus).toBe('BUDGET_EXCEEDED');
    expect(valSuperHeavy.isBudgetCleared).toBe(false);
    expect(valSuperHeavy.isOverallCleared).toBe(false);
    expect(valSuperHeavy.overallStatus).toBe('BLOCKED');
    expect(valSuperHeavy.budgetErrors.some((e) => e.includes('$81.4M') || e.includes('exceeds'))).toBe(true);
  });

  it('3. verifies switching between vehicles recalculates payload margin and capacities immediately', () => {
    // Core in SSO: capacity 12,870 kg - 1,320 kg = +11,550 kg
    const valCore = getDetailedLaunchValidation(
      coreVehicle,
      ssoOrbit,
      testSpacecraft.resources.totalMassKg,
      baseBudget,
      testSpacecraft.resources.totalCostMUSD,
      undefined,
      earthSentinel
    );
    expect(valCore.effectiveCapacityKg).toBe(12870);
    expect(valCore.payloadMarginKg).toBe(11550);

    // SuperHeavy in SSO: capacity 74,100 kg - 1,320 kg = +72,780 kg
    const valSuperHeavy = getDetailedLaunchValidation(
      superHeavyVehicle,
      ssoOrbit,
      testSpacecraft.resources.totalMassKg,
      baseBudget,
      testSpacecraft.resources.totalCostMUSD,
      undefined,
      earthSentinel
    );
    expect(valSuperHeavy.effectiveCapacityKg).toBe(74100);
    expect(valSuperHeavy.payloadMarginKg).toBe(72780);
  });

  it('4. verifies validateLaunchConfiguration reflects BLOCKED status for SuperHeavy', () => {
    const configSuperHeavy = validateLaunchConfiguration(
      superHeavyVehicle,
      ssoOrbit,
      testSpacecraft.resources.totalMassKg,
      baseBudget,
      testSpacecraft.resources.totalCostMUSD,
      earthSentinel,
      testSpacecraft
    );

    expect(configSuperHeavy.vehicleId).toBe('vehicle-orbital-superheavy');
    expect(configSuperHeavy.isCompatible).toBe(false);
    expect(configSuperHeavy.status).toBe('BLOCKED');
    expect(configSuperHeavy.totalCostMUSD).toBe(242.4);
    expect(configSuperHeavy.validationSummary?.overallStatus).toBe('BLOCKED');
    expect(configSuperHeavy.validationSummary?.isBudgetCleared).toBe(false);
  });

  it('5. verifies createLaunchHandoff strictly rejects operations readiness for budget-blocked vehicle', () => {
    const handoffSuperHeavy = createLaunchHandoff(
      superHeavyVehicle,
      ssoOrbit,
      testSpacecraft,
      earthSentinel
    );

    expect(handoffSuperHeavy.vehicle.id).toBe('vehicle-orbital-superheavy');
    expect(handoffSuperHeavy.isReadyForOperations).toBe(false);
    expect(handoffSuperHeavy.configuration.status).toBe('BLOCKED');
    expect(handoffSuperHeavy.configuration.isCompatible).toBe(false);
    expect(handoffSuperHeavy.configuration.totalCostMUSD).toBe(242.4);
  });

  it('6. verifies switching back from SuperHeavy to Core immediately clears launch and authorizes ops handoff', () => {
    // 1. Blocked state on SuperHeavy
    const handoffSuperHeavy = createLaunchHandoff(
      superHeavyVehicle,
      ssoOrbit,
      testSpacecraft,
      earthSentinel
    );
    expect(handoffSuperHeavy.isReadyForOperations).toBe(false);

    // 2. Switched back to Core
    const handoffCore = createLaunchHandoff(
      coreVehicle,
      ssoOrbit,
      testSpacecraft,
      earthSentinel
    );

    expect(handoffCore.vehicle.id).toBe('vehicle-orbital-core');
    expect(handoffCore.isReadyForOperations).toBe(true);
    expect(handoffCore.configuration.status).toBe('CONFIRMED');
    expect(handoffCore.configuration.isCompatible).toBe(true);
    expect(handoffCore.configuration.totalCostMUSD).toBe(121.4);
    expect(handoffCore.validation.overallStatus).toBe('VALID');
  });

  it('7. verifies Developer 04 handoff receives the currently selected vehicle, never a stale vehicle', () => {
    const handoff = createLaunchHandoff(
      coreVehicle,
      ssoOrbit,
      testSpacecraft,
      earthSentinel
    );

    expect(handoff.vehicle.id).toBe('vehicle-orbital-core');
    expect(handoff.vehicle.name).toBe('ORBITAL-Core');
    expect(handoff.configuration.vehicleId).toBe('vehicle-orbital-core');
    expect(handoff.configuration.estimatedCostMUSD).toBe(54.0);
    expect(handoff.configuration.totalCostMUSD).toBe(121.4);
    expect(handoff.spacecraft.name).toBe('Sentinel-1 Alpha');
    expect(handoff.scenario.id).toBe('scenario-earth-sentinel');
  });
});
