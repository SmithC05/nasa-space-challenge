import { getSocket, createRoom, joinRoom, selectScenarioSocket } from '../../../services/socket';
import {
  CreateRoomRequest,
  JoinRoomRequest,
  MultiplayerEntryService,
  RoomOperationResult
} from '../types/multiplayer-entry.types';
import { MockMultiplayerService } from './multiplayer-entry.mock';

export class LiveMultiplayerAdapter implements MultiplayerEntryService {
  private mockFallback = new MockMultiplayerService();

  isLiveConnection(): boolean {
    const socket = getSocket();
    return Boolean(socket && socket.connected);
  }

  async createMissionRoom(req: CreateRoomRequest): Promise<RoomOperationResult> {
    const socket = getSocket();

    // If socket is not connected to a live backend, use clean mock demonstration
    if (!socket || !socket.connected) {
      return this.mockFallback.createMissionRoom(req);
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        // Fallback to mock on timeout
        this.mockFallback.createMissionRoom(req).then(resolve);
      }, 3000);

      try {
        createRoom(req.hostName, req.roomName, (res) => {
          clearTimeout(timeout);
          if (res.success && res.room) {
            // Associate selected scenario with the new room
            if (req.scenarioId) {
              selectScenarioSocket(res.room.code, req.scenarioId);
            }
            resolve({
              success: true,
              room: res.room,
              memberId: res.memberId,
              isMock: false
            });
          } else {
            resolve({
              success: false,
              error: res.error || 'Failed to establish live mission room.',
              isMock: false
            });
          }
        });
      } catch (err) {
        clearTimeout(timeout);
        this.mockFallback.createMissionRoom(req).then(resolve);
      }
    });
  }

  async joinMissionRoom(req: JoinRoomRequest): Promise<RoomOperationResult> {
    const socket = getSocket();

    if (!socket || !socket.connected) {
      return this.mockFallback.joinMissionRoom(req);
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.mockFallback.joinMissionRoom(req).then(resolve);
      }, 3000);

      try {
        joinRoom(req.roomCode, req.name, req.role, (res) => {
          clearTimeout(timeout);
          if (res.success && res.room) {
            resolve({
              success: true,
              room: res.room,
              memberId: res.memberId,
              isMock: false
            });
          } else {
            resolve({
              success: false,
              error: res.error || 'Mission room not found or connection rejected.',
              isMock: false
            });
          }
        });
      } catch (err) {
        clearTimeout(timeout);
        this.mockFallback.joinMissionRoom(req).then(resolve);
      }
    });
  }
}

// Singleton adapter instance
export const multiplayerEntryService = new LiveMultiplayerAdapter();

