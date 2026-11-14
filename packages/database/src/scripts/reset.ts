import { sql } from 'drizzle-orm';
import { getDatabase, closeDatabase } from '../client';
import { runSetup } from './setup';

export async function runReset() {
  console.log('⚠️ RESETTING ORBITAL local database...');
  const db = getDatabase();

  const tables = [
    'mission_reports',
    'team_members',
    'mission_rooms',
    'launch_configs',
    'spacecraft_designs',
    'missions'
  ];

  for (const table of tables) {
    await db.execute(sql.raw(`DROP TABLE IF EXISTS ${table} CASCADE;`));
  }

  console.log('🧹 Tables dropped. Re-initializing schema and seed data...');
  await runSetup();
}

if (process.argv[1]?.endsWith('reset.ts')) {
  runReset()
    .then(async () => {
      await closeDatabase();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Reset failed:', err);
      await closeDatabase();
      process.exit(1);
    });
}
