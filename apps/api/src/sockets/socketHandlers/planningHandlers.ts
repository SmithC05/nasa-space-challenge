import { Server, Socket } from 'socket.io';
import {
  GetPlanInputSchema,
  SocketResponse,
  UpdateDesignInputSchema,
  UpdateLaunchInputSchema,
  UpdateScenarioInputSchema
} from '@orbital/contracts';
import { RoomService } from '../../services/roomService';
import { validateActiveSocketSession } from '../socketAuth';

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
      const auth = validateActiveSocketSession(socket, roomService, roomCode);
      if (!auth) {
        return callback?.({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You are not authenticated or your session was resumed from another connection.'
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
      const auth = validateActiveSocketSession(socket, roomService, roomCode);
      if (!auth) {
        const errorMsg = 'You are not authenticated or your session was resumed from another connection.';
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
      const safeRoom = err.currentSnapshot || (rawPayload as any)?.roomCode ? roomService.getRoomSnapshot((rawPayload as any).roomCode) || undefined : undefined;

      socket.emit('plan:rejected', {
        code: errorCode,
        message: errorMessage,
        room: safeRoom
      });

      callback?.({
        success: false,
        error: { code: errorCode, message: errorMessage },
        data: safeRoom ? { room: safeRoom } : undefined
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
      const auth = validateActiveSocketSession(socket, roomService, roomCode);
      if (!auth) {
        const errorMsg = 'You are not authenticated or your session was resumed from another connection.';
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
      const safeRoom = err.currentSnapshot || (rawPayload as any)?.roomCode ? roomService.getRoomSnapshot((rawPayload as any).roomCode) || undefined : undefined;

      socket.emit('plan:rejected', {
        code: errorCode,
        message: errorMessage,
        room: safeRoom
      });

      callback?.({
        success: false,
        error: { code: errorCode, message: errorMessage },
        data: safeRoom ? { room: safeRoom } : undefined
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
      const auth = validateActiveSocketSession(socket, roomService, roomCode);
      if (!auth) {
        const errorMsg = 'You are not authenticated or your session was resumed from another connection.';
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
      const safeRoom = err.currentSnapshot || (rawPayload as any)?.roomCode ? roomService.getRoomSnapshot((rawPayload as any).roomCode) || undefined : undefined;

      socket.emit('plan:rejected', {
        code: errorCode,
        message: errorMessage,
        room: safeRoom
      });

      callback?.({
        success: false,
        error: { code: errorCode, message: errorMessage },
        data: safeRoom ? { room: safeRoom } : undefined
      });
    }
  });
}
