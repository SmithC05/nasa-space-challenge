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
    let currentPlanningRev = joinRes.data.room.planningRevision;

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
        { roomCode, scenarioId: targetScenario.id, baseRevision: currentPlanningRev },
        (res: any) => resolve(res)
      );
    });

    expect(selectRes.success).toBe(true);
    expect(selectRes.data.room.scenarioId).toBe(targetScenario.id);

    // Host also receives the broadcast
    const broadcastedRoom = await hostReceivedUpdate;
    expect(broadcastedRoom.scenarioId).toBe(targetScenario.id);
    expect(broadcastedRoom.lastUpdatedBy?.role).toBe('SCIENCE_LEAD');

    hostSocket.disconnect();
    scienceSocket.disconnect();
  });

  it('synchronizes spacecraft design updates from SYSTEMS_ENGINEER and invalidates readiness', async () => {
    hostSocket = await createSocket();
    systemsSocket = await createSocket();

    const createRes = await new Promise<any>((resolve) => {
      hostSocket.emit(
        'room:create',
        { hostName: 'Flight Director', roomName: 'Collab Design Beta' },
        (res: any) => resolve(res)
      );
    });
    const roomCode = createRes.data.room.code;

    const joinRes = await new Promise<any>((resolve) => {
      systemsSocket.emit(
        'room:join',
        { roomCode, name: 'Chief Engineer', role: 'SYSTEMS_ENGINEER' },
        (res: any) => resolve(res)
      );
    });

    // Mark host ready
    await new Promise<any>((resolve) => {
      hostSocket.emit('room:setReady', { roomCode, isReady: true }, (res: any) => resolve(res));
    });

    const hostReceivedUpdate = new Promise<MissionRoom>((resolve) => {
      hostSocket.on('room:updated', (room: MissionRoom) => {
        if (room.design?.name === 'Hyperion Surveyor Mk 2') {
          resolve(room);
        }
      });
    });

    const updateRes = await new Promise<any>((resolve) => {
      systemsSocket.emit(
        'design:update',
        {
          roomCode,
          design: {
            name: 'Hyperion Surveyor Mk 2',
            busId: 'bus-smallsat-standard',
            selectedComponentIds: [
              'bus-smallsat-standard',
              'power-solar-standard-wings',
              'power-batt-li-ion',
              'comms-omni-patch',
              'aocs-reaction-wheels',
              'inst-multispectral-imager'
            ]
          },
          baseRevision: joinRes.data.room.planningRevision
        },
        (res: any) => resolve(res)
      );
    });

    expect(updateRes.success).toBe(true);
    expect(updateRes.data.room.design.name).toBe('Hyperion Surveyor Mk 2');

    // Verify readiness was invalidated across members
    const updatedRoom = await hostReceivedUpdate;
    const hostMember = updatedRoom.members.find((m) => m.name === 'Flight Director');
    expect(hostMember?.isReady).toBe(false);

    hostSocket.disconnect();
    systemsSocket.disconnect();
  });

  it('enforces role authorization on Socket.IO level and emits plan:rejected to unauthorized socket', async () => {
    const sHost = await createSocket();
    const sScience = await createSocket();

    const createRes = await new Promise<any>((resolve) => {
      sHost.emit('room:create', { hostName: 'Director Lead', roomName: 'Role Auth Room' }, resolve);
    });
    const code = createRes.data.room.code;

    const joinRes = await new Promise<any>((resolve) => {
      sScience.emit('room:join', { roomCode: code, name: 'Science Specialist', role: 'SCIENCE_LEAD' }, resolve);
    });

    // Set up plan:rejected error listener on unauthorized client
    const rejectedPromise = new Promise<{ code: string; message: string }>((resolve) => {
      sScience.on('plan:rejected', (err: any) => resolve(err));
    });

    // Science Lead attempts to configure launch vehicle (reserved for TRAJECTORY_SPECIALIST or FLIGHT_DIRECTOR)
    const launchRes = await new Promise<any>((resolve) => {
      sScience.emit(
        'launch:configure',
        {
          roomCode: code,
          launchConfig: {
            vehicleId: LAUNCH_VEHICLES[1].id,
            orbitId: ORBIT_PROFILES[0].id
          },
          baseRevision: joinRes.data.room.planningRevision
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

    const initialPlanRev = joinRes.data.room.planningRevision;

    // Host updates scenario, advancing room planning revision from 1 to 2
    await new Promise<any>((resolve) => {
      sHost.emit(
        'scenario:select',
        { roomCode: code, scenarioId: MISSION_SCENARIOS[1].id, baseRevision: initialPlanRev },
        resolve
      );
    });

    // Systems Engineer tries to update design using OLD initialPlanRev
    const conflictRes = await new Promise<any>((resolve) => {
      sSystems.emit(
        'design:update',
        {
          roomCode: code,
          design: { name: 'Outdated Design', selectedComponentIds: ['bus-smallsat-standard'] },
          baseRevision: initialPlanRev // Stale revision 1!
        },
        resolve
      );
    });

    expect(conflictRes.success).toBe(false);
    expect(conflictRes.error.code).toBe('REVISION_CONFLICT');
    expect(conflictRes.data.room).toBeDefined();
    expect(conflictRes.data.room.planningRevision).toBeGreaterThan(initialPlanRev);
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

  // =========================================================================
  // TESTS A - F: STALE SOCKET REVOCATION & ROOM AUTHORIZATION
  // =========================================================================

  it('Test A: previous socket is disconnected upon successful reconnection', async () => {
    const socketA = await createSocket();
    const createRes = await new Promise<any>((resolve) => {
      socketA.emit('room:create', { hostName: 'Host A', roomName: 'Revocation Alpha' }, resolve);
    });
    expect(createRes.success).toBe(true);
    const roomCode = createRes.data.room.code;
    const memberId = createRes.data.session.memberId;
    const resumeToken = createRes.data.session.resumeToken;

    // Set up disconnect listener on socketA
    const socketADisconnected = new Promise<string>((resolve) => {
      socketA.on('disconnect', (reason) => resolve(reason));
    });

    // Reconnect on socketB
    const socketB = await createSocket();
    const reconnectRes = await new Promise<any>((resolve) => {
      socketB.emit('room:reconnect', { roomCode, memberId, resumeToken }, resolve);
    });
    expect(reconnectRes.success).toBe(true);

    // Confirm socketA was disconnected by the server
    const disconnectReason = await socketADisconnected;
    expect(disconnectReason).toBe('io server disconnect');
    expect(socketA.connected).toBe(false);

    socketB.disconnect();
  });

  it('Test B: new socket retains authenticated access to plan:get and planning mutations', async () => {
    const socketA = await createSocket();
    const createRes = await new Promise<any>((resolve) => {
      socketA.emit('room:create', { hostName: 'Host B', roomName: 'Retain Access' }, resolve);
    });
    expect(createRes.success).toBe(true);
    const roomCode = createRes.data.room.code;
    const memberId = createRes.data.session.memberId;
    const resumeToken = createRes.data.session.resumeToken;

    const socketB = await createSocket();
    const reconnectRes = await new Promise<any>((resolve) => {
      socketB.emit('room:reconnect', { roomCode, memberId, resumeToken }, resolve);
    });
    expect(reconnectRes.success).toBe(true);

    // 1. Socket B can read plan
    const planRes = await new Promise<any>((resolve) => {
      socketB.emit('plan:get', { roomCode }, resolve);
    });
    expect(planRes.success).toBe(true);
    expect(planRes.data.room.code).toBe(roomCode);

    // 2. Socket B can mutate scenario
    const targetScenario = MISSION_SCENARIOS[1];
    const updateRes = await new Promise<any>((resolve) => {
      socketB.emit(
        'scenario:select',
        { roomCode, scenarioId: targetScenario.id, baseRevision: planRes.data.room.planningRevision },
        resolve
      );
    });
    expect(updateRes.success).toBe(true);
    expect(updateRes.data.room.scenarioId).toBe(targetScenario.id);

    socketB.disconnect();
  });

  it('Test C: previous socket cannot receive room:updated or room:presence broadcasts after reconnection', async () => {
    const socketA = await createSocket();
    const createRes = await new Promise<any>((resolve) => {
      socketA.emit('room:create', { hostName: 'Host C', roomName: 'Broadcast Leak Test' }, resolve);
    });
    expect(createRes.success).toBe(true);
    const roomCode = createRes.data.room.code;
    const memberId = createRes.data.session.memberId;
    const resumeToken = createRes.data.session.resumeToken;

    let socketAReceivedRoomUpdated = false;
    let socketAReceivedPresence = false;
    socketA.on('room:updated', () => {
      socketAReceivedRoomUpdated = true;
    });
    socketA.on('room:presence', () => {
      socketAReceivedPresence = true;
    });

    // Reconnect on socketB
    const socketB = await createSocket();
    await new Promise<any>((resolve) => {
      socketB.emit('room:reconnect', { roomCode, memberId, resumeToken }, resolve);
    });

    // Connect an observer member to trigger presence broadcasts
    const socketOther = await createSocket();
    const otherJoined = new Promise<any>((resolve) => {
      socketB.on('room:presence', (p: any) => {
        if (p.name === 'Observer Member') resolve(p);
      });
    });

    await new Promise<any>((resolve) => {
      socketOther.emit('room:join', { roomCode, name: 'Observer Member', role: 'SCIENCE_LEAD' }, resolve);
    });

    await otherJoined;

    // Mutate scenario from socketB to trigger room:updated broadcast
    await new Promise<any>((resolve) => {
      socketB.emit(
        'scenario:select',
        { roomCode, scenarioId: MISSION_SCENARIOS[1].id, baseRevision: 1 },
        resolve
      );
    });

    // Allow time for any network packets
    await new Promise((r) => setTimeout(r, 100));

    expect(socketAReceivedRoomUpdated).toBe(false);
    expect(socketAReceivedPresence).toBe(false);

    socketB.disconnect();
    socketOther.disconnect();
  });

  it('Test D: stale socket cannot mutate room state and is rejected with UNAUTHORIZED', async () => {
    const socketA = await createSocket();
    const createRes = await new Promise<any>((resolve) => {
      socketA.emit('room:create', { hostName: 'Host D', roomName: 'Mutation Lockdown' }, resolve);
    });
    expect(createRes.success).toBe(true);
    const roomCode = createRes.data.room.code;
    const memberId = createRes.data.session.memberId;
    const resumeToken = createRes.data.session.resumeToken;

    // Socket B reconnects as the authoritative member
    const socketB = await createSocket();
    await new Promise<any>((resolve) => {
      socketB.emit('room:reconnect', { roomCode, memberId, resumeToken }, resolve);
    });

    // Create a live socket representing a stale connection attempting mutations with old memberId
    const staleSocket = await createSocket();
    const serverStaleSocket = io.sockets.sockets.get(staleSocket.id!);
    expect(serverStaleSocket).toBeDefined();
    serverStaleSocket!.data = {
      memberId,
      roomCode,
      authenticated: true,
      stale: false
    };

    // 1. room:setReady
    const readyRes = await new Promise<any>((resolve) => {
      staleSocket.emit('room:setReady', { roomCode, isReady: true }, resolve);
    });
    expect(readyRes.success).toBe(false);
    expect(readyRes.error.code).toBe('UNAUTHORIZED');

    // 2. room:setRole
    const roleRes = await new Promise<any>((resolve) => {
      staleSocket.emit('room:setRole', { roomCode, role: 'SYSTEMS_ENGINEER' }, resolve);
    });
    expect(roleRes.success).toBe(false);
    expect(roleRes.error.code).toBe('UNAUTHORIZED');

    // 3. room:advanceLobby
    const advanceRes = await new Promise<any>((resolve) => {
      staleSocket.emit('room:advanceLobby', { roomCode }, resolve);
    });
    expect(advanceRes.success).toBe(false);
    expect(advanceRes.error.code).toBe('UNAUTHORIZED');

    // 4. room:leave
    const leaveRes = await new Promise<any>((resolve) => {
      staleSocket.emit('room:leave', { roomCode }, resolve);
    });
    expect(leaveRes.success).toBe(false);
    expect(leaveRes.error.code).toBe('UNAUTHORIZED');

    // 5. plan:get
    const planRes = await new Promise<any>((resolve) => {
      staleSocket.emit('plan:get', { roomCode }, resolve);
    });
    expect(planRes.success).toBe(false);
    expect(planRes.error.code).toBe('UNAUTHORIZED');

    // 6. scenario:select
    const scenarioRes = await new Promise<any>((resolve) => {
      staleSocket.emit('scenario:select', { roomCode, scenarioId: MISSION_SCENARIOS[1].id, baseRevision: 1 }, resolve);
    });
    expect(scenarioRes.success).toBe(false);
    expect(scenarioRes.error.code).toBe('UNAUTHORIZED');

    // 7. design:update
    const designRes = await new Promise<any>((resolve) => {
      staleSocket.emit(
        'design:update',
        {
          roomCode,
          design: { name: 'Unauthorized Stale Craft', selectedComponentIds: ['bus-smallsat-standard'] },
          baseRevision: 1
        },
        resolve
      );
    });
    expect(designRes.success).toBe(false);
    expect(designRes.error.code).toBe('UNAUTHORIZED');

    // 8. launch:configure
    const launchRes = await new Promise<any>((resolve) => {
      staleSocket.emit(
        'launch:configure',
        {
          roomCode,
          launchConfig: { vehicleId: LAUNCH_VEHICLES[0].id, orbitId: ORBIT_PROFILES[0].id },
          baseRevision: 1
        },
        resolve
      );
    });
    expect(launchRes.success).toBe(false);
    expect(launchRes.error.code).toBe('UNAUTHORIZED');

    // Verify stale flag set on server socket
    expect(serverStaleSocket!.data.stale).toBe(true);
    expect(serverStaleSocket!.data.authenticated).toBe(false);

    staleSocket.disconnect();
    socketB.disconnect();
  });

  it('Test E: invalid resume token does not disconnect active socket', async () => {
    const socketA = await createSocket();
    const createRes = await new Promise<any>((resolve) => {
      socketA.emit('room:create', { hostName: 'Host E', roomName: 'Token Security' }, resolve);
    });
    expect(createRes.success).toBe(true);
    const roomCode = createRes.data.room.code;
    const memberId = createRes.data.session.memberId;

    let socketADisconnected = false;
    socketA.on('disconnect', () => {
      socketADisconnected = true;
    });

    // Attacker or malformed client attempts reconnection with bogus resume token
    const socketAttacker = await createSocket();
    const reconnectRes = await new Promise<any>((resolve) => {
      socketAttacker.emit(
        'room:reconnect',
        { roomCode, memberId, resumeToken: 'totally-invalid-resume-token-xyz' },
        resolve
      );
    });
    expect(reconnectRes.success).toBe(false);
    expect(reconnectRes.error.code).toBe('INVALID_TOKEN');

    // Socket A must remain connected and operational
    await new Promise((r) => setTimeout(r, 100));
    expect(socketADisconnected).toBe(false);
    expect(socketA.connected).toBe(true);

    const planRes = await new Promise<any>((resolve) => {
      socketA.emit('plan:get', { roomCode }, resolve);
    });
    expect(planRes.success).toBe(true);

    socketA.disconnect();
    socketAttacker.disconnect();
  });

  it('Test F: disconnect lifecycle remains correct and old socket disconnect does not mark participant disconnected', async () => {
    const socketA = await createSocket();
    const createRes = await new Promise<any>((resolve) => {
      socketA.emit('room:create', { hostName: 'Host F', roomName: 'Lifecycle Test' }, resolve);
    });
    expect(createRes.success).toBe(true);
    const roomCode = createRes.data.room.code;
    const memberId = createRes.data.session.memberId;
    const resumeToken = createRes.data.session.resumeToken;

    // Listen on Socket B for any presence events
    const socketB = await createSocket();
    let socketBReceivedDisconnectedPresence = false;
    socketB.on('room:presence', (presence: any) => {
      if (presence.memberId === memberId && presence.connected === false) {
        socketBReceivedDisconnectedPresence = true;
      }
    });

    const reconnectRes = await new Promise<any>((resolve) => {
      socketB.emit('room:reconnect', { roomCode, memberId, resumeToken }, resolve);
    });
    expect(reconnectRes.success).toBe(true);

    // Socket A is disconnected by server revocation or client disconnect
    socketA.disconnect();

    // Wait a brief moment for any disconnect events to process
    await new Promise((r) => setTimeout(r, 100));

    // Confirm that Socket B did NOT receive any connected: false presence for this participant
    expect(socketBReceivedDisconnectedPresence).toBe(false);

    // Check room snapshot: participant is still connected === true
    const planRes = await new Promise<any>((resolve) => {
      socketB.emit('plan:get', { roomCode }, resolve);
    });
    expect(planRes.success).toBe(true);
    const memberInRoom = planRes.data.room.members.find((m: any) => m.id === memberId);
    expect(memberInRoom).toBeDefined();
    expect(memberInRoom.connected).toBe(true);

    socketB.disconnect();
  });

  it('rejects missing, negative, and non-integer revisions with VALIDATION_ERROR', async () => {
    const sClient = await createSocket();
    const createRes = await new Promise<any>((resolve) => {
      sClient.emit('room:create', { hostName: 'Rev Tester', roomName: 'Zod Rev Test' }, resolve);
    });
    const code = createRes.data.room.code;

    // Missing baseRevision
    const missingRevRes = await new Promise<any>((resolve) => {
      sClient.emit('scenario:select', { roomCode: code, scenarioId: MISSION_SCENARIOS[1].id }, resolve);
    });
    expect(missingRevRes.success).toBe(false);
    expect(missingRevRes.error.code).toBe('VALIDATION_ERROR');

    // Negative baseRevision
    const negRevRes = await new Promise<any>((resolve) => {
      sClient.emit('scenario:select', { roomCode: code, scenarioId: MISSION_SCENARIOS[1].id, baseRevision: -1 }, resolve);
    });
    expect(negRevRes.success).toBe(false);
    expect(negRevRes.error.code).toBe('VALIDATION_ERROR');

    // Non-integer baseRevision
    const floatRevRes = await new Promise<any>((resolve) => {
      sClient.emit('scenario:select', { roomCode: code, scenarioId: MISSION_SCENARIOS[1].id, baseRevision: 1.5 }, resolve);
    });
    expect(floatRevRes.success).toBe(false);
    expect(floatRevRes.error.code).toBe('VALIDATION_ERROR');

    sClient.disconnect();
  });

  it('returns safe authoritative snapshot when unauthorized update is rejected', async () => {
    const sHost = await createSocket();
    const sScience = await createSocket();

    const createRes = await new Promise<any>((resolve) => {
      sHost.emit('room:create', { hostName: 'Host Flight', roomName: 'Rollback Test' }, resolve);
    });
    const code = createRes.data.room.code;

    const joinRes = await new Promise<any>((resolve) => {
      sScience.emit('room:join', { roomCode: code, name: 'Science Officer', role: 'SCIENCE_LEAD' }, resolve);
    });

    // Science attempts unauthorized spacecraft design update
    const rejectedRes = await new Promise<any>((resolve) => {
      sScience.emit(
        'design:update',
        {
          roomCode: code,
          design: { name: 'Optimistic Unauthorized Name', selectedComponentIds: ['bus-smallsat-standard'] },
          baseRevision: joinRes.data.room.planningRevision
        },
        resolve
      );
    });

    expect(rejectedRes.success).toBe(false);
    expect(rejectedRes.error.code).toBe('FORBIDDEN');
    // Authoritative room snapshot is provided for client state rollback
    expect(rejectedRes.data.room).toBeDefined();
    expect(rejectedRes.data.room.design.name).not.toBe('Optimistic Unauthorized Name');

    sHost.disconnect();
    sScience.disconnect();
  });
});
