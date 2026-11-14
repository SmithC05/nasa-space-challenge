import { Router } from 'express';
import { LAUNCH_VEHICLES, ORBIT_PROFILES, getLaunchVehicleById } from '@orbital/game-data';
import { validateLaunchConfiguration } from '@orbital/simulation-engine';

export const orbitsRouter = Router();

orbitsRouter.get('/', (_req, res) => {
  res.json(ORBIT_PROFILES);
});

orbitsRouter.get('/vehicles', (_req, res) => {
  res.json(LAUNCH_VEHICLES);
});

orbitsRouter.post('/validate-launch', (req, res) => {
  const { vehicleId, orbitId, spacecraftMassKg, scenarioBudgetMUSD, spacecraftCostMUSD } = req.body;
  const vehicle = getLaunchVehicleById(vehicleId) || LAUNCH_VEHICLES.find((v) => v.id === vehicleId);
  const orbit = ORBIT_PROFILES.find((o) => o.id === orbitId);

  if (!vehicle || !orbit) {
    return res.status(400).json({ error: 'Vehicle or Orbit profile not found' });
  }

  const result = validateLaunchConfiguration(
    vehicle,
    orbit,
    Number(spacecraftMassKg) || 1000,
    Number(scenarioBudgetMUSD) || 150,
    Number(spacecraftCostMUSD) || 50
  );

  return res.json(result);
});
