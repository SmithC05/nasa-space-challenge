import { Router } from 'express';
import { getDatabase, missionReportsTable } from '@orbital/database';

export const reportsRouter = Router();

reportsRouter.get('/', async (_req, res) => {
  try {
    const db = getDatabase();
    const rows = await db.select().from(missionReportsTable);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

reportsRouter.post('/', async (req, res) => {
  const { report } = req.body;
  if (!report || !report.id) {
    return res.status(400).json({ error: 'Valid MissionReport payload required' });
  }

  try {
    const db = getDatabase();
    await db.insert(missionReportsTable).values({
      id: report.id,
      roomCode: report.roomCode,
      scenarioId: report.scenarioId,
      scenarioName: report.scenarioName,
      spacecraftName: report.spacecraftName,
      outcome: report.outcome,
      finalScienceScore: report.finalScienceScore,
      dataGatheredGb: report.dataGatheredGb,
      budgetRemainingMUSD: report.budgetRemainingMUSD,
      missionDurationDays: report.missionDurationDays,
      crisesResolved: report.crisesResolved,
      totalCrises: report.totalCrises,
      teamEngineers: report.teamEngineers,
      accolades: report.accolades,
      evaluationNotes: report.evaluationNotes,
      completedAt: report.completedAt || new Date().toISOString()
    });

    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
