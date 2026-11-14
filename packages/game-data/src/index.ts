import {
  ComponentDefinition,
  LaunchVehicle,
  MissionEvent,
  MissionScenario,
  OrbitProfile
} from '@orbital/contracts';

// ==========================================
// 1. MISSION SCENARIOS
// ==========================================
export const MISSION_SCENARIOS: MissionScenario[] = [
  {
    id: 'scenario-earth-sentinel',
    name: 'Earth Sentinel: Cryo & Climate',
    code: 'OPS-2601',
    tagline: 'Monitor melting polar ice caps and greenhouse gas emissions across Earth.',
    description:
      'The United Nations Climate Observatory requires a high-resolution polar orbit satellite to track sea ice thickness, permafrost thaw, and urban greenhouse gas emissions. Engineers must balance massive radar power requirements against the dark Arctic winter.',
    targetBody: 'Earth',
    difficulty: 'Beginner',
    budgetMUSD: 140,
    maxMassKg: 1200,
    targetOrbitType: 'SSO',
    minSciencePoints: 600,
    minBandwidthMbps: 50,
    durationDays: 365,
    primaryObjectives: [
      'Map polar ice thickness with Synthetic Aperture Radar (SAR) or LiDAR.',
      'Maintain continuous orbital downlink to ground stations.',
      'Achieve positive power balance across high-latitude solar eclipses.'
    ],
    secondaryObjectives: [
      'Detect localized methane leaks over major industrial corridors.',
      'Maintain battery depth-of-discharge below 60%.'
    ],
    environmentalHazards: [
      'Frequent 35-minute orbital eclipses over polar night sectors.',
      'Atomic oxygen erosion in low Earth orbit.'
    ],
    recommendedInstruments: ['Synthetic Aperture Radar', 'Multispectral Imager', 'Fourier Spectrometer'],
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'scenario-artemis-prospector',
    name: 'Artemis Polar Prospector',
    code: 'LUNAR-2604',
    tagline: 'Scout permanently shadowed craters for volatile water ice deposits on the Moon.',
    description:
      'In support of the permanent Artemis base camp, this lunar orbiter must map subsurface hydrogen and ice trapped inside freezing craters near the Moon’s South Pole (Shackleton Crater). High delta-V is required for lunar insertion.',
    targetBody: 'Moon',
    difficulty: 'Intermediate',
    budgetMUSD: 220,
    maxMassKg: 2400,
    targetOrbitType: 'TLI',
    minSciencePoints: 950,
    minBandwidthMbps: 80,
    durationDays: 540,
    primaryObjectives: [
      'Execute Trans-Lunar Injection and lunar orbit capture with onboard propulsion.',
      'Conduct neutron & gamma-ray spectrometry over the lunar south pole.',
      'Map surface elevation with sub-meter laser altimetry.'
    ],
    secondaryObjectives: [
      'Map lunar magnetic anomalies (mascons).',
      'Provide relay communications beacon for landed robotic rovers.'
    ],
    environmentalHazards: [
      'Deep thermal swings between lunar sunlight (+120°C) and shadowed craters (-230°C).',
      'Solar energetic particles outside Earth’s protective magnetosphere.'
    ],
    recommendedInstruments: ['Gamma-Ray Spectrometer', 'Fluxgate Magnetometer', 'Laser Optical Downlink'],
    imageUrl: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'scenario-ares-recon',
    name: 'Ares Weather & Atmospheric Scout',
    code: 'MARS-2609',
    tagline: 'Forecast global dust storms and atmospheric dynamics for future crewed landings.',
    description:
      'Mars global dust storms can envelop the entire planet within days, threatening solar-powered assets. This mission deploys a high-altitude Martian reconnaissance orbiter to track atmospheric density and dust storm genesis.',
    targetBody: 'Mars',
    difficulty: 'Advanced',
    budgetMUSD: 310,
    maxMassKg: 3200,
    targetOrbitType: 'GTO',
    minSciencePoints: 1400,
    minBandwidthMbps: 120,
    durationDays: 780,
    primaryObjectives: [
      'Monitor global Martian dust storm genesis in real time.',
      'Map atmospheric trace gas concentrations (methane and water vapor).',
      'Demonstrate deep space optical laser communications to Earth.'
    ],
    secondaryObjectives: [
      'Survive severe dust attenuation on solar array power generation.',
      'Calibrate ionospheric perturbation models during solar flares.'
    ],
    environmentalHazards: [
      'Severe solar flux reduction at 1.52 AU (requires oversized solar arrays or RTG).',
      'Round-trip light delay between 4 and 22 minutes requiring autonomous AOCS.'
    ],
    recommendedInstruments: ['Atmospheric Fourier Spectrometer', 'Optical Laser Terminal', 'High-Gain Dish'],
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'scenario-nea-interceptor',
    name: 'Deep Space Planetary Defense Sentinel',
    code: 'DEF-2612',
    tagline: 'Track potentially hazardous asteroids and characterize their chemical composition.',
    description:
      'An uncharacterized 450-meter carbonaceous near-Earth asteroid poses an uncertain impact risk in 2042. The mission requires a high-agility electric propulsion probe to rendezvous, image the rubble-pile structure, and measure gravitational mass.',
    targetBody: 'DeepSpace',
    difficulty: 'Expert',
    budgetMUSD: 380,
    maxMassKg: 2800,
    targetOrbitType: 'TLI',
    minSciencePoints: 1800,
    minBandwidthMbps: 40,
    durationDays: 900,
    primaryObjectives: [
      'Execute 2,200 m/s delta-V orbital transfer using high-efficiency ion thrusters.',
      'Perform close proximity hovering and gravity mapping of the asteroid.',
      'Determine internal composition and porosity.'
    ],
    secondaryObjectives: [
      'Deploy kinetic impact experiment probe.',
      'Achieve 99% autonomous station-keeping precision.'
    ],
    environmentalHazards: [
      'Dust and micro-debris ejection from volatile asteroid venting.',
      'Extreme interplanetary cosmic radiation.'
    ],
    recommendedInstruments: ['Hall-Effect Ion Thrusters', 'Next-Gen RTG', 'Radar Altimeter'],
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
  }
];

