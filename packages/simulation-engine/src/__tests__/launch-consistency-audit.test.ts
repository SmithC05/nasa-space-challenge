import { describe, expect, it } from 'vitest';
import {
  LAUNCH_VEHICLES,
  ORBIT_PROFILES,
  ORBIT_PROFILES_CATALOG,
  getLaunchVehicleById,
  getOrbitProfileById
} from '@orbital/game-data';
import {
  calculateVehicleOrbitCapacity,
  validateLaunchConfiguration
} from '../index';

describe('ORBITAL Developer 03 — Data Consistency Audit & Verification', () => {
  // =========================================================================
  // B. ORBIT PROFILE LABELS & METADATA
  // =========================================================================
  describe('B. Orbit Profile Labels & Category Metadata', () => {
    it('ensures Polar Orbit profile is strictly labeled as "Polar Orbit" and categorized as "POLAR"', () => {
      const polarProfile = ORBIT_PROFILES.find((p) => p.id === 'orbit-polar');
      expect(polarProfile).toBeDefined();
      expect(polarProfile?.name).toBe('Polar Orbit');
      expect((polarProfile as any)?.category).toBe('POLAR');
      // Preserves LEO type for underlying contracts compatibility while categorized as POLAR
      expect(polarProfile?.type).toBe('LEO');
    });

    it('ensures all 4 orbit profiles have distinct, consistent names and categories', () => {
      expect(ORBIT_PROFILES).toHaveLength(4);
      const names = ORBIT_PROFILES.map((p) => p.name);
      expect(names).toEqual([
        'Low Earth Orbit (LEO)',
        'Sun-Synchronous Polar Orbit (SSO)',
        'Polar Orbit',
        'Geostationary Orbit (GEO)'
      ]);

      const categories = ORBIT_PROFILES.map(
        (p) => (p as any).category || (p.id === 'orbit-polar' ? 'POLAR' : p.type)
      );
      expect(categories).toEqual(['LEO', 'SSO', 'POLAR', 'GEO']);
    });
  });

  // =========================================================================
  // C. ORBIT CATALOG NUMERICAL CONSISTENCY (Single Source of Truth)
  // =========================================================================
  describe('C. Orbit Catalog Single Source of Truth', () => {
    it('verifies Low Earth Orbit (LEO) parameters: 410 × 420 km, 51.6°, 92.8 min', () => {
      const leo = ORBIT_PROFILES_CATALOG.find((p) => p.id === 'orbit-leo')!;
      expect(leo.perigeeKm).toBe(410);
      expect(leo.apogeeKm).toBe(420);
      expect(leo.inclinationDeg).toBe(51.6);
      expect(leo.orbitalPeriodMin).toBe(92.8);
      expect(leo.requiredDeltaVMps).toBe(9400);
    });

    it('verifies Sun-Synchronous Orbit (SSO) parameters: 705 × 705 km, 98.2°, 98.8 min', () => {
      const sso = ORBIT_PROFILES_CATALOG.find((p) => p.id === 'orbit-sso')!;
      expect(sso.perigeeKm).toBe(705);
      expect(sso.apogeeKm).toBe(705);
      expect(sso.inclinationDeg).toBe(98.2);
      expect(sso.orbitalPeriodMin).toBe(98.8);
      expect(sso.requiredDeltaVMps).toBe(9750);
    });

    it('verifies Polar Orbit parameters: 800 × 800 km, 90.0°, 100.8 min', () => {
      const polar = ORBIT_PROFILES_CATALOG.find((p) => p.id === 'orbit-polar')!;
      expect(polar.perigeeKm).toBe(800);
      expect(polar.apogeeKm).toBe(800);
      expect(polar.inclinationDeg).toBe(90.0);
      expect(polar.orbitalPeriodMin).toBe(100.8);
      expect(polar.requiredDeltaVMps).toBe(9650);
    });

    it('verifies Geostationary Orbit (GEO) parameters: 35,786 × 35,786 km, 0.0°, 1,436.1 min', () => {
      const geo = ORBIT_PROFILES_CATALOG.find((p) => p.id === 'orbit-geo')!;
      expect(geo.perigeeKm).toBe(35786);
      expect(geo.apogeeKm).toBe(35786);
      expect(geo.inclinationDeg).toBe(0.0);
      expect(geo.orbitalPeriodMin).toBe(1436.1);
      expect(geo.requiredDeltaVMps).toBe(12500);
    });
  });

  // =========================================================================
  // D. LAUNCH VEHICLE CATALOG ALIGNMENT
  // =========================================================================
  describe('D. Launch Vehicle Catalog Alignment', () => {
    it('contains the required fictional vehicles: ORBITAL-Lite, ORBITAL-Core, ORBITAL-Heavy', () => {
      const vehicleNames = LAUNCH_VEHICLES.map((v) => v.name);
      expect(vehicleNames).toContain('ORBITAL-Lite');
      expect(vehicleNames).toContain('ORBITAL-Core');
      expect(vehicleNames).toContain('ORBITAL-Heavy');
    });

    it('clearly marks simulation assumptions in vehicle descriptions', () => {
      for (const vehicle of LAUNCH_VEHICLES) {
        expect(vehicle.description.toLowerCase()).toContain('simulation assumption');
      }
    });

    it('provides backwards-compatible vehicle lookup via getLaunchVehicleById', () => {
      expect(getLaunchVehicleById('vehicle-orbital-core')?.name).toBe('ORBITAL-Core');
      expect(getLaunchVehicleById('vehicle-phoenix-medium')?.name).toBe('ORBITAL-Core');
      expect(getLaunchVehicleById('vehicle-orbital-lite')?.name).toBe('ORBITAL-Lite');
      expect(getLaunchVehicleById('vehicle-nova-light')?.name).toBe('ORBITAL-Lite');
    });
  });

  // =========================================================================
  // E. PAYLOAD VALIDATION & MARGIN COMPUTATION
  // =========================================================================
  describe('E. Payload Validation, Margins & Compatibility', () => {
    const coreVehicle = LAUNCH_VEHICLES.find((v) => v.name === 'ORBITAL-Core')!;
    const liteVehicle = LAUNCH_VEHICLES.find((v) => v.name === 'ORBITAL-Lite')!;
    const leo = ORBIT_PROFILES.find((p) => p.id === 'orbit-leo')!;
    const polar = ORBIT_PROFILES.find((p) => p.id === 'orbit-polar')!;
    const sso = ORBIT_PROFILES.find((p) => p.id === 'orbit-sso')!;
    const geo = ORBIT_PROFILES.find((p) => p.id === 'orbit-geo')!;

    it('correctly calculates vehicle effective capacity per orbital regime', () => {
      // LEO base capacity: 16,500 kg
      expect(calculateVehicleOrbitCapacity(coreVehicle, leo)).toBe(16500);

      // Polar and SSO apply high-inclination penalty (~78% of LEO): 12,870 kg
      expect(calculateVehicleOrbitCapacity(coreVehicle, polar)).toBe(12870);
      expect(calculateVehicleOrbitCapacity(coreVehicle, sso)).toBe(12870);

      // GEO returns GTO transfer capacity: 5,800 kg
      expect(calculateVehicleOrbitCapacity(coreVehicle, geo)).toBe(5800);
    });

    it('calculates payload margin precisely as capacity minus spacecraft mass', () => {
      const spacecraftMassKg = 1200;
      const config = validateLaunchConfiguration(coreVehicle, leo, spacecraftMassKg, 150, 40);
      expect(config.payloadMarginKg).toBe(16500 - 1200);
      expect(config.isCompatible).toBe(true);
    });

    it('rejects vehicle when payload mass exceeds vehicle capacity', () => {
      const heavyMassKg = 3000; // Exceeds Lite booster 650kg capacity
      const config = validateLaunchConfiguration(liteVehicle, leo, heavyMassKg, 150, 40);
      expect(config.payloadMarginKg).toBe(650 - 3000);
      expect(config.payloadMarginKg).toBeLessThan(0);
      expect(config.isCompatible).toBe(false);
    });

    it('rejects Light-class vehicle attempting direct GEO injection (destination restriction)', () => {
      const lightMassKg = 100; // Small mass within GTO capacity
      const config = validateLaunchConfiguration(liteVehicle, geo, lightMassKg, 150, 40);
      expect(config.isCompatible).toBe(false);
    });

    it('rejects configuration when total mission cost exceeds scenario budget ceiling', () => {
      const heavyBooster = LAUNCH_VEHICLES.find((v) => v.name === 'ORBITAL-Heavy')!; // $98M
      const highCostSpacecraft = 90; // Total = 98 + 90 = 188M
      const tightBudget = 100; // Budget ceiling = 100 * 1.15 = 115M
      const config = validateLaunchConfiguration(heavyBooster, leo, 2000, tightBudget, highCostSpacecraft);
      expect(config.isCompatible).toBe(false);
    });

    it('returns green isCompatible=true only when mass, budget, and destination criteria are all satisfied', () => {
      const config = validateLaunchConfiguration(coreVehicle, sso, 850, 150, 40);
      expect(config.payloadMarginKg).toBeGreaterThan(0);
      expect(config.isCompatible).toBe(true);
    });
  });

  // =========================================================================
  // F. COST AND CAPACITY CONSISTENCY
  // =========================================================================
  describe('F. Cost and Capacity Single Source of Truth', () => {
    it('ensures launch vehicle costs and reliability figures are internally consistent', () => {
      for (const vehicle of LAUNCH_VEHICLES) {
        expect(vehicle.launchCostMUSD).toBeGreaterThan(0);
        expect(vehicle.successRatePercent).toBeGreaterThanOrEqual(90);
        expect(vehicle.payloadCapacityLeoKg).toBeGreaterThan(vehicle.payloadCapacityGtoKg);
        expect(vehicle.payloadCapacityGtoKg).toBeGreaterThan(vehicle.payloadCapacityTliKg);
      }
    });
  });
});
