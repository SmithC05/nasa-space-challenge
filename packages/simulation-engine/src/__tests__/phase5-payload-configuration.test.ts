import { describe, expect, it } from 'vitest';
import {
  LAUNCH_VEHICLES,
  MISSION_SCENARIOS,
  ORBIT_PROFILES,
  SPACECRAFT_COMPONENTS
} from '@orbital/game-data';
import { SpacecraftDesign } from '@orbital/contracts';
import {
  calculateSpacecraftDimensions,
  calculateVehicleOrbitCapacity,
  createLaunchHandoff,
  getDetailedLaunchValidation,
  validateLaunchConfiguration,
  validateLaunchVehicleSuitability
} from '../index';

describe('ORBITAL Phase 5: Payload Compatibility & Launch Configuration Workflow', () => {
  const earthSentinel = MISSION_SCENARIOS.find((s) => s.id === 'scenario-earth-sentinel')!;
  const aresRecon = MISSION_SCENARIOS.find((s) => s.id === 'scenario-ares-recon')!;

  const liteVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-lite')!;
  const coreVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-core')!;
  const heavyVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-heavy')!;

  const leoOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-leo')!;
  const ssoOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-sso')!;
  const polarOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-polar')!;
  const geoOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-geo')!;

  const nominalSpacecraft: SpacecraftDesign = {
    id: 'design-sentinel-test',
    name: 'Sentinel-1 Alpha',
    scenarioId: earthSentinel.id,
    busId: 'bus-smallsat-standard',
    selectedComponentIds: ['bus-smallsat-standard', 'power-solar-standard-wings'],
    resources: {
      totalMassKg: 368,
      maxMassKg: 1200,
      massMarginKg: 832,
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

  // =========================================================================
  // 1. PAYLOAD WITHIN VEHICLE CAPACITY
  // =========================================================================
  it('1. verifies payload within vehicle capacity yields positive margin and compatible state', () => {
    // 368 kg on ORBITAL-Lite in SSO (capacity = 507 kg, margin = +139 kg)
    const val = getDetailedLaunchValidation(
      liteVehicle,
      ssoOrbit,
      nominalSpacecraft.resources.totalMassKg,
      earthSentinel.budgetMUSD,
      nominalSpacecraft.resources.totalCostMUSD,
      undefined,
      earthSentinel
    );

    expect(val.effectiveCapacityKg).toBe(507);
    expect(val.payloadMarginKg).toBe(139);
    expect(val.isPayloadCompatible).toBe(true);
    expect(val.technicalErrors).toHaveLength(0);
  });

  // =========================================================================
  // 2. PAYLOAD EXCEEDING CAPACITY
  // =========================================================================
  it('2. verifies payload exceeding capacity fails payload compatibility and blocks clearance', () => {
    const overweightMassKg = 650; // exceeds ORBITAL-Lite SSO capacity (507 kg)
    const val = getDetailedLaunchValidation(
      liteVehicle,
      ssoOrbit,
      overweightMassKg,
      earthSentinel.budgetMUSD,
      nominalSpacecraft.resources.totalCostMUSD,
      undefined,
      earthSentinel
    );

    expect(val.isPayloadCompatible).toBe(false);
    expect(val.payloadMarginKg).toBe(-143);
    expect(val.isTechnicallyCompatible).toBe(false);
    expect(val.isOverallCleared).toBe(false);
    expect(val.overallStatus).toBe('CRITICAL');
    expect(val.technicalErrors.some((e) => e.includes('exceeds ORBITAL-Lite capacity'))).toBe(true);
  });

  // =========================================================================
  // 3. FAIRING DIAMETER INCOMPATIBILITY
  // =========================================================================
  it('3. detects dynamic fairing diameter envelope incompatibility', () => {
    // ORBITAL-Lite outer fairing = 1.8m, max usable ~ 1.58m
    const oversizedDiameter = { diameterM: 2.1, heightM: 2.0 };
    const val = getDetailedLaunchValidation(
      liteVehicle,
      ssoOrbit,
      nominalSpacecraft.resources.totalMassKg,
      earthSentinel.budgetMUSD,
      nominalSpacecraft.resources.totalCostMUSD,
      oversizedDiameter,
      earthSentinel
    );

    expect(val.isFairingCompatible).toBe(false);
    expect(val.isTechnicallyCompatible).toBe(false);
    expect(val.isOverallCleared).toBe(false);
    expect(val.overallStatus).toBe('CRITICAL');
    expect(val.technicalErrors.some((e) => e.includes('Spacecraft diameter (2.1m) exceeds'))).toBe(true);
  });

  // =========================================================================
  // 4. FAIRING HEIGHT INCOMPATIBILITY
  // =========================================================================
  it('4. detects dynamic fairing vertical clearance incompatibility', () => {
    // ORBITAL-Lite total fairing height = 3.5m, max usable ~ 2.87m
    const tallSpacecraft = { diameterM: 1.2, heightM: 3.4 };
    const val = getDetailedLaunchValidation(
      liteVehicle,
      ssoOrbit,
      nominalSpacecraft.resources.totalMassKg,
      earthSentinel.budgetMUSD,
      nominalSpacecraft.resources.totalCostMUSD,
      tallSpacecraft,
      earthSentinel
    );

    expect(val.isFairingCompatible).toBe(false);
    expect(val.isTechnicallyCompatible).toBe(false);
    expect(val.isOverallCleared).toBe(false);
    expect(val.overallStatus).toBe('CRITICAL');
    expect(val.technicalErrors.some((e) => e.includes('Spacecraft height (3.4m) exceeds usable fairing height'))).toBe(true);
  });

  // =========================================================================
  // 5. UNSUPPORTED ORBIT AND VEHICLE COMBINATION
  // =========================================================================
  it('5. identifies unsupported orbit regime and lack of high-energy upper stage capacity', () => {
    // ORBITAL-Lite has no direct GEO injection capability
    const val = getDetailedLaunchValidation(
      liteVehicle,
      geoOrbit,
      100, // Small mass
      200,
      50
    );

    expect(val.isOrbitCompatible).toBe(false);
    expect(val.isTechnicallyCompatible).toBe(false);
    expect(val.isOverallCleared).toBe(false);
    expect(val.overallStatus).toBe('CRITICAL');
    expect(val.technicalErrors.some((e) => e.includes('lacks high-energy upper stage capacity'))).toBe(true);
  });

  // =========================================================================
  // 6. EARTH SENTINEL + GEO BLOCKED
  // =========================================================================
  it('6. strictly blocks Earth Sentinel in GEO due to polar ice cap coverage mandate', () => {
    const val = getDetailedLaunchValidation(
      coreVehicle,
      geoOrbit,
      nominalSpacecraft.resources.totalMassKg,
      earthSentinel.budgetMUSD,
      nominalSpacecraft.resources.totalCostMUSD,
      undefined,
      earthSentinel
    );

    // Vehicle payload is compatible (+5,432 kg margin) and budget is cleared ($121.4M <= $140M)
    expect(val.isTechnicallyCompatible).toBe(true);
    expect(val.isBudgetCleared).toBe(true);

    // Mission mandate gate FAILS
    expect(val.isMissionSuitable).toBe(false);
    expect(val.missionSuitabilityStatus).toBe('UNSUITABLE');
    expect(val.polarCoverageSatisfied).toBe(false);
    expect(val.isOverallCleared).toBe(false);
    expect(val.overallStatus).toBe('BLOCKED');
    expect(val.missionErrors[0]).toContain('Mission Mandate Violation: Earth Sentinel requires polar ice cap coverage');
  });

  // =========================================================================
  // 7. EARTH SENTINEL + SSO OPTIMAL
  // =========================================================================
  it('7. confirms Earth Sentinel in SSO as optimal profile with full polar coverage', () => {
    const val = getDetailedLaunchValidation(
      coreVehicle,
      ssoOrbit,
      nominalSpacecraft.resources.totalMassKg,
      earthSentinel.budgetMUSD,
      nominalSpacecraft.resources.totalCostMUSD,
      undefined,
      earthSentinel
    );

    expect(val.isTechnicallyCompatible).toBe(true);
    expect(val.isBudgetCleared).toBe(true);
    expect(val.isMissionSuitable).toBe(true);
    expect(val.missionSuitabilityStatus).toBe('OPTIMAL');
    expect(val.polarCoverageSatisfied).toBe(true);
    expect(val.isOverallCleared).toBe(true);
    expect(val.overallStatus).toBe('VALID');
  });

  // =========================================================================
  // 8. EARTH SENTINEL + POLAR OPTIMAL
  // =========================================================================
  it('8. confirms Earth Sentinel in 90° Polar orbit as optimal candidate with direct pole crossings', () => {
    const val = getDetailedLaunchValidation(
      coreVehicle,
      polarOrbit,
      nominalSpacecraft.resources.totalMassKg,
      earthSentinel.budgetMUSD,
      nominalSpacecraft.resources.totalCostMUSD,
      undefined,
      earthSentinel
    );

    expect(val.isTechnicallyCompatible).toBe(true);
    expect(val.isBudgetCleared).toBe(true);
    expect(val.isMissionSuitable).toBe(true);
    expect(val.missionSuitabilityStatus).toBe('OPTIMAL');
    expect(val.polarCoverageSatisfied).toBe(true);
    expect(val.isOverallCleared).toBe(true);
    expect(val.overallStatus).toBe('VALID');
  });

  // =========================================================================
  // 9. EARTH SENTINEL + LEO WARNING
  // =========================================================================
  it('9. permits Earth Sentinel in LEO (51.6°) with explicit mid-latitude limitation warning', () => {
    const val = getDetailedLaunchValidation(
      coreVehicle,
      leoOrbit,
      nominalSpacecraft.resources.totalMassKg,
      earthSentinel.budgetMUSD,
      nominalSpacecraft.resources.totalCostMUSD,
      undefined,
      earthSentinel
    );

    expect(val.isTechnicallyCompatible).toBe(true);
    expect(val.isBudgetCleared).toBe(true);
    expect(val.isMissionSuitable).toBe(true);
    expect(val.missionSuitabilityStatus).toBe('ACCEPTABLE_WITH_WARNING');
    expect(val.polarCoverageSatisfied).toBe(false);
    expect(val.isOverallCleared).toBe(true);
    expect(val.overallStatus).toBe('WARNING');
    expect(val.warnings.some((w) => w.includes('excludes Arctic and Antarctic ice sheets'))).toBe(true);
  });

  // =========================================================================
  // 10. BUDGET WITHIN ALLOWANCE
  // =========================================================================
  it('10. clears launch when total mission cost is within base budget and contingency allowance', () => {
    // ORBITAL-Core ($54M) + Spacecraft ($67.4M) = $121.4M <= $140M
    const val = getDetailedLaunchValidation(
      coreVehicle,
      ssoOrbit,
      nominalSpacecraft.resources.totalMassKg,
      earthSentinel.budgetMUSD,
      nominalSpacecraft.resources.totalCostMUSD,
      undefined,
      earthSentinel
    );

    expect(val.totalMissionCostMUSD).toBe(121.4);
    expect(val.isWithinBaseBudget).toBe(true);
    expect(val.isWithinContingencyBudget).toBe(true);
    expect(val.isBudgetCleared).toBe(true);
    expect(val.budgetStatus).toBe('WITHIN_BUDGET');
    expect(val.budgetBufferRemainingMUSD).toBe(18.6);
  });

  // =========================================================================
  // 11. BUDGET EXCEEDING ALLOWANCE
  // =========================================================================
  it('11. flags budget deficit and distinguishes budget failure from technical compatibility', () => {
    // ORBITAL-Heavy ($98.0M) + Spacecraft ($67.4M) = $165.4M > $161.0M (140 * 1.15)
    const val = getDetailedLaunchValidation(
      heavyVehicle,
      ssoOrbit,
      nominalSpacecraft.resources.totalMassKg,
      earthSentinel.budgetMUSD,
      nominalSpacecraft.resources.totalCostMUSD,
      undefined,
      earthSentinel
    );

    // Technical compatibility passes completely
    expect(val.isTechnicallyCompatible).toBe(true);
    expect(val.payloadMarginKg).toBe(18742);

    // Budget fails
    expect(val.isWithinBaseBudget).toBe(false);
    expect(val.isWithinContingencyBudget).toBe(false);
    expect(val.isBudgetCleared).toBe(false);
    expect(val.budgetStatus).toBe('BUDGET_EXCEEDED');
    expect(val.budgetOverrunMUSD).toBe(4.4);

    // Clearance withheld due to budget
    expect(val.isOverallCleared).toBe(false);
    expect(val.overallStatus).toBe('BLOCKED');
  });

  // =========================================================================
  // 12. CONFIGURATION CONFIRMATION BLOCKED AFTER A CRITICAL FAILURE
  // =========================================================================
  it('12. ensures configuration confirmation is blocked when mandatory gates fail', () => {
    // Earth Sentinel + GEO on ORBITAL-Core (unsuitable orbit mandate)
    const config = validateLaunchConfiguration(
      coreVehicle,
      geoOrbit,
      nominalSpacecraft.resources.totalMassKg,
      earthSentinel.budgetMUSD,
      nominalSpacecraft.resources.totalCostMUSD,
      earthSentinel,
      nominalSpacecraft
    );

    expect(config.isCompatible).toBe(false);
    expect(config.status).toBe('BLOCKED');
    expect(config.validationSummary?.isMissionSuitable).toBe(false);
    expect(config.validationSummary?.overallStatus).toBe('BLOCKED');

    const handoff = createLaunchHandoff(
      coreVehicle,
      geoOrbit,
      nominalSpacecraft,
      earthSentinel
    );

    expect(handoff.isReadyForOperations).toBe(false);
    expect(handoff.configuration.isCompatible).toBe(false);
    expect(handoff.configuration.status).toBe('BLOCKED');
  });

  // =========================================================================
  // 13. CONFIGURATION CONFIRMATION ALLOWED WHEN MANDATORY GATES PASS
  // =========================================================================
  it('13. allows launch confirmation and creates verified handoff when all mandatory gates pass', () => {
    // Earth Sentinel + SSO on ORBITAL-Core (all gates valid)
    const config = validateLaunchConfiguration(
      coreVehicle,
      ssoOrbit,
      nominalSpacecraft.resources.totalMassKg,
      earthSentinel.budgetMUSD,
      nominalSpacecraft.resources.totalCostMUSD,
      earthSentinel,
      nominalSpacecraft
    );

    expect(config.isCompatible).toBe(true);
    expect(config.status).toBe('VALIDATED');
    expect(config.validationSummary?.isTechnicallyCompatible).toBe(true);
    expect(config.validationSummary?.isBudgetCleared).toBe(true);
    expect(config.validationSummary?.isMissionSuitable).toBe(true);
    expect(config.validationSummary?.overallStatus).toBe('VALID');

    const handoff = createLaunchHandoff(
      coreVehicle,
      ssoOrbit,
      nominalSpacecraft,
      earthSentinel
    );

    expect(handoff.isReadyForOperations).toBe(true);
    expect(handoff.configuration.isCompatible).toBe(true);
    expect(handoff.configuration.status).toBe('CONFIRMED');
    expect(handoff.configuration.confirmedAt).toBeDefined();
  });

  // =========================================================================
  // 14. CONFIGURATION DRAFT PRESERVED WHEN NAVIGATING BACKWARD
  // =========================================================================
  it('14. preserves configuration draft and dynamically updates when changing selections', () => {
    // Initial selection: ORBITAL-Core in SSO
    const configSSO = validateLaunchConfiguration(
      coreVehicle,
      ssoOrbit,
      nominalSpacecraft.resources.totalMassKg,
      earthSentinel.budgetMUSD,
      nominalSpacecraft.resources.totalCostMUSD,
      earthSentinel,
      nominalSpacecraft
    );
    expect(configSSO.isCompatible).toBe(true);
    expect(configSSO.orbitId).toBe('orbit-sso');
    expect(configSSO.vehicleId).toBe('vehicle-orbital-core');

    // User navigates backward to change orbit to GEO: updates reactively to BLOCKED
    const configGEO = validateLaunchConfiguration(
      coreVehicle,
      geoOrbit,
      nominalSpacecraft.resources.totalMassKg,
      earthSentinel.budgetMUSD,
      nominalSpacecraft.resources.totalCostMUSD,
      earthSentinel,
      nominalSpacecraft
    );
    expect(configGEO.isCompatible).toBe(false);
    expect(configGEO.orbitId).toBe('orbit-geo');
    expect(configGEO.status).toBe('BLOCKED');

    // User navigates back to SSO: restores compatibility cleanly without state contamination
    const restoredConfig = validateLaunchConfiguration(
      coreVehicle,
      ssoOrbit,
      nominalSpacecraft.resources.totalMassKg,
      earthSentinel.budgetMUSD,
      nominalSpacecraft.resources.totalCostMUSD,
      earthSentinel,
      nominalSpacecraft
    );
    expect(restoredConfig.isCompatible).toBe(true);
    expect(restoredConfig.orbitId).toBe('orbit-sso');
    expect(restoredConfig.status).toBe('VALIDATED');
  });

  // =========================================================================
  // 15. DEVELOPER 04 HANDOFF CONTAINS THE CORRECT CONFIGURATION DATA
  // =========================================================================
  it('15. verifies Developer 04 handoff contains all required typed parameters to initialize Mission Operations', () => {
    const handoff = createLaunchHandoff(
      coreVehicle,
      ssoOrbit,
      nominalSpacecraft,
      earthSentinel
    );

    // 1. Mission identifier
    expect(handoff.scenario.id).toBe('scenario-earth-sentinel');
    expect(handoff.configuration.scenarioId).toBe('scenario-earth-sentinel');

    // 2. Spacecraft identifier and relevant design snapshot
    expect(handoff.spacecraft.id).toBe(nominalSpacecraft.id);
    expect(handoff.configuration.spacecraftId).toBe(nominalSpacecraft.id);
    expect(handoff.configuration.spacecraftName).toBe('Sentinel-1 Alpha');
    expect(handoff.spacecraft.resources.totalMassKg).toBe(368);

    // 3. Orbit profile identifier
    expect(handoff.orbit.id).toBe('orbit-sso');
    expect(handoff.configuration.orbitId).toBe('orbit-sso');

    // 4. Launch vehicle identifier
    expect(handoff.vehicle.id).toBe('vehicle-orbital-core');
    expect(handoff.configuration.vehicleId).toBe('vehicle-orbital-core');

    // 5. Validated payload information
    expect(handoff.configuration.spacecraftMassKg).toBe(368);
    expect(handoff.configuration.payloadMarginKg).toBe(12502);

    // 6. Validation results & summary
    expect(handoff.configuration.isCompatible).toBe(true);
    expect(handoff.configuration.validationSummary).toBeDefined();
    expect(handoff.configuration.validationSummary?.isTechnicallyCompatible).toBe(true);
    expect(handoff.configuration.validationSummary?.isMissionSuitable).toBe(true);
    expect(handoff.configuration.validationSummary?.overallStatus).toBe('VALID');

    // 7. Cost and budget information
    expect(handoff.configuration.estimatedCostMUSD).toBe(54.0);
    expect(handoff.configuration.totalCostMUSD).toBe(121.4);

    // 8. Configuration status & readiness
    expect(handoff.configuration.status).toBe('CONFIRMED');
    expect(handoff.isReadyForOperations).toBe(true);
    expect(handoff.handoffTimestamp).toBeDefined();
  });
});