// ==========================================
// 2. SPACECRAFT COMPONENT CATALOG
// ==========================================
export const SPACECRAFT_COMPONENTS: ComponentDefinition[] = [
  // --- BUS / CHASSIS ---
  {
    id: 'bus-smallsat-standard',
    name: 'ESPA-Class Science Bus',
    category: 'bus',
    subCategory: 'Modular Chassis',
    description: 'Hexagonal carbon-composite aerospace bus structure with integrated avionics, flight computer, and power distribution units.',
    massKg: 180,
    powerGenerationW: 0,
    powerConsumptionW: 45,
    costMUSD: 16.5,
    dataRateMbps: 0,
    batteryCapacityWh: 0,
    deltaVMps: 0,
    reliabilityPercent: 98,
    visualModel: {
      shape: 'box',
      color: '#c5a059', // gold foil
      scale: [1.2, 1.4, 1.2],
      offset: [0, 0, 0]
    }
  },
  {
    id: 'bus-deepspace-heavy',
    name: 'Titanium Deep-Space Heavy Bus',
    category: 'bus',
    subCategory: 'Heavy Explorer',
    description: 'Radiation-hardened structural frame capable of supporting massive scientific payloads, large propellant tanks, and deep space avionics.',
    massKg: 420,
    powerGenerationW: 0,
    powerConsumptionW: 85,
    costMUSD: 32.0,
    dataRateMbps: 0,
    batteryCapacityWh: 0,
    deltaVMps: 0,
    reliabilityPercent: 99,
    visualModel: {
      shape: 'cylinder',
      color: '#71717a', // dark titanium
      scale: [1.6, 1.8, 1.6],
      offset: [0, 0, 0]
    }
  },

  // --- POWER ---
  {
    id: 'power-solar-standard-wings',
    name: 'Dual Deployable GaInP Solar Arrays',
    category: 'power',
    subCategory: 'Solar Wings',
    description: 'High-efficiency triple-junction photovoltaic wings. Generates 1,200 W in direct sunlight; generates 0 W during eclipse.',
    massKg: 45,
    powerGenerationW: 1200,
    powerConsumptionW: 10,
    costMUSD: 8.5,
    batteryCapacityWh: 0,
    reliabilityPercent: 96,
    visualModel: {
      shape: 'solar_wing',
      color: '#1d4ed8', // solar blue
      scale: [3.2, 0.05, 0.9],
      offset: [0, 0, 0]
    }
  },
  {
    id: 'power-solar-tracking-mega',
    name: 'Sun-Tracking Solar Array (2.4 kW)',
    category: 'power',
    subCategory: 'Motorized Solar',
    description: 'Motorized dual-axis solar panels that automatically track the Sun to maximize power harvest across elliptical orbits.',
    massKg: 95,
    powerGenerationW: 2400,
    powerConsumptionW: 30,
    costMUSD: 16.0,
    batteryCapacityWh: 0,
    reliabilityPercent: 94,
    visualModel: {
      shape: 'solar_wing',
      color: '#0284c7',
      scale: [4.8, 0.08, 1.2],
      offset: [0, 0, 0]
    }
  },
  {
    id: 'power-rtg-nextgen',
    name: 'Advanced Stirling Radioisotope Generator',
    category: 'power',
    subCategory: 'Nuclear RTG',
    description: 'Continuous 400 W thermal-to-electric nuclear generator using Plutonium-238. Immune to orbital eclipses and deep space darkness.',
    massKg: 130,
    powerGenerationW: 420,
    powerConsumptionW: 0,
    costMUSD: 45.0,
    batteryCapacityWh: 0,
    reliabilityPercent: 99.5,
    visualModel: {
      shape: 'cylinder',
      color: '#b45309', // metallic amber
      scale: [0.6, 1.0, 0.6],
      offset: [0, -0.6, 0.7]
    }
  },
  {
    id: 'power-batt-li-ion',
    name: 'Space-Qualified Li-Ion Battery (1.8 kWh)',
    category: 'power',
    subCategory: 'Secondary Storage',
    description: 'Multi-cell battery pack powering subsystems during planetary night and orbital eclipses.',
    massKg: 28,
    powerGenerationW: 0,
    powerConsumptionW: 0,
    costMUSD: 4.2,
    batteryCapacityWh: 1800,
    reliabilityPercent: 97,
    visualModel: {
      shape: 'box',
      color: '#10b981', // emerald
      scale: [0.5, 0.4, 0.5],
      offset: [0, 0.3, 0]
    }
  },
  {
    id: 'power-batt-solid-state',
    name: 'Ultra Solid-State Energy Cell (3.6 kWh)',
    category: 'power',
    subCategory: 'Advanced Storage',
    description: 'High-energy-density non-flammable solid electrolyte battery. Withstands deep thermal cycles without capacity degradation.',
    massKg: 42,
    powerGenerationW: 0,
    powerConsumptionW: 0,
    costMUSD: 9.8,
    batteryCapacityWh: 3600,
    reliabilityPercent: 98.5,
    visualModel: {
      shape: 'box',
      color: '#059669',
      scale: [0.6, 0.5, 0.6],
      offset: [0, 0.3, 0]
    }
  },

  // --- PROPULSION ---
  {
    id: 'prop-monoprop-hydrazine',
    name: 'Hydrazine Monopropellant System',
    category: 'propulsion',
    subCategory: 'Chemical Thrusters',
    description: 'Combat-proven chemical thrusters providing 380 m/s delta-V for orbit raising, collision avoidance, and station keeping.',
    massKg: 85,
    powerGenerationW: 0,
    powerConsumptionW: 20,
    costMUSD: 7.2,
    deltaVMps: 380,
    reliabilityPercent: 97,
    visualModel: {
      shape: 'thruster',
      color: '#e11d48', // rose / copper
      scale: [0.4, 0.6, 0.4],
      offset: [0, -0.9, 0]
    }
  },
  {
    id: 'prop-hall-electric',
    name: 'Krypton Hall-Effect Ion Engine',
    category: 'propulsion',
    subCategory: 'Electric Propulsion',
    description: 'Ultra-efficient ion engine delivering 1,850 m/s delta-V. Consumes substantial electrical power during firing burns.',
    massKg: 110,
    powerGenerationW: 0,
    powerConsumptionW: 650,
    costMUSD: 21.0,
    deltaVMps: 1850,
    reliabilityPercent: 95,
    visualModel: {
      shape: 'thruster',
      color: '#06b6d4', // cyan glow
      scale: [0.5, 0.7, 0.5],
      offset: [0, -0.9, 0]
    }
  },

  // --- COMMUNICATIONS ---
  {
    id: 'comms-omni-patch',
    name: 'S-Band Omni Patch Antenna Array',
    category: 'communications',
    subCategory: 'Telemetry & Command',
    description: 'Hemispherical coverage antenna ensuring spacecraft command uplink even during tumbling or emergency safe modes.',
    massKg: 8,
    powerGenerationW: 0,
    powerConsumptionW: 18,
    costMUSD: 2.1,
    dataRateMbps: 5,
    reliabilityPercent: 99.8,
    visualModel: {
      shape: 'sensor_dome',
      color: '#e2e8f0',
      scale: [0.2, 0.2, 0.2],
      offset: [0, 0.8, 0]
    }
  },
  {
    id: 'comms-ka-dish',
    name: '1.2m Steerable Ka-Band High-Gain Dish',
    category: 'communications',
    subCategory: 'Broadband Downlink',
    description: 'Gimbaled parabolic reflector capable of downlinking scientific imagery at up to 140 Mbps to Deep Space Network stations.',
    massKg: 24,
    powerGenerationW: 0,
    powerConsumptionW: 85,
    costMUSD: 9.4,
    dataRateMbps: 140,
    reliabilityPercent: 96,
    visualModel: {
      shape: 'dish_antenna',
      color: '#f8fafc',
      scale: [1.2, 0.4, 1.2],
      offset: [0.7, 0.4, 0]
    }
  },
  {
    id: 'comms-optical-laser',
    name: 'Deep-Space Laser Optical Terminal',
    category: 'communications',
    subCategory: 'Laser Broadband',
    description: 'State-of-the-art optical laser downlink delivering 850 Mbps bandwidth back to Earth optical ground stations.',
    massKg: 38,
    powerGenerationW: 0,
    powerConsumptionW: 160,
    costMUSD: 24.0,
    dataRateMbps: 850,
    reliabilityPercent: 93,
    visualModel: {
      shape: 'cylinder',
      color: '#8b5cf6', // purple
      scale: [0.35, 0.6, 0.35],
      offset: [-0.7, 0.5, 0]
    }
  },

  // --- SCIENTIFIC INSTRUMENTS ---
  {
    id: 'inst-multispectral-imager',
    name: 'High-Res Multispectral Earth Imager',
    category: 'instruments',
    subCategory: 'Optical Payload',
    description: '16-band visible and near-infrared optical camera. Captures vegetation indices, algal blooms, and cloud microphysics.',
    massKg: 65,
    powerGenerationW: 0,
    powerConsumptionW: 90,
    costMUSD: 22.0,
    dataRateMbps: 45,
    reliabilityPercent: 97,
    visualModel: {
      shape: 'cylinder',
      color: '#3b82f6',
      scale: [0.4, 0.7, 0.4],
      offset: [0, -0.7, 0.3]
    }
  },
  {
    id: 'inst-synthetic-aperture-radar',
    name: 'L-Band Synthetic Aperture Radar (SAR)',
    category: 'instruments',
    subCategory: 'Radar Payload',
    description: 'Active radar imaging system capable of penetrating cloud cover, smoke, and polar night darkness to measure ice sheet topography.',
    massKg: 195,
    powerGenerationW: 0,
    powerConsumptionW: 420,
    costMUSD: 44.0,
    dataRateMbps: 160,
    reliabilityPercent: 94,
    visualModel: {
      shape: 'box',
      color: '#f59e0b', // amber
      scale: [2.0, 0.15, 0.8],
      offset: [0, -0.6, -0.4]
    }
  },
  {
    id: 'inst-fourier-spectrometer',
    name: 'Atmospheric Fourier Transform Spectrometer',
    category: 'instruments',
    subCategory: 'Gas Analysis',
    description: 'Detects atmospheric absorption lines to pinpoint atmospheric methane, carbon dioxide, ozone, and water vapor profiles.',
    massKg: 52,
    powerGenerationW: 0,
    powerConsumptionW: 65,
    costMUSD: 18.5,
    dataRateMbps: 28,
    reliabilityPercent: 96,
    visualModel: {
      shape: 'sensor_dome',
      color: '#10b981',
      scale: [0.45, 0.45, 0.45],
      offset: [0.4, -0.5, 0.4]
    }
  },
  {
    id: 'inst-gamma-ray-spectrometer',
    name: 'Planetary Neutron & Gamma-Ray Spectrometer',
    category: 'instruments',
    subCategory: 'Subsurface Exploration',
    description: 'Measures high-energy cosmic ray collisions with surface regolith to detect subsurface water ice and rare elemental deposits.',
    massKg: 40,
    powerGenerationW: 0,
    powerConsumptionW: 38,
    costMUSD: 19.0,
    dataRateMbps: 12,
    reliabilityPercent: 98,
    visualModel: {
      shape: 'cylinder',
      color: '#ec4899',
      scale: [0.3, 0.8, 0.3],
      offset: [-0.4, -0.5, 0.4]
    }
  },
  {
    id: 'inst-fluxgate-magnetometer',
    name: 'Deployable Boom Fluxgate Magnetometer',
    category: 'instruments',
    subCategory: 'Space Physics',
    description: 'Measures planetary magnetic fields and solar wind interactions. Mounted on a deployable boom to isolate from spacecraft electrical noise.',
    massKg: 15,
    powerGenerationW: 0,
    powerConsumptionW: 14,
    costMUSD: 8.0,
    dataRateMbps: 6,
    reliabilityPercent: 99,
    visualModel: {
      shape: 'cylinder',
      color: '#e2e8f0',
      scale: [0.1, 1.8, 0.1],
      offset: [0, 1.2, 0]
    }
  },

  // --- THERMAL & AOCS ---
  {
    id: 'aocs-reaction-wheels',
    name: '3-Axis Precision Reaction Wheels & Star Trackers',
    category: 'thermal_aocs',
    subCategory: 'Attitude Determination & Control',
    description: 'Flywheels providing sub-arcsecond pointing stability. Vital for aiming imaging instruments and high-gain antennas.',
    massKg: 26,
    powerGenerationW: 0,
    powerConsumptionW: 42,
    costMUSD: 6.8,
    reliabilityPercent: 96,
    visualModel: {
      shape: 'box',
      color: '#64748b',
      scale: [0.35, 0.35, 0.35],
      offset: [0, 0, 0]
    }
  },
  {
    id: 'aocs-heat-pipe-radiators',
    name: 'Loop Heat Pipe Radiators & Louvers',
    category: 'thermal_aocs',
    subCategory: 'Thermal Control',
    description: 'High-conductivity active radiators that reject excess waste heat generated by high-power payloads into deep space.',
    massKg: 34,
    powerGenerationW: 0,
    powerConsumptionW: 12,
    costMUSD: 5.4,
    reliabilityPercent: 99,
    visualModel: {
      shape: 'box',
      color: '#e2e8f0', // white ceramic paint
      scale: [1.2, 0.8, 0.05],
      offset: [0, 0, -0.65]
    }
  }
];

