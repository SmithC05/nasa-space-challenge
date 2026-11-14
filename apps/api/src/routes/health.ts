import { Router } from 'express';
import { getDatabase } from '@orbital/database';
import { sql } from 'drizzle-orm';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    const db = getDatabase();
    await db.execute(sql`SELECT 1;`);
    res.json({
      status: 'healthy',
      service: 'ORBITAL Mission Control API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'degraded',
      service: 'ORBITAL Mission Control API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'error',
      error: err.message
    });
  }
});
