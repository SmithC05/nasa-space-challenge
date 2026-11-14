import {
  ComponentDefinition,
  LaunchConfiguration,
  LaunchVehicle,
  MissionScenario,
  OrbitProfile,
  SpacecraftDesign
} from '@orbital/contracts';
import {
  LAUNCH_VEHICLES,
  MISSION_SCENARIOS,
  ORBIT_PROFILES,
  SPACECRAFT_COMPONENTS
} from '@orbital/game-data';
import {
  calculateSpacecraftResources,
  validateLaunchConfiguration,
  validateSpacecraftDesign
} from '@orbital/simulation-engine';

export const DEFAULT_INITIAL_COMPONENT_IDS: string[] = [
  'bus-smallsat-standard',
  'power-solar-standard-wings',
  'power-batt-li-ion',
  'comms-ka-dish',
  'inst-multispectral-imager',
  'aocs-reaction-wheels'
];

export const DEFAULT_LAUNCH_SITE = 'Cape Canaveral Space Force Station (SLC-40)';

/**
 * Resolves a MissionScenario by ID, falling back to the first available scenario.
 */
export function resolveScenario(scenarioId?: string | null): MissionScenario {
  if (scenarioId) {
    const found = MISSION_SCENARIOS.find((s) => s.id === scenarioId);
    if (found) return found;
  }
  return MISSION_SCENARIOS[0];
}

/**
 * Resolves an OrbitProfile by ID or target orbit type, falling back to SSO.
 */
export function resolveOrbit(orbitIdOrType?: string | null): OrbitProfile {
  if (orbitIdOrType) {
    const byId = ORBIT_PROFILES.find((o) => o.id === orbitIdOrType);
    if (byId) return byId;
    const byType = ORBIT_PROFILES.find((o) => o.type === orbitIdOrType);
    if (byType) return byType;
  }
  return ORBIT_PROFILES[1]; // Sun-Synchronous Orbit (SSO)
}

/**
 * Resolves a LaunchVehicle by ID, falling back to Phoenix Medium.
 */
export function resolveLaunchVehicle(vehicleId?: string | null): LaunchVehicle {
  if (vehicleId) {
    const found = LAUNCH_VEHICLES.find((v) => v.id === vehicleId);
    if (found) return found;
  }
  return LAUNCH_VEHICLES[1]; // Phoenix Medium
}

/**
 * Strictly validates that the spacecraft has exactly one bus chassis,
 * that the bus ID refers to an actual catalog component of category 'bus',
 * and that explicitBusId (if provided) matches the selected bus.
 */
export function validateAndResolveBus(
  componentIds: string[],
  explicitBusId?: string
): { bus: ComponentDefinition; validComponents: ComponentDefinition[]; finalComponentIds: string[] } {
  // 1. If explicitBusId is provided, validate it strictly against catalog
  if (explicitBusId !== undefined) {
    const busDef = SPACECRAFT_COMPONENTS.find((c) => c.id === explicitBusId && c.category === 'bus');
    if (!busDef) {
      throw {
        code: 'INVALID_BUS_ID',
        message: `Bus component with ID '${explicitBusId}' does not exist or is not a bus chassis.`
      };
    }
    if (!componentIds.includes(explicitBusId)) {
      throw {
        code: 'BUS_NOT_SELECTED',
        message: `Bus '${explicitBusId}' must be included in selectedComponentIds.`
      };
    }
  }

  // 2. Validate all component IDs exist in catalog
  const unknownId = componentIds.find((id) => !SPACECRAFT_COMPONENTS.some((c) => c.id === id));
  if (unknownId) {
    throw {
      code: 'INVALID_COMPONENT',
      message: `Component with ID '${unknownId}' does not exist in catalog.`
    };
  }

  // 3. Find all bus components in selection
  const busComponents = componentIds
    .map((id) => SPACECRAFT_COMPONENTS.find((c) => c.id === id)!)
    .filter((c) => c.category === 'bus');

  if (busComponents.length === 0) {
    throw {
      code: 'MISSING_BUS',
      message: 'Spacecraft configuration must include exactly one bus chassis.'
    };
  }

  if (busComponents.length > 1) {
    throw {
      code: 'MULTIPLE_BUSES',
      message: `Spacecraft configuration contains ${busComponents.length} bus chassis components. Exactly one bus is permitted.`
    };
  }

  const selectedBus = busComponents[0];

  if (explicitBusId && explicitBusId !== selectedBus.id) {
    throw {
      code: 'BUS_MISMATCH',
      message: `Explicit busId '${explicitBusId}' does not match the bus in selectedComponentIds ('${selectedBus.id}').`
    };
  }

  // Deduplicate while preserving ordering
  const finalComponentIds = Array.from(new Set(componentIds));
  const validComponents = finalComponentIds.map((id) => SPACECRAFT_COMPONENTS.find((c) => c.id === id)!);

  return {
    bus: selectedBus,
    validComponents,
    finalComponentIds
  };
}

