import { getDatabase, closeDatabase } from '../client';
import { missionsTable } from '../schema';
import { MISSION_SCENARIOS } from '@orbital/game-data';
import { sql } from 'drizzle-orm';

export async function runSeeds() {
  console.log('🌱 Seeding ORBITAL mission scenarios...');
  const db = getDatabase();

  for (const scenario of MISSION_SCENARIOS) {
    await db
      .insert(missionsTable)
      .values({
        id: scenario.id,
        name: scenario.name,
        code: scenario.code,
        tagline: scenario.tagline,
        description: scenario.description,
        targetBody: scenario.targetBody,
        difficulty: scenario.difficulty,
        budgetMUSD: scenario.budgetMUSD,
        maxMassKg: scenario.maxMassKg,
        targetOrbitType: scenario.targetOrbitType,
        minSciencePoints: scenario.minSciencePoints,
        minBandwidthMbps: scenario.minBandwidthMbps,
        durationDays: scenario.durationDays,
        data: scenario
      })
      .onConflictDoUpdate({
        target: missionsTable.id,
        set: {
          name: sql`EXCLUDED.name`,
          tagline: sql`EXCLUDED.tagline`,
          description: sql`EXCLUDED.description`,
          budgetMUSD: sql`EXCLUDED.budget_musd`,
          maxMassKg: sql`EXCLUDED.max_mass_kg`,
          data: sql`EXCLUDED.data`
        }
      });
  }

  console.log(`✅ Seeded ${MISSION_SCENARIOS.length} scientific mission scenarios.`);
}

if (process.argv[1]?.endsWith('seed.ts')) {
  runSeeds()
    .then(async () => {
      await closeDatabase();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Seeding failed:', err);
      await closeDatabase();
      process.exit(1);
    });
}
