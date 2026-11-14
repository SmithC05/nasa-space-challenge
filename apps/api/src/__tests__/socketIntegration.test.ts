import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { setupMissionSockets } from '../sockets/missionSocket';
import { MissionRoom, SocketResponse } from '@orbital/contracts';

describe('Real-Time Socket.IO Multiplayer Integration Tests', () => {
  let server: http.Server;
  let io: Server;
  let serverPort: number;
  let client1: ClientSocket;
  let client2: ClientSocket;

  beforeAll(async () => {
    const app = express();
    server = http.createServer(app);
    io = new Server(server, { cors: { origin: '*' } });
    setupMissionSockets(io);

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        serverPort = typeof addr === 'object' && addr ? addr.port : 4001;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (client1?.connected) client1.disconnect();
    if (client2?.connected) client2.disconnect();
    io.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('client 1 creates a room and receives private session resumeToken', async () => {
    client1 = ioClient(`http://127.0.0.1:${serverPort}`, {
      transports: ['websocket', 'polling'],
      reconnection: false
    });

    await new Promise<void>((resolve) => {
      client1.on('connect', () => resolve());
    });

    const createRes = await new Promise<SocketResponse<{ room: MissionRoom; session: any }>>((resolve) => {
      client1.emit(
        'room:create',
        { hostName: 'Flight Lead Alpha', roomName: 'Apollo Alpha' },
        (res: any) => resolve(res)
      );
    });

    expect(createRes.success).toBe(true);
    expect(createRes.data?.room.code).toHaveLength(4);
    expect(createRes.data?.room.hostId).toBe(createRes.data?.session.memberId);
    expect(createRes.data?.session.resumeToken).toHaveLength(64);
    expect(createRes.data?.session.role).toBe('FLIGHT_DIRECTOR');
  });

  it('client 2 joins the room using roomCode and both receive synchronized broadcast', async () => {
    client2 = ioClient(`http://127.0.0.1:${serverPort}`, {
      transports: ['websocket', 'polling'],
      reconnection: false
    });

    await new Promise<void>((resolve) => {
      client2.on('connect', () => resolve());
    });

    // Get current room code from client 1
    const createRes = await new Promise<any>((resolve) => {
      client1.emit('room:create', { hostName: 'Director 1', roomName: 'Test Sync Room' }, (res: any) => resolve(res));
    });
    const roomCode = createRes.data.room.code;

    // Set up broadcast listener on client 1
    const client1UpdatePromise = new Promise<MissionRoom>((resolve) => {
      client1.on('room:updated', (updatedRoom: MissionRoom) => {
        if (updatedRoom.members.length === 2) {
          resolve(updatedRoom);
        }
      });
    });

    // Client 2 joins
    const joinRes = await new Promise<any>((resolve) => {
      client2.emit('room:join', { roomCode, name: 'Systems Lead Beta' }, (res: any) => resolve(res));
    });

    expect(joinRes.success).toBe(true);
    expect(joinRes.data.room.members).toHaveLength(2);
    expect(joinRes.data.session.role).toBe('SYSTEMS_ENGINEER');

    // Both clients received the broadcast
    const broadcastedRoom = await client1UpdatePromise;
    expect(broadcastedRoom.members).toHaveLength(2);
    expect(broadcastedRoom.members.some((m) => m.name === 'Systems Lead Beta')).toBe(true);
  });

  it('rejects an invalid resume token on reconnect', async () => {
    const createRes = await new Promise<any>((resolve) => {
      client1.emit('room:create', { hostName: 'Host C', roomName: 'Auth Test' }, (res: any) => resolve(res));
    });
    const roomCode = createRes.data.room.code;
    const memberId = createRes.data.session.memberId;

    const reconnectRes = await new Promise<any>((resolve) => {
      client2.emit(
        'room:reconnect',
        { roomCode, memberId, resumeToken: 'invalid-token-12345678901234567890' },
        (res: any) => resolve(res)
      );
    });

    expect(reconnectRes.success).toBe(false);
    expect(reconnectRes.error.code).toBe('INVALID_TOKEN');
  });

  it('rejects role changes when role is already occupied', async () => {
    const createRes = await new Promise<any>((resolve) => {
      client1.emit('room:create', { hostName: 'Commander' }, (res: any) => resolve(res));
    });
    const roomCode = createRes.data.room.code;

    await new Promise<any>((resolve) => {
      client2.emit('room:join', { roomCode, name: 'Engineer 2' }, (res: any) => resolve(res));
    });

    // Client 2 tries to claim FLIGHT_DIRECTOR (which client 1 holds)
    const roleRes = await new Promise<any>((resolve) => {
      client2.emit('room:setRole', { roomCode, role: 'FLIGHT_DIRECTOR' }, (res: any) => resolve(res));
    });

    expect(roleRes.success).toBe(false);
    expect(roleRes.error.code).toBe('ROLE_TAKEN');
  });

  it('enforces that only host can advance lobby to MISSION_SETUP when all are ready', async () => {
    const createRes = await new Promise<any>((resolve) => {
      client1.emit('room:create', { hostName: 'Host Final' }, (res: any) => resolve(res));
    });
    const roomCode = createRes.data.room.code;

    await new Promise<any>((resolve) => {
      client2.emit('room:join', { roomCode, name: 'Crew 2' }, (res: any) => resolve(res));
    });

    // Client 2 is not ready yet; host tries to advance -> fails
    const failAdvance = await new Promise<any>((resolve) => {
      client1.emit('room:advanceLobby', { roomCode }, (res: any) => resolve(res));
    });
    expect(failAdvance.success).toBe(false);

    // Client 2 marks ready
    await new Promise<any>((resolve) => {
      client2.emit('room:setReady', { roomCode, isReady: true }, (res: any) => resolve(res));
    });

    // Client 2 (non-host) tries to advance -> rejected with UNAUTHORIZED / FORBIDDEN
    const nonHostAdvance = await new Promise<any>((resolve) => {
      client2.emit('room:advanceLobby', { roomCode }, (res: any) => resolve(res));
    });
    expect(nonHostAdvance.success).toBe(false);

    // Host advances successfully
    const hostAdvance = await new Promise<any>((resolve) => {
      client1.emit('room:advanceLobby', { roomCode }, (res: any) => resolve(res));
    });
    expect(hostAdvance.success).toBe(true);
    expect(hostAdvance.data.room.status).toBe('MISSION_SETUP');
  });
});
