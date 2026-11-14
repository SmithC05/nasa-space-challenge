import { EngineerRole } from '@orbital/contracts';

export interface RoomMemberPresence {
  id: string;
  name: string;
  role: EngineerRole;
  isReady: boolean;
  isHost: boolean;
  connected: boolean;
}

export interface RoomPermissionContext {
  code: string;
  hostId: string;
  status: string;
  members: RoomMemberPresence[];
}

export const ALL_ENGINEER_ROLES: EngineerRole[] = [
  'FLIGHT_DIRECTOR',
  'SYSTEMS_ENGINEER',
  'TRAJECTORY_SPECIALIST',
  'SCIENCE_LEAD'
];

/**
 * Checks if the given member ID matches the current room host.
 */
export function isRoomHost(room: RoomPermissionContext, memberId: string): boolean {
  if (!room || !memberId) return false;
  return room.hostId === memberId;
}

/**
 * Verifies if a member is allowed to change a role.
 * A member may only change their own role; only host can reassign roles during migration.
 */
export function canChangeRole(
  room: RoomPermissionContext,
  requestingMemberId: string,
  targetMemberId: string
): boolean {
  if (!room || !requestingMemberId) return false;
  if (room.status !== 'LOBBY' && room.status !== 'MISSION_SETUP') return false;
  return requestingMemberId === targetMemberId;
}

/**
 * Checks whether an engineering role is available (unassigned among connected members).
 */
export function isRoleAvailable(
  room: RoomPermissionContext,
  role: EngineerRole,
  currentMemberId: string
): boolean {
  if (!room || !role) return false;
  return !room.members.some(
    (m) => m.id !== currentMemberId && m.connected && m.role === role
  );
}

/**
 * Automatically picks the next available unique engineering role.
 */
export function getNextAvailableRole(
  room: RoomPermissionContext,
  preferredRole?: EngineerRole
): EngineerRole {
  const activeRoles = new Set(
    room.members.filter((m) => m.connected).map((m) => m.role)
  );

  if (preferredRole && !activeRoles.has(preferredRole)) {
    return preferredRole;
  }

  for (const role of ALL_ENGINEER_ROLES) {
    if (!activeRoles.has(role)) {
      return role;
    }
  }

  // Fallback if all 4 roles assigned
  return 'SYSTEMS_ENGINEER';
}

/**
 * Verifies if a member is authorized to modify readiness.
 * A member can only modify their own readiness.
 */
export function canChangeReadyState(
  room: RoomPermissionContext,
  requestingMemberId: string,
  targetMemberId: string
): boolean {
  if (!room || !requestingMemberId) return false;
  if (room.status !== 'LOBBY') return false;
  return requestingMemberId === targetMemberId;
}

/**
 * Calculates whether all currently connected members in the room are marked ready.
 * At least 1 connected participant must exist.
 */
export function isRoomAllReady(room: RoomPermissionContext): boolean {
  if (!room || room.members.length === 0) return false;
  const connectedMembers = room.members.filter((m) => m.connected);
  if (connectedMembers.length === 0) return false;
  return connectedMembers.every((m) => m.isReady);
}

/**
 * Validates whether the room host is authorized to advance the lobby to MISSION_SETUP.
 */
export function canAdvanceLobby(
  room: RoomPermissionContext,
  requestingMemberId: string
): { allowed: boolean; reason?: string } {
  if (!isRoomHost(room, requestingMemberId)) {
    return { allowed: false, reason: 'Only the Flight Director (Host) can advance the lobby.' };
  }

  if (room.status !== 'LOBBY') {
    return { allowed: false, reason: `Room is in status '${room.status}', cannot advance from lobby.` };
  }

  if (!isRoomAllReady(room)) {
    return { allowed: false, reason: 'All active flight crew members must be marked READY before proceeding.' };
  }

  return { allowed: true };
}
