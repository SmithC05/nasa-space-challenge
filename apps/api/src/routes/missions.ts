import { Router } from 'express';
import { getDatabase, missionsTable } from '@orbital/database';
import { MISSION_SCENARIOS } from '@orbital/game-data';

export const missionsRouter = Router();

missionsRouter.get('/', async (_req, res) => {
  try {
    const db = getDatabase();
    const rows = await db.select().from(missionsTable);
    if (rows.length > 0) {
      return res.json(rows.map((r: any) => r.data));
    }
    return res.json(MISSION_SCENARIOS);
  } catch (err) {
    return res.json(MISSION_SCENARIOS);
  }
});

missionsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = getDatabase();
    const rows = await db.select().from(missionsTable);
    const found = rows.find((r: any) => r.id === id);
    if (found) {
      return res.json(found.data);
    }
  } catch (err) {
    // fallback
  }

  const scenario = MISSION_SCENARIOS.find((s) => s.id === id);
  if (!scenario) {
    return res.status(404).json({ error: 'Mission scenario not found' });
  }
  return res.json(scenario);
});
