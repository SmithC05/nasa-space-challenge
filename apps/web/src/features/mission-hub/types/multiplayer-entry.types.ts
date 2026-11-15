import { EngineerRole, MissionRoom } from '@orbital/contracts';

export type GamePlayMode = 'single' | 'multiplayer';

export type MultiplayerSubView = 'options' | 'create' | 'join';

export interface CreateRoomRequest {
  hostName: string;
  roomName: string;
  role: EngineerRole;
  scenarioId: string;
}

export interface JoinRoomRequest {
  roomCode: string;
  name: string;
  role: EngineerRole;
}

export interface RoomOperationResult {
  success: boolean;
  room?: MissionRoom;
  memberId?: string;
  error?: string;
  isMock: boolean;
}

export interface MultiplayerEntryService {
  createMissionRoom: (req: CreateRoomRequest) => Promise<RoomOperationResult>;
  joinMissionRoom: (req: JoinRoomRequest) => Promise<RoomOperationResult>;
  isLiveConnection: () => boolean;
}

