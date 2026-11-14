import { Router } from 'express';
import { MISSION_SCENARIOS, ORBIT_PROFILES, SPACECRAFT_COMPONENTS } from '@orbital/game-data';
import { calculateSpacecraftResources, validateSpacecraftDesign } from '@orbital/simulation-engine';
import { getDatabase, spacecraftDesignsTable } from '@orbital/database';
import { eq } from 'drizzle-orm';

export const designsRouter = Router();

designsRouter.post('/calculate', (req, res) => {
  const { scenarioId, orbitId, selectedComponentIds } = req.body;
  const scenario = MISSION_SCENARIOS.find((s) => s.id === scenarioId);
  const orbit = ORBIT_PROFILES.find((o) => o.id === orbitId);

  const selectedComps = SPACECRAFT_COMPONENTS.filter((c) =>
    (selectedComponentIds || []).includes(c.id)
  );

  const resources = calculateSpacecraftResources(selectedComps, scenario, orbit);
  const validation = validateSpacecraftDesign(selectedComps, resources, scenario);

  res.json({ resources, validation });
});

designsRouter.post('/', async (req, res) => {
  const { design } = req.body;
  if (!design || !design.id) {
    return res.status(400).json({ error: 'Valid SpacecraftDesign payload required' });
  }

  try {
    const db = getDatabase();
    await db
      .insert(spacecraftDesignsTable)
      .values({
        id: design.id,
        name: design.name,
        scenarioId: design.scenarioId,
        busId: design.busId,
        selectedComponentIds: design.selectedComponentIds,
        resources: design.resources,
        validation: design.validation,
        lastUpdatedBy: design.lastUpdatedBy,
        updatedAt: new Date().toISOString()
      })
      .onConflictDoUpdate({
        target: spacecraftDesignsTable.id,
        set: {
          name: design.name,
          busId: design.busId,
          selectedComponentIds: design.selectedComponentIds,
          resources: design.resources,
          validation: design.validation,
          lastUpdatedBy: design.lastUpdatedBy,
          updatedAt: new Date().toISOString()
        }
      });

    return res.json({ success: true, design });
  } catch (err: any) {
    console.error('Error saving design:', err);
    return res.status(500).json({ error: err.message });
  }
});

designsRouter.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const rows = await db
      .select()
      .from(spacecraftDesignsTable)
      .where(eq(spacecraftDesignsTable.id, req.params.id));

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Design not found' });
    }
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
