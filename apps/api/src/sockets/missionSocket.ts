import { Server, Socket } from 'socket.io';
import {
  EngineerRole,
  LaunchConfiguration,
  MissionReport,
  MissionRoom,
  MissionSimulationState,
  SpacecraftDesign,
  TeamMember
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
  ORBIT_PROFILES,
  SPACECRAFT_COMPONENTS
} from '@orbital/game-data';
import { getDatabase, missionReportsTable, missionRoomsTable, teamMembersTable } from '@orbital/database';
import { eq } from 'drizzle-orm';

// In-memory active session stores
const activeRooms = new Map<string, MissionRoom>();
const simulationStates = new Map<string, MissionSimulationState>();
const simulationIntervals = new Map<string, NodeJS.Timeout>();

export function setupMissionSockets(io: Server) {
  io.on('connection', (socket: Socket) => {
    // ----------------------------------------------------
    // 1. ROOM CREATION
    // ----------------------------------------------------
    socket.on('room:create', async ({ hostName, roomName }, callback) => {
      const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      const hostId = socket.id;

      const hostMember: TeamMember = {
        id: hostId,
        name: hostName || 'Flight Director Alpha',
        role: 'FLIGHT_DIRECTOR',
        isReady: true,
        isHost: true,
        joinedAt: new Date().toISOString()
      };

      const newRoom: MissionRoom = {
        code: roomCode,
        name: roomName || `Mission Unit ${roomCode}`,
        hostId,
        scenarioId: 'scenario-earth-sentinel',
        design: null,
        launchConfig: null,
        members: [hostMember],
        status: 'LOBBY',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      activeRooms.set(roomCode, newRoom);
      socket.join(roomCode);

      // Persist to database
      try {
        const db = getDatabase();
        await db.insert(missionRoomsTable).values({
          code: roomCode,
          name: newRoom.name,
          hostId,
          scenarioId: newRoom.scenarioId,
          status: newRoom.status,
          createdAt: newRoom.createdAt,
          updatedAt: newRoom.updatedAt
        });

        await db.insert(teamMembersTable).values({
          id: hostId,
          roomCode,
          name: hostMember.name,
          role: hostMember.role,
          isReady: hostMember.isReady,
          isHost: hostMember.isHost,
          joinedAt: hostMember.joinedAt
        });
      } catch (err) {
        console.warn('DB persistence warning (non-fatal):', err);
      }

      callback({ success: true, room: newRoom, memberId: hostId });
      io.to(roomCode).emit('room:updated', newRoom);
    });

    // ----------------------------------------------------
    // 2. ROOM JOINING
    // ----------------------------------------------------
    socket.on('room:join', async ({ roomCode, name, role }, callback) => {
      const code = (roomCode || '').toUpperCase();
      const room = activeRooms.get(code);

      if (!room) {
        return callback({ success: false, error: `Mission Room [${code}] not found.` });
      }

      if (room.members.length >= 4) {
        return callback({ success: false, error: 'Room has reached maximum capacity of 4 engineers.' });
      }

      // Automatically assign available role if already taken
      const takenRoles = room.members.map((m) => m.role);
      const allRoles: EngineerRole[] = [
        'FLIGHT_DIRECTOR',
        'SYSTEMS_ENGINEER',
        'TRAJECTORY_SPECIALIST',
        'SCIENCE_LEAD'
      ];
      let assignedRole: EngineerRole = role || allRoles.find((r) => !takenRoles.includes(r)) || 'SYSTEMS_ENGINEER';

      const newMember: TeamMember = {
        id: socket.id,
        name: name || `Engineer ${room.members.length + 1}`,
        role: assignedRole,
        isReady: false,
        isHost: false,
        joinedAt: new Date().toISOString()
      };

      room.members.push(newMember);
      room.updatedAt = new Date().toISOString();
      socket.join(code);

      // Persist to DB
      try {
        const db = getDatabase();
        await db.insert(teamMembersTable).values({
          id: socket.id,
          roomCode: code,
          name: newMember.name,
          role: newMember.role,
          isReady: false,
          isHost: false,
          joinedAt: newMember.joinedAt
        });
      } catch (err) {
        console.warn('DB member join warning:', err);
      }

      callback({ success: true, room, memberId: socket.id });
      io.to(code).emit('room:updated', room);
    });

    // ----------------------------------------------------
    // 3. ROLE & READINESS
    // ----------------------------------------------------
    socket.on('room:setRole', ({ roomCode, memberId, role }) => {
      const room = activeRooms.get(roomCode.toUpperCase());
      if (!room) return;
      const member = room.members.find((m) => m.id === memberId);
      if (member) {
        member.role = role;
        room.updatedAt = new Date().toISOString();
        io.to(room.code).emit('room:updated', room);
      }
    });

    socket.on('room:setReady', ({ roomCode, memberId, isReady }) => {
      const room = activeRooms.get(roomCode.toUpperCase());
      if (!room) return;
      const member = room.members.find((m) => m.id === memberId);
      if (member) {
        member.isReady = isReady;
        room.updatedAt = new Date().toISOString();
        io.to(room.code).emit('room:updated', room);
      }
    });

    // ----------------------------------------------------
    // 4. SCENARIO & DESIGN SYNC
    // ----------------------------------------------------
    socket.on('scenario:select', ({ roomCode, scenarioId }) => {
      const room = activeRooms.get(roomCode.toUpperCase());
      if (!room) return;
      room.scenarioId = scenarioId;
      room.updatedAt = new Date().toISOString();
      io.to(room.code).emit('room:updated', room);
    });

    socket.on('design:update', ({ roomCode, design }) => {
      const room = activeRooms.get(roomCode.toUpperCase());
      if (!room) return;
      room.design = design;
      room.updatedAt = new Date().toISOString();
      io.to(room.code).emit('room:updated', room);
    });

    socket.on('launch:configure', ({ roomCode, launchConfig }) => {
      const room = activeRooms.get(roomCode.toUpperCase());
      if (!room) return;
      room.launchConfig = launchConfig;
      room.updatedAt = new Date().toISOString();
      io.to(room.code).emit('room:updated', room);
    });

    // ----------------------------------------------------
    // 5. LAUNCH START & TELEMETRY TICK LOOP
    // ----------------------------------------------------
    socket.on('mission:startLaunch', ({ roomCode }) => {
      const code = roomCode.toUpperCase();
      const room = activeRooms.get(code);
      if (!room) return;

      const scenario = MISSION_SCENARIOS.find((s) => s.id === room.scenarioId) || MISSION_SCENARIOS[0];
      const targetOrbit = ORBIT_PROFILES.find((o) => o.type === scenario.targetOrbitType) || ORBIT_PROFILES[0];

      // Create fallback design if player starts directly
      const design: SpacecraftDesign =
        room.design || {
          id: `design-${Date.now()}`,
          name: 'Orbiter-1 Vanguard',
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

      room.design = design;
      room.status = 'ACTIVE_MISSION';
      io.to(code).emit('room:updated', room);

      // Stop any existing simulation loop
      if (simulationIntervals.has(code)) {
        clearInterval(simulationIntervals.get(code)!);
      }

      // Initialize Simulation State
      const simState = createInitialSimulationState(code, design, targetOrbit);
      simulationStates.set(code, simState);
      io.to(code).emit('simulation:tick', simState);

      // Start 1-second server tick loop
      const interval = setInterval(async () => {
        let currentSim = simulationStates.get(code);
        if (!currentSim) return;

        // Check if finished
        if (currentSim.phase === 'MISSION_COMPLETE' || currentSim.phase === 'MISSION_ABORTED') {
          clearInterval(interval);
          simulationIntervals.delete(code);

          // Generate Report
          const report = generateMissionReport(
            currentSim,
            scenario,
            design,
            code,
            room.members.map((m) => m.name)
          );

          // Persist report to database
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

          room.status = 'DEBRIEF';
          io.to(code).emit('room:updated', room);
          io.to(code).emit('mission:completed', report);
          return;
        }

        const prevActiveEvent = currentSim.activeEvent;
        const nextSim = tickSimulation(currentSim, design, targetOrbit, MISSION_EVENTS, 1);
        simulationStates.set(code, nextSim);

        // Notify client if a crisis event just popped up
        if (!prevActiveEvent && nextSim.activeEvent) {
          io.to(code).emit('mission:eventTriggered', nextSim.activeEvent);
        }

        io.to(code).emit('simulation:tick', nextSim);
      }, 1000);

      simulationIntervals.set(code, interval);
    });

    // ----------------------------------------------------
    // 6. EVENT RESOLUTION
    // ----------------------------------------------------
    socket.on('mission:eventChoice', ({ roomCode, eventId, choiceId }) => {
      const code = roomCode.toUpperCase();
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
    // 7. CONTROLS: SPEED & PAUSE
    // ----------------------------------------------------
    socket.on('mission:setSpeed', ({ roomCode, speedMultiplier }) => {
      const code = roomCode.toUpperCase();
      const sim = simulationStates.get(code);
      if (!sim) return;
      sim.speedMultiplier = Math.max(1, Math.min(5, speedMultiplier));
      io.to(code).emit('simulation:tick', sim);
    });

    socket.on('mission:togglePause', ({ roomCode }) => {
      const code = roomCode.toUpperCase();
      const sim = simulationStates.get(code);
      if (!sim) return;
      sim.isPaused = !sim.isPaused;
      io.to(code).emit('simulation:tick', sim);
    });

    // ----------------------------------------------------
    // 8. TACTICAL MISSION CHAT
    // ----------------------------------------------------
    socket.on('chat:send', ({ roomCode, sender, role, message }) => {
      const code = roomCode.toUpperCase();
      io.to(code).emit('chat:message', {
        id: `msg-${Date.now()}-${Math.random()}`,
        sender,
        role,
        message,
        timestamp: new Date().toLocaleTimeString()
      });
    });

    // ----------------------------------------------------
    // 9. DISCONNECT
    // ----------------------------------------------------
    socket.on('disconnect', () => {
      for (const [code, room] of activeRooms.entries()) {
        const index = room.members.findIndex((m) => m.id === socket.id);
        if (index !== -1) {
          room.members.splice(index, 1);
          if (room.members.length === 0) {
            // Clean up simulation loop
            if (simulationIntervals.has(code)) {
              clearInterval(simulationIntervals.get(code)!);
              simulationIntervals.delete(code);
            }
            activeRooms.delete(code);
            simulationStates.delete(code);
          } else {
            // Reassign host if host left
            if (room.hostId === socket.id) {
              room.hostId = room.members[0].id;
              room.members[0].isHost = true;
            }
            io.to(code).emit('room:updated', room);
          }
        }
      }
    });
  });
}