// ==========================================
// 3. ORBIT PROFILES & CATALOG
// ==========================================
export * from './orbit-profiles';

// ==========================================
// 4. LAUNCH VEHICLES
// ==========================================
export const LAUNCH_VEHICLES: LaunchVehicle[] = [
  {
    id: 'vehicle-nova-light',
    name: 'Nova-1 Light Booster',
    manufacturer: 'AeroLaunch Dynamics',
    class: 'Light',
    payloadCapacityLeoKg: 650,
    payloadCapacityGtoKg: 180,
    payloadCapacityTliKg: 40,
    fairingDiameterM: 1.8,
    fairingHeightM: 3.5,
    launchCostMUSD: 8.5,
    successRatePercent: 94.5,
    reusable: false,
    description: 'Cost-effective two-stage smallsat booster. Ideal for compact low-cost missions with lean payloads.'
  },
  {
    id: 'vehicle-phoenix-medium',
    name: 'Phoenix-9 Reusable Workhorse',
    manufacturer: 'Orbital Dynamics Corp',
    class: 'Medium',
    payloadCapacityLeoKg: 16500,
    payloadCapacityGtoKg: 5800,
    payloadCapacityTliKg: 2200,
    fairingDiameterM: 5.2,
    fairingHeightM: 13.1,
    launchCostMUSD: 54.0,
    successRatePercent: 99.2,
    reusable: true,
    description: 'Flight-proven reusable first-stage booster with exceptional reliability and large payload mass margin.'
  },
  {
    id: 'vehicle-atlas-heavy',
    name: 'Ares-Atlas V Deep Space Heavy',
    manufacturer: 'United Launch Consortium',
    class: 'Heavy',
    payloadCapacityLeoKg: 24500,
    payloadCapacityGtoKg: 9200,
    payloadCapacityTliKg: 4500,
    fairingDiameterM: 5.4,
    fairingHeightM: 14.5,
    launchCostMUSD: 98.0,
    successRatePercent: 99.6,
    reusable: false,
    description: 'High-energy cryogenic upper stage engineered specifically for high delta-V planetary exploration missions.'
  },
  {
    id: 'vehicle-titan-superheavy',
    name: 'Titan SLS SuperHeavy',
    manufacturer: 'NASA Core Systems',
    class: 'SuperHeavy',
    payloadCapacityLeoKg: 95000,
    payloadCapacityGtoKg: 38000,
    payloadCapacityTliKg: 27000,
    fairingDiameterM: 8.4,
    fairingHeightM: 19.0,
    launchCostMUSD: 175.0,
    successRatePercent: 98.0,
    reusable: false,
    description: 'Monumental super-heavy launch vehicle capable of sending massive multi-ton scientific probes directly into interplanetary transfer.'
  }
];

