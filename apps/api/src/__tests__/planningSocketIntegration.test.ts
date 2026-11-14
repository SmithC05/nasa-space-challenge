import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { setupMissionSockets } from '../sockets/missionSocket';
import { MissionRoom, SocketResponse } from '@orbital/contracts';
import { LAUNCH_VEHICLES, MISSION_SCENARIOS, ORBIT_PROFILES } from '@orbital/game-data';

describe('Real-Time Socket.IO Mission Planning Integration Tests (Phase 2)', () => {
  let server: http.Server;
  let io: Server;
  let serverPort: number;
  let hostSocket!: ClientSocket;
  let scienceSocket!: ClientSocket;
  let systemsSocket!: ClientSocket;

  beforeAll(async () => {
    const app = express();
    server = http.createServer(app);
    io = new Server(server, { cors: { origin: '*' } });
    setupMissionSockets(io);

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        serverPort = typeof addr === 'object' && addr ? addr.port : 4002;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (hostSocket?.connected) hostSocket.disconnect();
    if (scienceSocket?.connected) scienceSocket.disconnect();
    if (systemsSocket?.connected) systemsSocket.disconnect();
    io.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  function createSocket(): Promise<ClientSocket> {
    const s = ioClient(`http://127.0.0.1:${serverPort}`, {
      transports: ['websocket', 'polling'],
      reconnection: false
    });
    return new Promise((resolve) => {
      s.on('connect', () => resolve(s));
    });
  }

  it('synchronizes scenario selection from SCIENCE_LEAD across all room participants', async () => {
    hostSocket = await createSocket();
    scienceSocket = await createSocket();

    // 1. Host creates room
    const createRes = await new Promise<any>((resolve) => {
      hostSocket.emit(
        'room:create',
        { hostName: 'Flight Director', roomName: 'Collab Planning Alpha' },
        (res: any) => resolve(res)
      );
    });
    expect(createRes.success).toBe(true);
    const roomCode = createRes.data.room.code;

    // 2. Science officer joins room
    const joinRes = await new Promise<any>((resolve) => {
      scienceSocket.emit(
        'room:join',
        { roomCode, name: 'Dr. Ellie Arroway', role: 'SCIENCE_LEAD' },
        (res: any) => resolve(res)
      );
    });
    expect(joinRes.success).toBe(true);

    const targetScenario = MISSION_SCENARIOS[1]; // Lunar Prospector
    let currentRevision = joinRes.data.room.revision;

    // 3. Set up broadcast listener on host socket
    const hostReceivedUpdate = new Promise<MissionRoom>((resolve) => {
      hostSocket.on('room:updated', (room: MissionRoom) => {
        if (room.scenarioId === targetScenario.id) {
          resolve(room);
        }
      });
    });

    // 4. Science officer emits scenario:select with current revision
    const selectRes = await new Promise<any>((resolve) => {
      scienceSocket.emit(
        'scenario:select',
        { roomCode, scenarioId: targetScenario.id, baseRevision: currentRevision },
        (res: any) => resolve(res)
      );
    });

    expect(selectRes.success).toBe(true);
    expect(selectRes.data.room.scenarioId).toBe(targetScenario.id);

    // Host also receives the broadcast
    const broadcastRoom = await hostReceivedUpdate;
    expect(broadcastRoom.scenarioId).toBe(targetScenario.id);
    expect(broadcastRoom.revision).toBe(currentRevision + 1);
  });

  it('synchronizes spacecraft design update from SYSTEMS_ENGINEER and resets crew readiness', async () => {
    // Create a fresh collaborative room with 3 participants
    const freshHost = await createSocket();
    const freshSystems = await createSocket();
    const freshScience = await createSocket();

    const createRes = await new Promise<any>((resolve) => {
      freshHost.emit('room:create', { hostName: 'Director Fresh', roomName: 'Design Sync' }, resolve);
    });
    const testCode = createRes.data.room.code;

    const joinSys = await new Promise<any>((resolve) => {
      freshSystems.emit('room:join', { roomCode: testCode, name: 'Montgomery Scott', role: 'SYSTEMS_ENGINEER' }, resolve);
    });
    const joinSci = await new Promise<any>((resolve) => {
      freshScience.emit('room:join', { roomCode: testCode, name: 'Spock', role: 'SCIENCE_LEAD' }, resolve);
    });

    // All 3 members mark ready
    await new Promise<any>((resolve) => freshHost.emit('room:setReady', { roomCode: testCode, isReady: true }, resolve));
    await new Promise<any>((resolve) => freshSystems.emit('room:setReady', { roomCode: testCode, isReady: true }, resolve));
    const readySciRes = await new Promise<any>((resolve) => freshScience.emit('room:setReady', { roomCode: testCode, isReady: true }, resolve));
    expect(readySciRes.data.room.members.every((m: any) => m.isReady)).toBe(true);

    const newComponentIds = [
      'bus-smallsat-standard',
      'power-solar-standard-wings',
      'power-batt-li-ion',
      'comms-omni-patch',
      'inst-multispectral-imager'
    ];

    const scienceObservedReset = new Promise<MissionRoom>((resolve) => {
      freshScience.on('room:updated', (updated: MissionRoom) => {
        if (updated.design?.name === 'Enterprise NX') {
          resolve(updated);
        }
      });
    });

    // Systems Engineer updates spacecraft design
    const updateDesignRes = await new Promise<any>((resolve) => {
      freshSystems.emit(
        'design:update',
        {
          roomCode: testCode,
          design: { name: 'Enterprise NX', selectedComponentIds: newComponentIds },
          baseRevision: readySciRes.data.room.revision
        },
        resolve
      );
    });

    expect(updateDesignRes.success).toBe(true);
    expect(updateDesignRes.data.room.design.name).toBe('Enterprise NX');

    // Verify readiness was invalidated across all members due to material design change
    const broadcastState = await scienceObservedReset;
    expect(broadcastState.members.every((m: any) => !m.isReady)).toBe(true);

    freshHost.disconnect();
    freshSystems.disconnect();
    freshScience.disconnect();
  });

  it('rejects unauthorized role updates with FORBIDDEN and plan:rejected notification', async () => {
    const sHost = await createSocket();
    const sScience = await createSocket();

    const createRes = await new Promise<any>((resolve) => {
      sHost.emit('room:create', { hostName: 'Kranz', roomName: 'Auth Test' }, resolve);
    });
    const code = createRes.data.room.code;

    const joinRes = await new Promise<any>((resolve) => {
      sScience.emit('room:join', { roomCode: code, name: 'Dr. Sagan', role: 'SCIENCE_LEAD' }, resolve);
    });

    // Set up plan:rejected listener
    const rejectedPromise = new Promise<{ code: string; message: string }>((resolve) => {
      sScience.on('plan:rejected', (data) => resolve(data));
    });

    // Science Lead attempts to configure launch vehicle (which requires TRAJECTORY_SPECIALIST or FLIGHT_DIRECTOR)
    const launchRes = await new Promise<any>((resolve) => {
      sScience.emit(
        'launch:configure',
        {
          roomCode: code,
          launchConfig: { vehicleId: LAUNCH_VEHICLES[0].id, orbitId: ORBIT_PROFILES[0].id },
          baseRevision: joinRes.data.room.revision
        },
        resolve
      );
    });

    expect(launchRes.success).toBe(false);
    expect(launchRes.error.code).toBe('FORBIDDEN');

    const notification = await rejectedPromise;
    expect(notification.code).toBe('FORBIDDEN');

    sHost.disconnect();
    sScience.disconnect();
  });

  it('rejects stale baseRevision with REVISION_CONFLICT and returns latest authoritative snapshot', async () => {
    const sHost = await createSocket();
    const sSystems = await createSocket();

    const createRes = await new Promise<any>((resolve) => {
      sHost.emit('room:create', { hostName: 'Director Stale', roomName: 'Conflict Check' }, resolve);
    });
    const code = createRes.data.room.code;

    const joinRes = await new Promise<any>((resolve) => {
      sSystems.emit('room:join', { roomCode: code, name: 'Engineer Stale', role: 'SYSTEMS_ENGINEER' }, resolve);
    });

    const initialRev = joinRes.data.room.revision;

    // Host updates scenario, advancing room revision
    await new Promise<any>((resolve) => {
      sHost.emit(
        'scenario:select',
        { roomCode: code, scenarioId: MISSION_SCENARIOS[1].id, baseRevision: initialRev },
        resolve
      );
    });

    // Systems Engineer tries to update design using OLD initialRev
    const conflictRes = await new Promise<any>((resolve) => {
      sSystems.emit(
        'design:update',
        {
          roomCode: code,
          design: { name: 'Outdated Design', selectedComponentIds: ['bus-smallsat-standard'] },
          baseRevision: initialRev // Stale!
        },
        resolve
      );
    });

    expect(conflictRes.success).toBe(false);
    expect(conflictRes.error.code).toBe('REVISION_CONFLICT');
    expect(conflictRes.data.room).toBeDefined();
    expect(conflictRes.data.room.revision).toBeGreaterThan(initialRev);
    expect(conflictRes.data.room.scenarioId).toBe(MISSION_SCENARIOS[1].id);

    sHost.disconnect();
    sSystems.disconnect();
  });

  it('strictly isolates rooms: Room A updates never leak into Room B', async () => {
    const sHostA = await createSocket();
    const sHostB = await createSocket();

    const roomARes = await new Promise<any>((resolve) => {
      sHostA.emit('room:create', { hostName: 'Director A', roomName: 'Room A' }, resolve);
    });
    const roomBRes = await new Promise<any>((resolve) => {
      sHostB.emit('room:create', { hostName: 'Director B', roomName: 'Room B' }, resolve);
    });

    let roomBReceivedLeak = false;
    sHostB.on('room:updated', (updated: MissionRoom) => {
      if (updated.code === roomARes.data.room.code) {
        roomBReceivedLeak = true;
      }
    });

    // Update Room A
    await new Promise<any>((resolve) => {
      sHostA.emit(
        'scenario:select',
        {
          roomCode: roomARes.data.room.code,
          scenarioId: MISSION_SCENARIOS[2].id,
          baseRevision: roomARes.data.room.revision
        },
        resolve
      );
    });

    // Wait 100ms
    await new Promise((r) => setTimeout(r, 100));
    expect(roomBReceivedLeak).toBe(false);

    sHostA.disconnect();
    sHostB.disconnect();
  });
});
