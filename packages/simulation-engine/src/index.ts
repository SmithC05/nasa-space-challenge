import {
  ComponentDefinition,
  LaunchConfiguration,
  LaunchVehicle,
  MissionEvent,
  MissionPhase,
  MissionReport,
  MissionScenario,
  MissionSimulationState,
  OrbitProfile,
  ResourceSnapshot,
  SpacecraftDesign,
  TelemetrySnapshot,
  ValidationResult
} from '@orbital/contracts';
import { getOrbitProfileById } from '@orbital/game-data';

// ==========================================
// 1. ASTRODYNAMICS CONSTANTS & HELPERS
// ==========================================
export const EARTH_MU = 398600.4418; // km^3 / s^2
export const EARTH_RADIUS_KM = 6378.137;
export const SOLAR_CONSTANT_W_M2 = 1361.0;

/**
 * Calculates semi-major axis (a) in kilometers.
 */
export function getSemiMajorAxis(perigeeKm: number, apogeeKm: number): number {
  const rp = EARTH_RADIUS_KM + perigeeKm;
  const ra = EARTH_RADIUS_KM + apogeeKm;
  return (rp + ra) / 2;
}

/**
 * Calculates orbital period in minutes.
 */
export function calculateOrbitalPeriod(perigeeKm: number, apogeeKm: number): number {
  const a = getSemiMajorAxis(perigeeKm, apogeeKm);
  const periodSeconds = 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / EARTH_MU);
  return Number((periodSeconds / 60).toFixed(2));
}

/**
 * Calculates instantaneous orbital velocity in km/s (Vis-Viva equation).
 */
export function calculateOrbitalVelocity(currentAltKm: number, perigeeKm: number, apogeeKm: number): number {
  const r = EARTH_RADIUS_KM + currentAltKm;
  const a = getSemiMajorAxis(perigeeKm, apogeeKm);
  const v = Math.sqrt(EARTH_MU * (2 / r - 1 / a));
  return Number(v.toFixed(3));
}

/**
 * Calculates approximate eclipse duration fraction for an orbit.
 */
export function calculateEclipseFraction(perigeeKm: number, apogeeKm: number): number {
  const a = getSemiMajorAxis(perigeeKm, apogeeKm);
  if (a <= EARTH_RADIUS_KM) return 0.5;
  const ratio = EARTH_RADIUS_KM / a;
  if (ratio >= 1) return 0.5;
  const halfAngleRad = Math.asin(ratio);
  const fraction = halfAngleRad / Math.PI;
  return Number(Math.min(0.45, Math.max(0.05, fraction)).toFixed(3));
}

// ==========================================
// 2. RESOURCE CALCULATION & VALIDATION
// ==========================================
export function calculateSpacecraftResources(
  selectedComponents: ComponentDefinition[],
  scenario?: MissionScenario,
  orbit?: OrbitProfile
): ResourceSnapshot {
  let totalMassKg = 0;
  let totalCostMUSD = 0;
  let powerDayGenW = 0;
  let powerConsumptionW = 0;
  let batteryCapacityWh = 0;
  let totalDataRateMbps = 0;
  let totalDeltaVMps = 0;
  let reliabilitySum = 0;

  for (const comp of selectedComponents) {
    totalMassKg += comp.massKg;
    totalCostMUSD += comp.costMUSD;
    powerDayGenW += comp.powerGenerationW ?? 0;
    powerConsumptionW += comp.powerConsumptionW ?? 0;
    batteryCapacityWh += comp.batteryCapacityWh ?? 0;
    totalDataRateMbps += comp.dataRateMbps ?? 0;
    totalDeltaVMps += comp.deltaVMps ?? 0;
    reliabilitySum += comp.reliabilityPercent ?? 95;
  }

  const budgetMUSD = scenario?.budgetMUSD ?? 150;
  const maxMassKg = scenario?.maxMassKg ?? 1500;
  const eclipseFraction = orbit?.eclipseFraction ?? 0.35;
  const orbitPeriodMin = orbit?.orbitalPeriodMin ?? 92.5;
  const eclipseDurationMin = Number((orbitPeriodMin * eclipseFraction).toFixed(1));

  const dayPowerMarginW = Number((powerDayGenW - powerConsumptionW).toFixed(1));
  const nightPowerDeficitW = Number(powerConsumptionW.toFixed(1));

  const batteryEnduranceMin =
    powerConsumptionW > 0
      ? Number(((batteryCapacityWh / powerConsumptionW) * 60).toFixed(1))
      : 9999;

  const averageReliabilityPct =
    selectedComponents.length > 0
      ? Number((reliabilitySum / selectedComponents.length).toFixed(1))
      : 0;

  return {
    totalMassKg: Number(totalMassKg.toFixed(1)),
    maxMassKg,
    massMarginKg: Number((maxMassKg - totalMassKg).toFixed(1)),
    totalCostMUSD: Number(totalCostMUSD.toFixed(2)),
    budgetMUSD,
    costMarginMUSD: Number((budgetMUSD - totalCostMUSD).toFixed(2)),
    powerDayGenW: Number(powerDayGenW.toFixed(1)),
    powerConsumptionW: Number(powerConsumptionW.toFixed(1)),
    dayPowerMarginW,
    nightPowerDeficitW,
    batteryCapacityWh: Number(batteryCapacityWh.toFixed(1)),
    batteryEnduranceMin,
    eclipseDurationMin,
    dataRateMbps: Number(totalDataRateMbps.toFixed(2)),
    deltaVAvailableMps: Number(totalDeltaVMps.toFixed(1)),
    averageReliabilityPct
  };
}