// ==========================================
// 5. MISSION CRISIS & ANOMALY EVENTS
// ==========================================
export const MISSION_EVENTS: MissionEvent[] = [
  {
    id: 'event-solar-flare',
    title: 'Coronal Mass Ejection (CME) Warning',
    category: 'SOLAR_STORM',
    severity: 'HIGH',
    description:
      'NOAA Space Weather Prediction Center detects an X-class solar flare heading directly along the satellite’s orbital plane within 45 seconds. High-energy protons will bombard electronics.',
    triggerMissionSecond: 110,
    timeLimitSec: 25,
    choices: [
      {
        id: 'cme-safe-mode',
        label: 'Enter Protective Safe Mode',
        description: 'Power down sensitive optical instruments and rotate solar arrays edge-on to incoming proton stream.',
        successProbability: 0.95,
        powerDeltaW: -50,
        dataBufferDeltaGb: 0,
        batteryDamagePct: 2,
        scienceYieldDelta: -30,
        componentDegradationCategory: 'instruments',
        outcomeDescription: 'Payload safely protected from radiation latchup. Science collection paused for 2 orbits.'
      },
      {
        id: 'cme-magnetic-shield',
        label: 'Overdrive Magnetorquers & Shielding',
        description: 'Keep instruments active to measure the CME shockfront while using magnetic attitude coils to deflect ions.',
        successProbability: 0.65,
        powerDeltaW: 100,
        dataBufferDeltaGb: 15,
        batteryDamagePct: 12,
        scienceYieldDelta: 180,
        componentDegradationCategory: 'power',
        outcomeDescription: 'Captured groundbreaking real-time CME data, but solar cells sustained 8% radiation degradation.'
      }
    ]
  },
  {
    id: 'event-rw-saturation',
    title: 'Reaction Wheel 2 Speed Saturation',
    category: 'ATTITUDE_GLITCH',
    severity: 'MEDIUM',
    description:
      'Reaction Wheel 2 has reached maximum RPM (6,000 RPM) fighting gravity-gradient torque. Spacecraft pointing stability is drifting; high-gain antenna lock may be lost.',
    triggerMissionSecond: 170,
    timeLimitSec: 20,
    choices: [
      {
        id: 'rw-rcs-dump',
        label: 'Fire Propulsion RCS to Dump Momentum',
        description: 'Expend 2.5 kg of thruster fuel to desaturate the flywheel back to nominal idle speed.',
        successProbability: 0.98,
        powerDeltaW: 0,
        dataBufferDeltaGb: 0,
        batteryDamagePct: 0,
        scienceYieldDelta: 0,
        componentDegradationCategory: 'propulsion',
        outcomeDescription: 'Reaction wheels successfully spun down. Antenna lock retained; minor propellant expended.'
      },
      {
        id: 'rw-magnetic-dump',
        label: 'Gradual Earth Magnetic Desaturation',
        description: 'Rely solely on Earth’s magnetic field to slowly desaturate the wheel without expending fuel.',
        successProbability: 0.7,
        powerDeltaW: -20,
        dataBufferDeltaGb: -5,
        batteryDamagePct: 0,
        scienceYieldDelta: -20,
        componentDegradationCategory: 'thermal_aocs',
        outcomeDescription: 'Fuel conserved, but pointing jitter reduced high-resolution imaging quality during desaturation.'
      }
    ]
  },
  {
    id: 'event-battery-thermal-runaway',
    title: 'Battery Cell Temperature Anomaly',
    category: 'THERMAL_SPIKE',
    severity: 'CRITICAL',
    description:
      'Li-Ion Battery Pack telemetry indicates Cell Bank 3 is heating rapidly to 58°C under continuous daytime charging. Risk of thermal runaway if not addressed.',
    triggerMissionSecond: 240,
    timeLimitSec: 20,
    choices: [
      {
        id: 'batt-isolate-cell',
        label: 'Isolate Bank 3 & Open Heat Pipe Radiators',
        description: 'Bypass the faulty cell bank and command active thermal louvers to maximum heat dissipation.',
        successProbability: 0.92,
        powerDeltaW: -80,
        dataBufferDeltaGb: 0,
        batteryDamagePct: 15,
        scienceYieldDelta: 0,
        componentDegradationCategory: 'power',
        outcomeDescription: 'Temperature normalized to 24°C. Battery capacity reduced by 15% for remainder of mission.'
      },
      {
        id: 'batt-throttle-payload',
        label: 'Throttle High-Power Payload by 50%',
        description: 'Reduce current draw immediately by duty-cycling radar and transmitter systems.',
        successProbability: 0.82,
        powerDeltaW: -150,
        dataBufferDeltaGb: -10,
        batteryDamagePct: 5,
        scienceYieldDelta: -50,
        componentDegradationCategory: 'instruments',
        outcomeDescription: 'Thermal spike averted by lowering current flow. Science output temporarily throttled.'
      }
    ]
  },
  {
    id: 'event-ground-los',
    title: 'Deep Space Network Antenna Lock Lost',
    category: 'COMMS_BLACKOUT',
    severity: 'MEDIUM',
    description:
      'Ground station at Madrid DSN reports sudden loss of telemetry signal due to high atmospheric rain fade. Onboard science memory buffer is 78% full.',
    triggerMissionSecond: 300,
    timeLimitSec: 20,
    choices: [
      {
        id: 'los-compress-store',
        label: 'Enable Autonomous Onboard Lossless Compression',
        description: 'Compress buffered science frames to prevent buffer overflow until Canberra DSN acquires signal.',
        successProbability: 0.94,
        powerDeltaW: 30,
        dataBufferDeltaGb: -15,
        batteryDamagePct: 0,
        scienceYieldDelta: 20,
        componentDegradationCategory: 'communications',
        outcomeDescription: 'Data successfully compressed and stored onboard. Zero scientific observations lost.'
      },
      {
        id: 'los-switch-optical',
        label: 'Handover Downlink to Optical Laser Receiver',
        description: 'Slew spacecraft to lock onto ground optical telescope terminal in the Canary Islands.',
        successProbability: 0.78,
        powerDeltaW: 80,
        dataBufferDeltaGb: 0,
        batteryDamagePct: 4,
        scienceYieldDelta: 120,
        componentDegradationCategory: 'communications',
        outcomeDescription: 'Laser link acquired! Streamed all buffered science data in under 40 seconds.'
      }
    ]
  }
];
