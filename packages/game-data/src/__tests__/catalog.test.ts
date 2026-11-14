import { describe, expect, it } from 'vitest';
import { ComponentDefinitionSchema } from '@orbital/contracts';
import { SPACECRAFT_COMPONENTS, SCENARIO_COMPATIBILITY, MISSION_SCENARIOS } from '../index';

const componentIds = SPACECRAFT_COMPONENTS.map((c) => c.id);
const scenarioIds = MISSION_SCENARIOS.map((s) => s.id);

describe('ORBITAL Component Catalog (game-data)', () => {
  it('all catalog ids are unique', () => {
    const dupes = componentIds.filter((id, i) => componentIds.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  it('every entry parses against the ComponentDefinition Zod schema', () => {
    for (const comp of SPACECRAFT_COMPONENTS) {
      const result = ComponentDefinitionSchema.safeParse(comp);
      const errorMsg = result.success ? '' : JSON.stringify(result.error.flatten());
      expect(result.success, `Schema parse failed for ${comp.id}: ${errorMsg}`).toBe(true);
    }
  });

  it('meets minimum counts per subCategory', () => {
    const counts: Record<string, number> = {};
    for (const comp of SPACECRAFT_COMPONENTS) {
      counts[comp.subCategory] = (counts[comp.subCategory] ?? 0) + 1;
    }
    const minimums: Record<string, number> = {
      'Modular Chassis': 1,
      'Heavy Explorer': 1,
      'Shielded Chassis': 1,
      'Solar Wings': 1,
      'Motorized Solar': 1,
      'Nuclear RTG': 1,
      'Data Storage': 2,
      'Onboard Computer': 2,
      'Chemical Thrusters': 1,
      'Electric Propulsion': 1,
      'Telemetry & Command': 1,
      'Broadband Downlink': 1,
      'Laser Broadband': 1,
      'Optical Camera': 1,
      'Thermal Infrared Sensor': 1,
      'Optical Payload': 1,
      'Radar Payload': 1,
      'Gas Analysis': 1,
      'Subsurface Exploration': 1,
      'Space Physics': 1,
      'Attitude Determination & Control': 1,
      'Thermal Control': 2,
      'Magnetic Attitude Control': 1,
      'Thruster Attitude Control': 1
    };
    for (const [subCategory, min] of Object.entries(minimums)) {
      expect(
        counts[subCategory] ?? 0,
        `SubCategory ${subCategory} has ${counts[subCategory] ?? 0} entries, minimum ${min}`
      ).toBeGreaterThanOrEqual(min);
    }
  });

  it('onboard computers and data storage are counted separately from power systems', () => {
    const counts: Record<string, number> = {};
    for (const comp of SPACECRAFT_COMPONENTS) {
      counts[comp.subCategory] = (counts[comp.subCategory] ?? 0) + 1;
    }
    const powerStorage = counts['Data Storage'] ?? 0;
    const onboardComputer = counts['Onboard Computer'] ?? 0;
    const powerGeneration =
      (counts['Solar Wings'] ?? 0) + (counts['Motorized Solar'] ?? 0) + (counts['Nuclear RTG'] ?? 0);
    expect(onboardComputer).toBeGreaterThanOrEqual(2);
    expect(powerStorage).toBeGreaterThanOrEqual(2);
    expect(powerGeneration).toBeGreaterThanOrEqual(3);
  });

  it('includes the five required scientific instruments', () => {
    for (const id of [
      'inst-optical-camera',
      'inst-thermal-ir-sensor',
      'inst-multispectral-imager',
      'inst-synthetic-aperture-radar',
      'inst-fluxgate-magnetometer'
    ]) {
      expect(componentIds).toContain(id);
    }
  });

  it('every scenario key in SCENARIO_COMPATIBILITY matches a MISSION_SCENARIOS id', () => {
    const valid = new Set(scenarioIds);
    for (const scenarioId of Object.keys(SCENARIO_COMPATIBILITY)) {
      expect(valid.has(scenarioId), `SCENARIO_COMPATIBILITY key ${scenarioId} is not a MissionScenario id`).toBe(
        true
      );
    }
  });

  it('every MISSION_SCENARIOS id has a SCENARIO_COMPATIBILITY entry', () => {
    const configured = new Set(Object.keys(SCENARIO_COMPATIBILITY));
    for (const scenarioId of scenarioIds) {
      expect(
        configured.has(scenarioId),
        `MissionScenario ${scenarioId} has no SCENARIO_COMPATIBILITY entry`
      ).toBe(true);
    }
  });

  it('each scenario compatibility mapping resolves to existing component ids', () => {
    const valid = new Set(componentIds);
    for (const [scenarioId, mapping] of Object.entries(SCENARIO_COMPATIBILITY)) {
      for (const id of mapping.allowedComponentIds) {
        expect(valid.has(id), `Scenario ${scenarioId} references unknown component ${id}`).toBe(
          true
        );
      }
    }
  });

  it('Earth Sentinel has a non-empty fully configured allowed-parts list', () => {
    const earth = SCENARIO_COMPATIBILITY['scenario-earth-sentinel'];
    expect(earth).toBeDefined();
    expect(earth.allowedComponentIds.length).toBeGreaterThan(0);
  });
});
