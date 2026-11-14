import { z } from 'zod';
import { OrbitProfileSchema } from '@orbital/contracts';
import { DetailedOrbitProfile } from './types';

export const OrbitCategorySchema = z.enum(['LEO', 'SSO', 'POLAR', 'GEO']);

export const OrbitCoverageCharacteristicsSchema = z.object({
  groundTrackPattern: z.string().min(1, 'Ground track pattern description is required'),
  repeatCycleDays: z.number().positive().optional(),
  latitudinalCoverage: z.object({
    minDeg: z.number().min(-90).max(90),
    maxDeg: z.number().min(-90).max(90)
  }).refine((data) => data.minDeg <= data.maxDeg, {
    message: 'minDeg must be less than or equal to maxDeg'
  }),
  revisitTimeHours: z.number().nonnegative('Revisit time must be non-negative'),
  globalCoverage: z.boolean(),
  polarCoverage: z.boolean(),
  description: z.string().min(1, 'Coverage description is required')
});

export const OrbitMissionSuitabilitySchema = z.object({
  primaryApplications: z.array(z.string()).min(1, 'At least one primary application is required'),
  recommendedMissionTypes: z.array(z.string()).min(1, 'At least one recommended mission type is required'),
  targetScenarios: z.array(z.string()),
  suitableForEarthSentinel: z.boolean(),
  suitabilityDescription: z.string().min(1, 'Suitability description is required')
});

export const OrbitConfigurationRestrictionsSchema = z.object({
  minBatteryEnduranceMin: z.number().positive('Minimum battery endurance must be positive'),
  minDeltaVMps: z.number().nonnegative('Minimum delta-V must be non-negative'),
  recommendedInstrumentTypes: z.array(z.string()).min(1, 'At least one recommended instrument type is required'),
  thermalNotes: z.string().min(1, 'Thermal notes are required'),
  radiationProtectionLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EXTREME']),
  specialRequirements: z.array(z.string())
});

export const OrbitVisualizationParametersSchema = z.object({
  orbitRadiusReference: z.number().positive('Orbit radius reference must be positive'),
  inclinationDeg: z.number().min(0).max(180, 'Inclination must be between 0 and 180 degrees'),
  orbitColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'orbitColor must be a valid hex code'),
  orbitPathVisibility: z.boolean(),
  spacecraftAnimationSpeed: z.number().positive('Animation speed must be positive'),
  referencePlane: z.enum(['EQUATORIAL', 'ECLIPTIC']),
  visualizationScale: z.number().positive('Visualization scale must be positive'),
  lineWidth: z.number().positive().optional(),
  dashPattern: z.array(z.number()).optional(),
  glowIntensity: z.number().min(0).max(1).optional()
});

export const OrbitEducationalAssumptionsSchema = z.object({
  modelType: z.enum(['SIMPLIFIED_CIRCULAR', 'SIMPLIFIED_KEPLERIAN', 'PREDEFINED_GEOMETRY']),
  notes: z.array(z.string()).min(1, 'Educational notes are required'),
  fidelityDisclaimer: z.string().min(1, 'Fidelity disclaimer is required')
});

/**
 * Detailed Orbit Profile Schema.
 * Merges the shared OrbitProfileSchema from @orbital/contracts with the extended catalog fields.
 * Includes refine checks to guarantee altitude validity and positive orbital period.
 */
export const DetailedOrbitProfileSchema = OrbitProfileSchema.extend({
  name: z.string().min(3, 'Profile name must be at least 3 characters'),
  inclinationDeg: z.number().min(0, 'Inclination must be between 0 and 180 degrees').max(180, 'Inclination must be between 0 and 180 degrees'),
  category: OrbitCategorySchema,
  coverageCharacteristics: OrbitCoverageCharacteristicsSchema,
  missionSuitability: OrbitMissionSuitabilitySchema,
  advantages: z.array(z.string()).min(1, 'At least one advantage must be documented'),
  disadvantages: z.array(z.string()).min(1, 'At least one disadvantage must be documented'),
  configurationRestrictions: OrbitConfigurationRestrictionsSchema,
  visualizationParameters: OrbitVisualizationParametersSchema,
  educationalAssumptions: OrbitEducationalAssumptionsSchema,
  aliases: z.array(z.string()).optional()
}).refine((data) => data.perigeeKm > 0 && data.apogeeKm > 0, {
  message: 'Orbital altitude (perigeeKm and apogeeKm) must be strictly positive'
}).refine((data) => data.perigeeKm <= data.apogeeKm, {
  message: 'Perigee altitude cannot exceed apogee altitude'
}).refine((data) => data.orbitalPeriodMin > 0, {
  message: 'Orbital period must be positive'
});

/**
 * Validates an individual orbit profile.
 * Throws a descriptive Error if validation fails.
 */
export function validateOrbitProfile(data: unknown): DetailedOrbitProfile {
  const result = DetailedOrbitProfileSchema.safeParse(data);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((e) => `[${e.path.join('.') || 'root'}]: ${e.message}`)
      .join('; ');
    throw new Error(`Orbit profile validation failed: ${errorDetails}`);
  }
  return result.data as DetailedOrbitProfile;
}

/**
 * Validates a complete orbit catalog.
 * Guarantees profile schema compliance and uniqueness of profile IDs.
 */
export function validateOrbitCatalog(catalog: unknown[]): DetailedOrbitProfile[] {
  if (!Array.isArray(catalog) || catalog.length === 0) {
    throw new Error('Orbit catalog must be a non-empty array of orbit profiles');
  }

  const validatedProfiles: DetailedOrbitProfile[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < catalog.length; i++) {
    const rawProfile = catalog[i];
    const validated = validateOrbitProfile(rawProfile);

    if (seenIds.has(validated.id)) {
      throw new Error(`Duplicate profile ID detected in orbit catalog: "${validated.id}" at index ${i}`);
    }
    seenIds.add(validated.id);

    // Also check aliases for uniqueness
    if (validated.aliases) {
      for (const alias of validated.aliases) {
        if (seenIds.has(alias)) {
          throw new Error(`Alias conflict detected in orbit catalog: "${alias}" at profile "${validated.id}"`);
        }
        seenIds.add(alias);
      }
    }

    validatedProfiles.push(validated);
  }

  return validatedProfiles;
}
