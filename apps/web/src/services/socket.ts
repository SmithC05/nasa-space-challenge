import { io, Socket } from 'socket.io-client';
import {
  EngineerRole,
  LaunchConfiguration,
  MissionEvent,
  MissionReport,
  MissionRoom,
  MissionSimulationState,
  SpacecraftDesign
} from '@orbital/contracts';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('🛰️ Connected to ORBITAL Mission Socket:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('📡 Disconnected from Mission Socket');
    });
  }
  return socket;
}

export function createRoom(
  hostName: string,
  roomName: string,
  callback: (res: { success: boolean; room?: MissionRoom; memberId?: string; error?: string }) => void
) {
  const s = getSocket();
  s.emit('room:create', { hostName, roomName }, callback);
}

export function joinRoom(
  roomCode: string,
  name: string,
  role: EngineerRole | undefined,
  callback: (res: { success: boolean; room?: MissionRoom; memberId?: string; error?: string }) => void
) {
  const s = getSocket();
  s.emit('room:join', { roomCode, name, role }, callback);
}

export function setMemberRole(roomCode: string, memberId: string, role: EngineerRole) {
  getSocket().emit('room:setRole', { roomCode, memberId, role });
}

export function setMemberReady(roomCode: string, memberId: string, isReady: boolean) {
  getSocket().emit('room:setReady', { roomCode, memberId, isReady });
}

export function selectScenarioSocket(roomCode: string, scenarioId: string) {
  getSocket().emit('scenario:select', { roomCode, scenarioId });
}

export function updateDesignSocket(roomCode: string, design: SpacecraftDesign) {
  getSocket().emit('design:update', { roomCode, design });
}

export function configureLaunchSocket(roomCode: string, launchConfig: LaunchConfiguration) {
  getSocket().emit('launch:configure', { roomCode, launchConfig });
}

export function startLaunchSocket(roomCode: string) {
  getSocket().emit('mission:startLaunch', { roomCode });
}

export function submitEventChoiceSocket(roomCode: string, eventId: string, choiceId: string) {
  getSocket().emit('mission:eventChoice', { roomCode, eventId, choiceId });
}

export function setSpeedSocket(roomCode: string, speedMultiplier: number) {
  getSocket().emit('mission:setSpeed', { roomCode, speedMultiplier });
}

export function togglePauseSocket(roomCode: string) {
  getSocket().emit('mission:togglePause', { roomCode });
}

export function sendChatMessage(roomCode: string, sender: string, role: EngineerRole, message: string) {
  getSocket().emit('chat:send', { roomCode, sender, role, message });
}
