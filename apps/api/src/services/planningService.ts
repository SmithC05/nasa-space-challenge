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
 * Creates an authoritative SpacecraftDesign instance based on scenario, orbit, and components.
 */
export function buildAuthoritativeDesign(
  scenario: MissionScenario,
  orbit: OrbitProfile,
  componentIds: string[],
  designName?: string,
  preferredBusId?: string
): SpacecraftDesign {
  // Filter valid components from game data
  const validComponents: ComponentDefinition[] = componentIds
    .map((id) => SPACECRAFT_COMPONENTS.find((c) => c.id === id))
    .filter((c): c is ComponentDefinition => c !== undefined);

  // Ensure exactly one bus
  let busComp = validComponents.find((c) => c.category === 'bus');
  if (preferredBusId) {
    const requestedBus = SPACECRAFT_COMPONENTS.find(
      (c) => c.id === preferredBusId && c.category === 'bus'
    );
    if (requestedBus) {
      busComp = requestedBus;
    }
  }

  if (!busComp) {
    busComp = SPACECRAFT_COMPONENTS.find((c) => c.category === 'bus')!;
    validComponents.unshift(busComp);
  }

  const finalComponentIds = Array.from(new Set(validComponents.map((c) => c.id)));

  // Authoritative physics calculations via simulation engine
  const resources = calculateSpacecraftResources(validComponents, scenario, orbit);
  const validation = validateSpacecraftDesign(validComponents, resources, scenario);

  return {
    id: `design-${scenario.id}`,
    name: designName?.trim() || `${scenario.code} Orbiter Alpha`,
    scenarioId: scenario.id,
    busId: busComp.id,
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