/**
 * Creates an authoritative SpacecraftDesign instance based on scenario, orbit, and components.
 */
export function buildAuthoritativeDesign(
  scenario: MissionScenario,
  orbit: OrbitProfile,
  componentIds: string[],
  designName?: string,
  preferredBusId?: string
): SpacecraftDesign {
  // Validate exactly one bus chassis and resolve components
  const { bus, validComponents, finalComponentIds } = validateAndResolveBus(
    componentIds,
    preferredBusId
  );

  // Authoritative physics calculations via simulation engine using the exact same components
  const resources = calculateSpacecraftResources(validComponents, scenario, orbit);
  const validation = validateSpacecraftDesign(validComponents, resources, scenario);

  return {
    id: `design-${scenario.id}`,
    name: designName?.trim() || `${scenario.code} Orbiter Alpha`,
    scenarioId: scenario.id,
    busId: bus.id,
    selectedComponentIds: finalComponentIds,
    resources,
    validation,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Creates an authoritative LaunchConfiguration based on vehicle, orbit, design, and scenario.
 */
export function buildAuthoritativeLaunchConfig(
  vehicle: LaunchVehicle,
  orbit: OrbitProfile,
  design: SpacecraftDesign,
  scenario: MissionScenario,
  launchSite?: string
): LaunchConfiguration {
  const result = validateLaunchConfiguration(
    vehicle,
    orbit,
    design.resources.totalMassKg,
    scenario.budgetMUSD,
    design.resources.totalCostMUSD
  );

  return {
    vehicleId: vehicle.id,
    orbitId: orbit.id,
    spacecraftMassKg: design.resources.totalMassKg,
    launchWindow: new Date(Date.now() + 86400000 * 30).toISOString(),
    launchSite: launchSite || DEFAULT_LAUNCH_SITE,
    isCompatible: result.isCompatible,
    payloadMarginKg: result.payloadMarginKg,
    estimatedCostMUSD: result.estimatedCostMUSD
  };
}

/**
 * Checks whether an updated design represents a material change compared to current design.
 */
export function isDesignMaterialChange(
  currentDesign: SpacecraftDesign,
  newComponentIds: string[],
  newName?: string,
  newBusId?: string
): boolean {
  if (newName && newName.trim() !== currentDesign.name.trim()) {
    return true;
  }

  if (newBusId && newBusId !== currentDesign.busId) {
    return true;
  }

  const currentSet = new Set(currentDesign.selectedComponentIds);
  const newSet = new Set(newComponentIds);

  if (currentSet.size !== newSet.size) {
    return true;
  }

  for (const id of newSet) {
    if (!currentSet.has(id)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether an updated launch config represents a material change.
 */
export function isLaunchMaterialChange(
  currentConfig: LaunchConfiguration,
  newVehicleId: string,
  newOrbitId: string,
  newLaunchSite?: string
): boolean {
  if (newVehicleId !== currentConfig.vehicleId) {
    return true;
  }

  if (newOrbitId !== currentConfig.orbitId) {
    return true;
  }

  if (newLaunchSite && newLaunchSite.trim() !== currentConfig.launchSite.trim()) {
    return true;
  }

  return false;
}
