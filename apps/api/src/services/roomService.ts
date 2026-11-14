import {
  EngineerRole,
  LaunchConfiguration,
  MissionRoom,
  ParticipantSession,
  RoomStatus,
  SpacecraftDesign,
  TeamMember
} from '@orbital/contracts';
import {
  createMemberIdentity,
  formatParticipantSession,
  verifyResumeToken
} from './identityService';
import { generateUniqueRoomCode, normalizeRoomCode } from './roomCodeService';
import {
  canAdvanceLobby,
  canChangeReadyState,
  canChangeRole,
  canPerformPlanningAction,
  getNextAvailableRole,
  isRoleAvailable,
  isRoomAllReady
} from './permissionService';
import {
  DEFAULT_INITIAL_COMPONENT_IDS,
  buildAuthoritativeDesign,
  buildAuthoritativeLaunchConfig,
  isDesignMaterialChange,
  isLaunchMaterialChange,
  resolveLaunchVehicle,
  resolveOrbit,
  resolveScenario
} from './planningService';
import { SPACECRAFT_COMPONENTS } from '@orbital/game-data';
import { getDatabase, missionRoomsTable, teamMembersTable } from '@orbital/database';
import { eq } from 'drizzle-orm';

export interface InternalMemberSession {
  id: string; // UUID
  name: string;
  role: EngineerRole;
  isReady: boolean;
  isHost: boolean;
  connected: boolean;
  tokenHash: string;
  socketId: string | null;
  joinedAt: string;
  lastActiveAt: string;
}

export interface InternalRoomState {
  code: string;
  name: string;
  hostId: string;
  scenarioId: string;
  design: SpacecraftDesign;
  launchConfig: LaunchConfiguration;
  status: RoomStatus;
  maxPlayers: number;
  revision: number;
  planningRevision: number;
  members: InternalMemberSession[];
  lastUpdatedBy?: {
    memberId: string;
    name: string;
    role: EngineerRole;
    action: string;
  };
  processedRequests?: Map<string, MissionRoom>;
  createdAt: string;
  updatedAt: string;
}

export class RoomService {
  private rooms = new Map<string, InternalRoomState>();
  private disconnectTimers = new Map<string, NodeJS.Timeout>();
  private roomLocks = new Map<string, Promise<unknown>>();
  private gracePeriodMs: number;

  constructor(gracePeriodMs = 60000) {
    this.gracePeriodMs = gracePeriodMs;
  }

  public setGracePeriod(ms: number) {
    this.gracePeriodMs = ms;
  }

  public getActiveRoomCount(): number {
    return this.rooms.size;
  }

  public hasRoom(code: string): boolean {
    return this.rooms.has(normalizeRoomCode(code));
  }

  public getRawRoom(code: string): InternalRoomState | undefined {
    return this.rooms.get(normalizeRoomCode(code));
  }

  /**
   * Serializes operations per room to prevent concurrent mutation race conditions.
   */
  public async withRoomLock<T>(roomCode: string, fn: () => Promise<T>): Promise<T> {
    const code = normalizeRoomCode(roomCode);
    const prev = this.roomLocks.get(code) || Promise.resolve();
    let resolveNext: () => void;
    const next = new Promise<void>((resolve) => {
      resolveNext = resolve;
    });
    this.roomLocks.set(code, next);

    try {
      await prev;
      return await fn();
    } finally {
      resolveNext!();
      if (this.roomLocks.get(code) === next) {
        this.roomLocks.delete(code);
      }
    }
  }

