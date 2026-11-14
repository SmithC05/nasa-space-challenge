import { Server, Socket } from 'socket.io';
import {
  GetPlanInputSchema,
  SocketResponse,
  UpdateDesignInputSchema,
  UpdateLaunchInputSchema,
  UpdateScenarioInputSchema
} from '@orbital/contracts';
import { RoomService } from '../../services/roomService';
import { normalizeRoomCode } from '../../services/roomCodeService';

/**
 * Resolves the authenticated member ID and room code for a socket connection.
 */
function resolveSocketMember(socket: Socket, roomService: RoomService, targetRoomCode: string): {
  memberId: string;
  roomCode: string;
} | null {
  const normCode = normalizeRoomCode(targetRoomCode);

  // Check socket session data
  if (socket.data?.authenticated && socket.data.memberId && normalizeRoomCode(socket.data.roomCode) === normCode) {
    return {
      memberId: socket.data.memberId,
      roomCode: normCode
    };
  }

  // Fallback: look up member by socket.id in room
  const rawRoom = roomService.getRawRoom(normCode);
  if (rawRoom) {
    const member = rawRoom.members.find((m) => m.socketId === socket.id && m.connected);
    if (member) {
      socket.data = {
        memberId: member.id,
        roomCode: normCode,
        name: member.name,
        role: member.role,
        isHost: member.isHost,
        authenticated: true
      };
      return {
        memberId: member.id,
        roomCode: normCode
      };
    }
  }

  return null;
}

