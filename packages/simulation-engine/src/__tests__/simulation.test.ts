import { describe, expect, it } from 'vitest';
import {
  calculateEclipseFraction,
  calculateOrbitalPeriod,
  calculateOrbitalVelocity,
  calculateSpacecraftResources,
  createInitialSimulationState,
  getSemiMajorAxis,
  resolveMissionEvent,
  tickSimulation,
  validateLaunchConfiguration,
  validateSpacecraftDesign
} from '../index';
import {
  LAUNCH_VEHICLES,
  MISSION_EVENTS,
  MISSION_SCENARIOS,
  ORBIT_PROFILES,
  SPACECRAFT_COMPONENTS
} from '@orbital/game-data';

describe('ORBITAL Astrodynamics Engine', () => {
  it('calculates semi-major axis correctly', () => {
    const a = getSemiMajorAxis(400, 400); // LEO circular 400km
    expect(a).toBeCloseTo(6778.137, 2);
  });

  it('calculates orbital period for LEO (around 92.5 minutes)', () => {
    const period = calculateOrbitalPeriod(400, 400);
    expect(period).toBeGreaterThan(90);
    expect(period).toBeLessThan(95);
  });

  it('calculates circular orbital velocity (approx 7.67 km/s)', () => {
    const v = calculateOrbitalVelocity(400, 400, 400);
    expect(v).toBeGreaterThan(7.6);
    expect(v).toBeLessThan(7.8);
  });

  it('calculates eclipse fraction within reasonable bound (0.3 - 0.45)', () => {
    const frac = calculateEclipseFraction(400, 400);
    expect(frac).toBeGreaterThanOrEqual(0.3);
    expect(frac).toBeLessThanOrEqual(0.45);
  });
});

describe('ORBITAL Spacecraft Resource Engine', () => {
  const scenario = MISSION_SCENARIOS[0]; // Earth Sentinel
  const orbit = ORBIT_PROFILES[0]; // LEO

  it('correctly sums mass, power generation, and consumption', () => {
    const components = SPACECRAFT_COMPONENTS.filter((c) =>
      ['bus-smallsat-standard', 'power-solar-standard-wings', 'power-batt-li-ion'].includes(c.id)
    );
    const resources = calculateSpacecraftResources(components, scenario, orbit);

    expect(resources.totalMassKg).toBe(180 + 45 + 28);
    expect(resources.powerDayGenW).toBe(1200);
    expect(resources.powerConsumptionW).toBe(45 + 10);
    expect(resources.dayPowerMarginW).toBe(1200 - 55);
    expect(resources.batteryCapacityWh).toBe(1800);
  });

  it('flags validation errors when critical subsystems are omitted', () => {
    // Only bus, missing power generation and battery
    const components = SPACECRAFT_COMPONENTS.filter((c) => c.id === 'bus-smallsat-standard');
    const resources = calculateSpacecraftResources(components, scenario, orbit);
    const validation = validateSpacecraftDesign(components, resources, scenario);

    expect(validation.isValid).toBe(false);
    expect(validation.errors.some((e) => e.includes('No solar or power generator'))).toBe(true);
    expect(validation.errors.some((e) => e.includes('No energy storage'))).toBe(true);
  });

  it('validates a complete, sound spacecraft design', () => {
    const components = SPACECRAFT_COMPONENTS.filter((c) =>
      [
        'bus-smallsat-standard',
        'power-solar-standard-wings',
        'power-batt-li-ion',
        'comms-ka-dish',
        'aocs-reaction-wheels',
        'inst-multispectral-imager'
      ].includes(c.id)
    );
    const resources = calculateSpacecraftResources(components, scenario, orbit);
    const validation = validateSpacecraftDesign(components, resources, scenario);

    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});

describe('ORBITAL Launch Configuration Validation', () => {
  it('validates compatible booster payload capacity', () => {
    const vehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-core' || v.id === 'vehicle-phoenix-medium')!;
    const orbit = ORBIT_PROFILES[0];
    const config = validateLaunchConfiguration(vehicle, orbit, 800, 150, 45);

    expect(config.isCompatible).toBe(true);
    expect(config.payloadMarginKg).toBeGreaterThan(0);
  });

  it('rejects booster if payload mass exceeds vehicle capability', () => {
    const lightVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-lite' || v.id === 'vehicle-nova-light')!; // 650kg LEO
    const orbit = ORBIT_PROFILES[0];
    const config = validateLaunchConfiguration(lightVehicle, orbit, 2500, 150, 45);

    expect(config.isCompatible).toBe(false);
    expect(config.payloadMarginKg).toBeLessThan(0);
  });
});

describe('ORBITAL Simulation Telemetry Step & Events', () => {
  it('initializes telemetry state correctly', () => {
    const design = {
      id: 'test-design',
      name: 'Vanguard',
      scenarioId: 'scenario-earth-sentinel',
      busId: 'bus-smallsat-standard',
      selectedComponentIds: [],
      resources: {
        totalMassKg: 500,
        maxMassKg: 1200,
        massMarginKg: 700,
        totalCostMUSD: 40,
        budgetMUSD: 140,
        costMarginMUSD: 100,
        powerDayGenW: 1000,
        powerConsumptionW: 200,
        dayPowerMarginW: 800,
        nightPowerDeficitW: 200,
        batteryCapacityWh: 2000,
        batteryEnduranceMin: 600,
        eclipseDurationMin: 32,
        dataRateMbps: 100,
        deltaVAvailableMps: 0,
        averageReliabilityPct: 98
      },
      validation: { isValid: true, errors: [], warnings: [], recommendations: [] },
      updatedAt: new Date().toISOString()
    };

    const orbit = ORBIT_PROFILES[0];
    const state = createInitialSimulationState('TEST-ROOM', design, orbit);

    expect(state.phase).toBe('PRE_LAUNCH');
    expect(state.telemetry.batteryLevelPct).toBe(100);
    expect(state.telemetry.subsystemHealth.power).toBe(100);

    // Step simulation
    const nextState = tickSimulation(state, design, orbit, MISSION_EVENTS, 5);
    expect(nextState.missionClockSec).toBe(5);
  });

  it('resolves active crisis event with consequences', () => {
    const event = MISSION_EVENTS[0];
    const design = {
      id: 'test-design',
      name: 'Vanguard',
      scenarioId: 'scenario-earth-sentinel',
      busId: 'bus-smallsat-standard',
      selectedComponentIds: [],
      resources: {
        totalMassKg: 500,
        maxMassKg: 1200,
        massMarginKg: 700,
        totalCostMUSD: 40,
        budgetMUSD: 140,
        costMarginMUSD: 100,
        powerDayGenW: 1000,
        powerConsumptionW: 200,
        dayPowerMarginW: 800,
        nightPowerDeficitW: 200,
        batteryCapacityWh: 2000,
        batteryEnduranceMin: 600,
        eclipseDurationMin: 32,
        dataRateMbps: 100,
        deltaVAvailableMps: 0,
        averageReliabilityPct: 98
      },
      validation: { isValid: true, errors: [], warnings: [], recommendations: [] },
      updatedAt: new Date().toISOString()
    };
    const dummyState = {
      ...createInitialSimulationState('TEST', design, ORBIT_PROFILES[0]),
      activeEvent: event
    };

    const choiceId = event.choices[0].id;
    const { nextState, outcomeMessage } = resolveMissionEvent(dummyState, event.id, choiceId);

    expect(nextState.activeEvent).toBeNull();
    expect(nextState.resolvedEvents).toHaveLength(1);
    expect(outcomeMessage).toContain('mitigated');
  });
});
