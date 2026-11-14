import { sql } from 'drizzle-orm';
import { getDatabase, closeDatabase } from '../client';

export async function runMigrations() {
  console.log('🚀 Running ORBITAL database migrations...');
  const db = getDatabase();

  const ddlStatements = [
    `CREATE TABLE IF NOT EXISTS missions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL,
      target_body TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      budget_musd DOUBLE PRECISION NOT NULL,
      max_mass_kg DOUBLE PRECISION NOT NULL,
      target_orbit_type TEXT NOT NULL,
      min_science_points INTEGER NOT NULL,
      min_bandwidth_mbps DOUBLE PRECISION NOT NULL,
      duration_days INTEGER NOT NULL,
      data JSONB NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS spacecraft_designs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      scenario_id TEXT NOT NULL,
      bus_id TEXT NOT NULL,
      selected_component_ids JSONB NOT NULL,
      resources JSONB NOT NULL,
      validation JSONB NOT NULL,
      last_updated_by TEXT,
      updated_at TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS launch_configs (
      id TEXT PRIMARY KEY,
      vehicle_id TEXT NOT NULL,
      orbit_id TEXT NOT NULL,
      spacecraft_mass_kg DOUBLE PRECISION NOT NULL,
      is_compatible BOOLEAN NOT NULL,
      payload_margin_kg DOUBLE PRECISION NOT NULL,
      estimated_cost_musd DOUBLE PRECISION NOT NULL,
      launch_site TEXT NOT NULL,
      created_at TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS mission_rooms (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      host_id TEXT NOT NULL,
      scenario_id TEXT,
      status TEXT NOT NULL DEFAULT 'LOBBY',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      room_code TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      is_ready BOOLEAN NOT NULL DEFAULT FALSE,
      is_host BOOLEAN NOT NULL DEFAULT FALSE,
      joined_at TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS mission_reports (
      id TEXT PRIMARY KEY,
      room_code TEXT NOT NULL,
      scenario_id TEXT NOT NULL,
      scenario_name TEXT NOT NULL,
      spacecraft_name TEXT NOT NULL,
      outcome TEXT NOT NULL,
      final_science_score INTEGER NOT NULL,
      data_gathered_gb DOUBLE PRECISION NOT NULL,
      budget_remaining_musd DOUBLE PRECISION NOT NULL,
      mission_duration_days INTEGER NOT NULL,
      crises_resolved INTEGER NOT NULL,
      total_crises INTEGER NOT NULL,
      team_engineers JSONB NOT NULL,
      accolades JSONB NOT NULL,
      evaluation_notes TEXT NOT NULL,
      completed_at TEXT NOT NULL
    );`
  ];

  for (const statement of ddlStatements) {
    await db.execute(sql.raw(statement));
  }

  console.log('✅ Migrations applied successfully.');
}

if (process.argv[1]?.endsWith('migrate.ts')) {
  runMigrations()
    .then(async () => {
      await closeDatabase();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Migration failed:', err);
      await closeDatabase();
      process.exit(1);
    });
}
