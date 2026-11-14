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
export function validateLaunchConfiguration(
  vehicle: LaunchVehicle,
  orbit: OrbitProfile,
  spacecraftMassKg: number,
  scenarioBudgetMUSD: number,
  spacecraftCostMUSD: number
): LaunchConfiguration {
  let capacityKg = vehicle.payloadCapacityLeoKg;
  if (orbit.type === 'GTO' || orbit.type === 'GEO') {
    capacityKg = vehicle.payloadCapacityGtoKg;
  } else if (orbit.type === 'TLI') {
    capacityKg = vehicle.payloadCapacityTliKg;
  } else if (orbit.type === 'SSO' || orbit.type === 'MOLNIYA') {
    capacityKg = Math.round(vehicle.payloadCapacityLeoKg * 0.78);
  }

  const payloadMarginKg = Number((capacityKg - spacecraftMassKg).toFixed(1));
  const estimatedCostMUSD = vehicle.launchCostMUSD;
  const totalMissionCost = spacecraftCostMUSD + estimatedCostMUSD;

  const isCompatible = payloadMarginKg >= 0 && totalMissionCost <= scenarioBudgetMUSD * 1.15;

  return {
    vehicleId: vehicle.id,
    orbitId: orbit.id,
    spacecraftMassKg,
    launchWindow: 'T-00:00:00 (Nominal UTC Window)',
    launchSite: vehicle.class === 'Light' ? 'Vandenberg Space Force Base, SLC-2' : 'Cape Canaveral Space Force Station, SLC-40',
    isCompatible,
    payloadMarginKg,
    estimatedCostMUSD
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
