import { DetailedOrbitProfile } from './types';
import { validateOrbitCatalog } from './validation';

export const RAW_ORBIT_PROFILES: DetailedOrbitProfile[] = [
  // =========================================================================
  // A. LOW EARTH ORBIT (LEO)
  // =========================================================================
  {
    id: 'orbit-leo',
    aliases: ['orbit-leo-iss'],
    name: 'Low Earth Orbit (LEO)',
    type: 'LEO',
    category: 'LEO',
    perigeeKm: 410,
    apogeeKm: 420,
    inclinationDeg: 51.6,
    orbitalPeriodMin: 92.8,
    eclipseFraction: 0.38,
    requiredDeltaVMps: 9400,
    radiationSeverity: 'LOW',
    description:
      'Standard low-earth orbit providing high spatial resolution and frequent revisit opportunities for mid-latitude Earth observation.',
    coverageCharacteristics: {
      groundTrackPattern:
        'Progressive westward ground track shift (~22.5° per orbit) due to Earth rotation beneath 51.6° orbital inclination plane.',
      repeatCycleDays: 3,
      latitudinalCoverage: {
        minDeg: -51.6,
        maxDeg: 51.6
      },
      revisitTimeHours: 24,
      globalCoverage: false,
      polarCoverage: false,
      description:
        'Covers the majority of Earths populated continents, agricultural zones, and temperate oceans; cannot observe high Arctic or Antarctic ice sheets.'
    },
    missionSuitability: {
      primaryApplications: [
        'Mid-latitude Earth Observation',
        'ISS Cargo & Crew Staging',
        'Atmospheric Aeronomy',
        'Microgravity Research'
      ],
      recommendedMissionTypes: [
        'Earth Observation',
        'Climate & Cryosphere',
        'Technology Demonstration'
      ],
      targetScenarios: ['scenario-earth-sentinel'],
      suitableForEarthSentinel: true,
      suitabilityDescription:
        'Highlighted as a suitable initial candidate for the Earth Sentinel campaign for mid-latitude climate and greenhouse gas tracking, though SSO is preferred for polar ice caps.'
    },
    advantages: [
      'Lowest launch energy requirement (Delta-V ~9,400 m/s), maximizing allowable payload scientific mass.',
      'Close proximity to Earth enables high-resolution optical and radar imaging with smaller apertures.',
      'Low communications latency (5-10 ms) and benign radiation environment within inner magnetosphere.',
      'Rapid revisit rates over populated tropical and temperate zones.'
    ],
    disadvantages: [
      'Persistent atmospheric drag decay requiring periodic propulsion reboost maneuvers.',
      'Frequent orbital eclipses (~35 minutes every 93 minutes) requiring high battery cycle endurance.',
      'Incomplete Earth coverage with zero visibility above 51.6° latitude (excludes polar ice caps).',
      'Short ground station contact passes (5 to 10 minutes per station).'
    ],
    configurationRestrictions: {
      minBatteryEnduranceMin: 40,
      minDeltaVMps: 150,
      recommendedInstrumentTypes: [
        'Multispectral Imager',
        'Fourier Spectrometer',
        'Optical Camera'
      ],
      thermalNotes:
        'Requires robust thermal cycling management for 15+ daily transitions between direct solar flux (+120°C) and orbital eclipse (-65°C).',
      radiationProtectionLevel: 'LOW',
      specialRequirements: [
        'AOCS drag makeup propulsion',
        'Minimum battery depth-of-discharge buffer >= 25%'
      ]
    },
    visualizationParameters: {
      orbitRadiusReference: 2.13,
      inclinationDeg: 51.6,
      orbitColor: '#06b6d4',
      orbitPathVisibility: true,
      spacecraftAnimationSpeed: 1.0,
      referencePlane: 'EQUATORIAL',
      visualizationScale: 2 / 6378,
      lineWidth: 2,
      glowIntensity: 0.8
    },
    educationalAssumptions: {
      modelType: 'PREDEFINED_GEOMETRY',
      notes: [
        'Simplified near-circular Keplerian orbit around a spherical Earth.',
        'J2 nodal regression and atmospheric drag perturbations are calculated parametrically rather than integrated in continuous 6-DOF astrodynamics.',
        'Eclipse duration assumes a spherical Earth shadow without atmospheric refraction or penumbra modeling.'
      ],
      fidelityDisclaimer:
        'Educational simulation model based on simplified predefined Keplerian geometry. Not intended for operational flight dynamics.'
    }
  },

  // =========================================================================
  // B. SUN-SYNCHRONOUS ORBIT (SSO)
  // =========================================================================
  {
    id: 'orbit-sso',
    aliases: ['orbit-sso-polar'],
    name: 'Sun-Synchronous Polar Orbit (SSO)',
    type: 'SSO',
    category: 'SSO',
    perigeeKm: 705,
    apogeeKm: 705,
    inclinationDeg: 98.2,
    orbitalPeriodMin: 98.8,
    eclipseFraction: 0.32,
    requiredDeltaVMps: 9750,
    radiationSeverity: 'MEDIUM',
    description:
      'Retrograde near-polar orbit precessing eastward at 0.9856°/day matching Earths heliocentric orbit, guaranteeing constant local solar illumination angles.',
    coverageCharacteristics: {
      groundTrackPattern:
        'Retrograde polar track with constant 10:30 AM local solar crossing time at descending node; global swath coverage repeating systematically.',
      repeatCycleDays: 16,
      latitudinalCoverage: {
        minDeg: -90,
        maxDeg: 90
      },
      revisitTimeHours: 48,
      globalCoverage: true,
      polarCoverage: true,
      description:
        'Provides comprehensive global planetary coverage including both geographic poles with consistent shadow and illumination conditions.'
    },
    missionSuitability: {
      primaryApplications: [
        'Global Climate & Cryosphere Monitoring',
        'Synthetic Aperture Radar (SAR) Mapping',
        'Multispectral Earth Imaging',
        'Agricultural Remote Sensing'
      ],
      recommendedMissionTypes: [
        'Climate & Cryosphere',
        'Earth Observation',
        'Planetary Science'
      ],
      targetScenarios: ['scenario-earth-sentinel'],
      suitableForEarthSentinel: true,
      suitabilityDescription:
        'Prime recommended orbit for the Earth Sentinel campaign, providing mandatory polar ice cap visibility and consistent lighting for radar and multispectral sensors.'
    },
    advantages: [
      'Constant solar illumination angles eliminate daylight shadow variation in longitudinal optical comparisons.',
      '100% global planetary access including critical Arctic and Antarctic ice sheets.',
      'High predictability for solar array electrical output and thermal radiator sizing.',
      'Regular polar ground station passes (e.g., Svalbard, McMurdo) offering 10-14 contact opportunities per day.'
    ],
    disadvantages: [
      'Higher launch delta-V penalty (~9,750 m/s) because launching retrograde opposes Earths rotational velocity.',
      'Increased exposure to auroral particle precipitation and polar horn radiation zones.',
      'Crowded orbital corridor with higher concentration of orbital debris (700-800 km altitude band).'
    ],
    configurationRestrictions: {
      minBatteryEnduranceMin: 45,
      minDeltaVMps: 200,
      recommendedInstrumentTypes: [
        'Synthetic Aperture Radar',
        'Multispectral Imager',
        'Fourier Spectrometer',
        'LiDAR Altimeter'
      ],
      thermalNotes:
        'Long polar night passes require active survival heater duty-cycling and dedicated thermal louvers.',
      radiationProtectionLevel: 'MEDIUM',
      specialRequirements: [
        'Debris collision avoidance maneuver propellant',
        'Polar ground station downlink capability'
      ]
    },
    visualizationParameters: {
      orbitRadiusReference: 2.22,
      inclinationDeg: 98.2,
      orbitColor: '#10b981',
      orbitPathVisibility: true,
      spacecraftAnimationSpeed: 0.95,
      referencePlane: 'EQUATORIAL',
      visualizationScale: 2 / 6378,
      lineWidth: 2,
      glowIntensity: 0.9
    },
    educationalAssumptions: {
      modelType: 'PREDEFINED_GEOMETRY',
      notes: [
        'Precession rate is assumed perfectly matched to Earth mean motion (360°/365.2422 days) without differential gravitational harmonics.',
        'Atmospheric drag at 705 km is assumed negligible for short-term mission cycles in educational mode.',
        'Solar Beta angle variations across seasons are represented via simplified trigonometric curves.'
      ],
      fidelityDisclaimer:
        'Educational simulation model based on simplified predefined Keplerian geometry. Not intended for operational flight dynamics.'
    }
  },

  // =========================================================================
  // C. POLAR ORBIT
  // =========================================================================
  {
    id: 'orbit-polar',
    aliases: [],
    name: 'Polar Orbit',
    type: 'LEO',
    category: 'POLAR',
    perigeeKm: 800,
    apogeeKm: 800,
    inclinationDeg: 90.0,
    orbitalPeriodMin: 100.8,
    eclipseFraction: 0.35,
    requiredDeltaVMps: 9650,
    radiationSeverity: 'MEDIUM',
    description:
      'True 90° inclination orbit traversing perpendicular to Earths equator, passing directly over both geographic North and South Poles on every revolution.',
    coverageCharacteristics: {
      groundTrackPattern:
        'Meridional north-south longitudinal slicing with 25.2° equatorial longitude displacement per revolution.',
      repeatCycleDays: 14,
      latitudinalCoverage: {
        minDeg: -90,
        maxDeg: 90
      },
      revisitTimeHours: 36,
      globalCoverage: true,
      polarCoverage: true,
      description:
        'True 100% surface access with direct overhead zenith passes over North and South poles every ~50 minutes.'
    },
    missionSuitability: {
      primaryApplications: [
        'Planetary Magnetic Field Surveys',
        'Global Ozone Mapping',
        'Space Weather & Auroral Monitoring',
        'High-Latitude Weather Reconnaissance'
      ],
      recommendedMissionTypes: [
        'Earth Observation',
        'Planetary Science',
        'Atmospheric Science',
        'Space Weather'
      ],
      targetScenarios: ['scenario-earth-sentinel'],
      suitableForEarthSentinel: true,
      suitabilityDescription:
        'Viable polar candidate for Earth Sentinel scientific monitoring, providing direct pole-crossing coverage, though lacks SSO consistent local solar time lock.'
    },
    advantages: [
      'Absolute zenith coverage directly over true geographic poles (90°N / 90°S).',
      'Unmatched coverage for auroral oval dynamics, polar electrojet currents, and magnetospheric cusp particle entry.',
      'Complete global surface access as Earth rotates 360° under the orthogonal orbital plane.',
      'High frequency of passes over Arctic/Antarctic ground reception stations.'
    ],
    disadvantages: [
      'No sun-synchronous lock: local solar crossing time drifts across the 24-hour clock through seasons, causing variable shadow angles in imagery.',
      'Launch cannot exploit Earths rotational velocity assist, increasing delta-V demand.',
      'Repeated passage through polar cap absorption and solar cosmic ray event zones.'
    ],
    configurationRestrictions: {
      minBatteryEnduranceMin: 45,
      minDeltaVMps: 180,
      recommendedInstrumentTypes: [
        'Fluxgate Magnetometer',
        'Multispectral Imager',
        'Atmospheric Sounder'
      ],
      thermalNotes:
        'Requires handling varying eclipse durations and shifting sun-orbit geometry over annual cycles.',
      radiationProtectionLevel: 'MEDIUM',
      specialRequirements: [
        'Magnetic cleanliness for magnetometer booms',
        'High radiation tolerance for polar cusp passages'
      ]
    },
    visualizationParameters: {
      orbitRadiusReference: 2.25,
      inclinationDeg: 90.0,
      orbitColor: '#8b5cf6',
      orbitPathVisibility: true,
      spacecraftAnimationSpeed: 0.92,
      referencePlane: 'EQUATORIAL',
      visualizationScale: 2 / 6378,
      lineWidth: 2,
      glowIntensity: 0.85
    },
    educationalAssumptions: {
      modelType: 'PREDEFINED_GEOMETRY',
      notes: [
        'Inclination modeled as exactly 90.00° without orbital plane precession.',
        'Earth rotation beneath the orbit is modeled as constant sidereal rate (360° per 86164 seconds).'
      ],
      fidelityDisclaimer:
        'Educational simulation model based on simplified predefined Keplerian geometry. Not intended for operational flight dynamics.'
    }
  },

  // =========================================================================
  // D. GEOSTATIONARY ORBIT (GEO)
  // =========================================================================
  {
    id: 'orbit-geo',
    aliases: [],
    name: 'Geostationary Orbit (GEO)',
    type: 'GEO',
    category: 'GEO',
    perigeeKm: 35786,
    apogeeKm: 35786,
    inclinationDeg: 0.0,
    orbitalPeriodMin: 1436.1, // ~23.93 hours (sidereal period)
    eclipseFraction: 0.05,
    requiredDeltaVMps: 12500,
    radiationSeverity: 'HIGH',
    description:
      'Circular equatorial orbit at 35,786 km altitude matching Earths sidereal rotation period, allowing continuous stationary observation of a fixed hemisphere.',
    coverageCharacteristics: {
      groundTrackPattern:
        'Fixed sub-satellite point on the equator (0° latitude); stationary relative to the rotating Earth surface.',
      repeatCycleDays: 1,
      latitudinalCoverage: {
        minDeg: -81,
        maxDeg: 81
      },
      revisitTimeHours: 0.1,
      globalCoverage: false,
      polarCoverage: false,
      description:
        'Continuous, unbroken view of approximately 42% of Earths surface centered on the sub-satellite point; zero view of polar latitudes above 81°.'
    },
    missionSuitability: {
      primaryApplications: [
        'Continuous Continental Weather & Severe Storm Tracking',
        'Broadband Telecommunications Relay',
        'Missile Early Warning',
        'Space Environmental Monitoring'
      ],
      recommendedMissionTypes: [
        'Communications Relay',
        'Continental Weather',
        'Space Weather'
      ],
      targetScenarios: ['scenario-ares-recon'],
      suitableForEarthSentinel: false,
      suitabilityDescription:
        'NOT suitable for the Earth Sentinel mission due to complete lack of polar coverage and high delta-V requirement.'
    },
    advantages: [
      'Stationary positioning enables fixed ground antennas without expensive multi-axis tracking drives.',
      'Continuous real-time view of extreme meteorological events (hurricanes, severe storm outbreaks).',
      'Negligible atmospheric drag ensuring orbital lifetimes exceeding thousands of years.',
      'Very low eclipse fraction; eclipses occur only during brief 44-day eclipse seasons around equinoxes.'
    ],
    disadvantages: [
      'Massive delta-V requirement (~12,500 m/s direct or GTO insertion) severely restricts spacecraft scientific payload mass.',
      'Complete lack of coverage for polar ice caps and high-latitude zones (> 81°N/S).',
      'Significant signal latency (~240 ms round trip) for telecommunications.',
      'High radiation environment in the outer Van Allen radiation belt requiring radiation hardening.'
    ],
    configurationRestrictions: {
      minBatteryEnduranceMin: 75,
      minDeltaVMps: 1800,
      recommendedInstrumentTypes: [
        'High-Gain Dish Antenna',
        'Advanced Weather Imager',
        'Lightning Mapper'
      ],
      thermalNotes:
        'Long eclipse periods during equinoxes (up to 72 minutes continuous shadow) require high thermal mass and heater reserves.',
      radiationProtectionLevel: 'HIGH',
      specialRequirements: [
        'Apogee kick motor or high-efficiency electric propulsion',
        'Graveyard orbit end-of-life disposal propellant'
      ]
    },
    visualizationParameters: {
      orbitRadiusReference: 13.22,
      inclinationDeg: 0.0,
      orbitColor: '#f59e0b',
      orbitPathVisibility: true,
      spacecraftAnimationSpeed: 0.25,
      referencePlane: 'EQUATORIAL',
      visualizationScale: 2 / 6378,
      lineWidth: 2,
      glowIntensity: 0.7
    },
    educationalAssumptions: {
      modelType: 'PREDEFINED_GEOMETRY',
      notes: [
        'Altitude assumed exactly 35,786 km above Earth mean sea level with eccentricity 0.000.',
        'East-west and north-south gravitational drift perturbations from lunar and solar gravity are omitted in simplified educational display.',
        'Visualization scale applies an aesthetic logarithmic compression factor if displayed alongside LEO in a single frame.'
      ],
      fidelityDisclaimer:
        'Educational simulation model based on simplified predefined Keplerian geometry. Not intended for operational flight dynamics.'
    }
  }
];

// Validate the catalog at startup using Zod validation
export const ORBIT_PROFILES_CATALOG: DetailedOrbitProfile[] = validateOrbitCatalog(RAW_ORBIT_PROFILES);
