import { Server, Socket } from 'socket.io';
import {
  AdvanceLobbyInputSchema,
  RoomCreateInputSchema,
  RoomJoinInputSchema,
  RoomLeaveInputSchema,
  RoomReconnectInputSchema,
  SetReadyInputSchema,
  SetRoleInputSchema,
  SocketResponse
} from '@orbital/contracts';
import { RoomService } from '../../services/roomService';
import { validateActiveSocketSession } from '../socketAuth';

export function registerRoomHandlers(io: Server, socket: Socket, roomService: RoomService) {
  // ----------------------------------------------------
  // 1. ROOM CREATE
  // ----------------------------------------------------
  socket.on('room:create', async (rawPayload: unknown, callback?: (res: SocketResponse) => void) => {
    try {
      const parsed = RoomCreateInputSchema.safeParse(rawPayload);
      if (!parsed.success) {
        return callback?.({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Invalid room creation payload'
          }
        });
      }

      const { hostName, roomName } = parsed.data;
      const { room, session } = await roomService.createRoom(hostName, roomName, socket.id);

      // Authenticate socket session
      socket.data = {
        memberId: session.memberId,
        roomCode: room.code,
        name: session.name,
        role: session.role,
        isHost: true,
        authenticated: true,
        stale: false
      };

      socket.join(room.code);

      callback?.({
        success: true,
        data: { room, session }
      });

      io.to(room.code).emit('room:updated', room);
    } catch (err: any) {
      callback?.({
        success: false,
        error: {
          code: err.code || 'INTERNAL_ERROR',
          message: err.message || 'Failed to create mission room'
        }
      });
    }
  });

  // ----------------------------------------------------
  // 2. ROOM JOIN
  // ----------------------------------------------------
  socket.on('room:join', async (rawPayload: unknown, callback?: (res: SocketResponse) => void) => {
    try {
      const parsed = RoomJoinInputSchema.safeParse(rawPayload);
      if (!parsed.success) {
        return callback?.({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Invalid join payload'
          }
        });
      }

      const { roomCode, name, role } = parsed.data;
      const { room, session } = await roomService.joinRoom(roomCode, name, role, socket.id);

      // Authenticate socket session
      socket.data = {
        memberId: session.memberId,
        roomCode: room.code,
        name: session.name,
        role: session.role,
        isHost: session.isHost,
        authenticated: true,
        stale: false
      };

      socket.join(room.code);

      callback?.({
        success: true,
        data: { room, session }
      });

      // Broadcast room update to all members
      io.to(room.code).emit('room:updated', room);
      io.to(room.code).emit('room:presence', {
        memberId: session.memberId,
        name: session.name,
        connected: true,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      callback?.({
        success: false,
        error: {
          code: err.code || 'JOIN_FAILED',
          message: err.message || 'Failed to join mission room'
        }
      });
    }
  });

  // ----------------------------------------------------
  // 3. ROOM RECONNECT (Resuming Session)
  // ----------------------------------------------------
  socket.on('room:reconnect', async (rawPayload: unknown, callback?: (res: SocketResponse) => void) => {
    try {
      const parsed = RoomReconnectInputSchema.safeParse(rawPayload);
      if (!parsed.success) {
        return callback?.({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Invalid reconnection payload'
          }
        });
      }

      const { roomCode, memberId, resumeToken } = parsed.data;

      // Identify the previous socket ID before reconnecting
      const rawRoom = roomService.getRawRoom(roomCode);
      const existingMember = rawRoom?.members.find((m) => m.id === memberId);
      const previousSocketId = existingMember?.socketId;

      const { room, session, reconnectedMember } = await roomService.reconnectRoom(
        roomCode,
        memberId,
        resumeToken,
        socket.id
      );

      // Authorize new socket
      socket.data = {
        memberId: session.memberId,
        roomCode: room.code,
        name: session.name,
        role: session.role,
        isHost: session.isHost,
        authenticated: true,
        stale: false
      };

      socket.join(room.code);

      // Revoke previous socket immediately if different
      if (previousSocketId && previousSocketId !== socket.id) {
        const prevSocket = io.sockets.sockets.get(previousSocketId);
        if (prevSocket) {
          if (prevSocket.data) {
            prevSocket.data.authenticated = false;
            prevSocket.data.stale = true;
          }
          prevSocket.leave(room.code);
          prevSocket.disconnect(true);
        }
      }

      callback?.({
        success: true,
        data: { room, session }
      });

      // Notify other members of re-established presence
      io.to(room.code).emit('room:updated', room);
      io.to(room.code).emit('room:presence', {
        memberId: reconnectedMember.id,
        name: reconnectedMember.name,
        connected: true,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      callback?.({
        success: false,
        error: {
          code: err.code || 'RECONNECT_FAILED',
          message: err.message || 'Failed to resume session'
        }
      });
    }
  });

  // ----------------------------------------------------
  // 4. SET ROLE
  // ----------------------------------------------------
  socket.on('room:setRole', (rawPayload: unknown, callback?: (res: SocketResponse) => void) => {
    try {
      const parsed = SetRoleInputSchema.safeParse(rawPayload);
      if (!parsed.success) {
        return callback?.({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Invalid role payload'
          }
        });
      }

      const { roomCode, role } = parsed.data;
      const session = validateActiveSocketSession(socket, roomService, roomCode);

      if (!session) {
        return callback?.({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You are not authenticated or your session was resumed from another connection.'
          }
        });
      }

      const { room } = roomService.setMemberRole(session.roomCode, session.memberId, role);
      socket.data.role = role;

      callback?.({ success: true, data: { room } });
      io.to(room.code).emit('room:updated', room);
    } catch (err: any) {
      callback?.({
        success: false,
        error: {
          code: err.code || 'SET_ROLE_FAILED',
          message: err.message || 'Failed to update engineering role'
        }
      });
    }
  });

  // ----------------------------------------------------
  // 5. SET READY
  // ----------------------------------------------------
  socket.on('room:setReady', (rawPayload: unknown, callback?: (res: SocketResponse) => void) => {
    try {
      const parsed = SetReadyInputSchema.safeParse(rawPayload);
      if (!parsed.success) {
        return callback?.({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Invalid readiness payload'
          }
        });
      }

      const { roomCode, isReady } = parsed.data;
      const session = validateActiveSocketSession(socket, roomService, roomCode);

      if (!session) {
        return callback?.({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You are not authenticated or your session was resumed from another connection.'
          }
        });
      }

      const { room, allReady } = roomService.setMemberReady(session.roomCode, session.memberId, isReady);

      callback?.({ success: true, data: { room, allReady } });
      io.to(room.code).emit('room:updated', room);
    } catch (err: any) {
      callback?.({
        success: false,
        error: {
          code: err.code || 'SET_READY_FAILED',
          message: err.message || 'Failed to update readiness status'
        }
      });
    }
  });

  // ----------------------------------------------------
  // 6. ADVANCE LOBBY TO MISSION_SETUP (Host Only)
  // ----------------------------------------------------
  socket.on('room:advanceLobby', (rawPayload: unknown, callback?: (res: SocketResponse) => void) => {
    try {
      const parsed = AdvanceLobbyInputSchema.safeParse(rawPayload);
      if (!parsed.success) {
        return callback?.({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Invalid advance payload'
          }
        });
      }

      const { roomCode } = parsed.data;
      const session = validateActiveSocketSession(socket, roomService, roomCode);

      if (!session) {
        return callback?.({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You are not authenticated or your session was resumed from another connection.'
          }
        });
      }

      const { room } = roomService.advanceLobby(session.roomCode, session.memberId);

      callback?.({ success: true, data: { room } });
      io.to(room.code).emit('room:updated', room);
    } catch (err: any) {
      callback?.({
        success: false,
        error: {
          code: err.code || 'FORBIDDEN',
          message: err.message || 'Failed to advance lobby'
        }
      });
    }
  });

  // ----------------------------------------------------
  // 7. LEAVE ROOM
  // ----------------------------------------------------
  socket.on('room:leave', (rawPayload: unknown, callback?: (res: SocketResponse) => void) => {
    try {
      const parsed = RoomLeaveInputSchema.safeParse(rawPayload);
      if (!parsed.success) {
        return callback?.({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid payload' }
        });
      }

      const { roomCode } = parsed.data;
      const session = validateActiveSocketSession(socket, roomService, roomCode);

      if (!session) {
        return callback?.({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You are not authenticated or your session was resumed from another connection.'
          }
        });
      }

      const { room, isClosed } = roomService.leaveRoom(
        session.roomCode,
        session.memberId,
        (code, newHost, prevHostId) => {
          io.to(code).emit('room:hostChanged', {
            previousHostId: prevHostId,
            newHostId: newHost.id,
            newHostName: newHost.name
          });
        }
      );

      socket.leave(session.roomCode);
      socket.data = { authenticated: false, stale: true };

      callback?.({ success: true, data: { message: 'Left room successfully' } });

      if (room && !isClosed) {
        io.to(room.code).emit('room:updated', room);
      }
    } catch (err: any) {
      callback?.({
        success: false,
        error: { code: 'LEAVE_FAILED', message: err.message || 'Failed to leave room' }
      });
    }
  });

  // ----------------------------------------------------
  // 8. DISCONNECT Preserving Grace Period
  // ----------------------------------------------------
  socket.on('disconnect', () => {
    // If this socket was marked stale, or is no longer the active socket for its member,
    // do not trigger disconnect grace period or presence broadcasts.
    if (socket.data?.stale) {
      return;
    }

    const roomCode = socket.data?.roomCode;
    const memberId = socket.data?.memberId;

    if (roomCode && memberId) {
      const rawRoom = roomService.getRawRoom(roomCode);
      const member = rawRoom?.members.find((m) => m.id === memberId);
      if (member && member.socketId !== socket.id) {
        return;
      }
    }

    const disconnectRes = roomService.handleSocketDisconnect(
      socket.id,
      (code, newHost, prevHostId) => {
        io.to(code).emit('room:hostChanged', {
          previousHostId: prevHostId,
          newHostId: newHost.id,
          newHostName: newHost.name
        });
      },
      (code, room) => {
        io.to(code).emit('room:updated', room);
      },
      (code) => {
        io.to(code).emit('error:notification', `Mission Room [${code}] closed due to inactivity.`);
      }
    );

    // Only broadcast presence change if this socket was the authoritative member session
    if (disconnectRes && roomCode && memberId) {
      const name = socket.data?.name || disconnectRes.member.name;
      io.to(roomCode).emit('room:presence', {
        memberId,
        name: name || 'Engineer',
        connected: false,
        timestamp: new Date().toISOString()
      });

      const snapshot = roomService.getRoomSnapshot(roomCode);
      if (snapshot) {
        io.to(roomCode).emit('room:updated', snapshot);
      }
    }
  });
}
