import { Socket } from 'socket.io';
import { RoomService, InternalMemberSession } from '../services/roomService';
import { normalizeRoomCode } from '../services/roomCodeService';

export interface ValidatedSocketSession {
  memberId: string;
  roomCode: string;
  member: InternalMemberSession;
}

/**
 * Authoritatively validates that a socket connection corresponds to an active,
 * connected member in the requested mission room.
 *
 * Verifies:
 * 1. Socket has an authenticated identity (socket.data.memberId, socket.data.authenticated).
 * 2. Socket is not marked stale.
 * 3. Requested room exists in the authoritative RoomService.
 * 4. Socket's associated roomCode matches the target room code.
 * 5. Member exists in the room, is connected (connected === true), and the authoritative
 *    member.socketId strictly matches this socket.id.
 *
 * If any check fails, stale sockets are deauthorized (socket.data.authenticated = false,
 * socket.data.stale = true) and null is returned.
 */
export function validateActiveSocketSession(
  socket: Socket,
  roomService: RoomService,
  targetRoomCode: string
): ValidatedSocketSession | null {
  if (!targetRoomCode) {
    return null;
  }

  // Reject explicitly stale or unauthenticated sockets
  if (socket.data?.stale || socket.data?.authenticated === false) {
    return null;
  }

  const normCode = normalizeRoomCode(targetRoomCode);
  const rawRoom = roomService.getRawRoom(normCode);
  if (!rawRoom) {
    return null;
  }

  const targetMemberId = socket.data?.memberId;
  if (!targetMemberId) {
    return null;
  }

  // Socket room code must match the target room
  if (socket.data?.roomCode && normalizeRoomCode(socket.data.roomCode) !== normCode) {
    return null;
  }

  const member = rawRoom.members.find((m) => m.id === targetMemberId);
  if (!member) {
    if (socket.data) {
      socket.data.authenticated = false;
      socket.data.stale = true;
    }
    return null;
  }

  // Crucial: Must be actively connected AND socket.id must match authoritative member.socketId
  if (!member.connected || member.socketId !== socket.id) {
    if (socket.data) {
      socket.data.authenticated = false;
      socket.data.stale = true;
    }
    return null;
  }

  // Keep socket data synchronized and marked authenticated
  socket.data = {
    ...socket.data,
    memberId: member.id,
    roomCode: normCode,
    name: member.name,
    role: member.role,
    isHost: member.isHost,
    authenticated: true,
    stale: false
  };

  return {
    memberId: member.id,
    roomCode: normCode,
    member
  };
}