  /**
   * Generates a safe public snapshot of a room for broadcasting.
   * Strips all secret hashes and internal socket IDs.
   */
  public getRoomSnapshot(code: string): MissionRoom | null {
    const room = this.rooms.get(normalizeRoomCode(code));
    if (!room) return null;

    const publicMembers: TeamMember[] = room.members.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      isReady: m.isReady,
      isHost: m.isHost,
      connected: m.connected,
      joinedAt: m.joinedAt,
      lastActiveAt: m.lastActiveAt
    }));

    return {
      code: room.code,
      name: room.name,
      hostId: room.hostId,
      scenarioId: room.scenarioId,
      design: room.design,
      launchConfig: room.launchConfig,
      members: publicMembers,
      status: room.status,
      maxPlayers: room.maxPlayers,
      revision: room.revision,
      planningRevision: room.planningRevision ?? 1,
      lastUpdatedBy: room.lastUpdatedBy,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt
    };
  }

  /**
   * 1. CREATE ROOM
   */
  public async createRoom(
    hostName: string,
    roomName?: string,
    socketId: string | null = null
  ): Promise<{ room: MissionRoom; session: ParticipantSession }> {
    const code = generateUniqueRoomCode((c) => this.rooms.has(c));
    const identity = createMemberIdentity();
    const now = new Date().toISOString();

    const hostMember: InternalMemberSession = {
      id: identity.memberId,
      name: hostName.trim() || 'Flight Director Alpha',
      role: 'FLIGHT_DIRECTOR',
      isReady: true,
      isHost: true,
      connected: true,
      tokenHash: identity.tokenHash,
      socketId,
      joinedAt: now,
      lastActiveAt: now
    };

    // Initialize authoritative default planning state
    const defaultScenario = resolveScenario('scenario-earth-sentinel');
    const defaultOrbit = resolveOrbit(defaultScenario.targetOrbitType);
    const defaultVehicle = resolveLaunchVehicle();
    const defaultDesign = buildAuthoritativeDesign(
      defaultScenario,
      defaultOrbit,
      DEFAULT_INITIAL_COMPONENT_IDS,
      `${defaultScenario.code} Orbiter Alpha`
    );
    const defaultLaunch = buildAuthoritativeLaunchConfig(
      defaultVehicle,
      defaultOrbit,
      defaultDesign,
      defaultScenario
    );

    const newRoom: InternalRoomState = {
      code,
      name: (roomName?.trim() || `${hostMember.name}'s Mission`).substring(0, 48),
      hostId: hostMember.id,
      scenarioId: defaultScenario.id,
      design: defaultDesign,
      launchConfig: defaultLaunch,
      status: 'LOBBY',
      maxPlayers: 4,
      revision: 1,
      planningRevision: 1,
      members: [hostMember],
      lastUpdatedBy: {
        memberId: hostMember.id,
        name: hostMember.name,
        role: hostMember.role,
        action: 'Initialized mission room and baseline configuration'
      },
      createdAt: now,
      updatedAt: now
    };

    this.rooms.set(code, newRoom);

    // Persist to database asynchronously
    this.persistRoomToDb(newRoom, hostMember).catch((err) => {
      console.warn('DB persistence warning in createRoom:', err);
    });

    const snapshot = this.getRoomSnapshot(code)!;
    const session = formatParticipantSession(
      identity.memberId,
      identity.resumeToken,
      code,
      hostMember.name,
      hostMember.role,
      true
    );

    return { room: snapshot, session };
  }

  /**
   * 2. JOIN ROOM
   */
  public async joinRoom(
    rawCode: string,
    name: string,
    preferredRole?: EngineerRole,
    socketId: string | null = null
  ): Promise<{ room: MissionRoom; session: ParticipantSession }> {
    const code = normalizeRoomCode(rawCode);
    const room = this.rooms.get(code);

    if (!room) {
      throw { code: 'ROOM_NOT_FOUND', message: `Mission Room [${code}] does not exist.` };
    }

    if (room.status === 'CLOSED') {
      throw { code: 'ROOM_CLOSED', message: `Mission Room [${code}] is closed.` };
    }

    // Capacity validation: maximum 4 players
    const activeMemberCount = room.members.filter((m) => m.connected).length;
    if (activeMemberCount >= room.maxPlayers || room.members.length >= room.maxPlayers) {
      throw {
        code: 'ROOM_FULL',
        message: `Mission Room [${code}] has reached the maximum capacity of ${room.maxPlayers} engineers.`
      };
    }

    // Prevent duplicate display name collisions in the same room
    let sanitizedName = name.trim();
    if (room.members.some((m) => m.name.toLowerCase() === sanitizedName.toLowerCase())) {
      sanitizedName = `${sanitizedName} (${room.members.length + 1})`;
    }

    const identity = createMemberIdentity();
    const assignedRole = getNextAvailableRole(room, preferredRole);
    const now = new Date().toISOString();

    const newMember: InternalMemberSession = {
      id: identity.memberId,
      name: sanitizedName,
      role: assignedRole,
      isReady: false,
      isHost: false,
      connected: true,
      tokenHash: identity.tokenHash,
      socketId,
      joinedAt: now,
      lastActiveAt: now
    };

    room.members.push(newMember);
    room.revision += 1;
    room.updatedAt = now;

    // Persist to database
    this.persistMemberToDb(code, newMember).catch((err) => {
      console.warn('DB persistence warning in joinRoom:', err);
    });

    const snapshot = this.getRoomSnapshot(code)!;
    const session = formatParticipantSession(
      identity.memberId,
      identity.resumeToken,
      code,
      newMember.name,
      newMember.role,
      false
    );

    return { room: snapshot, session };
  }

  /**
   * 3. RECONNECT ROOM
   */
  public async reconnectRoom(
    rawCode: string,
    memberId: string,
    resumeToken: string,
    newSocketId: string | null = null
  ): Promise<{ room: MissionRoom; session: ParticipantSession; reconnectedMember: InternalMemberSession }> {
    const code = normalizeRoomCode(rawCode);
    const room = this.rooms.get(code);

    if (!room) {
      throw { code: 'ROOM_NOT_FOUND', message: `Mission Room [${code}] does not exist.` };
    }

    const member = room.members.find((m) => m.id === memberId);
    if (!member) {
      throw { code: 'MEMBER_NOT_FOUND', message: 'Participant record not found in this room.' };
    }

    // Verify token hash
    const isValidToken = verifyResumeToken(resumeToken, member.tokenHash);
    if (!isValidToken) {
      throw { code: 'INVALID_TOKEN', message: 'Authentication failed: Invalid resume token.' };
    }

    // Cancel any pending disconnect timer for this member
    this.cancelDisconnectTimer(memberId);

    const now = new Date().toISOString();
    member.connected = true;
    member.socketId = newSocketId;
    member.lastActiveAt = now;
    room.revision += 1;
    room.updatedAt = now;

    // Update member connection state in database
    this.updateMemberDbStatus(member.id, true, now).catch((err) => {
      console.warn('DB update warning in reconnectRoom:', err);
    });

    const snapshot = this.getRoomSnapshot(code)!;
    const session = formatParticipantSession(
      member.id,
      resumeToken,
      code,
      member.name,
      member.role,
      member.isHost
    );

    return { room: snapshot, session, reconnectedMember: member };
  }

  /**
   * 4. SET ROLE
   */
  public setMemberRole(
    rawCode: string,
    requestingMemberId: string,
    newRole: EngineerRole
  ): { room: MissionRoom; updatedMember: InternalMemberSession } {
    const code = normalizeRoomCode(rawCode);
    const room = this.rooms.get(code);

    if (!room) {
      throw { code: 'ROOM_NOT_FOUND', message: `Room [${code}] not found.` };
    }

    const member = room.members.find((m) => m.id === requestingMemberId);
    if (!member) {
      throw { code: 'UNAUTHORIZED', message: 'Member not found in room.' };
    }

    if (!canChangeRole(room, requestingMemberId, member.id)) {
      throw { code: 'FORBIDDEN', message: 'You are not authorized to change this role.' };
    }

    if (member.role === newRole) {
      return { room: this.getRoomSnapshot(code)!, updatedMember: member };
    }

    // Ensure role uniqueness among connected members
    if (!isRoleAvailable(room, newRole, member.id)) {
      throw {
        code: 'ROLE_TAKEN',
        message: `The engineering role '${newRole.replace('_', ' ')}' is already assigned to another crew member.`
      };
    }

    member.role = newRole;
    member.isReady = false; // Reset readiness on role change
    member.lastActiveAt = new Date().toISOString();
    room.revision += 1;
    room.updatedAt = new Date().toISOString();

    return { room: this.getRoomSnapshot(code)!, updatedMember: member };
  }

  /**
   * 5. SET READY
   */
  public setMemberReady(
    rawCode: string,
    requestingMemberId: string,
    isReady: boolean
  ): { room: MissionRoom; allReady: boolean; member: InternalMemberSession } {
    const code = normalizeRoomCode(rawCode);
    const room = this.rooms.get(code);

    if (!room) {
      throw { code: 'ROOM_NOT_FOUND', message: `Room [${code}] not found.` };
    }

    const member = room.members.find((m) => m.id === requestingMemberId);
    if (!member) {
      throw { code: 'UNAUTHORIZED', message: 'Member not found in room.' };
    }

    if (!canChangeReadyState(room, requestingMemberId, member.id)) {
      throw { code: 'FORBIDDEN', message: 'Cannot modify readiness state in current phase.' };
    }

    member.isReady = isReady;
    member.lastActiveAt = new Date().toISOString();
    room.revision += 1;
    room.updatedAt = new Date().toISOString();

    const allReady = isRoomAllReady(room);
    return { room: this.getRoomSnapshot(code)!, allReady, member };
  }

  /**
   * 6. ADVANCE LOBBY TO MISSION_SETUP
   */
  public advanceLobby(
    rawCode: string,
    requestingMemberId: string
  ): { room: MissionRoom } {
    const code = normalizeRoomCode(rawCode);
    const room = this.rooms.get(code);

    if (!room) {
      throw { code: 'ROOM_NOT_FOUND', message: `Room [${code}] not found.` };
    }

    const check = canAdvanceLobby(room, requestingMemberId);
    if (!check.allowed) {
      throw { code: 'FORBIDDEN', message: check.reason || 'Cannot advance lobby.' };
    }

    room.status = 'MISSION_SETUP';
    room.revision += 1;
    room.updatedAt = new Date().toISOString();

    return { room: this.getRoomSnapshot(code)! };
  }

  /**
   * ==========================================
   * PHASE 2: COLLABORATIVE MISSION PLANNING
   * ==========================================
   */

  /**
   * 7. GET MISSION PLANNING SNAPSHOT
   */
  public getPlanningSnapshot(
    rawCode: string,
    memberId: string
  ): MissionRoom {
    const code = normalizeRoomCode(rawCode);
    const room = this.rooms.get(code);
    if (!room) {
      throw { code: 'ROOM_NOT_FOUND', message: `Room [${code}] not found.` };
    }

    const auth = canPerformPlanningAction(room, memberId, 'VIEW_PLAN');
    if (!auth.allowed) {
      throw { code: 'FORBIDDEN', message: auth.reason || 'Not authorized to view mission plan.' };
    }

    return this.getRoomSnapshot(code)!;
  }

  /**
   * 8. UPDATE MISSION SCENARIO
   */
  public async updateScenario(
    rawCode: string,
    memberId: string,
    scenarioId: string,
    baseRevision: number,
    requestId?: string
  ): Promise<{ room: MissionRoom; isMaterialChange: boolean }> {
    const code = normalizeRoomCode(rawCode);
    return this.withRoomLock(code, async () => {
      const room = this.rooms.get(code);
      if (!room) {
        throw { code: 'ROOM_NOT_FOUND', message: `Room [${code}] not found.` };
      }

      // 1. Centralized Role-based authorization evaluated FIRST before idempotency replay
      const auth = canPerformPlanningAction(room, memberId, 'SELECT_SCENARIO');
      if (!auth.allowed) {
        throw {
          code: 'FORBIDDEN',
          message: auth.reason || 'Not authorized to select mission scenario.',
          currentSnapshot: this.getRoomSnapshot(code)
        };
      }

      // 2. Idempotency replay with composite key scoped to member and action
      const idempotencyKey = `${code}:${memberId}:SELECT_SCENARIO:${requestId}`;
      if (requestId && room.processedRequests?.has(idempotencyKey)) {
        return { room: room.processedRequests.get(idempotencyKey)!, isMaterialChange: false };
      }

      // 3. Mandatory monotonically increasing revision check
      const currentPlanningRev = room.planningRevision ?? 1;
      const isValidRev = baseRevision === currentPlanningRev;
      if (!isValidRev) {
        throw {
          code: 'REVISION_CONFLICT',
          message: `Planning state has changed (server planning revision: ${currentPlanningRev}, your revision: ${baseRevision}). Reconciled with latest room state.`,
          currentSnapshot: this.getRoomSnapshot(code)
        };
      }

      // Validate scenario exists in catalog
      const targetScenario = resolveScenario(scenarioId);
      if (targetScenario.id !== scenarioId) {
        throw { code: 'INVALID_SCENARIO', message: `Scenario with ID '${scenarioId}' does not exist.` };
      }

      // Check for material change
      const isMaterialChange = room.scenarioId !== scenarioId;
      if (!isMaterialChange) {
        return { room: this.getRoomSnapshot(code)!, isMaterialChange: false };
      }

      const now = new Date().toISOString();
      const currentOrbit = resolveOrbit(room.launchConfig?.orbitId || targetScenario.targetOrbitType);
      const currentVehicle = resolveLaunchVehicle(room.launchConfig?.vehicleId);

      // Apply update & recalculate authoritative design and launch configuration
      room.scenarioId = targetScenario.id;
      room.design = buildAuthoritativeDesign(
        targetScenario,
        currentOrbit,
        room.design.selectedComponentIds,
        room.design.name,
        room.design.busId
      );
      room.launchConfig = buildAuthoritativeLaunchConfig(
        currentVehicle,
        currentOrbit,
        room.design,
        targetScenario,
        room.launchConfig.launchSite
      );

      // Material change invalidates participant readiness
      room.members.forEach((m) => {
        m.isReady = false;
      });

      room.planningRevision = currentPlanningRev + 1;
      room.revision += 1;
      room.updatedAt = now;
      room.lastUpdatedBy = {
        memberId,
        name: auth.member?.name || 'Flight Crew',
        role: auth.member?.role || 'SCIENCE_LEAD',
        action: `Selected scenario: ${targetScenario.name}`
      };

      const snapshot = this.getRoomSnapshot(code)!;
      if (requestId) {
        if (!room.processedRequests) room.processedRequests = new Map();
        if (room.processedRequests.size >= 50) {
          const firstKey = room.processedRequests.keys().next().value;
          if (firstKey) room.processedRequests.delete(firstKey);
        }
        room.processedRequests.set(idempotencyKey, snapshot);
      }

      return { room: snapshot, isMaterialChange: true };
    });
  }

  /**
   * 9. UPDATE SPACECRAFT DESIGN
   */
  public async updateDesign(
    rawCode: string,
    memberId: string,
    designPayload: {
      name?: string;
      busId?: string;
      selectedComponentIds: string[];
    },
    baseRevision: number,
    requestId?: string
  ): Promise<{ room: MissionRoom; isMaterialChange: boolean }> {
    const code = normalizeRoomCode(rawCode);
    return this.withRoomLock(code, async () => {
      const room = this.rooms.get(code);
      if (!room) {
        throw { code: 'ROOM_NOT_FOUND', message: `Room [${code}] not found.` };
      }

      // 1. Centralized Role-based authorization evaluated FIRST before idempotency replay
      const auth = canPerformPlanningAction(room, memberId, 'UPDATE_DESIGN');
      if (!auth.allowed) {
        throw {
          code: 'FORBIDDEN',
          message: auth.reason || 'Not authorized to update spacecraft design.',
          currentSnapshot: this.getRoomSnapshot(code)
        };
      }

      // 2. Idempotency replay with composite key
      const idempotencyKey = `${code}:${memberId}:UPDATE_DESIGN:${requestId}`;
      if (requestId && room.processedRequests?.has(idempotencyKey)) {
        return { room: room.processedRequests.get(idempotencyKey)!, isMaterialChange: false };
      }

      // 3. Mandatory monotonically increasing revision check
      const currentPlanningRev = room.planningRevision ?? 1;
      const isValidRev = baseRevision === currentPlanningRev;
      if (!isValidRev) {
        throw {
          code: 'REVISION_CONFLICT',
          message: `Planning state has changed (server planning revision: ${currentPlanningRev}, your revision: ${baseRevision}). Reconciled with latest room state.`,
          currentSnapshot: this.getRoomSnapshot(code)
        };
      }

      const componentIds = designPayload.selectedComponentIds;
      if (!componentIds || componentIds.length === 0) {
        throw { code: 'INVALID_DESIGN', message: 'At least one component must be selected for the spacecraft.' };
      }

      // Check material change
      const isMaterial = isDesignMaterialChange(
        room.design,
        componentIds,
        designPayload.name,
        designPayload.busId
      );

      if (!isMaterial) {
        return { room: this.getRoomSnapshot(code)!, isMaterialChange: false };
      }

      const now = new Date().toISOString();
      const currentScenario = resolveScenario(room.scenarioId);
      const currentOrbit = resolveOrbit(room.launchConfig?.orbitId);
      const currentVehicle = resolveLaunchVehicle(room.launchConfig?.vehicleId);

      // Rebuild authoritative design with strict single-bus chassis validation
      room.design = buildAuthoritativeDesign(
        currentScenario,
        currentOrbit,
        componentIds,
        designPayload.name || room.design.name,
        designPayload.busId
      );

      // Recalculate launch configuration with updated mass
      room.launchConfig = buildAuthoritativeLaunchConfig(
        currentVehicle,
        currentOrbit,
        room.design,
        currentScenario,
        room.launchConfig.launchSite
      );

      // Invalidate participant readiness
      room.members.forEach((m) => {
        m.isReady = false;
      });

      room.planningRevision = currentPlanningRev + 1;
      room.revision += 1;
      room.updatedAt = now;
      room.lastUpdatedBy = {
        memberId,
        name: auth.member?.name || 'Systems Engineer',
        role: auth.member?.role || 'SYSTEMS_ENGINEER',
        action: `Updated spacecraft design (${componentIds.length} components)`
      };

      const snapshot = this.getRoomSnapshot(code)!;
      if (requestId) {
        if (!room.processedRequests) room.processedRequests = new Map();
        if (room.processedRequests.size >= 50) {
          const firstKey = room.processedRequests.keys().next().value;
          if (firstKey) room.processedRequests.delete(firstKey);
        }
        room.processedRequests.set(idempotencyKey, snapshot);
      }

      return { room: snapshot, isMaterialChange: true };
    });
  }

  /**
   * 10. UPDATE LAUNCH CONFIGURATION
   */
  public async updateLaunchConfig(
    rawCode: string,
    memberId: string,
    launchPayload: {
      vehicleId: string;
      orbitId: string;
      launchSite?: string;
    },
    baseRevision: number,
    requestId?: string
  ): Promise<{ room: MissionRoom; isMaterialChange: boolean }> {
    const code = normalizeRoomCode(rawCode);
    return this.withRoomLock(code, async () => {
      const room = this.rooms.get(code);
      if (!room) {
        throw { code: 'ROOM_NOT_FOUND', message: `Room [${code}] not found.` };
      }

      // 1. Centralized Role-based authorization evaluated FIRST before idempotency replay
      const auth = canPerformPlanningAction(room, memberId, 'UPDATE_LAUNCH');
      if (!auth.allowed) {
        throw {
          code: 'FORBIDDEN',
          message: auth.reason || 'Not authorized to update launch configuration.',
          currentSnapshot: this.getRoomSnapshot(code)
        };
      }

      // 2. Idempotency replay with composite key
      const idempotencyKey = `${code}:${memberId}:UPDATE_LAUNCH:${requestId}`;
      if (requestId && room.processedRequests?.has(idempotencyKey)) {
        return { room: room.processedRequests.get(idempotencyKey)!, isMaterialChange: false };
      }

      // 3. Mandatory monotonically increasing revision check
      const currentPlanningRev = room.planningRevision ?? 1;
      const isValidRev = baseRevision === currentPlanningRev;
      if (!isValidRev) {
        throw {
          code: 'REVISION_CONFLICT',
          message: `Planning state has changed (server planning revision: ${currentPlanningRev}, your revision: ${baseRevision}). Reconciled with latest room state.`,
          currentSnapshot: this.getRoomSnapshot(code)
        };
      }

      // Validate vehicle and orbit exist in catalogs
      const targetVehicle = resolveLaunchVehicle(launchPayload.vehicleId);
      const targetOrbit = resolveOrbit(launchPayload.orbitId);

      if (targetVehicle.id !== launchPayload.vehicleId) {
        throw { code: 'INVALID_VEHICLE', message: `Launch vehicle with ID '${launchPayload.vehicleId}' does not exist.` };
      }
      if (targetOrbit.id !== launchPayload.orbitId) {
        throw { code: 'INVALID_ORBIT', message: `Orbit profile with ID '${launchPayload.orbitId}' does not exist.` };
      }

      // Check material change
      const isMaterial = isLaunchMaterialChange(
        room.launchConfig,
        launchPayload.vehicleId,
        launchPayload.orbitId,
        launchPayload.launchSite
      );

      if (!isMaterial) {
        return { room: this.getRoomSnapshot(code)!, isMaterialChange: false };
      }

      const now = new Date().toISOString();
      const currentScenario = resolveScenario(room.scenarioId);

      // If orbit changed, recalculate spacecraft design resources because eclipse times change
      if (targetOrbit.id !== room.launchConfig.orbitId) {
        room.design = buildAuthoritativeDesign(
          currentScenario,
          targetOrbit,
          room.design.selectedComponentIds,
          room.design.name,
          room.design.busId
        );
      }

      // Rebuild launch configuration
      room.launchConfig = buildAuthoritativeLaunchConfig(
        targetVehicle,
        targetOrbit,
        room.design,
        currentScenario,
        launchPayload.launchSite || room.launchConfig.launchSite
      );

      // Invalidate participant readiness
      room.members.forEach((m) => {
        m.isReady = false;
      });

      room.planningRevision = currentPlanningRev + 1;
      room.revision += 1;
      room.updatedAt = now;
      room.lastUpdatedBy = {
        memberId,
        name: auth.member?.name || 'Trajectory Specialist',
        role: auth.member?.role || 'TRAJECTORY_SPECIALIST',
        action: `Configured launch: ${targetVehicle.name} to ${targetOrbit.name}`
      };

      const snapshot = this.getRoomSnapshot(code)!;
      if (requestId) {
        if (!room.processedRequests) room.processedRequests = new Map();
        if (room.processedRequests.size >= 50) {
          const firstKey = room.processedRequests.keys().next().value;
          if (firstKey) room.processedRequests.delete(firstKey);
        }
        room.processedRequests.set(idempotencyKey, snapshot);
      }

      return { room: snapshot, isMaterialChange: true };
    });
  }

  /**
   * 11. HANDLE SOCKET DISCONNECT WITH 60-SECOND GRACE PERIOD
   */
  public handleSocketDisconnect(
    socketId: string,
    onHostMigrated?: (code: string, newHost: InternalMemberSession, prevHostId: string) => void,
    onRoomUpdated?: (code: string, room: MissionRoom) => void,
    onRoomClosed?: (code: string) => void
  ): { roomCode: string; member: InternalMemberSession } | null {
    for (const [code, room] of this.rooms.entries()) {
      const member = room.members.find((m) => m.socketId === socketId);
      if (!member) continue;

      // Mark member as disconnected, but preserve membership during grace period
      member.connected = false;
      member.socketId = null;
      member.lastActiveAt = new Date().toISOString();
      room.revision += 1;
      room.updatedAt = new Date().toISOString();

      const memberId = member.id;
      const isHost = member.isHost;

      // Start grace period timer
      const timer = setTimeout(() => {
        this.processGracePeriodExpiration(code, memberId, isHost, onHostMigrated, onRoomUpdated, onRoomClosed);
      }, this.gracePeriodMs);

      this.disconnectTimers.set(memberId, timer);

      return { roomCode: code, member };
    }

    return null;
  }

  /**
   * 8. LEAVE ROOM (Intentional disconnect)
   */
  public leaveRoom(
    rawCode: string,
    memberId: string,
    onHostMigrated?: (code: string, newHost: InternalMemberSession, prevHostId: string) => void
  ): { room: MissionRoom | null; isClosed: boolean } {
    const code = normalizeRoomCode(rawCode);
    const room = this.rooms.get(code);
    if (!room) return { room: null, isClosed: true };

    this.cancelDisconnectTimer(memberId);

    const index = room.members.findIndex((m) => m.id === memberId);
    if (index === -1) return { room: this.getRoomSnapshot(code), isClosed: false };

    const leavingMember = room.members[index];
    room.members.splice(index, 1);
    room.revision += 1;
    room.updatedAt = new Date().toISOString();

    // If room is empty, clean up and close
    if (room.members.length === 0) {
      this.rooms.delete(code);
      return { room: null, isClosed: true };
    }

    // If host left, immediately migrate host to next member
    if (leavingMember.isHost) {
      const newHost = room.members.find((m) => m.connected) || room.members[0];
      newHost.isHost = true;
      room.hostId = newHost.id;

      // Reassign FLIGHT_DIRECTOR to new host if unassigned
      if (leavingMember.role === 'FLIGHT_DIRECTOR') {
        newHost.role = 'FLIGHT_DIRECTOR';
      }

      if (onHostMigrated) {
        onHostMigrated(code, newHost, leavingMember.id);
      }
    }

    return { room: this.getRoomSnapshot(code), isClosed: false };
  }

  /**
   * Helper: Cancels an active disconnect grace timer.
   */
  private cancelDisconnectTimer(memberId: string) {
    const timer = this.disconnectTimers.get(memberId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(memberId);
    }
  }

  /**
   * Helper: Triggered when a participant's disconnect grace period expires.
   */
  private processGracePeriodExpiration(
    code: string,
    memberId: string,
    wasHost: boolean,
    onHostMigrated?: (code: string, newHost: InternalMemberSession, prevHostId: string) => void,
    onRoomUpdated?: (code: string, room: MissionRoom) => void,
    onRoomClosed?: (code: string) => void
  ) {
    this.disconnectTimers.delete(memberId);
    const room = this.rooms.get(code);
    if (!room) return;

    const member = room.members.find((m) => m.id === memberId);
    if (!member || member.connected) {
      // Reconnected in the meantime
      return;
    }

    // If host didn't reconnect, migrate host to an active member
    if (wasHost && member.isHost) {
      const activeMembers = room.members.filter((m) => m.connected && m.id !== memberId);

      if (activeMembers.length > 0) {
        const nextHost = activeMembers[0];
        member.isHost = false;
        nextHost.isHost = true;
        room.hostId = nextHost.id;

        if (member.role === 'FLIGHT_DIRECTOR') {
          nextHost.role = 'FLIGHT_DIRECTOR';
        }

        room.revision += 1;
        room.updatedAt = new Date().toISOString();

        if (onHostMigrated) {
          onHostMigrated(code, nextHost, memberId);
        }
      }
    }

    // Remove abandoned disconnected member if lobby state
    if (room.status === 'LOBBY') {
      const idx = room.members.findIndex((m) => m.id === memberId);
      if (idx !== -1) {
        room.members.splice(idx, 1);
        room.revision += 1;
        room.updatedAt = new Date().toISOString();
      }
    }

    // If no connected members remain, close room
    const anyConnected = room.members.some((m) => m.connected);
    if (!anyConnected) {
      room.status = 'CLOSED';
      this.rooms.delete(code);
      if (onRoomClosed) {
        onRoomClosed(code);
      }
      return;
    }

    if (onRoomUpdated) {
      const snapshot = this.getRoomSnapshot(code);
      if (snapshot) {
        onRoomUpdated(code, snapshot);
      }
    }
  }

  // --- Database Sync Helpers ---
  private async persistRoomToDb(room: InternalRoomState, host: InternalMemberSession) {
    try {
      const db = getDatabase();
      await db.insert(missionRoomsTable).values({
        code: room.code,
        name: room.name,
        hostId: room.hostId,
        scenarioId: room.scenarioId,
        status: room.status,
        maxPlayers: room.maxPlayers,
        revision: room.revision,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt
      });

      await db.insert(teamMembersTable).values({
        id: host.id,
        roomCode: room.code,
        name: host.name,
        role: host.role,
        isReady: host.isReady,
        isHost: host.isHost,
        connected: host.connected,
        tokenHash: host.tokenHash,
        joinedAt: host.joinedAt,
        lastActiveAt: host.lastActiveAt
      });
    } catch (err) {
      // Non-fatal logging for local dev
    }
  }

  private async persistMemberToDb(roomCode: string, member: InternalMemberSession) {
    try {
      const db = getDatabase();
      await db.insert(teamMembersTable).values({
        id: member.id,
        roomCode,
        name: member.name,
        role: member.role,
        isReady: member.isReady,
        isHost: member.isHost,
        connected: member.connected,
        tokenHash: member.tokenHash,
        joinedAt: member.joinedAt,
        lastActiveAt: member.lastActiveAt
      });
    } catch (err) {
      // Non-fatal
    }
  }

  private async updateMemberDbStatus(memberId: string, connected: boolean, lastActiveAt: string) {
    try {
      const db = getDatabase();
      await db
        .update(teamMembersTable)
        .set({ connected, lastActiveAt })
        .where(eq(teamMembersTable.id, memberId));
    } catch (err) {
      // Non-fatal
    }
  }
}

// Global Singleton RoomService
export const roomService = new RoomService();