export function validateSpacecraftDesign(
  selectedComponents: ComponentDefinition[],
  resources: ResourceSnapshot,
  scenario?: MissionScenario
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const hasBus = selectedComponents.some((c) => c.category === 'bus');
  const hasPowerGen = selectedComponents.some((c) => c.category === 'power' && (c.powerGenerationW ?? 0) > 0);
  const hasBattery = selectedComponents.some((c) => c.category === 'power' && (c.batteryCapacityWh ?? 0) > 0);
  const hasComms = selectedComponents.some((c) => c.category === 'communications');
  const hasAOCS = selectedComponents.some((c) => c.category === 'thermal_aocs');
  const hasInstruments = selectedComponents.some((c) => c.category === 'instruments');

  if (!hasBus) {
    errors.push('CRITICAL: Spacecraft chassis (Bus) is required to mount avionics and subsystems.');
  }
  if (!hasPowerGen) {
    errors.push('CRITICAL: No solar or power generator selected. Spacecraft will lose electrical power.');
  }
  if (!hasBattery) {
    errors.push('CRITICAL: No energy storage (Battery) installed. Spacecraft will shut down during eclipse.');
  }
  if (!hasComms) {
    errors.push('CRITICAL: No communications transmitter installed. Ground control cannot receive science telemetry.');
  }
  if (!hasInstruments) {
    errors.push('CRITICAL: No scientific payload instruments installed. Mission cannot fulfill science objectives.');
  }

  // Mass Check
  if (resources.massMarginKg < 0) {
    errors.push(`EXCESS MASS: Spacecraft exceeds allowable launch envelope by ${Math.abs(resources.massMarginKg)} kg.`);
  } else if (resources.massMarginKg < resources.maxMassKg * 0.1) {
    warnings.push(`Low mass margin (${resources.massMarginKg} kg remaining, < 10%). Consider lightweight components.`);
  }

  // Cost Check
  if (resources.costMarginMUSD < 0) {
    errors.push(`OVER BUDGET: Total mission hardware cost exceeds budget by $${Math.abs(resources.costMarginMUSD).toFixed(2)}M.`);
  }

  // Power Margin
  if (resources.dayPowerMarginW < 0) {
    errors.push(`NEGATIVE POWER MARGIN: Daytime power generation is insufficient by ${Math.abs(resources.dayPowerMarginW)} W.`);
  } else if (resources.dayPowerMarginW < 50) {
    warnings.push(`Tight power margin (${resources.dayPowerMarginW} W). Battery charging during daytime will be slow.`);
  }

  // Battery in Eclipse
  if (hasBattery && resources.batteryEnduranceMin < resources.eclipseDurationMin) {
    errors.push(
      `BATTERY DEPLETION RISK: Battery endurance (${resources.batteryEnduranceMin} min) is less than eclipse duration (${resources.eclipseDurationMin} min). Spacecraft will experience brownouts.`
    );
  } else if (hasBattery && resources.batteryEnduranceMin < resources.eclipseDurationMin * 1.25) {
    warnings.push(
      `Low battery reserve (< 25% safety buffer). Battery endurance: ${resources.batteryEnduranceMin} min vs ${resources.eclipseDurationMin} min eclipse.`
    );
  }

  // AOCS
  if (!hasAOCS) {
    warnings.push('No AOCS/Reaction Wheels installed. Pointing accuracy will degrade science data collection by 40%.');
  }

  // Scenario specific checks
  if (scenario) {
    if (resources.dataRateMbps < scenario.minBandwidthMbps) {
      warnings.push(`Downlink bandwidth (${resources.dataRateMbps} Mbps) is below recommended scenario rate (${scenario.minBandwidthMbps} Mbps).`);
    }

    const missingRecommended = scenario.recommendedInstruments.filter(
      (rec) => !selectedComponents.some((c) => c.name.toLowerCase().includes(rec.toLowerCase()))
    );
    if (missingRecommended.length > 0) {
      recommendations.push(`Scenario recommends: ${missingRecommended.join(', ')}.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendations
  };
}

// ==========================================
// 3. LAUNCH CONFIGURATION VALIDATION
// ==========================================
export interface SpacecraftDimensionsConstraint {
  diameterM?: number;
  heightM?: number;
}

/**
 * Calculates effective payload capacity of a launch vehicle into a target orbit regime.
 * Accounts for high-energy destination penalties (GTO/GEO/TLI) and high-inclination polar penalties (SSO/Polar).
 */
export function calculateVehicleOrbitCapacity(
  vehicle: LaunchVehicle,
  orbit: OrbitProfile
): number {
  const isPolar =
    orbit.type === 'SSO' ||
    orbit.type === 'MOLNIYA' ||
    (orbit as any).category === 'POLAR' ||
    orbit.id === 'orbit-polar' ||
    orbit.inclinationDeg >= 85;

  if (orbit.type === 'GTO' || orbit.type === 'GEO') {
    return vehicle.payloadCapacityGtoKg;
  } else if (orbit.type === 'TLI') {
    return vehicle.payloadCapacityTliKg;
  } else if (isPolar) {
    return Math.round(vehicle.payloadCapacityLeoKg * 0.78);
  }
  return vehicle.payloadCapacityLeoKg;
}

export type MissionSuitabilityStatus = 'OPTIMAL' | 'ACCEPTABLE_WITH_WARNING' | 'UNSUITABLE';

export interface MissionSuitabilityEvaluation {
  isMissionSuitable: boolean;
  missionSuitabilityStatus: MissionSuitabilityStatus;
  missionSuitabilityReasons: string[];
  polarCoverageSatisfied: boolean;
  missionErrors: string[];
  warnings: string[];
  recommendations: string[];
}

/**
 * Evaluates whether a selected orbital regime satisfies the scientific objectives,
 * latitudinal coverage requirements, and operational mandate of the active mission scenario.
 * Derived from Phase 1 OrbitProfile catalog metadata.
 */
export function evaluateMissionSuitability(
  orbit: OrbitProfile,
  scenario?: MissionScenario | string
): MissionSuitabilityEvaluation {
  const missionErrors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const missionSuitabilityReasons: string[] = [];

  // If no scenario specified, consider mission profile suitable by default
  if (!scenario) {
    return {
      isMissionSuitable: true,
      missionSuitabilityStatus: 'OPTIMAL',
      missionSuitabilityReasons: ['Default flight profile: no active scenario constraints provided.'],
      polarCoverageSatisfied: true,
      missionErrors,
      warnings,
      recommendations
    };
  }

  const scenarioId = typeof scenario === 'string' ? scenario : scenario.id;
  const scenarioObj = typeof scenario === 'object' ? scenario : undefined;

  // Retrieve Phase 1 detailed catalog profile if available
  const detailedProfile = (orbit as any).missionSuitability
    ? (orbit as any)
    : getOrbitProfileById(orbit.id);

  const hasPolarCoverage =
    detailedProfile?.coverageCharacteristics?.polarCoverage ??
    (orbit.type === 'SSO' || (orbit as any).category === 'POLAR' || orbit.id === 'orbit-polar' || orbit.inclinationDeg >= 85);

  const isEarthSentinel =
    scenarioId === 'scenario-earth-sentinel' ||
    scenarioId.toLowerCase().includes('sentinel') ||
    scenarioObj?.code === 'OPS-2601' ||
    scenarioObj?.name?.toLowerCase().includes('earth sentinel');

  // =========================================================================
  // SCENARIO: Earth Sentinel: Cryo & Climate (OPS-2601)
  // Mandate: Polar ice caps monitoring, radar observation of cryosphere
  // =========================================================================
  if (isEarthSentinel) {
    // 1. Geostationary Orbit (GEO) - Explicitly Unsuitable (Blocks Launch Clearance)
    if (orbit.type === 'GEO' || orbit.id === 'orbit-geo' || (orbit as any).category === 'GEO') {
      const err =
        'Mission Mandate Violation: Earth Sentinel requires polar ice cap coverage (≥90° latitude). Geostationary Orbit (GEO) is equatorial (0.0° inclination) and restricted to ±81° latitude, providing 0% visibility of Arctic and Antarctic ice sheets.';
      missionErrors.push(err);
      missionSuitabilityReasons.push(err);
      recommendations.push(
        'Select Sun-Synchronous Orbit (SSO) or Polar Orbit to satisfy mandatory polar ice cap observation requirements.'
      );

      return {
        isMissionSuitable: false,
        missionSuitabilityStatus: 'UNSUITABLE',
        missionSuitabilityReasons,
        polarCoverageSatisfied: false,
        missionErrors,
        warnings,
        recommendations
      };
    }

    // 2. Sun-Synchronous Polar Orbit (SSO) - Prime Recommended Orbit
    if (orbit.type === 'SSO' || orbit.id === 'orbit-sso' || (orbit as any).category === 'SSO') {
      const reason =
        'Prime Recommended Orbit: 98.2° Sun-Synchronous Orbit satisfies all Earth Sentinel cryosphere observation requirements with 100% polar coverage and constant solar illumination angles.';
      missionSuitabilityReasons.push(reason);
      recommendations.push(reason);

      return {
        isMissionSuitable: true,
        missionSuitabilityStatus: 'OPTIMAL',
        missionSuitabilityReasons,
        polarCoverageSatisfied: true,
        missionErrors,
        warnings,
        recommendations
      };
    }

    // 3. Polar Orbit (90°) - Viable Polar Candidate
    if (
      (orbit as any).category === 'POLAR' ||
      orbit.id === 'orbit-polar' ||
      (orbit.inclinationDeg >= 89 && orbit.inclinationDeg <= 91)
    ) {
      const reason =
        'Viable Polar Candidate: 90.0° Polar Orbit provides direct pole-crossing coverage over Arctic and Antarctic ice sheets on every revolution.';
      missionSuitabilityReasons.push(reason);
      recommendations.push(reason);

      return {
        isMissionSuitable: true,
        missionSuitabilityStatus: 'OPTIMAL',
        missionSuitabilityReasons,
        polarCoverageSatisfied: true,
        missionErrors,
        warnings,
        recommendations
      };
    }

    // 4. Low Earth Orbit (LEO, 51.6°) - Alternative Orbit with Warning
    if (orbit.type === 'LEO' || orbit.id === 'orbit-leo') {
      const warn =
        'Mission Limitation: 51.6° Low Earth Orbit (LEO) provides high-revisit observation for mid-latitude climate zones and urban greenhouse gas emissions, but lacks coverage above 51.6° latitude (excludes Arctic and Antarctic ice sheets). Sun-Synchronous Orbit (SSO) is strongly recommended for primary cryosphere science goals.';
      warnings.push(warn);
      missionSuitabilityReasons.push(warn);
      recommendations.push(
        'Consider switching to Sun-Synchronous Orbit (SSO) for 100% global ice sheet coverage.'
      );

      return {
        isMissionSuitable: true,
        missionSuitabilityStatus: 'ACCEPTABLE_WITH_WARNING',
        missionSuitabilityReasons,
        polarCoverageSatisfied: false,
        missionErrors,
        warnings,
        recommendations
      };
    }
  }

  // =========================================================================
  // MISSION-DEPENDENT / OTHER SCENARIOS (E.g., Ares Recon, Artemis Prospector)
  // Ensures GEO is NOT hardcoded as invalid for every mission.
  // =========================================================================
  if (detailedProfile?.missionSuitability?.targetScenarios?.some((s: string) => s.toLowerCase() === scenarioId.toLowerCase())) {
    const reason = `Certified Flight Regime: ${orbit.name} is a designated primary target trajectory for scenario ${scenarioObj?.name ?? scenarioId}.`;
    missionSuitabilityReasons.push(reason);
    return {
      isMissionSuitable: true,
      missionSuitabilityStatus: 'OPTIMAL',
      missionSuitabilityReasons,
      polarCoverageSatisfied: hasPolarCoverage,
      missionErrors,
      warnings,
      recommendations
    };
  }

  if (scenarioObj?.targetOrbitType) {
    if (scenarioObj.targetOrbitType === orbit.type) {
      const reason = `Orbit matches scenario target orbit regime (${scenarioObj.targetOrbitType}).`;
      missionSuitabilityReasons.push(reason);
      return {
        isMissionSuitable: true,
        missionSuitabilityStatus: 'OPTIMAL',
        missionSuitabilityReasons,
        polarCoverageSatisfied: hasPolarCoverage,
        missionErrors,
        warnings,
        recommendations
      };
    } else if (scenarioObj.targetBody !== 'Earth' && orbit.type !== 'TLI' && orbit.type !== 'GTO') {
      const warn = `Trajectory Note: ${orbit.name} is an Earth-centric orbit, whereas scenario ${scenarioObj.name} targets ${scenarioObj.targetBody}. Additional translunar/interplanetary injection required.`;
      warnings.push(warn);
      missionSuitabilityReasons.push(warn);
      return {
        isMissionSuitable: true,
        missionSuitabilityStatus: 'ACCEPTABLE_WITH_WARNING',
        missionSuitabilityReasons,
        polarCoverageSatisfied: hasPolarCoverage,
        missionErrors,
        warnings,
        recommendations
      };
    }
  }

  // Fallback for general mission scenarios
  missionSuitabilityReasons.push(`Trajectory compatible with mission profile.`);
  return {
    isMissionSuitable: true,
    missionSuitabilityStatus: 'OPTIMAL',
    missionSuitabilityReasons,
    polarCoverageSatisfied: hasPolarCoverage,
    missionErrors,
    warnings,
    recommendations
  };
}

export interface DetailedLaunchValidation {
  // 1. Technical compatibility gates
  isPayloadCompatible: boolean;
  isOrbitCompatible: boolean;
  isFairingCompatible: boolean;
  isTechnicallyCompatible: boolean;

  // 2. Budget status gates
  isWithinBaseBudget: boolean;
  isWithinContingencyBudget: boolean;
  isBudgetCleared: boolean;
  budgetStatus: 'WITHIN_BUDGET' | 'CONTINGENCY_USED' | 'BUDGET_EXCEEDED';

  // 3. Mission suitability gates
  isMissionSuitable: boolean;
  missionSuitabilityStatus: MissionSuitabilityStatus;
  missionSuitabilityReasons: string[];
  polarCoverageSatisfied: boolean;

  // 4. Overall launch clearance (all technical + budget + mission suitability gates must pass)
  isOverallCleared: boolean;

  // 5. Exact numerical metrics
  effectiveCapacityKg: number;
  payloadMarginKg: number;
  spacecraftMassKg: number;
  boosterCostMUSD: number;
  spacecraftCostMUSD: number;
  totalMissionCostMUSD: number;
  baseBudgetMUSD: number;
  maxBudgetWithBufferMUSD: number;
  budgetOverrunMUSD: number;
  budgetBufferRemainingMUSD: number;

  // 6. Diagnostic messages
  technicalErrors: string[];
  budgetErrors: string[];
  missionErrors: string[];
  allErrors: string[];
  warnings: string[];
  recommendations: string[];
}

/**
 * Evaluates comprehensive technical compatibility, budget clearance, mission suitability,
 * and overall readiness for an orbit and launch vehicle selection.
 * Keeps vehicle payload capability, budget status, and mission suitability strictly separated.
 */
export function getDetailedLaunchValidation(
  vehicle: LaunchVehicle,
  orbit: OrbitProfile,
  spacecraftMassKg: number,
  scenarioBudgetMUSD: number,
  spacecraftCostMUSD: number,
  spacecraftDimensions?: SpacecraftDimensionsConstraint,
  scenario?: MissionScenario | string
): DetailedLaunchValidation {
  const technicalErrors: string[] = [];
  const budgetErrors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const effectiveCapacityKg = calculateVehicleOrbitCapacity(vehicle, orbit);
  const payloadMarginKg = Number((effectiveCapacityKg - spacecraftMassKg).toFixed(1));
  const boosterCostMUSD = vehicle.launchCostMUSD;
  const totalMissionCostMUSD = Number((spacecraftCostMUSD + boosterCostMUSD).toFixed(1));
  const baseBudgetMUSD = scenarioBudgetMUSD;
  const maxBudgetWithBufferMUSD = Number((scenarioBudgetMUSD * 1.15).toFixed(1));

  // 1. Technical: Payload mass margin check
  const isPayloadCompatible = payloadMarginKg >= 0;
  if (!isPayloadCompatible) {
    technicalErrors.push(
      `Spacecraft mass (${spacecraftMassKg} kg) exceeds ${vehicle.name} capacity to ${orbit.name} (${effectiveCapacityKg} kg) by ${Math.abs(payloadMarginKg)} kg.`
    );
    recommendations.push(
      `Upgrade to a higher-capacity booster class or reduce spacecraft payload wet mass.`
    );
  } else if (payloadMarginKg < effectiveCapacityKg * 0.08) {
    warnings.push(
      `Tight payload mass margin (+${payloadMarginKg} kg reserve, ${((payloadMarginKg / effectiveCapacityKg) * 100).toFixed(1)}%). Trajectory dispersion may affect insertion velocity.`
    );
  }

  // 2. Technical: Orbit & Destination check
  let isOrbitCompatible = true;
  if (vehicle.class === 'Light' && (orbit.type === 'GEO' || orbit.type === 'TLI')) {
    isOrbitCompatible = false;
    technicalErrors.push(
      `${vehicle.name} (Light class) lacks high-energy upper stage capacity for direct injection to ${orbit.name}.`
    );
    recommendations.push(
      `Select ORBITAL-Core or ORBITAL-Heavy equipped with cryogenic upper stages for high-energy orbital insertion.`
    );
  }

  if (vehicle.compatibleOrbitProfiles && vehicle.compatibleOrbitProfiles.length > 0) {
    if (!vehicle.compatibleOrbitProfiles.includes(orbit.id)) {
      isOrbitCompatible = false;
      if (!technicalErrors.some((e) => e.includes('high-energy'))) {
        technicalErrors.push(
          `${vehicle.name} does not certify direct flight profile insertion into ${orbit.name}.`
        );
      }
    }
  }

  // 3. Technical: Fairing dimension constraints
  let isFairingCompatible = true;
  if (spacecraftDimensions) {
    const usableDiameter = vehicle.fairingDiameterM * 0.88;
    const usableHeight = vehicle.fairingHeightM * 0.82;

    if (spacecraftDimensions.diameterM && spacecraftDimensions.diameterM > usableDiameter) {
      isFairingCompatible = false;
      technicalErrors.push(
        `Spacecraft diameter (${spacecraftDimensions.diameterM}m) exceeds dynamic payload fairing envelope (${vehicle.fairingDiameterM}m outer, max allowable ~${usableDiameter.toFixed(1)}m).`
      );
      recommendations.push(
        `Select a booster with a wider payload fairing (ORBITAL-Core: 5.2m or ORBITAL-Heavy: 5.4m).`
      );
    }
    if (spacecraftDimensions.heightM && spacecraftDimensions.heightM > usableHeight) {
      isFairingCompatible = false;
      technicalErrors.push(
        `Spacecraft height (${spacecraftDimensions.heightM}m) exceeds usable fairing height (${vehicle.fairingHeightM}m total, max allowable ~${usableHeight.toFixed(1)}m).`
      );
      recommendations.push(`Select a booster with increased fairing vertical clearance.`);
    }
  }

  const isTechnicallyCompatible = isPayloadCompatible && isOrbitCompatible && isFairingCompatible;

  // 4. Budget status calculations
  const isWithinBaseBudget = totalMissionCostMUSD <= baseBudgetMUSD;
  const isWithinContingencyBudget = totalMissionCostMUSD <= maxBudgetWithBufferMUSD;
  const isBudgetCleared = isWithinContingencyBudget;

  let budgetStatus: 'WITHIN_BUDGET' | 'CONTINGENCY_USED' | 'BUDGET_EXCEEDED';
  let budgetOverrunMUSD = 0;
  let budgetBufferRemainingMUSD = 0;

  if (isWithinBaseBudget) {
    budgetStatus = 'WITHIN_BUDGET';
    budgetBufferRemainingMUSD = Number((baseBudgetMUSD - totalMissionCostMUSD).toFixed(1));
  } else if (isWithinContingencyBudget) {
    budgetStatus = 'CONTINGENCY_USED';
    budgetBufferRemainingMUSD = Number((maxBudgetWithBufferMUSD - totalMissionCostMUSD).toFixed(1));
    warnings.push(
      `Total mission cost ($${totalMissionCostMUSD}M) utilizes the 15% contingency reserve buffer beyond base budget ($${baseBudgetMUSD}M). Remaining buffer: $${budgetBufferRemainingMUSD}M.`
    );
  } else {
    budgetStatus = 'BUDGET_EXCEEDED';
    budgetOverrunMUSD = Number((totalMissionCostMUSD - maxBudgetWithBufferMUSD).toFixed(1));
    budgetErrors.push(
      `Total mission cost ($${totalMissionCostMUSD}M: $${spacecraftCostMUSD}M spacecraft + $${boosterCostMUSD}M booster) exceeds allowable budget (maximum with 15% buffer: $${maxBudgetWithBufferMUSD}M) by $${budgetOverrunMUSD}M.`
    );
    recommendations.push(
      `Select a more economical booster class or optimize spacecraft bus/instrument selection to eliminate the $${budgetOverrunMUSD}M overrun.`
    );
  }

  // 5. Mission suitability evaluation (Integrated from Phase 1 catalog)
  const suitability = evaluateMissionSuitability(orbit, scenario);
  const isMissionSuitable = suitability.isMissionSuitable;
  const missionSuitabilityStatus = suitability.missionSuitabilityStatus;
  const missionSuitabilityReasons = suitability.missionSuitabilityReasons;
  const polarCoverageSatisfied = suitability.polarCoverageSatisfied;
  const missionErrors = suitability.missionErrors;

  warnings.push(...suitability.warnings);
  recommendations.push(...suitability.recommendations);

  // 6. Reliability & operations notes
  if (vehicle.reusable) {
    recommendations.push(
      `Reusable first stage enables propulsive recovery, reducing launch service pricing and turnaround time.`
    );
  }
  if (vehicle.successRatePercent >= 99) {
    recommendations.push(
      `Booster features high flight heritage and >99% mission success probability.`
    );
  }

  const allErrors = [...technicalErrors, ...budgetErrors, ...missionErrors];
  // Overall clearance requires: technical compatibility + budget clearance + mission suitability
  const isOverallCleared = isTechnicallyCompatible && isBudgetCleared && isMissionSuitable;

  return {
    isPayloadCompatible,
    isOrbitCompatible,
    isFairingCompatible,
    isTechnicallyCompatible,

    isWithinBaseBudget,
    isWithinContingencyBudget,
    isBudgetCleared,
    budgetStatus,

    isMissionSuitable,
    missionSuitabilityStatus,
    missionSuitabilityReasons,
    polarCoverageSatisfied,

    isOverallCleared,

    effectiveCapacityKg,
    payloadMarginKg,
    spacecraftMassKg,
    boosterCostMUSD,
    spacecraftCostMUSD,
    totalMissionCostMUSD,
    baseBudgetMUSD,
    maxBudgetWithBufferMUSD,
    budgetOverrunMUSD,
    budgetBufferRemainingMUSD,

    technicalErrors,
    budgetErrors,
    missionErrors,
    allErrors,
    warnings,
    recommendations
  };
}

/**
 * Validates a launch vehicle configuration comprehensively against the selected orbit,
 * spacecraft mass, budget allowance, destination restrictions, fairing constraints, and mission mandate.
 * Returns standard ValidationResult contract.
 */
export function validateLaunchVehicleSuitability(
  vehicle: LaunchVehicle,
  orbit: OrbitProfile,
  spacecraftMassKg: number,
  scenarioBudgetMUSD: number,
  spacecraftCostMUSD: number,
  spacecraftDimensions?: SpacecraftDimensionsConstraint,
  scenario?: MissionScenario | string
): ValidationResult {
  const detail = getDetailedLaunchValidation(
    vehicle,
    orbit,
    spacecraftMassKg,
    scenarioBudgetMUSD,
    spacecraftCostMUSD,
    spacecraftDimensions,
    scenario
  );

  return {
    isValid: detail.isOverallCleared,
    errors: detail.allErrors,
    warnings: detail.warnings,
    recommendations: detail.recommendations
  };
}

export function validateLaunchConfiguration(
  vehicle: LaunchVehicle,
  orbit: OrbitProfile,
  spacecraftMassKg: number,
  scenarioBudgetMUSD: number,
  spacecraftCostMUSD: number,
  scenario?: MissionScenario | string
): LaunchConfiguration {
  const detail = getDetailedLaunchValidation(
    vehicle,
    orbit,
    spacecraftMassKg,
    scenarioBudgetMUSD,
    spacecraftCostMUSD,
    undefined,
    scenario
  );

  return {
    vehicleId: vehicle.id,
    orbitId: orbit.id,
    spacecraftMassKg,
    launchWindow: 'T-00:00:00 (Nominal UTC Window)',
    launchSite:
      vehicle.class === 'Light'
        ? 'Vandenberg Space Force Base, SLC-2'
        : 'Cape Canaveral Space Force Station, SLC-40',
    isCompatible: detail.isOverallCleared,
    payloadMarginKg: detail.payloadMarginKg,
    estimatedCostMUSD: vehicle.launchCostMUSD
  };
}

// ==========================================
// 4. SIMULATION TELEMETRY ENGINE
// ==========================================
const GROUND_STATIONS = [
  { name: 'Goldstone DSN', location: 'California, USA', baseLat: 35.4, baseLon: -116.8 },
  { name: 'Madrid DSN', location: 'Robledo, Spain', baseLat: 40.4, baseLon: -4.2 },
  { name: 'Canberra DSN', location: 'Tidbinbilla, Australia', baseLat: -35.4, baseLon: 148.9 }
];

export function createInitialSimulationState(
  roomId: string,
  design: SpacecraftDesign,
  orbit: OrbitProfile
): MissionSimulationState {
  const telemetry: TelemetrySnapshot = {
    timestamp: Date.now(),
    missionElapsedSeconds: 0,
    altitudeKm: orbit.perigeeKm,
    velocityKps: calculateOrbitalVelocity(orbit.perigeeKm, orbit.perigeeKm, orbit.apogeeKm),
    trueAnomalyDeg: 0,
    inSunlight: true,
    batteryLevelPct: 100,
    solarPowerGenW: design?.resources?.powerDayGenW ?? 1000,
    powerDrawW: design?.resources?.powerConsumptionW ?? 200,
    temperatureCelsius: 22.0,
    dataBufferGb: 0,
    scienceDataDownlinkedGb: 0,
    activeGroundStation: 'Goldstone DSN',
    groundStations: [
      { name: 'Goldstone DSN', location: 'California, USA', elevationDeg: 65, inContact: true, signalStrengthPct: 98 },
      { name: 'Madrid DSN', location: 'Robledo, Spain', elevationDeg: 0, inContact: false, signalStrengthPct: 0 },
      { name: 'Canberra DSN', location: 'Tidbinbilla, Australia', elevationDeg: 0, inContact: false, signalStrengthPct: 0 }
    ],
    subsystemHealth: {
      bus: 100,
      power: 100,
      propulsion: 100,
      communications: 100,
      instruments: 100,
      thermal_aocs: 100
    }
  };

  return {
    roomId,
    phase: 'PRE_LAUNCH',
    missionClockSec: 0,
    speedMultiplier: 1,
    isPaused: false,
    telemetry,
    activeEvent: null,
    resolvedEvents: [],
    sciencePointsAccumulated: 0,
    missionLogs: [
      {
        id: 'log-1',
        timeSec: 0,
        level: 'INFO',
        source: 'FLIGHT_DIRECTOR',
        message: `Simulation initialized for spacecraft [${design.name}] in target orbit ${orbit.name}.`
      }
    ]
  };
}

/**
 * Steps the simulation forward by deltaSec (scaled by speed multiplier).
 */
export function tickSimulation(
  state: MissionSimulationState,
  design: SpacecraftDesign,
  orbit: OrbitProfile,
  candidateEvents: MissionEvent[],
  deltaSec = 1
): MissionSimulationState {
  if (state.isPaused || state.phase === 'MISSION_COMPLETE' || state.phase === 'MISSION_ABORTED') {
    return state;
  }

  const effectiveDelta = deltaSec * state.speedMultiplier;
  const newClock = state.missionClockSec + effectiveDelta;
  const currentTelem = state.telemetry;

  let newPhase: MissionPhase = state.phase;
  const logs = [...state.missionLogs];

  // Phase progression
  if (state.phase === 'PRE_LAUNCH' && newClock > 0) {
    newPhase = 'COUNTDOWN';
    logs.push({
      id: `log-${Date.now()}-1`,
      timeSec: Math.floor(newClock),
      level: 'INFO',
      source: 'SYSTEM',
      message: 'T-minus 10 seconds. Terminal countdown initiated.'
    });
  } else if (state.phase === 'COUNTDOWN' && newClock >= 10) {
    newPhase = 'ASCENT';
    logs.push({
      id: `log-${Date.now()}-2`,
      timeSec: Math.floor(newClock),
      level: 'SUCCESS',
      source: 'SYSTEM',
      message: 'Liftoff confirmed! Main engine start. Rocket ascending through atmosphere.'
    });
  } else if (state.phase === 'ASCENT' && newClock >= 35) {
    newPhase = 'ORBIT_INSERTION';
    logs.push({
      id: `log-${Date.now()}-3`,
      timeSec: Math.floor(newClock),
      level: 'INFO',
      source: 'TRAJECTORY',
      message: 'Fairing separation confirmed. Second stage orbital insertion burn underway.'
    });
  } else if (state.phase === 'ORBIT_INSERTION' && newClock >= 60) {
    newPhase = 'COMMISSIONING';
    logs.push({
      id: `log-${Date.now()}-4`,
      timeSec: Math.floor(newClock),
      level: 'SUCCESS',
      source: 'SYSTEMS',
      message: 'Spacecraft separation confirmed! Solar arrays deployed. Commissioning subsystems.'
    });
  } else if (state.phase === 'COMMISSIONING' && newClock >= 90) {
    newPhase = 'PRIMARY_SCIENCE';
    logs.push({
      id: `log-${Date.now()}-5`,
      timeSec: Math.floor(newClock),
      level: 'SUCCESS',
      source: 'SCIENCE',
      message: 'All instruments calibrated and operational. Primary science data collection active.'
    });
  }

  // Orbital position update
  const orbitalPeriodSec = orbit.orbitalPeriodMin * 60;
  const meanMotionDegPerSec = 360 / orbitalPeriodSec;
  const newTrueAnomaly = (currentTelem.trueAnomalyDeg + meanMotionDegPerSec * effectiveDelta) % 360;

  // Approximate altitude fluctuation along elliptical orbit
  const e = (orbit.apogeeKm - orbit.perigeeKm) / (orbit.apogeeKm + orbit.perigeeKm + 2 * EARTH_RADIUS_KM);
  const currentAlt = orbit.perigeeKm + (orbit.apogeeKm - orbit.perigeeKm) * (0.5 - 0.5 * Math.cos((newTrueAnomaly * Math.PI) / 180));
  const currentVelocity = calculateOrbitalVelocity(currentAlt, orbit.perigeeKm, orbit.apogeeKm);

  // Sunlight vs Earth Shadow (eclipse)
  // Eclipse happens roughly when trueAnomaly is around 180 deg +/- (eclipseFraction * 180)
  const halfEclipseDeg = (orbit.eclipseFraction * 360) / 2;
  const inSunlight = !(newTrueAnomaly >= 180 - halfEclipseDeg && newTrueAnomaly <= 180 + halfEclipseDeg);

  // Power & Battery dynamics
  const powerDraw = design.resources.powerConsumptionW;
  const powerGen = inSunlight ? design.resources.powerDayGenW : 0;
  const netPowerW = powerGen - powerDraw;

  let batteryPct = currentTelem.batteryLevelPct;
  const totalBatteryCapacityWh = Math.max(1, design.resources.batteryCapacityWh);

  if (netPowerW >= 0) {
    // Charge battery
    const chargeWh = (netPowerW * (effectiveDelta / 3600)) * 0.9; // 90% charge efficiency
    const deltaPct = (chargeWh / totalBatteryCapacityWh) * 100;
    batteryPct = Math.min(100, batteryPct + deltaPct);
  } else {
    // Discharge battery
    const drainWh = Math.abs(netPowerW) * (effectiveDelta / 3600);
    const deltaPct = (drainWh / totalBatteryCapacityWh) * 100;
    batteryPct = Math.max(0, batteryPct - deltaPct);
  }

  // Thermal model (oscillates between ~ -15C in eclipse to +35C in full sun)
  const targetTemp = inSunlight ? 26.0 : -8.0;
  const thermalInertia = 0.05 * effectiveDelta;
  const newTemp = currentTelem.temperatureCelsius + (targetTemp - currentTelem.temperatureCelsius) * Math.min(0.2, thermalInertia);

  // Ground Station Contact model
  // Satellite visits 3 stations as orbital anomaly sweeps 360 deg
  const st1InContact = newTrueAnomaly >= 20 && newTrueAnomaly <= 70;
  const st2InContact = newTrueAnomaly >= 140 && newTrueAnomaly <= 190;
  const st3InContact = newTrueAnomaly >= 260 && newTrueAnomaly <= 310;

  const groundStations = [
    {
      name: GROUND_STATIONS[0].name,
      location: GROUND_STATIONS[0].location,
      elevationDeg: st1InContact ? 45 + 30 * Math.sin(((newTrueAnomaly - 20) / 50) * Math.PI) : 0,
      inContact: st1InContact,
      signalStrengthPct: st1InContact ? 95 : 0
    },
    {
      name: GROUND_STATIONS[1].name,
      location: GROUND_STATIONS[1].location,
      elevationDeg: st2InContact ? 40 + 35 * Math.sin(((newTrueAnomaly - 140) / 50) * Math.PI) : 0,
      inContact: st2InContact,
      signalStrengthPct: st2InContact ? 92 : 0
    },
    {
      name: GROUND_STATIONS[2].name,
      location: GROUND_STATIONS[2].location,
      elevationDeg: st3InContact ? 50 + 25 * Math.sin(((newTrueAnomaly - 260) / 50) * Math.PI) : 0,
      inContact: st3InContact,
      signalStrengthPct: st3InContact ? 99 : 0
    }
  ];

  const anyContact = groundStations.find((g) => g.inContact);
  const activeStation = anyContact ? anyContact.name : null;

  // Science generation and downlink
  // Instruments gather science data (Gb) into buffer
  const instrumentDataRateMbps = design.resources.dataRateMbps;
  const generatedGb = (instrumentDataRateMbps * effectiveDelta) / (8 * 1024);
  let dataBufferGb = currentTelem.dataBufferGb + generatedGb;
  let downlinkedGb = currentTelem.scienceDataDownlinkedGb;
  let sciencePoints = state.sciencePointsAccumulated;

  if (activeStation && dataBufferGb > 0) {
    const downlinkSpeedMbps = Math.max(10, design.resources.dataRateMbps * 1.5);
    const downlinkableGb = (downlinkSpeedMbps * effectiveDelta) / (8 * 1024);
    const actualDownlink = Math.min(dataBufferGb, downlinkableGb);
    dataBufferGb -= actualDownlink;
    downlinkedGb += actualDownlink;
    sciencePoints += actualDownlink * 15; // 15 science points per GB received
  }

  // Active crisis event checking
  let activeEvent = state.activeEvent;
  if (!activeEvent && (newPhase === 'PRIMARY_SCIENCE' || newPhase === 'COMMISSIONING')) {
    const matching = candidateEvents.find(
      (ev) =>
        Math.floor(newClock) >= ev.triggerMissionSecond &&
        !state.resolvedEvents.some((re) => re.eventId === ev.id)
    );
    if (matching) {
      activeEvent = matching;
      logs.push({
        id: `event-${Date.now()}`,
        timeSec: Math.floor(newClock),
        level: 'ERROR',
        source: 'FLIGHT_DIRECTOR',
        message: `ALERT: Event triggered: [${matching.title}] - ${matching.description}`
      });
    }
  }

  // Check battery failure condition
  if (batteryPct <= 0) {
    logs.push({
      id: `crit-batt-${Date.now()}`,
      timeSec: Math.floor(newClock),
      level: 'ERROR',
      source: 'SYSTEMS',
      message: 'CRITICAL FAILURE: Spacecraft batteries completely exhausted. Systems unrecoverable.'
    });
    newPhase = 'MISSION_ABORTED';
  }

  // End of primary mission
  if (newClock >= 360 && newPhase !== 'MISSION_ABORTED') {
    newPhase = 'MISSION_COMPLETE';
    logs.push({
      id: `complete-${Date.now()}`,
      timeSec: Math.floor(newClock),
      level: 'SUCCESS',
      source: 'FLIGHT_DIRECTOR',
      message: 'Primary scientific objectives fulfilled! Mission operations concluded successfully.'
    });
  }

  const updatedTelemetry: TelemetrySnapshot = {
    timestamp: Date.now(),
    missionElapsedSeconds: Math.floor(newClock),
    altitudeKm: Number(currentAlt.toFixed(1)),
    velocityKps: currentVelocity,
    trueAnomalyDeg: Number(newTrueAnomaly.toFixed(1)),
    inSunlight,
    batteryLevelPct: Number(batteryPct.toFixed(1)),
    solarPowerGenW: Number(powerGen.toFixed(1)),
    powerDrawW: Number(powerDraw.toFixed(1)),
    temperatureCelsius: Number(newTemp.toFixed(1)),
    dataBufferGb: Number(dataBufferGb.toFixed(2)),
    scienceDataDownlinkedGb: Number(downlinkedGb.toFixed(2)),
    activeGroundStation: activeStation,
    groundStations,
    subsystemHealth: currentTelem.subsystemHealth
  };

  return {
    ...state,
    phase: newPhase,
    missionClockSec: Number(newClock.toFixed(1)),
    telemetry: updatedTelemetry,
    activeEvent,
    sciencePointsAccumulated: Number(sciencePoints.toFixed(1)),
    missionLogs: logs.slice(-50) // keep last 50 logs
  };
}

// ==========================================
// 5. EVENT CHOICE RESOLUTION
// ==========================================
export function resolveMissionEvent(
  state: MissionSimulationState,
  eventId: string,
  choiceId: string
): { nextState: MissionSimulationState; outcomeMessage: string; success: boolean } {
  if (!state.activeEvent || state.activeEvent.id !== eventId) {
    return { nextState: state, outcomeMessage: 'Event not active.', success: false };
  }

  const choice = state.activeEvent.choices.find((c) => c.id === choiceId);
  if (!choice) {
    return { nextState: state, outcomeMessage: 'Invalid choice.', success: false };
  }

  // Roll success probability
  const roll = Math.random();
  const success = roll <= choice.successProbability;

  const nextHealth = { ...state.telemetry.subsystemHealth };
  if (choice.componentDegradationCategory) {
    const key = choice.componentDegradationCategory;
    nextHealth[key] = Math.max(10, (nextHealth[key] ?? 100) - (success ? 5 : 25));
  }

  const batteryImpactPct = success ? choice.batteryDamagePct * 0.5 : choice.batteryDamagePct;
  const newBattery = Math.max(0, state.telemetry.batteryLevelPct - batteryImpactPct);

  const scienceDelta = success ? choice.scienceYieldDelta : Math.floor(choice.scienceYieldDelta * 0.2);
  const nextScience = Math.max(0, state.sciencePointsAccumulated + scienceDelta);

  const outcomeMessage = success
    ? `SUCCESS: ${choice.outcomeDescription} (Risk mitigated successfully).`
    : `PARTIAL FAILURE: Contingency command executed with anomalies. System performance degraded.`;

  const updatedLogs = [
    ...state.missionLogs,
    {
      id: `event-res-${Date.now()}`,
      timeSec: Math.floor(state.missionClockSec),
      level: (success ? 'SUCCESS' : 'WARN') as 'SUCCESS' | 'WARN',
      source: 'OPERATIONS',
      message: `Event [${state.activeEvent.title}] resolved with choice '${choice.label}'. ${outcomeMessage}`
    }
  ];

  const resolved = [
    ...state.resolvedEvents,
    {
      eventId,
      chosenChoiceId: choiceId,
      success,
      timestampSec: state.missionClockSec
    }
  ];

  const nextState: MissionSimulationState = {
    ...state,
    activeEvent: null,
    resolvedEvents: resolved,
    sciencePointsAccumulated: nextScience,
    telemetry: {
      ...state.telemetry,
      batteryLevelPct: Number(newBattery.toFixed(1)),
      subsystemHealth: nextHealth
    },
    missionLogs: updatedLogs
  };

  return { nextState, outcomeMessage, success };
}

// ==========================================
// 6. MISSION REPORT GENERATOR
// ==========================================
export function generateMissionReport(
  state: MissionSimulationState,
  scenario: MissionScenario,
  design: SpacecraftDesign,
  roomCode: string,
  teamEngineers: string[]
): MissionReport {
  const isFailed = state.phase === 'MISSION_ABORTED' || state.telemetry.batteryLevelPct <= 0;
  const scienceScore = state.sciencePointsAccumulated;
  const targetScore = scenario.minSciencePoints;

  let outcome: MissionReport['outcome'] = 'MISSION_ACCOMPLISHED';
  if (isFailed) {
    outcome = 'MISSION_FAILURE';
  } else if (scienceScore >= targetScore * 1.3) {
    outcome = 'OUTSTANDING_SUCCESS';
  } else if (scienceScore >= targetScore) {
    outcome = 'MISSION_ACCOMPLISHED';
  } else {
    outcome = 'PARTIAL_SUCCESS';
  }

  const accolades: string[] = [];
  if (design.resources.costMarginMUSD > 10) {
    accolades.push('Fiscal Prudence: Completed mission well under budgetary constraints.');
  }
  if (design.resources.averageReliabilityPct >= 95) {
    accolades.push('High Reliability Spacecraft: Hardware demonstrated zero catastrophic failures.');
  }
  const resolvedCrisesCount = state.resolvedEvents.filter((r) => r.success).length;
  if (resolvedCrisesCount >= 2) {
    accolades.push('Crisis Master: Engineering team expertly navigated severe orbital hazards.');
  }
  if (state.telemetry.scienceDataDownlinkedGb >= 50) {
    accolades.push('Data Flood Award: Exceeded ground telemetry volume expectations.');
  }

  return {
    id: `report-${Date.now()}`,
    roomCode,
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    spacecraftName: design.name,
    outcome,
    finalScienceScore: Math.floor(scienceScore),
    dataGatheredGb: state.telemetry.scienceDataDownlinkedGb,
    budgetRemainingMUSD: design.resources.costMarginMUSD,
    missionDurationDays: scenario.durationDays,
    crisesResolved: resolvedCrisesCount,
    totalCrises: state.resolvedEvents.length,
    teamEngineers: teamEngineers.length > 0 ? teamEngineers : ['Solo Flight Director'],
    accolades,
    evaluationNotes:
      outcome === 'OUTSTANDING_SUCCESS'
        ? 'Superlative engineering achievement. The spacecraft surpassed all baseline science metrics while preserving redundant power and link margins.'
        : outcome === 'MISSION_ACCOMPLISHED'
          ? 'Mission goals fully satisfied. Spacecraft delivered required scientific data to ground stations with robust orbital execution.'
          : outcome === 'PARTIAL_SUCCESS'
            ? 'Mission concluded with partial data collection. Valuable telemetry was secured despite subsystem limitations.'
            : 'Mission experienced catastrophic loss of telemetry or electrical power. Post-flight telemetry analysis recommended.',
    completedAt: new Date().toISOString()
  };
}
