import { runMigrations } from './migrate';
import { runSeeds } from './seed';
import { closeDatabase } from '../client';

export async function runSetup() {
  console.log('⚡ Initializing ORBITAL Local Database Setup...');
  await runMigrations();
  await runSeeds();
  console.log('🎉 Database setup complete and ready for mission operations!');
}

if (process.argv[1]?.endsWith('setup.ts')) {
  runSetup()
    .then(async () => {
      await closeDatabase();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Setup error:', err);
      await closeDatabase();
      process.exit(1);
    });
}
