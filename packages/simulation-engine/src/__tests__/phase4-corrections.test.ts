import { describe, expect, it } from 'vitest';
import {
  LAUNCH_VEHICLES,
  ORBIT_PROFILES,
  getLaunchVehicleById
} from '@orbital/game-data';
import {
  calculateVehicleOrbitCapacity,
  getDetailedLaunchValidation,
  validateLaunchConfiguration
} from '../index';

describe('ORBITAL Phase 4 Corrections: Selection Synchronization & Budget Separation', () => {
  const lite = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-lite')!;
  const core = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-core')!;
  const heavy = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-heavy')!;
  const superHeavy = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-superheavy')!;

  const ssoOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-sso')!;
  const geoOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-geo')!;
  const leoOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-leo')!;

  // =========================================================================
  // 1. VEHICLE CAPACITY & PAYLOAD MARGIN SYNCHRONIZATION
  // =========================================================================
  describe('1. Vehicle Capacity & Payload Margin for 368 kg Spacecraft in SSO', () => {
    const spacecraftMassKg = 368;

    it('ORBITAL-Lite: capacity 507 kg, margin 507 - 368 = +139 kg', () => {
      const cap = calculateVehicleOrbitCapacity(lite, ssoOrbit);
      expect(cap).toBe(507);
      const margin = Number((cap - spacecraftMassKg).toFixed(1));
      expect(margin).toBe(139);
    });

    it('ORBITAL-Core: capacity 12,870 kg, margin 12,870 - 368 = +12,502 kg', () => {
      const cap = calculateVehicleOrbitCapacity(core, ssoOrbit);
      expect(cap).toBe(12870);
      const margin = Number((cap - spacecraftMassKg).toFixed(1));
      expect(margin).toBe(12502);
    });

    it('ORBITAL-Heavy: capacity 19,110 kg, margin 19,110 - 368 = +18,742 kg', () => {
      const cap = calculateVehicleOrbitCapacity(heavy, ssoOrbit);
      expect(cap).toBe(19110);
      const margin = Number((cap - spacecraftMassKg).toFixed(1));
      expect(margin).toBe(18742);
    });

    it('ORBITAL-SuperHeavy: capacity 74,100 kg, margin 74,100 - 368 = +73,732 kg', () => {
      const cap = calculateVehicleOrbitCapacity(superHeavy, ssoOrbit);
      expect(cap).toBe(74100);
      const margin = Number((cap - spacecraftMassKg).toFixed(1));
      expect(margin).toBe(73732);
    });

    it('switching from SuperHeavy to Heavy updates capacity from 74,100 kg to 19,110 kg with no stale state', () => {
      // 1. SuperHeavy validation
      const superHeavyVal = getDetailedLaunchValidation(superHeavy, ssoOrbit, spacecraftMassKg, 140, 67.4);
      expect(superHeavyVal.effectiveCapacityKg).toBe(74100);
      expect(superHeavyVal.payloadMarginKg).toBe(73732);
      expect(superHeavyVal.boosterCostMUSD).toBe(175.0);

      // 2. Heavy validation (switched)
      const heavyVal = getDetailedLaunchValidation(heavy, ssoOrbit, spacecraftMassKg, 140, 67.4);
      expect(heavyVal.effectiveCapacityKg).toBe(19110);
      expect(heavyVal.payloadMarginKg).toBe(18742);
      expect(heavyVal.boosterCostMUSD).toBe(98.0);

      // Ensure no properties cross-contaminate
      expect(heavyVal.effectiveCapacityKg).not.toBe(superHeavyVal.effectiveCapacityKg);
      expect(heavyVal.payloadMarginKg).not.toBe(superHeavyVal.payloadMarginKg);
      expect(heavyVal.boosterCostMUSD).not.toBe(superHeavyVal.boosterCostMUSD);
    });
  });

  // =========================================================================
  // 2. SEPARATION OF TECHNICAL COMPATIBILITY FROM BUDGET CLEARANCE
  // =========================================================================
  describe('2. Separation of Technical Compatibility and Budget Clearance', () => {
    const spacecraftMassKg = 368;
    const spacecraftCostMUSD = 67.4;
    const scenarioBudgetMUSD = 140; // Max allowed with 15% buffer = 161.0M

    it('ORBITAL-Heavy: TECHNICALLY COMPATIBLE while BUDGET EXCEEDED ($165.4M > $161.0M)', () => {
      const validation = getDetailedLaunchValidation(
        heavy,
        ssoOrbit,
        spacecraftMassKg,
        scenarioBudgetMUSD,
        spacecraftCostMUSD
      );

      // Technical gates must ALL be TRUE
      expect(validation.isPayloadCompatible).toBe(true);
      expect(validation.isOrbitCompatible).toBe(true);
      expect(validation.isFairingCompatible).toBe(true);
      expect(validation.isTechnicallyCompatible).toBe(true);

      // Budget gates must be FALSE
      expect(validation.isWithinBaseBudget).toBe(false);
      expect(validation.isWithinContingencyBudget).toBe(false);
      expect(validation.isBudgetCleared).toBe(false);
      expect(validation.budgetStatus).toBe('BUDGET_EXCEEDED');

      // Overall clearance must be WITHHELD due to budget
      expect(validation.isOverallCleared).toBe(false);
    });

    it('correctly calculates the exact $4.4M budget overrun for ORBITAL-Heavy', () => {
      const validation = getDetailedLaunchValidation(
        heavy,
        ssoOrbit,
        spacecraftMassKg,
        scenarioBudgetMUSD,
        spacecraftCostMUSD
      );

      expect(validation.baseBudgetMUSD).toBe(140);
      expect(validation.maxBudgetWithBufferMUSD).toBe(161.0);
      expect(validation.spacecraftCostMUSD).toBe(67.4);
      expect(validation.boosterCostMUSD).toBe(98.0);
      expect(validation.totalMissionCostMUSD).toBe(165.4); // 67.4 + 98.0
      expect(validation.budgetOverrunMUSD).toBe(4.4); // 165.4 - 161.0
    });

    it('ORBITAL-Core: both TECHNICALLY COMPATIBLE and WITHIN BUDGET ($121.4M <= $140M)', () => {
      const validation = getDetailedLaunchValidation(
        core,
        ssoOrbit,
        spacecraftMassKg,
        scenarioBudgetMUSD,
        spacecraftCostMUSD
      );

      expect(validation.isTechnicallyCompatible).toBe(true);
      expect(validation.isBudgetCleared).toBe(true);
      expect(validation.budgetStatus).toBe('WITHIN_BUDGET');
      expect(validation.totalMissionCostMUSD).toBe(121.4); // 67.4 + 54.0
      expect(validation.budgetOverrunMUSD).toBe(0);
      expect(validation.budgetBufferRemainingMUSD).toBe(18.6); // 140 - 121.4
      expect(validation.isOverallCleared).toBe(true);
    });

    it('ORBITAL-Lite: TECHNICALLY COMPATIBLE and WITHIN BUDGET for 368kg payload', () => {
      const validation = getDetailedLaunchValidation(
        lite,
        ssoOrbit,
        spacecraftMassKg,
        scenarioBudgetMUSD,
        spacecraftCostMUSD
      );

      expect(validation.isTechnicallyCompatible).toBe(true);
      expect(validation.payloadMarginKg).toBe(139);
      expect(validation.isBudgetCleared).toBe(true);
      expect(validation.totalMissionCostMUSD).toBe(75.9); // 67.4 + 8.5
      expect(validation.isOverallCleared).toBe(true);
    });

    it('ORBITAL-Lite on direct GEO: INCOMPATIBLE technically (regime restricted) even if budget is cleared', () => {
      const validation = getDetailedLaunchValidation(
        lite,
        geoOrbit,
        100, // Small mass within GTO capacity
        scenarioBudgetMUSD,
        spacecraftCostMUSD
      );

      expect(validation.isBudgetCleared).toBe(true); // $75.9M < $140M
      expect(validation.isOrbitCompatible).toBe(false); // Direct GEO unsupported
      expect(validation.isTechnicallyCompatible).toBe(false);
      expect(validation.isOverallCleared).toBe(false);
    });
  });

  // =========================================================================
  // 3. CONTINGENCY BUFFER VERIFICATION (15%)
  // =========================================================================
  describe('3. Contingency Buffer Calculation & Tiered States', () => {
    it('accurately identifies CONTINGENCY_USED when cost is between base and max buffer', () => {
      const baseBudget = 100;
      const maxBudget = 115; // 100 * 1.15
      const spacecraftCost = 50;
      const boosterCost = core.launchCostMUSD; // 54. Total = 104

      const validation = getDetailedLaunchValidation(
        core,
        ssoOrbit,
        500,
        baseBudget,
        spacecraftCost
      );

      expect(validation.totalMissionCostMUSD).toBe(104);
      expect(validation.isWithinBaseBudget).toBe(false);
      expect(validation.isWithinContingencyBudget).toBe(true);
      expect(validation.budgetStatus).toBe('CONTINGENCY_USED');
      expect(validation.budgetBufferRemainingMUSD).toBe(11.0); // 115 - 104
      expect(validation.isOverallCleared).toBe(true);
    });

    it('withholds launch clearance whenever total cost exceeds max budget buffer by even 0.1M', () => {
      const baseBudget = 100; // max = 115.0
      const spacecraftCost = 61.1; // Total = 61.1 + 54 = 115.1 > 115.0

      const validation = getDetailedLaunchValidation(
        core,
        ssoOrbit,
        500,
        baseBudget,
        spacecraftCost
      );

      expect(validation.totalMissionCostMUSD).toBe(115.1);
      expect(validation.budgetStatus).toBe('BUDGET_EXCEEDED');
      expect(validation.budgetOverrunMUSD).toBe(0.1);
      expect(validation.isOverallCleared).toBe(false);
    });
  });
});
