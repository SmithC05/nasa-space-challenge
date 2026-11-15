import { LearningConcept, LearningConceptId, LearningCategory } from '../types/learning.types';

export const LEARNING_CONCEPTS: Record<LearningConceptId, LearningConcept> = {
  'earth-observation': {
    id: 'earth-observation',
    title: 'WHAT IS EARTH OBSERVATION?',
    category: 'Space Science',
    shortExplanation:
      'Earth observation is the process of collecting information about our planet using satellites and other instruments. These observations help scientists understand environmental changes, monitor weather and identify events such as wildfires.',
    whyItMatters:
      'Satellites can observe large regions of Earth repeatedly, helping researchers monitor environmental conditions and identify areas that need attention.',
    connectionToOrbital:
      'In Earth Sentinel, your spacecraft collects observations that help identify wildfire-affected regions.',
    expandedPoints: [
      'What satellites observe: Oceans, polar ice sheets, forest vegetation, and atmosphere layers.',
      'How satellite images are collected: Specialized sensors capture reflected sunlight and emitted heat across different wavelengths.',
      'Thermal heat detection: Thermal infrared sensors highlight unusually hot ground areas, spotting wildfires through thick smoke.',
      'Why repeated passes matter: Frequent revisit times allow scientists to monitor fire spread and rate of polar ice melt over days.'
    ],
    keyTerms: [
      {
        term: 'Remote Sensing',
        definition: 'Scanning the Earth from space using sensors without making physical contact with the surface.'
      },
      {
        term: 'Thermal Infrared',
        definition: 'Radiation emitted as heat, invisible to human eyes but detectable by specialized cameras.'
      },
      {
        term: 'Revisit Rate',
        definition: 'The time elapsed between consecutive satellite passes over the exact same geographic location.'
      }
    ],
    relatedConcepts: ['orbital-selection', 'scientific-instruments', 'space-communication']
  },

  'orbital-selection': {
    id: 'orbital-selection',
    title: 'WHY DOES ORBITAL SELECTION MATTER?',
    category: 'Orbital Mechanics',
    shortExplanation:
      'An orbit is the path a spacecraft follows around a celestial body. The orbit determines which regions the spacecraft can observe, how frequently it passes over them and when it can communicate with ground stations.',
    whyItMatters:
      'Different orbits provide different observation opportunities. Selecting an appropriate orbit helps a spacecraft achieve its scientific objectives.',
    connectionToOrbital:
      'In Earth Sentinel, selecting an appropriate orbit affects how frequently your satellite can observe wildfire-affected regions.',
    expandedPoints: [
      'Low Earth Orbit (LEO): 300 to 1,000 km altitude; offers close-up detail and lower launch energy, but with short ~90-minute orbital periods.',
      'Polar Orbit: Passes over both North and South poles, allowing the satellite to scan the entire spinning planet over several days.',
      'Sun-Synchronous Orbit (SSO): Crosses each latitude at the exact same local solar time, ensuring constant shadow angles for clear image comparison.',
      'Geostationary Orbit (GEO): At 35,786 km, the satellite orbits at Earth rotation speed, staying fixed over one hemisphere for weather monitoring.',
      'Observation coverage vs. resolution: Higher orbits see bigger areas at once; lower orbits capture sharper surface resolution.'
    ],
    keyTerms: [
      {
        term: 'Orbital Period',
        definition: 'The time taken for a spacecraft to complete one full revolution around a celestial body.'
      },
      {
        term: 'Sun-Synchronous Orbit (SSO)',
        definition: 'A polar orbit where the spacecraft visits each surface point at the exact same local solar time.'
      },
      {
        term: 'Eclipse Sector',
        definition: 'The dark portion of an orbit where a planetary body blocks the Sun, cutting off solar power.'
      }
    ],
    relatedConcepts: ['earth-observation', 'payload-capacity', 'space-communication']
  },

  'scientific-instruments': {
    id: 'scientific-instruments',
    title: 'WHAT ARE SCIENTIFIC INSTRUMENTS?',
    category: 'Spacecraft Engineering',
    shortExplanation:
      'Scientific instruments are devices installed on spacecraft to collect information about space or planetary environments.',
    whyItMatters:
      'Different instruments measure different things. Choosing the appropriate instrument allows a mission to collect the information required by its scientific objectives.',
    connectionToOrbital:
      'For example, an optical camera captures images, while a thermal infrared sensor measures heat signatures that can help identify wildfire activity.',
    expandedPoints: [
      'Optical Camera: Captures visible light photographs similar to human vision, ideal for cloud and land mapping.',
      'Thermal Infrared Sensor: Measures surface temperature and heat radiation to track active wildfire perimeters.',
      'Multispectral Imager: Gathers light across multiple discrete color and infrared bands to calculate vegetation health and moisture.',
      'Synthetic Aperture Radar (SAR): Bounces radio microwave pulses off terrain to see through heavy clouds and dark polar nights.',
      'Magnetometer: Measures magnetic field lines to detect planetary cores and space weather solar wind storms.'
    ],
    keyTerms: [
      {
        term: 'Payload Sensor',
        definition: 'The scientific instrument hardware carrying out the dedicated research goal of the mission.'
      },
      {
        term: 'Synthetic Aperture Radar (SAR)',
        definition: 'A radar system that uses spacecraft motion to simulate an antenna kilometers wide for fine imaging.'
      },
      {
        term: 'Spectral Band',
        definition: 'A specific slice of the electromagnetic wavelength spectrum measured by a sensor.'
      }
    ],
    relatedConcepts: ['earth-observation', 'payload-capacity', 'space-communication']
  },

  'payload-capacity': {
    id: 'payload-capacity',
    title: 'WHAT DOES PAYLOAD CAPACITY MEAN?',
    category: 'Spacecraft Engineering',
    shortExplanation:
      'Payload capacity is the amount of useful equipment or cargo that a launch vehicle or spacecraft can carry, depending on the relevant mission stage.',
    whyItMatters:
      'Spacecraft have mass limits. Adding more instruments and equipment increases mass and can affect launch compatibility, power requirements and mission cost.',
    connectionToOrbital:
      'In Earth Sentinel, you must choose scientific instruments without exceeding the spacecraft’s permitted payload mass.',
    expandedPoints: [
      'Payload mass: The weight of the scientific sensors and cameras that perform the actual mission research.',
      'Spacecraft dry mass: The mass of the structural bus, computer, batteries, reaction wheels, and instruments without fuel.',
      'Launch capacity: The maximum weight a rocket booster can accelerate to orbital velocity without running out of propellant.',
      'Mass margin: Safety buffer between current spacecraft weight and the maximum allowable rocket fairing capacity.',
      'Trade-offs: Heavier instruments require larger chassis frames, bigger solar wings, and more expensive rocket launches.'
    ],
    keyTerms: [
      {
        term: 'Dry Mass',
        definition: 'The total mass of the spacecraft excluding all consumable propellant and pressurant fuels.'
      },
      {
        term: 'Payload Fairing',
        definition: 'The aerodynamic nose cone of a rocket that protects the satellite during launch through the atmosphere.'
      },
      {
        term: 'Mass Margin',
        definition: 'The unused reserve weight allowable before reaching the hard launch vehicle limit.'
      }
    ],
    relatedConcepts: ['scientific-instruments', 'orbital-selection']
  },

  'space-communication': {
    id: 'space-communication',
    title: 'WHY DOES SPACE COMMUNICATION MATTER?',
    category: 'Space Communication',
    shortExplanation:
      'Spacecraft use communication systems to send information to Earth and receive instructions from mission controllers.',
    whyItMatters:
      'Scientific observations are useful only when the collected information can be delivered to researchers. Communication opportunities and transmission capacity therefore influence how a mission operates.',
    connectionToOrbital:
      'Your Earth observation satellite must transmit the information it collects to ground stations on Earth.',
    expandedPoints: [
      'Communication antennas: Low-gain antennas send basic health telemetry in all directions; high-gain dish antennas beam dense science data.',
      'Ground stations: Giant dish antennas located across Earth that lock onto satellites as they fly overhead in line of sight.',
      'Data transmission (Downlink): Beaming gathered sensor data down to Earth at measured rates (e.g. 50 Mbps).',
      'Communication windows: In low orbits, contact with a ground station dish lasts only 8 to 15 minutes per pass.',
      'Buffer storage: Spacecraft record research scans into solid-state memory until flying over an active ground station.'
    ],
    keyTerms: [
      {
        term: 'Downlink',
        definition: 'The transmission of telemetry, images, and science data from the spacecraft down to ground stations.'
      },
      {
        term: 'High-Gain Antenna (HGA)',
        definition: 'A focused dish antenna designed for high-speed data transmission over long distances.'
      },
      {
        term: 'Line of Sight',
        definition: 'An unobstructed direct path between satellite antenna and ground receiver without Earth blocking the radio wave.'
      }
    ],
    relatedConcepts: ['earth-observation', 'orbital-selection', 'scientific-instruments']
  }
};

export function getLearningConcept(id: LearningConceptId): LearningConcept {
  return LEARNING_CONCEPTS[id];
}

export function getAllLearningConcepts(): LearningConcept[] {
  return Object.values(LEARNING_CONCEPTS);
}

export function getLearningConceptsByCategory(category: LearningCategory): LearningConcept[] {
  return getAllLearningConcepts().filter((c) => c.category === category);
}

