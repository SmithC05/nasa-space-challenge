import { describe, expect, it } from 'vitest';
import { RoomService } from '../services/roomService';
import {
  createMemberIdentity,
  hashResumeToken,
  verifyResumeToken
} from '../services/identityService';
import {
  generateUniqueRoomCode,
  isValidRoomCodeSyntax,
  normalizeRoomCode
} from '../services/roomCodeService';
import { isRoomAllReady } from '../services/permissionService';

describe('Player Identity & Token Cryptography', () => {
  it('creates unique member UUIDs and 256-bit entropy resume tokens', () => {
    const id1 = createMemberIdentity();
    const id2 = createMemberIdentity();

    expect(id1.memberId).toBeDefined();
    expect(id2.memberId).toBeDefined();
    expect(id1.memberId).not.toBe(id2.memberId);
    expect(id1.resumeToken).toHaveLength(64); // 32 bytes in hex = 64 hex chars
    expect(id1.tokenHash).toHaveLength(64); // SHA-256 in hex = 64 hex chars
  });

  it('correctly hashes and verifies resume tokens using constant-time comparison', () => {
    const { resumeToken, tokenHash } = createMemberIdentity();

    expect(verifyResumeToken(resumeToken, tokenHash)).toBe(true);
    expect(verifyResumeToken('wrong-token-abc-123', tokenHash)).toBe(false);
    expect(verifyResumeToken('', tokenHash)).toBe(false);
  });
});

describe('Room Code Generation & Normalization', () => {
  it('normalizes room codes to uppercase and trims whitespace', () => {
    expect(normalizeRoomCode('  7knp  ')).toBe('7KNP');
    expect(normalizeRoomCode('nova')).toBe('NOVA');
  });

  it('validates syntax and generates unique codes avoiding ambiguous characters', () => {
    const code = generateUniqueRoomCode(() => false);
    expect(code).toHaveLength(4);
    expect(isValidRoomCodeSyntax(code)).toBe(true);
    // Should not contain ambiguous characters 0, O, 1, I, L
    expect(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]+$/.test(code)).toBe(true);
  });
});

describe('RoomService: Creation, Joining & 4-Player Capacity', () => {
  it('creates a room with creator as Host and FLIGHT_DIRECTOR', async () => {
    const service = new RoomService(500); // 500ms grace period for tests
    const { room, session } = await service.createRoom('Commander Shepard', 'Normandy Ops');

    expect(room.code).toHaveLength(4);
    expect(room.status).toBe('LOBBY');
    expect(room.hostId).toBe(session.memberId);
    expect(room.members).toHaveLength(1);
    expect(room.members[0].name).toBe('Commander Shepard');
    expect(room.members[0].role).toBe('FLIGHT_DIRECTOR');
    expect(room.members[0].isHost).toBe(true);
    expect(session.resumeToken).toBeDefined();
  });

  it('allows players to join and enforces the 4-player capacity cap', async () => {
    const service = new RoomService(500);
    const { room } = await service.createRoom('Host Player');

    // Join 2nd, 3rd, and 4th player
    const p2 = await service.joinRoom(room.code, 'Player 2');
    const p3 = await service.joinRoom(room.code, 'Player 3');
    const p4 = await service.joinRoom(room.code, 'Player 4');

    expect(p4.room.members).toHaveLength(4);

    // 5th player must be rejected
    await expect(service.joinRoom(room.code, 'Player 5')).rejects.toMatchObject({
      code: 'ROOM_FULL'
    });
  });

  it('rejects joining with an invalid or nonexistent room code', async () => {
    const service = new RoomService(500);
    await expect(service.joinRoom('XXXX', 'Guest')).rejects.toMatchObject({
      code: 'ROOM_NOT_FOUND'
    });
  });
});

