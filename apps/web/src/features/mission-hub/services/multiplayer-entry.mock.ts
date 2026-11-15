import { MissionRoom } from '@orbital/contracts';
import {
  CreateRoomRequest,
  JoinRoomRequest,
  MultiplayerEntryService,
  RoomOperationResult
} from '../types/multiplayer-entry.types';

/**
 * Mock Multiplayer Adapter
 * Demonstrates room creation and joining locally when live Socket.IO backend is unreachable.
 * Explicitly flags result with isMock: true so UI indicates demo mode clearly.
 */
export class MockMultiplayerService implements MultiplayerEntryService {
  private mockRooms: Map<string, MissionRoom> = new Map();

  isLiveConnection(): boolean {
    return false;
  }

  async createMissionRoom(req: CreateRoomRequest): Promise<RoomOperationResult> {
    await new Promise((r) => setTimeout(r, 600)); // Simulate network latency

    const generatedCode = `SIM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const hostId = `mock-host-${Date.now()}`;

    const newRoom: MissionRoom = {
      code: generatedCode,
      name: req.roomName || 'Orbital Mission Squad',
      hostId,
      scenarioId: req.scenarioId,
      design: null,
      launchConfig: null,
      members: [
        {
          id: hostId,
          name: req.hostName || 'Flight Director',
          role: req.role,
          isHost: true,
          isReady: false,
          joinedAt: new Date().toISOString()
        }
      ],
      status: 'LOBBY',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.mockRooms.set(generatedCode, newRoom);

    return {
      success: true,
      room: newRoom,
      memberId: hostId,
      isMock: true
    };
  }

  async joinMissionRoom(req: JoinRoomRequest): Promise<RoomOperationResult> {
    await new Promise((r) => setTimeout(r, 600));

    const cleanCode = req.roomCode.trim().toUpperCase();

    // Check if code is invalid format
    if (!cleanCode || cleanCode.length < 3) {
      return {
        success: false,
        error: 'Invalid mission room code format. Please verify with your crew host.',
        isMock: true
      };
    }

    // Check if room exists in local mock or generate an accessible simulated mock room
    let room = this.mockRooms.get(cleanCode);
    if (!room) {
      // Auto-create a simulated existing room so testers can experience joining any valid code in demo mode!
      const simulatedHostId = `sim-host-999`;
      room = {
        code: cleanCode,
        name: `Squadron ${cleanCode}`,
        hostId: simulatedHostId,
        scenarioId: 'scenario-earth-sentinel',
        design: null,
        launchConfig: null,
        members: [
          {
            id: simulatedHostId,
            name: 'Commander Shepard',
            role: 'FLIGHT_DIRECTOR',
            isHost: true,
            isReady: true,
            joinedAt: new Date(Date.now() - 60000).toISOString()
          }
        ],
        status: 'LOBBY',
        createdAt: new Date(Date.now() - 60000).toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.mockRooms.set(cleanCode, room);
    }

    // Check room capacity limit (max 4 players)
    if (room.members.length >= 4) {
      return {
        success: false,
        error: 'Mission room is at maximum capacity (4/4 specialists already deployed).',
        isMock: true
      };
    }

    const newMemberId = `mock-member-${Date.now()}`;
    room.members.push({
      id: newMemberId,
      name: req.name || 'Specialist',
      role: req.role,
      isHost: false,
      isReady: false,
      joinedAt: new Date().toISOString()
    });

    return {
      success: true,
      room,
      memberId: newMemberId,
      isMock: true
    };
  }
}

