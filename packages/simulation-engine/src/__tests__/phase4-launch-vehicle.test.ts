import { describe, expect, it } from 'vitest';
import {
  LAUNCH_VEHICLES,
  ORBIT_PROFILES,
  getLaunchVehicleById,
  getOrbitProfileById
} from '@orbital/game-data';
import {
  calculateVehicleOrbitCapacity,
  validateLaunchConfiguration,
  validateLaunchVehicleSuitability
} from '../index';

describe('ORBITAL Phase 4: Launch Vehicle Catalog & Selection Test Suite', () => {
  const liteVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-lite')!;
  const coreVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-core')!;
  const heavyVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-heavy')!;
  const superHeavyVehicle = LAUNCH_VEHICLES.find((v) => v.id === 'vehicle-orbital-superheavy')!;

  const leoOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-leo')!;
  const ssoOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-sso')!;
  const polarOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-polar')!;
  const geoOrbit = ORBIT_PROFILES.find((p) => p.id === 'orbit-geo')!;

  // 1. Launch vehicle catalog retrieval
  describe('1. Launch Vehicle Catalog Retrieval', () => {
    it('retrieves all 4 fleet vehicles from shared game-data catalog', () => {
      expect(LAUNCH_VEHICLES).toHaveLength(4);
      expect(liteVehicle).toBeDefined();
      expect(coreVehicle).toBeDefined();
      expect(heavyVehicle).toBeDefined();
      expect(superHeavyVehicle).toBeDefined();
    });

    it('ensures each vehicle has complete, valid specifications according to contract', () => {
      for (const vehicle of LAUNCH_VEHICLES) {
        expect(vehicle.id).toBeTruthy();
        expect(vehicle.name).toBeTruthy();
        expect(vehicle.class).toMatch(/Light|Medium|Heavy|SuperHeavy/);
        expect(vehicle.manufacturer).toBeTruthy();
        expect(vehicle.payloadCapacityLeoKg).toBeGreaterThan(0);
        expect(vehicle.payloadCapacityGtoKg).toBeGreaterThan(0);
        expect(vehicle.payloadCapacityTliKg).toBeGreaterThan(0);
        expect(vehicle.fairingDiameterM).toBeGreaterThan(0);
        expect(vehicle.fairingHeightM).toBeGreaterThan(0);
        expect(vehicle.launchCostMUSD).toBeGreaterThan(0);
        expect(vehicle.successRatePercent).toBeGreaterThanOrEqual(90);
        expect(vehicle.description).toBeTruthy();
        expect(typeof vehicle.reusable).toBe('boolean');
        expect(vehicle.compatibleOrbitProfiles?.length).toBeGreaterThan(0);
        expect(vehicle.supportedDestinations?.length).toBeGreaterThan(0);
        expect(vehicle.deploymentRestrictions?.length).toBeGreaterThan(0);
        expect(vehicle.simulationDisclaimer).toBeTruthy();
      }
    });

    it('clearly distinguishes fictional vehicles from NASA exploration reference architecture', () => {
      expect(liteVehicle.manufacturer).toContain('Fictional');
      expect(coreVehicle.manufacturer).toContain('Fictional');
      expect(heavyVehicle.manufacturer).toContain('Fictional');
      expect(superHeavyVehicle.name).toContain('Exploration Reference');
      expect(superHeavyVehicle.manufacturer).toContain('NASA Reference Architecture');
    });
  });

  // 2. Vehicle selection
  describe('2. Vehicle Selection & Lookup', () => {
    it('selects vehicle by direct ID', () => {
      const selected = getLaunchVehicleById('vehicle-orbital-core');
      expect(selected).toBeDefined();
      expect(selected?.name).toBe('ORBITAL-Core');
      expect(selected?.class).toBe('Medium');
    });

    it('resolves legacy alias vehicle IDs for backwards compatibility', () => {
      expect(getLaunchVehicleById('vehicle-nova-light')?.id).toBe('vehicle-orbital-lite');
      expect(getLaunchVehicleById('vehicle-phoenix-medium')?.id).toBe('vehicle-orbital-core');
      expect(getLaunchVehicleById('vehicle-atlas-heavy')?.id).toBe('vehicle-orbital-heavy');
      expect(getLaunchVehicleById('vehicle-titan-superheavy')?.id).toBe('vehicle-orbital-superheavy');
    });
  });

  // 3. Selected vehicle state updates
  describe('3. Selected Vehicle State Updates', () => {
    it('updates launch configuration parameters when a new vehicle is selected', () => {
      const initialConfig = validateLaunchConfiguration(coreVehicle, ssoOrbit, 1200, 150, 40);
      expect(initialConfig.vehicleId).toBe('vehicle-orbital-core');
      expect(initialConfig.estimatedCostMUSD).toBe(54.0);
      expect(initialConfig.launchSite).toBe('Cape Canaveral Space Force Station, SLC-40');

      // Switch to Light booster
      const updatedConfig = validateLaunchConfiguration(liteVehicle, leoOrbit, 400, 150, 40);
      expect(updatedConfig.vehicleId).toBe('vehicle-orbital-lite');
      expect(updatedConfig.estimatedCostMUSD).toBe(8.5);
      expect(updatedConfig.launchSite).toBe('Vandenberg Space Force Base, SLC-2');
    });
  });

  // 4. Payload capacity by orbit
  describe('4. Payload Capacity by Orbit Regime', () => {
    it('calculates full LEO capacity for equatorial/mid-latitude LEO', () => {
      expect(calculateVehicleOrbitCapacity(coreVehicle, leoOrbit)).toBe(16500);
      expect(calculateVehicleOrbitCapacity(liteVehicle, leoOrbit)).toBe(650);
      expect(calculateVehicleOrbitCapacity(heavyVehicle, leoOrbit)).toBe(24500);
    });

    it('applies the 78% polar inclination penalty for SSO and Polar regimes', () => {
      const expectedCorePolar = Math.round(16500 * 0.78); // 12,870 kg
      expect(calculateVehicleOrbitCapacity(coreVehicle, ssoOrbit)).toBe(expectedCorePolar);
      expect(calculateVehicleOrbitCapacity(coreVehicle, polarOrbit)).toBe(expectedCorePolar);

      const expectedLitePolar = Math.round(650 * 0.78); // 507 kg
      expect(calculateVehicleOrbitCapacity(liteVehicle, ssoOrbit)).toBe(expectedLitePolar);
      expect(calculateVehicleOrbitCapacity(liteVehicle, polarOrbit)).toBe(expectedLitePolar);
    });

    it('uses GTO payload capacity for high-energy GEO regime', () => {
      expect(calculateVehicleOrbitCapacity(coreVehicle, geoOrbit)).toBe(5800);
      expect(calculateVehicleOrbitCapacity(heavyVehicle, geoOrbit)).toBe(9200);
      expect(calculateVehicleOrbitCapacity(superHeavyVehicle, geoOrbit)).toBe(38000);
    });
  });

  // 5. Payload margin calculation
  describe('5. Payload Margin Calculation', () => {
    it('calculates exact positive payload mass margin for compliant spacecraft', () => {
      const spacecraftMassKg = 850;
      const config = validateLaunchConfiguration(coreVehicle, ssoOrbit, spacecraftMassKg, 150, 40);
      const expectedCapacity = Math.round(16500 * 0.78); // 12870
      expect(config.payloadMarginKg).toBe(Number((expectedCapacity - spacecraftMassKg).toFixed(1)));
      expect(config.payloadMarginKg).toBe(12020);
      expect(config.isCompatible).toBe(true);
    });

    it('calculates exact negative deficit when spacecraft exceeds vehicle capacity', () => {
      const heavySpacecraftKg = 1500;
      const config = validateLaunchConfiguration(liteVehicle, leoOrbit, heavySpacecraftKg, 150, 40);
      expect(config.payloadMarginKg).toBe(650 - 1500);
      expect(config.payloadMarginKg).toBe(-850);
      expect(config.isCompatible).toBe(false);
    });
  });

  // 6. Destination compatibility
  describe('6. Destination & Orbital Regime Compatibility', () => {
    it('rejects Light-class booster attempting direct GEO or TLI injection', () => {
      const suitabilityGeo = validateLaunchVehicleSuitability(liteVehicle, geoOrbit, 100, 150, 40);
      expect(suitabilityGeo.isValid).toBe(false);
      expect(suitabilityGeo.errors.some((e) => e.includes('high-energy upper stage'))).toBe(true);
    });

    it('clears Medium and Heavy vehicles for high-energy GEO destination', () => {
      const suitabilityCore = validateLaunchVehicleSuitability(coreVehicle, geoOrbit, 2000, 150, 40);
      expect(suitabilityCore.isValid).toBe(true);
      expect(suitabilityCore.errors).toHaveLength(0);
    });
  });

  // 7. Fairing restrictions
  describe('7. Fairing Dimension Constraints', () => {
    it('detects when spacecraft diameter exceeds fairing dynamic clearance envelope', () => {
      // Lite fairing diameter: 1.8m (usable max ~1.58m)
      const oversizedSpacecraft = { diameterM: 2.2, heightM: 2.0 };
      const suitability = validateLaunchVehicleSuitability(
        liteVehicle,
        leoOrbit,
        300,
        150,
        40,
        oversizedSpacecraft
      );
      expect(suitability.isValid).toBe(false);
      expect(suitability.errors.some((e) => e.includes('exceeds dynamic payload fairing envelope'))).toBe(true);
    });

    it('detects when spacecraft height exceeds fairing vertical clearance', () => {
      // Lite fairing height: 3.5m (usable max ~2.87m)
      const tallSpacecraft = { diameterM: 1.2, heightM: 4.2 };
      const suitability = validateLaunchVehicleSuitability(
        liteVehicle,
        leoOrbit,
        300,
        150,
        40,
        tallSpacecraft
      );
      expect(suitability.isValid).toBe(false);
      expect(suitability.errors.some((e) => e.includes('exceeds usable fairing height'))).toBe(true);
    });

    it('passes when spacecraft dimensions fit comfortably within fairing envelope', () => {
      const compliantSpacecraft = { diameterM: 1.2, heightM: 2.0 };
      const suitability = validateLaunchVehicleSuitability(
        liteVehicle,
        leoOrbit,
        300,
        150,
        40,
        compliantSpacecraft
      );
      expect(suitability.isValid).toBe(true);
      expect(suitability.errors).toHaveLength(0);
    });
  });

  // 8. Budget validation
  describe('8. Mission Budget & Cost Validation', () => {
    it('approves launch when combined mission cost is well within budget', () => {
      const spacecraftCost = 35;
      const budget = 120;
      const suitability = validateLaunchVehicleSuitability(coreVehicle, ssoOrbit, 1000, budget, spacecraftCost);
      expect(suitability.isValid).toBe(true);
      expect(suitability.errors).toHaveLength(0);
    });

    it('rejects configuration when total cost exceeds scenario budget + 15% contingency ceiling', () => {
      const expensiveSpacecraft = 80;
      const boosterCost = superHeavyVehicle.launchCostMUSD; // 175
      const tightBudget = 150; // Ceiling = 150 * 1.15 = 172.5, but total = 255
      const suitability = validateLaunchVehicleSuitability(
        superHeavyVehicle,
        leoOrbit,
        5000,
        tightBudget,
        expensiveSpacecraft
      );
      expect(suitability.isValid).toBe(false);
      expect(suitability.errors.some((e) => e.includes('exceeds allowable budget'))).toBe(true);
    });

    it('emits contingency warning when utilizing the 15% overrun buffer', () => {
      const spacecraftCost = 70;
      const boosterCost = coreVehicle.launchCostMUSD; // 54. Total = 124
      const baseBudget = 115; // Base is 115, ceiling is 115 * 1.15 = 132.25
      const suitability = validateLaunchVehicleSuitability(
        coreVehicle,
        ssoOrbit,
        1000,
        baseBudget,
        spacecraftCost
      );
      expect(suitability.isValid).toBe(true);
      expect(suitability.warnings.some((w) => w.includes('contingency reserve'))).toBe(true);
    });
  });

  // 9. Vehicle comparison
  describe('9. Multi-Vehicle Comparative Analysis', () => {
    it('compares all fleet vehicles on specific launch cost per kg to target orbit', () => {
      const targetOrbit = ssoOrbit;
      const comparisons = LAUNCH_VEHICLES.map((v) => {
        const capacityKg = calculateVehicleOrbitCapacity(v, targetOrbit);
        const costPerKg = (v.launchCostMUSD * 1000000) / capacityKg;
        return {
          id: v.id,
          name: v.name,
          capacityKg,
          costMUSD: v.launchCostMUSD,
          costPerKg
        };
      });

      expect(comparisons).toHaveLength(4);
      // ORBITAL-Core achieves economies of scale through reusability compared to smallsat booster
      const liteComp = comparisons.find((c) => c.id === 'vehicle-orbital-lite')!;
      const coreComp = comparisons.find((c) => c.id === 'vehicle-orbital-core')!;
      expect(coreComp.costPerKg).toBeLessThan(liteComp.costPerKg);
    });

    it('verifies monotonic capacity increase across classes: Light < Medium < Heavy < SuperHeavy', () => {
      expect(liteVehicle.payloadCapacityLeoKg).toBeLessThan(coreVehicle.payloadCapacityLeoKg);
      expect(coreVehicle.payloadCapacityLeoKg).toBeLessThan(heavyVehicle.payloadCapacityLeoKg);
      expect(heavyVehicle.payloadCapacityLeoKg).toBeLessThan(superHeavyVehicle.payloadCapacityLeoKg);
    });
  });

  // 10. Flight integration checklist consistency
  describe('10. Flight Integration Checklist Consistency', () => {
    it('ensures validateLaunchConfiguration and validateLaunchVehicleSuitability are 100% synchronized', () => {
      for (const vehicle of LAUNCH_VEHICLES) {
        for (const orbit of ORBIT_PROFILES) {
          const config = validateLaunchConfiguration(vehicle, orbit, 1200, 150, 45);
          const suitability = validateLaunchVehicleSuitability(vehicle, orbit, 1200, 150, 45);
          expect(config.isCompatible).toBe(suitability.isValid);
        }
      }
    });

    it('grants launch clearance only when mass margin, destination, and budget are all satisfied', () => {
      // 1. All valid
      const validCheck = validateLaunchConfiguration(coreVehicle, ssoOrbit, 1000, 150, 40);
      expect(validCheck.isCompatible).toBe(true);

      // 2. Overweight invalid
      const overweightCheck = validateLaunchConfiguration(liteVehicle, ssoOrbit, 2000, 150, 40);
      expect(overweightCheck.isCompatible).toBe(false);

      // 3. Dest restricted invalid
      const destCheck = validateLaunchConfiguration(liteVehicle, geoOrbit, 100, 150, 40);
      expect(destCheck.isCompatible).toBe(false);

      // 4. Overbudget invalid
      const budgetCheck = validateLaunchConfiguration(superHeavyVehicle, leoOrbit, 1000, 80, 50);
      expect(budgetCheck.isCompatible).toBe(false);
    });
  });
});