export function registerPlanningHandlers(io: Server, socket: Socket, roomService: RoomService) {
  // ----------------------------------------------------
  // 1. GET MISSION PLANNING SNAPSHOT
  // ----------------------------------------------------
  socket.on('plan:get', (rawPayload: unknown, callback?: (res: SocketResponse) => void) => {
    try {
      const parsed = GetPlanInputSchema.safeParse(rawPayload);
      if (!parsed.success) {
        return callback?.({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Invalid plan request payload'
          }
        });
      }

      const { roomCode } = parsed.data;
      const auth = resolveSocketMember(socket, roomService, roomCode);
      if (!auth) {
        return callback?.({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You are not authenticated in this mission room.'
          }
        });
      }

      const room = roomService.getPlanningSnapshot(roomCode, auth.memberId);
      callback?.({
        success: true,
        data: { room }
      });
    } catch (err: any) {
      callback?.({
        success: false,
        error: {
          code: err.code || 'INTERNAL_ERROR',
          message: err.message || 'Failed to fetch mission planning snapshot'
        }
      });
    }
  });

  // ----------------------------------------------------
  // 2. SELECT MISSION SCENARIO
  // ----------------------------------------------------
  socket.on('scenario:select', async (rawPayload: unknown, callback?: (res: SocketResponse) => void) => {
    try {
      const parsed = UpdateScenarioInputSchema.safeParse(rawPayload);
      if (!parsed.success) {
        const errorMsg = parsed.error.issues[0]?.message || 'Invalid scenario update payload';
        socket.emit('plan:rejected', { code: 'VALIDATION_ERROR', message: errorMsg });
        return callback?.({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: errorMsg }
        });
      }

      const { roomCode, scenarioId, baseRevision, requestId } = parsed.data;
      const auth = resolveSocketMember(socket, roomService, roomCode);
      if (!auth) {
        const errorMsg = 'You are not authenticated in this mission room.';
        socket.emit('plan:rejected', { code: 'UNAUTHORIZED', message: errorMsg });
        return callback?.({
          success: false,
          error: { code: 'UNAUTHORIZED', message: errorMsg }
        });
      }

      const { room, isMaterialChange } = await roomService.updateScenario(
        roomCode,
        auth.memberId,
        scenarioId,
        baseRevision,
        requestId
      );

      callback?.({
        success: true,
        data: { room }
      });

      // Broadcast authoritative state to all room participants on material change
      if (isMaterialChange) {
        io.to(room.code).emit('room:updated', room);
      }
    } catch (err: any) {
      const errorCode = err.code || 'INTERNAL_ERROR';
      const errorMessage = err.message || 'Failed to update scenario';

      socket.emit('plan:rejected', {
        code: errorCode,
        message: errorMessage,
        room: err.currentSnapshot
      });

      callback?.({
        success: false,
        error: { code: errorCode, message: errorMessage },
        data: err.currentSnapshot ? { room: err.currentSnapshot } : undefined
      });
    }
  });

  // ----------------------------------------------------
  // 3. UPDATE SPACECRAFT DESIGN
  // ----------------------------------------------------
  socket.on('design:update', async (rawPayload: unknown, callback?: (res: SocketResponse) => void) => {
    try {
      const parsed = UpdateDesignInputSchema.safeParse(rawPayload);
      if (!parsed.success) {
        const errorMsg = parsed.error.issues[0]?.message || 'Invalid design update payload';
        socket.emit('plan:rejected', { code: 'VALIDATION_ERROR', message: errorMsg });
        return callback?.({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: errorMsg }
        });
      }

      const { roomCode, design, baseRevision, requestId } = parsed.data;
      const auth = resolveSocketMember(socket, roomService, roomCode);
      if (!auth) {
        const errorMsg = 'You are not authenticated in this mission room.';
        socket.emit('plan:rejected', { code: 'UNAUTHORIZED', message: errorMsg });
        return callback?.({
          success: false,
          error: { code: 'UNAUTHORIZED', message: errorMsg }
        });
      }

      const { room, isMaterialChange } = await roomService.updateDesign(
        roomCode,
        auth.memberId,
        {
          name: design.name,
          busId: design.busId,
          selectedComponentIds: design.selectedComponentIds
        },
        baseRevision,
        requestId
      );

      callback?.({
        success: true,
        data: { room }
      });

      if (isMaterialChange) {
        io.to(room.code).emit('room:updated', room);
      }
    } catch (err: any) {
      const errorCode = err.code || 'INTERNAL_ERROR';
      const errorMessage = err.message || 'Failed to update spacecraft design';

      socket.emit('plan:rejected', {
        code: errorCode,
        message: errorMessage,
        room: err.currentSnapshot
      });

      callback?.({
        success: false,
        error: { code: errorCode, message: errorMessage },
        data: err.currentSnapshot ? { room: err.currentSnapshot } : undefined
      });
    }
  });

  // ----------------------------------------------------
  // 4. UPDATE LAUNCH CONFIGURATION
  // ----------------------------------------------------
  socket.on('launch:configure', async (rawPayload: unknown, callback?: (res: SocketResponse) => void) => {
    try {
      const parsed = UpdateLaunchInputSchema.safeParse(rawPayload);
      if (!parsed.success) {
        const errorMsg = parsed.error.issues[0]?.message || 'Invalid launch update payload';
        socket.emit('plan:rejected', { code: 'VALIDATION_ERROR', message: errorMsg });
        return callback?.({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: errorMsg }
        });
      }

      const { roomCode, launchConfig, baseRevision, requestId } = parsed.data;
      const auth = resolveSocketMember(socket, roomService, roomCode);
      if (!auth) {
        const errorMsg = 'You are not authenticated in this mission room.';
        socket.emit('plan:rejected', { code: 'UNAUTHORIZED', message: errorMsg });
        return callback?.({
          success: false,
          error: { code: 'UNAUTHORIZED', message: errorMsg }
        });
      }

      const { room, isMaterialChange } = await roomService.updateLaunchConfig(
        roomCode,
        auth.memberId,
        {
          vehicleId: launchConfig.vehicleId,
          orbitId: launchConfig.orbitId,
          launchSite: launchConfig.launchSite
        },
        baseRevision,
        requestId
      );

      callback?.({
        success: true,
        data: { room }
      });

      if (isMaterialChange) {
        io.to(room.code).emit('room:updated', room);
      }
    } catch (err: any) {
      const errorCode = err.code || 'INTERNAL_ERROR';
      const errorMessage = err.message || 'Failed to update launch configuration';

      socket.emit('plan:rejected', {
        code: errorCode,
        message: errorMessage,
        room: err.currentSnapshot
      });

      callback?.({
        success: false,
        error: { code: errorCode, message: errorMessage },
        data: err.currentSnapshot ? { room: err.currentSnapshot } : undefined
      });
    }
  });
}
