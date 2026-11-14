import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { config } from './config';
import { healthRouter } from './routes/health';
import { missionsRouter } from './routes/missions';
import { componentsRouter } from './routes/components';
import { orbitsRouter } from './routes/orbits';
import { designsRouter } from './routes/designs';
import { roomsRouter } from './routes/rooms';
import { reportsRouter } from './routes/reports';
import { setupMissionSockets } from './sockets/missionSocket';
import { getDatabase } from '@orbital/database';

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  })
);

app.use(express.json());

// Routes
app.use('/health', healthRouter);
app.use('/api/scenarios', missionsRouter);
app.use('/api/components', componentsRouter);
app.use('/api/orbits', orbitsRouter);
app.use('/api/designs', designsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/reports', reportsRouter);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupMissionSockets(io);

// Server startup
server.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 ORBITAL Mission Control API & Socket Server Online`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`🩺 Health: http://localhost:${config.port}/health`);
  console.log(`🗄️ Database Provider: ${config.databaseProvider}`);
  console.log(`=======================================================`);

  // Eagerly connect DB
  try {
    getDatabase();
    console.log('✅ Local PGlite database client connected.');
  } catch (err) {
    console.error('Database connection warning:', err);
  }
});
