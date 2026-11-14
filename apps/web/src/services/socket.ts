import { io, Socket } from 'socket.io-client';
import {
  EngineerRole,
  LaunchConfiguration,
  MissionEvent,
  MissionReport,
  MissionRoom,
  MissionSimulationState,
  ParticipantSession,
  SocketResponse,
  SpacecraftDesign
} from '@orbital/contracts';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;

// Session storage helpers
const SESSION_PREFIX = 'orbital_session_';

export function saveSessionToStorage(session: ParticipantSession) {
  try {
    sessionStorage.setItem(`${SESSION_PREFIX}${session.roomCode}`, JSON.stringify(session));
    sessionStorage.setItem('orbital_last_room', session.roomCode);
  } catch (err) {
    // ignore
  }
}

export function getSessionFromStorage(roomCode: string): ParticipantSession | null {
  try {
    const raw = sessionStorage.getItem(`${SESSION_PREFIX}${roomCode.toUpperCase()}`);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function getLastSessionFromStorage(): ParticipantSession | null {
  try {
    const lastCode = sessionStorage.getItem('orbital_last_room');
    if (!lastCode) return null;
    return getSessionFromStorage(lastCode);
  } catch (err) {
    return null;
  }
}

export function clearSessionFromStorage(roomCode: string) {
  try {
    sessionStorage.removeItem(`${SESSION_PREFIX}${roomCode.toUpperCase()}`);
    if (sessionStorage.getItem('orbital_last_room') === roomCode.toUpperCase()) {
      sessionStorage.removeItem('orbital_last_room');
    }
  } catch (err) {
    // ignore
  }
}

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

      // Attempt automatic reconnection if a session was stored
      const lastSession = getLastSessionFromStorage();
      if (lastSession) {
        reconnectRoom(
          lastSession.roomCode,
          lastSession.memberId,
          lastSession.resumeToken,
          (res) => {
            if (res.success && res.data) {
              console.log('🔄 Successfully resumed mission session:', lastSession.roomCode);
            } else {
              console.warn('Session resume attempt expired or rejected:', res.error?.message);
              clearSessionFromStorage(lastSession.roomCode);
            }
          }
        );
      }
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
  callback: (res: SocketResponse<{ room: MissionRoom; session: ParticipantSession }>) => void
) {
  const s = getSocket();
  s.emit('room:create', { hostName, roomName }, (res: SocketResponse<{ room: MissionRoom; session: ParticipantSession }>) => {
    if (res.success && res.data?.session) {
      saveSessionToStorage(res.data.session);
    }
    callback(res);
  });
}

export function joinRoom(
  roomCode: string,
  name: string,
  role: EngineerRole | undefined,
  callback: (res: SocketResponse<{ room: MissionRoom; session: ParticipantSession }>) => void
) {
  const s = getSocket();
  s.emit('room:join', { roomCode, name, role }, (res: SocketResponse<{ room: MissionRoom; session: ParticipantSession }>) => {
    if (res.success && res.data?.session) {
      saveSessionToStorage(res.data.session);
    }
    callback(res);
  });
}

export function reconnectRoom(
  roomCode: string,
  memberId: string,
  resumeToken: string,
  callback: (res: SocketResponse<{ room: MissionRoom; session: ParticipantSession }>) => void
) {
  const s = getSocket();
  s.emit('room:reconnect', { roomCode, memberId, resumeToken }, (res: SocketResponse<{ room: MissionRoom; session: ParticipantSession }>) => {
    if (res.success && res.data?.session) {
      saveSessionToStorage(res.data.session);
    }
    callback(res);
  });
}

export function setMemberRole(
  roomCode: string,
  role: EngineerRole,
  callback?: (res: SocketResponse<{ room: MissionRoom }>) => void
) {
  getSocket().emit('room:setRole', { roomCode, role }, callback);
}

export function setMemberReady(
  roomCode: string,
  isReady: boolean,
  callback?: (res: SocketResponse<{ room: MissionRoom; allReady: boolean }>) => void
) {
  getSocket().emit('room:setReady', { roomCode, isReady }, callback);
}

export function advanceLobbySocket(
  roomCode: string,
  callback?: (res: SocketResponse<{ room: MissionRoom }>) => void
) {
  getSocket().emit('room:advanceLobby', { roomCode }, callback);
}

export function leaveRoomSocket(
  roomCode: string,
  callback?: (res: SocketResponse<{ message: string }>) => void
) {
  clearSessionFromStorage(roomCode);
  getSocket().emit('room:leave', { roomCode }, callback);
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
