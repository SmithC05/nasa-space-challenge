import { Server, Socket } from 'socket.io';
import {
  EngineerRole,
  LaunchConfiguration,
  MissionReport,
  MissionRoom,
  MissionSimulationState,
  SpacecraftDesign
} from '@orbital/contracts';
import {
  createInitialSimulationState,
  generateMissionReport,
  resolveMissionEvent,
  tickSimulation
} from '@orbital/simulation-engine';
import {
  MISSION_EVENTS,
  MISSION_SCENARIOS,
  ORBIT_PROFILES
} from '@orbital/game-data';
import { getDatabase, missionReportsTable } from '@orbital/database';
import { roomService } from '../services/roomService';
import { registerRoomHandlers } from './socketHandlers/roomHandlers';
import { registerPlanningHandlers } from './socketHandlers/planningHandlers';

// In-memory simulation stores
const simulationStates = new Map<string, MissionSimulationState>();
const simulationIntervals = new Map<string, NodeJS.Timeout>();

export function setupMissionSockets(io: Server) {
  io.on('connection', (socket: Socket) => {
    // Register Phase 1 Room Management & Player Identity Handlers
    registerRoomHandlers(io, socket, roomService);

    // Register Phase 2 Collaborative Mission Planning Handlers
    registerPlanningHandlers(io, socket, roomService);

    // ----------------------------------------------------
    // LAUNCH START & TELEMETRY TICK LOOP
    // ----------------------------------------------------
    socket.on('mission:startLaunch', ({ roomCode }) => {
      const code = (roomCode || '').toUpperCase();
      const rawRoom = roomService.getRawRoom(code);
      if (!rawRoom) return;

      const scenario = MISSION_SCENARIOS.find((s) => s.id === rawRoom.scenarioId) || MISSION_SCENARIOS[0];
      const targetOrbit = ORBIT_PROFILES.find((o) => o.type === scenario.targetOrbitType) || ORBIT_PROFILES[0];

      // Fallback design if launched directly
      const design: SpacecraftDesign = {
        id: `design-${Date.now()}`,
        name: `${rawRoom.name} Orbiter`,
        scenarioId: scenario.id,
        busId: 'bus-smallsat-standard',
        selectedComponentIds: [
          'bus-smallsat-standard',
          'power-solar-standard-wings',
          'power-batt-li-ion',
          'comms-ka-dish',
          'aocs-reaction-wheels',
          'inst-multispectral-imager'
        ],
        resources: {
          totalMassKg: 348,
          maxMassKg: scenario.maxMassKg,
          massMarginKg: scenario.maxMassKg - 348,
          totalCostMUSD: 66.9,
          budgetMUSD: scenario.budgetMUSD,
          costMarginMUSD: scenario.budgetMUSD - 66.9,
          powerDayGenW: 1200,
          powerConsumptionW: 272,
          dayPowerMarginW: 928,
          nightPowerDeficitW: 272,
          batteryCapacityWh: 1800,
          batteryEnduranceMin: 397,
          eclipseDurationMin: 32,
          dataRateMbps: 185,
          deltaVAvailableMps: 0,
          averageReliabilityPct: 97
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          recommendations: []
        },
        updatedAt: new Date().toISOString()
      };

      rawRoom.status = 'ACTIVE_MISSION';
      rawRoom.revision += 1;
      rawRoom.updatedAt = new Date().toISOString();

      const snapshot = roomService.getRoomSnapshot(code);
      if (snapshot) {
        snapshot.design = design;
        io.to(code).emit('room:updated', snapshot);
      }

      // Stop any existing simulation loop
      if (simulationIntervals.has(code)) {
        clearInterval(simulationIntervals.get(code)!);
      }

      // Initialize Simulation State
      const simState = createInitialSimulationState(code, design, targetOrbit);
      simulationStates.set(code, simState);
      io.to(code).emit('simulation:tick', simState);

      // 1-second server tick loop
      const interval = setInterval(async () => {
        const currentSim = simulationStates.get(code);
        if (!currentSim) return;

        if (currentSim.phase === 'MISSION_COMPLETE' || currentSim.phase === 'MISSION_ABORTED') {
          clearInterval(interval);
          simulationIntervals.delete(code);

          const report = generateMissionReport(
            currentSim,
            scenario,
            design,
            code,
            rawRoom.members.map((m) => m.name)
          );

          try {
            const db = getDatabase();
            await db.insert(missionReportsTable).values({
              id: report.id,
              roomCode: code,
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
              completedAt: report.completedAt
            });
          } catch (dbErr) {
            console.warn('DB report save warning:', dbErr);
          }

          rawRoom.status = 'DEBRIEF';
          const finalSnapshot = roomService.getRoomSnapshot(code);
          if (finalSnapshot) {
            io.to(code).emit('room:updated', finalSnapshot);
          }
          io.to(code).emit('mission:completed', report);
          return;
        }

        const prevActiveEvent = currentSim.activeEvent;
        const nextSim = tickSimulation(currentSim, design, targetOrbit, MISSION_EVENTS, 1);
        simulationStates.set(code, nextSim);

        if (!prevActiveEvent && nextSim.activeEvent) {
          io.to(code).emit('mission:eventTriggered', nextSim.activeEvent);
        }

        io.to(code).emit('simulation:tick', nextSim);
      }, 1000);

      simulationIntervals.set(code, interval);
    });

    // ----------------------------------------------------
    // EVENT RESOLUTION
    // ----------------------------------------------------
    socket.on('mission:eventChoice', ({ roomCode, eventId, choiceId }) => {
      const code = (roomCode || '').toUpperCase();
      const sim = simulationStates.get(code);
      if (!sim) return;

      const { nextState, outcomeMessage, success } = resolveMissionEvent(sim, eventId, choiceId);
      simulationStates.set(code, nextState);

      io.to(code).emit('mission:eventResolved', {
        eventId,
        choiceId,
        success,
        message: outcomeMessage
      });
      io.to(code).emit('simulation:tick', nextState);
    });

    // ----------------------------------------------------
    // SPEED & PAUSE
    // ----------------------------------------------------
    socket.on('mission:setSpeed', ({ roomCode, speedMultiplier }) => {
      const code = (roomCode || '').toUpperCase();
      const sim = simulationStates.get(code);
      if (!sim) return;
      sim.speedMultiplier = Math.max(1, Math.min(5, speedMultiplier));
      io.to(code).emit('simulation:tick', sim);
    });

    socket.on('mission:togglePause', ({ roomCode }) => {
      const code = (roomCode || '').toUpperCase();
      const sim = simulationStates.get(code);
      if (!sim) return;
      sim.isPaused = !sim.isPaused;
      io.to(code).emit('simulation:tick', sim);
    });

    // ----------------------------------------------------
    // TACTICAL MISSION CHAT
    // ----------------------------------------------------
    socket.on('chat:send', ({ roomCode, sender, role, message }) => {
      const code = (roomCode || '').toUpperCase();
      const authorName = socket.data?.name || sender || 'Engineer';
      const authorRole = socket.data?.role || role || 'SYSTEMS_ENGINEER';

      io.to(code).emit('chat:message', {
        id: `msg-${Date.now()}-${Math.random()}`,
        sender: authorName,
        role: authorRole,
        message: String(message || '').substring(0, 500),
        timestamp: new Date().toLocaleTimeString()
      });
    });
  });
}