describe('RoomService: Roles, Readiness & Lobby Advancement', () => {
  it('automatically assigns available roles and rejects duplicate role assignment', async () => {
    const service = new RoomService(500);
    const { room } = await service.createRoom('Host');
    const p2 = await service.joinRoom(room.code, 'Player 2');

    // Host has FLIGHT_DIRECTOR, p2 was assigned SYSTEMS_ENGINEER
    expect(p2.session.role).toBe('SYSTEMS_ENGINEER');

    // p2 cannot take FLIGHT_DIRECTOR because Host currently has it
    expect(() =>
      service.setMemberRole(room.code, p2.session.memberId, 'FLIGHT_DIRECTOR')
    ).toThrowError();

    // p2 can switch to TRAJECTORY_SPECIALIST
    const res = service.setMemberRole(room.code, p2.session.memberId, 'TRAJECTORY_SPECIALIST');
    expect(res.updatedMember.role).toBe('TRAJECTORY_SPECIALIST');
    expect(res.updatedMember.isReady).toBe(false); // role change resets readiness
  });

  it('tracks readiness and allows host to advance lobby only when all crew members are ready', async () => {
    const service = new RoomService(500);
    const { room, session: hostSession } = await service.createRoom('Host');
    const p2 = await service.joinRoom(room.code, 'Engineer 2');

    // Initially Host is ready, p2 is not ready
    expect(isRoomAllReady(service.getRawRoom(room.code)!)).toBe(false);

    // Host cannot advance lobby yet
    expect(() => service.advanceLobby(room.code, hostSession.memberId)).toThrowError();

    // p2 marks ready
    service.setMemberReady(room.code, p2.session.memberId, true);
    expect(isRoomAllReady(service.getRawRoom(room.code)!)).toBe(true);

    // Non-host cannot advance lobby
    expect(() => service.advanceLobby(room.code, p2.session.memberId)).toThrowError();

    // Host advances lobby successfully
    const advanced = service.advanceLobby(room.code, hostSession.memberId);
    expect(advanced.room.status).toBe('MISSION_SETUP');
  });
});

describe('RoomService: Disconnect Presence, Grace Period & Reconnection', () => {
  it('allows a disconnected member to reconnect with a valid resume token', async () => {
    const service = new RoomService(5000);
    const { room, session } = await service.createRoom('Explorer 1', 'Recon', 'socket-1');

    // Simulate socket disconnect
    service.handleSocketDisconnect('socket-1');
    const disconnectedRoom = service.getRoomSnapshot(room.code)!;
    expect(disconnectedRoom.members[0].connected).toBe(false);

    // Reconnect with valid token
    const reconnected = await service.reconnectRoom(
      room.code,
      session.memberId,
      session.resumeToken,
      'socket-2'
    );

    expect(reconnected.room.members[0].connected).toBe(true);
    expect(reconnected.reconnectedMember.socketId).toBe('socket-2');
  });

  it('rejects reconnection if resume token is invalid', async () => {
    const service = new RoomService(5000);
    const { room, session } = await service.createRoom('Explorer 1');

    await expect(
      service.reconnectRoom(room.code, session.memberId, 'fake-token-00000000000000000000000000000000')
    ).rejects.toMatchObject({ code: 'INVALID_TOKEN' });
  });

  it('migrates host to remaining connected member when host intentionally leaves', async () => {
    const service = new RoomService(5000);
    const { room, session: hostSession } = await service.createRoom('Host 1');
    const p2 = await service.joinRoom(room.code, 'Engineer 2');

    let migratedNewHostId: string | null = null;
    service.leaveRoom(room.code, hostSession.memberId, (_code, newHost) => {
      migratedNewHostId = newHost.id;
    });

    const snapshot = service.getRoomSnapshot(room.code)!;
    expect(snapshot.members).toHaveLength(1);
    expect(snapshot.hostId).toBe(p2.session.memberId);
    expect(snapshot.members[0].isHost).toBe(true);
    expect(snapshot.members[0].role).toBe('FLIGHT_DIRECTOR');
    expect(migratedNewHostId).toBe(p2.session.memberId);
  });
});
