# ORBITAL: Mission Control — Shared Contracts

## 1. Overview

All cross-module TypeScript types and matching runtime Zod validation schemas reside in:
`packages/contracts/src/index.ts`

This package is consumed by all packages and applications in the monorepo:
- `@orbital/game-data`
- `@orbital/simulation-engine`
- `@orbital/database`
- `@orbital/api`
- `@orbital/web`

## 2. Core Shared Contracts

- `MissionScenario`: Scientific campaign parameters, budget, max mass, target orbit.
- `ComponentDefinition`: Hardware subsystems available in Spacecraft Design Lab.
- `ResourceSnapshot`: Power, mass, cost, battery endurance, and reliability metrics.
- `SpacecraftDesign`: Selected components and computed resource snapshot.
- `OrbitProfile`: Target orbital trajectory characteristics.
- `LaunchVehicle`: Booster launch vehicle specifications.
- `LaunchConfiguration`: Spacecraft, vehicle, and orbit pairing validation.
- `ValidationResult`: Structured errors, warnings, and recommendations.
- `MissionSimulationState`: Telemetry snapshot, phase, clock, and event logs.
- `MissionReport`: Final debrief score, science yield, and accolades.

## 3. Protocol for Contract Changes

1. **Coordination First**: No developer may independently alter `packages/contracts` without submitting a formal extension proposal to the Integration Lead.
2. **Backwards Compatibility**: Extensions must preserve compatibility with existing database columns and simulation calculations.
3. **Module-Level Specialization**: Features requiring rich domain data (such as Orbit Studio visualization and educational metadata) should extend the base contract in their respective domain package (`packages/game-data/src/orbit-profiles/types.ts`) until approved for global contract promotion.

## 4. Phase 1 Integration Lead Proposal: DetailedOrbitProfile Extension

### Base Contract (`OrbitProfile`):
```typescript
export interface OrbitProfile {
  id: string;
  name: string;
  type: 'LEO' | 'SSO' | 'GTO' | 'GEO' | 'MOLNIYA' | 'TLI';
  perigeeKm: number;
  apogeeKm: number;
  inclinationDeg: number;
  orbitalPeriodMin: number;
  eclipseFraction: number;
  requiredDeltaVMps: number;
  radiationSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  description: string;
}
```

### Proposed Compatible Extensions:
To support rich UI presentation and 3D visualization without breaking base compatibility, `DetailedOrbitProfile` extends `OrbitProfile` with:
- `category`: `'LEO' | 'SSO' | 'POLAR' | 'GEO'`
- `coverageCharacteristics`: Ground track, repeat cycle, latitude limits, revisit time, polar coverage.
- `missionSuitability`: Primary applications, target scenarios, Earth Sentinel suitability flag.
- `advantages` & `disadvantages`: Educational tradeoff arrays.
- `configurationRestrictions`: Minimum battery endurance, delta-V, thermal notes, protection level.
- `visualizationParameters`: Orbit radius, color, visibility, animation speed, scale factor.
- `educationalAssumptions`: Modeling simplifications and fidelity disclaimer.

## 5. Phase 5 Integration Lead Proposal: LaunchConfiguration Handoff Extension

### Developer 04 (Mission Operations Center) Handoff Requirements:
To initialize real-time Mission Operations upon orbital launch authorization, Developer 04 requires:
1. `scenarioId`: Active campaign identifier.
2. `spacecraftId` & `spacecraftName`: Spacecraft identity and payload designation.
3. `status`: Launch configuration lifecycle status (`'DRAFT' | 'VALIDATED' | 'CONFIRMED' | 'BLOCKED'`).
4. `validationSummary`: Consolidated gate results, overall status (`'VALID' | 'WARNING' | 'CRITICAL' | 'BLOCKED'`), errors, and warnings.
5. `totalCostMUSD`: Combined spacecraft and booster cost.
6. `confirmedAt`: UTC timestamp of flight authorization.

### Proposed Compatible Extensions:
All added fields are optional with defaults, preserving 100% backward compatibility for all consumers and database serialization.
```typescript
export const LaunchConfigurationStatusSchema = z.enum(['DRAFT', 'VALIDATED', 'CONFIRMED', 'BLOCKED']);
export type LaunchConfigurationStatus = z.infer<typeof LaunchConfigurationStatusSchema>;

export const LaunchValidationSummarySchema = z.object({
  isPayloadCompatible: z.boolean(),
  isFairingCompatible: z.boolean(),
  isOrbitCompatible: z.boolean(),
  isTechnicallyCompatible: z.boolean(),
  isBudgetCleared: z.boolean(),
  isMissionSuitable: z.boolean(),
  overallStatus: z.enum(['VALID', 'WARNING', 'CRITICAL', 'BLOCKED']),
  errors: z.array(z.string()),
  warnings: z.array(z.string())
});
export type LaunchValidationSummary = z.infer<typeof LaunchValidationSummarySchema>;

export const LaunchConfigurationSchema = z.object({
  vehicleId: z.string(),
  orbitId: z.string(),
  spacecraftMassKg: z.number().positive(),
  launchWindow: z.string(),
  launchSite: z.string(),
  isCompatible: z.boolean(),
  payloadMarginKg: z.number(),
  estimatedCostMUSD: z.number(),
  // Extended handoff fields
  scenarioId: z.string().optional(),
  spacecraftId: z.string().optional(),
  spacecraftName: z.string().optional(),
  status: LaunchConfigurationStatusSchema.optional().default('DRAFT'),
  validationSummary: LaunchValidationSummarySchema.optional(),
  totalCostMUSD: z.number().optional(),
  confirmedAt: z.string().optional()
});
```
