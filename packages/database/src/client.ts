import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePgLite } from 'drizzle-orm/pglite';
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import * as schema from './schema';

let dbInstance: any = null;
let pgliteClient: PGlite | null = null;
let pgPool: Pool | null = null;

export function getDatabase() {
  if (dbInstance) return dbInstance;

  const provider = process.env.DATABASE_PROVIDER || 'pglite';

  if (provider === 'postgres' && process.env.DATABASE_URL) {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });
    dbInstance = drizzleNodePg(pgPool, { schema });
    return dbInstance;
  }

  // Default: PGlite local development
  let rootDir = process.cwd();
  while (rootDir && !fs.existsSync(path.join(rootDir, 'pnpm-workspace.yaml'))) {
    const parent = path.dirname(rootDir);
    if (parent === rootDir) break;
    rootDir = parent;
  }

  const localDir =
    process.env.PGLITE_DATA_DIR && path.isAbsolute(process.env.PGLITE_DATA_DIR)
      ? process.env.PGLITE_DATA_DIR
      : path.resolve(rootDir, 'apps/api/.local/pglite');

  // Ensure parent directory exists
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  pgliteClient = new PGlite(localDir);
  dbInstance = drizzlePgLite(pgliteClient, { schema });
  return dbInstance;
}

export async function closeDatabase() {
  if (pgliteClient) {
    await pgliteClient.close();
    pgliteClient = null;
  }
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
  }
  dbInstance = null;
}
