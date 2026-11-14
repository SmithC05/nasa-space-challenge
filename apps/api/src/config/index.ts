import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseProvider: process.env.DATABASE_PROVIDER || 'pglite',
  pgliteDataDir: process.env.PGLITE_DATA_DIR || '.local/pglite'
};
