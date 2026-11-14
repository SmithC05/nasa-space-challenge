import { describe, expect, it } from 'vitest';
import {
  LAUNCH_VEHICLES,
  MISSION_SCENARIOS,
  ORBIT_PROFILES
} from '@orbital/game-data';
import {
  evaluateMissionSuitability,
  getDetailedLaunchValidation,
  validateLaunchConfiguration,
  validateLaunchVehicleSuitability
} from '../index';

describe('ORBITAL Phase 4: Mission Suitability Validation & Orbit Alignment', () => {
  const earthSentinelScenario = MISSION_SCENARIOS.find((s) => s.id === 'scenario-earth-sentinel')!;
  const aresReconScenario = MISSION_SCENARIOS.find((s) => s.id === 'scenario-ares-recon')!;

  const liteVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-lite')!;
  const coreVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-core')!;
  const heavyVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-heavy')!;

  const ssoOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-sso')!;
  const polarOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-polar')!;
  const leoOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-leo')!;
  const geoOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-geo')!;

  const standardMassKg = 368;
  const standardCostMUSD = 67.4;

  // =========================================================================
  // 1. EARTH SENTINEL + GEO (CRITICAL ISSUE TEST)
  // =========================================================================
  describe('1. Earth Sentinel with Geostationary Orbit (GEO)', () => {
    it('blocks launch clearance for Earth Sentinel in GEO despite passing technical and budget checks', () => {
      const validation = getDetailedLaunchValidation(
        coreVehicle,
        geoOrbit,
        standardMassKg,
        earthSentinelScenario.budgetMUSD,
        standardCostMUSD,
        undefined,
        earthSentinelScenario
      );

      // Vehicle payload compatibility: ORBITAL-Core has 5,800 kg GTO/GEO capacity (5,800 - 368 = +5,432 kg)
      expect(validation.isPayloadCompatible).toBe(true);
      expect(validation.payloadMarginKg).toBe(5432);
      expect(validation.isOrbitCompatible).toBe(true);
      expect(validation.isFairingCompatible).toBe(true);
      expect(validation.isTechnicallyCompatible).toBe(true);

      // Budget check: $67.4M + $54.0M = $121.4M <= $140M base budget
      expect(validation.isWithinBaseBudget).toBe(true);
      expect(validation.isBudgetCleared).toBe(true);
      expect(validation.budgetStatus).toBe('WITHIN_BUDGET');

      // Mission suitability check: MUST BE UNSUITABLE
      expect(validation.isMissionSuitable).toBe(false);
      expect(validation.missionSuitabilityStatus).toBe('UNSUITABLE');
      expect(validation.polarCoverageSatisfied).toBe(false);

      // Overall launch clearance MUST BE WITHHELD
      expect(validation.isOverallCleared).toBe(false);

      // Explanation message must describe polar mandate violation
      expect(validation.missionErrors.length).toBeGreaterThan(0);
      expect(validation.missionErrors[0]).toContain('Mission Mandate Violation: Earth Sentinel requires polar ice cap coverage');
      expect(validation.missionErrors[0]).toContain('Geostationary Orbit (GEO) is equatorial');
      expect(validation.allErrors).toContain(validation.missionErrors[0]);
    });

    it('validateLaunchVehicleSuitability and validateLaunchConfiguration also reject Earth Sentinel in GEO', () => {
      const suitResult = validateLaunchVehicleSuitability(
        coreVehicle,
        geoOrbit,
        standardMassKg,
        earthSentinelScenario.budgetMUSD,
        standardCostMUSD,
        undefined,
        earthSentinelScenario
      );
      expect(suitResult.isValid).toBe(false);
      expect(suitResult.errors.some((e) => e.includes('Earth Sentinel requires polar ice cap coverage'))).toBe(true);

      const configResult = validateLaunchConfiguration(
        coreVehicle,
        geoOrbit,
        standardMassKg,
        earthSentinelScenario.budgetMUSD,
        standardCostMUSD,
        earthSentinelScenario
      );
      expect(configResult.isCompatible).toBe(false);
    });
  });

  // =========================================================================
  // 2. EARTH SENTINEL + SSO (PRIME RECOMMENDED ORBIT)
  // =========================================================================
  describe('2. Earth Sentinel with Sun-Synchronous Orbit (SSO)', () => {
    it('authorizes launch with optimal mission suitability and 100% polar coverage', () => {
      const validation = getDetailedLaunchValidation(
        coreVehicle,
        ssoOrbit,
        standardMassKg,
        earthSentinelScenario.budgetMUSD,
        standardCostMUSD,
        undefined,
        earthSentinelScenario
      );

      // Technical compatibility
      expect(validation.isTechnicallyCompatible).toBe(true);
      expect(validation.payloadMarginKg).toBe(12502);

      // Budget
      expect(validation.isBudgetCleared).toBe(true);

      // Mission suitability
      expect(validation.isMissionSuitable).toBe(true);
      expect(validation.missionSuitabilityStatus).toBe('OPTIMAL');
      expect(validation.polarCoverageSatisfied).toBe(true);
      expect(validation.missionErrors).toHaveLength(0);

      // Overall clearance
      expect(validation.isOverallCleared).toBe(true);
      expect(validation.recommendations.some((r) => r.includes('Sun-Synchronous Orbit satisfies all Earth Sentinel cryosphere observation'))).toBe(true);
    });
  });

  // =========================================================================
  // 3. EARTH SENTINEL + POLAR (VIABLE POLAR CANDIDATE)
  // =========================================================================
  describe('3. Earth Sentinel with Polar Orbit (90°)', () => {
    it('authorizes launch for Polar orbit providing direct pole-crossing coverage', () => {
      const validation = getDetailedLaunchValidation(
        coreVehicle,
        polarOrbit,
        standardMassKg,
        earthSentinelScenario.budgetMUSD,
        standardCostMUSD,
        undefined,
        earthSentinelScenario
      );

      expect(validation.isTechnicallyCompatible).toBe(true);
      expect(validation.isBudgetCleared).toBe(true);

      expect(validation.isMissionSuitable).toBe(true);
      expect(validation.missionSuitabilityStatus).toBe('OPTIMAL');
      expect(validation.polarCoverageSatisfied).toBe(true);
      expect(validation.missionErrors).toHaveLength(0);

      expect(validation.isOverallCleared).toBe(true);
      expect(validation.recommendations.some((r) => r.includes('Polar Orbit provides direct pole-crossing coverage'))).toBe(true);
    });
  });

  // =========================================================================
  // 4. EARTH SENTINEL + LEO (ALTERNATIVE ORBIT WITH WARNING)
  // =========================================================================
  describe('4. Earth Sentinel with Low Earth Orbit (LEO, 51.6°)', () => {
    it('permits mission but displays explicit warning and limitation explanation', () => {
      const validation = getDetailedLaunchValidation(
        coreVehicle,
        leoOrbit,
        standardMassKg,
        earthSentinelScenario.budgetMUSD,
        standardCostMUSD,
        undefined,
        earthSentinelScenario
      );

      expect(validation.isTechnicallyCompatible).toBe(true);
      expect(validation.isBudgetCleared).toBe(true);

      // Acceptable with warning
      expect(validation.isMissionSuitable).toBe(true);
      expect(validation.missionSuitabilityStatus).toBe('ACCEPTABLE_WITH_WARNING');
      expect(validation.polarCoverageSatisfied).toBe(false);
      expect(validation.missionErrors).toHaveLength(0);

      // Overall cleared because it is a permitted alternative
      expect(validation.isOverallCleared).toBe(true);

      // Must have explicit warning explaining limitation
      expect(validation.warnings.some((w) => w.includes('Mission Limitation: 51.6° Low Earth Orbit (LEO)'))).toBe(true);
      expect(validation.warnings.some((w) => w.includes('excludes Arctic and Antarctic ice sheets'))).toBe(true);
    });
  });

  // =========================================================================
  // 5. MISSION-DEPENDENT VALIDATION (GEO SUITABLE FOR OTHER MISSIONS)
  // =========================================================================
  describe('5. Mission-Dependent Validation: GEO is NOT hardcoded as invalid', () => {
    it('approves GEO for missions where GEO is a certified target regime (e.g., Ares Recon)', () => {
      const suitability = evaluateMissionSuitability(geoOrbit, aresReconScenario);

      expect(suitability.isMissionSuitable).toBe(true);
      expect(suitability.missionSuitabilityStatus).toBe('OPTIMAL');
      expect(suitability.missionErrors).toHaveLength(0);
      expect(suitability.missionSuitabilityReasons[0]).toContain('Certified Flight Regime');

      const validation = getDetailedLaunchValidation(
        coreVehicle,
        geoOrbit,
        standardMassKg,
        aresReconScenario.budgetMUSD,
        standardCostMUSD,
        undefined,
        aresReconScenario
      );

      expect(validation.isMissionSuitable).toBe(true);
      expect(validation.isOverallCleared).toBe(true);
    });

    it('approves GEO when evaluated without scenario restrictions', () => {
      const suitability = evaluateMissionSuitability(geoOrbit);
      expect(suitability.isMissionSuitable).toBe(true);
      expect(suitability.missionSuitabilityStatus).toBe('OPTIMAL');
    });
  });

  // =========================================================================
  // 6. SUFFICIENT VEHICLE CAPACITY BUT UNSUITABLE MISSION ORBIT
  // =========================================================================
  describe('6. Vehicle with Sufficient Capacity but Unsuitable Mission Orbit', () => {
    it('ORBITAL-Heavy has +8,832 kg payload reserve to GEO but launch clearance is withheld for Earth Sentinel', () => {
      const validation = getDetailedLaunchValidation(
        heavyVehicle,
        geoOrbit,
        standardMassKg,
        earthSentinelScenario.budgetMUSD,
        standardCostMUSD,
        undefined,
        earthSentinelScenario
      );

      // Massive payload reserve
      expect(validation.isPayloadCompatible).toBe(true);
      expect(validation.effectiveCapacityKg).toBe(9200);
      expect(validation.payloadMarginKg).toBe(8832);
      expect(validation.isTechnicallyCompatible).toBe(true);

      // Mission suitability fails
      expect(validation.isMissionSuitable).toBe(false);
      expect(validation.missionSuitabilityStatus).toBe('UNSUITABLE');

      // Overall clearance withheld
      expect(validation.isOverallCleared).toBe(false);
    });
  });
});
