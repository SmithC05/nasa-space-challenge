import { z } from 'zod';

// ==========================================
// 1. Mission Scenarios
// ==========================================
export const TargetBodySchema = z.enum(['Earth', 'Moon', 'Mars', 'DeepSpace']);
export type TargetBody = z.infer<typeof TargetBodySchema>;

export const MissionDifficultySchema = z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']);
export type MissionDifficulty = z.infer<typeof MissionDifficultySchema>;

export const MissionScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  tagline: z.string(),
  description: z.string(),
  targetBody: TargetBodySchema,
  difficulty: MissionDifficultySchema,
  budgetMUSD: z.number().positive(),
  maxMassKg: z.number().positive(),
  targetOrbitType: z.enum(['LEO', 'SSO', 'GTO', 'GEO', 'MOLNIYA', 'TLI']),
  minSciencePoints: z.number().positive(),
  minBandwidthMbps: z.number().positive(),
  durationDays: z.number().positive(),
  primaryObjectives: z.array(z.string()),
  secondaryObjectives: z.array(z.string()),
  environmentalHazards: z.array(z.string()),
  recommendedInstruments: z.array(z.string()),
  imageUrl: z.string().optional()
});
export type MissionScenario = z.infer<typeof MissionScenarioSchema>;

// ==========================================
// 2. Components
// ==========================================
export const ComponentCategorySchema = z.enum([
  'bus',
  'power',
  'propulsion',
  'communications',
  'instruments',
  'thermal_aocs'
]);
export type ComponentCategory = z.infer<typeof ComponentCategorySchema>;

export const ComponentDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: ComponentCategorySchema,
  subCategory: z.string(),
  description: z.string(),
  massKg: z.number().nonnegative(),
  powerGenerationW: z.number().nonnegative().optional().default(0),
  powerConsumptionW: z.number().nonnegative().optional().default(0),
  costMUSD: z.number().nonnegative(),
  dataRateMbps: z.number().nonnegative().optional().default(0),
  batteryCapacityWh: z.number().nonnegative().optional().default(0),
  deltaVMps: z.number().nonnegative().optional().default(0),
  reliabilityPercent: z.number().min(0).max(100).optional().default(95),
  thermalToleranceMinC: z.number().optional().default(-40),
  thermalToleranceMaxC: z.number().optional().default(85),
  visualModel: z.object({
    shape: z.enum(['box', 'cylinder', 'solar_wing', 'dish_antenna', 'thruster', 'sensor_dome']),
    color: z.string(),
    scale: z.tuple([z.number(), z.number(), z.number()]),
    offset: z.tuple([z.number(), z.number(), z.number()]).optional().default([0, 0, 0]),
    rotation: z.tuple([z.number(), z.number(), z.number()]).optional()
  })
});
export type ComponentDefinition = z.input<typeof ComponentDefinitionSchema>;

// ==========================================
// 3. Validation and Resource Snapshot
// ==========================================
export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  recommendations: z.array(z.string())
});
export type ValidationResult = z.infer<typeof ValidationResultSchema>;

export const ResourceSnapshotSchema = z.object({
  totalMassKg: z.number(),
  maxMassKg: z.number(),
  massMarginKg: z.number(),
  totalCostMUSD: z.number(),
  budgetMUSD: z.number(),
  costMarginMUSD: z.number(),
  powerDayGenW: z.number(),
  powerConsumptionW: z.number(),
  dayPowerMarginW: z.number(),
  nightPowerDeficitW: z.number(),
  batteryCapacityWh: z.number(),
  batteryEnduranceMin: z.number(),
  eclipseDurationMin: z.number(),
  dataRateMbps: z.number(),
  deltaVAvailableMps: z.number(),
  averageReliabilityPct: z.number()
});
export type ResourceSnapshot = z.infer<typeof ResourceSnapshotSchema>;

// ==========================================
// 4. Spacecraft Design
// ==========================================
export const SpacecraftDesignSchema = z.object({
  id: z.string(),
  name: z.string(),
  scenarioId: z.string(),
  busId: z.string(),
  selectedComponentIds: z.array(z.string()),
  resources: ResourceSnapshotSchema,
  validation: ValidationResultSchema,
  lastUpdatedBy: z.string().optional(),
  updatedAt: z.string()
});
export type SpacecraftDesign = z.infer<typeof SpacecraftDesignSchema>;

// ==========================================
// 5. Orbit Profiles and Launch Vehicles
// ==========================================
export const OrbitProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['LEO', 'SSO', 'GTO', 'GEO', 'MOLNIYA', 'TLI']),
  perigeeKm: z.number().positive(),
  apogeeKm: z.number().positive(),
  inclinationDeg: z.number().min(0).max(180),
  orbitalPeriodMin: z.number().positive(),
  eclipseFraction: z.number().min(0).max(1),
  requiredDeltaVMps: z.number().positive(),
  radiationSeverity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EXTREME']),
  description: z.string()
});
export type OrbitProfile = z.infer<typeof OrbitProfileSchema>;

export const LaunchVehicleSchema = z.object({
  id: z.string(),
  name: z.string(),
  manufacturer: z.string(),
  class: z.enum(['Light', 'Medium', 'Heavy', 'SuperHeavy']),
  payloadCapacityLeoKg: z.number().positive(),
  payloadCapacityGtoKg: z.number().positive(),
  payloadCapacityTliKg: z.number().positive(),
  fairingDiameterM: z.number().positive(),
  fairingHeightM: z.number().positive(),
  launchCostMUSD: z.number().positive(),
  successRatePercent: z.number().min(0).max(100),
  description: z.string(),
  reusable: z.boolean().default(false)
});
export type LaunchVehicle = z.infer<typeof LaunchVehicleSchema>;

export const LaunchConfigurationSchema = z.object({
  vehicleId: z.string(),
  orbitId: z.string(),
  spacecraftMassKg: z.number().positive(),
  launchWindow: z.string(),
  launchSite: z.string(),
  isCompatible: z.boolean(),
  payloadMarginKg: z.number(),
  estimatedCostMUSD: z.number()
});
export type LaunchConfiguration = z.infer<typeof LaunchConfigurationSchema>;

// ==========================================
// 6. Mission Events & Crisis
// ==========================================
export const MissionEventChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  successProbability: z.number().min(0).max(1),
  powerDeltaW: z.number().default(0),
  dataBufferDeltaGb: z.number().default(0),
  batteryDamagePct: z.number().default(0),
  scienceYieldDelta: z.number().default(0),
  componentDegradationCategory: ComponentCategorySchema.optional(),
  outcomeDescription: z.string()
});
export type MissionEventChoice = z.infer<typeof MissionEventChoiceSchema>;

export const MissionEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum(['SOLAR_STORM', 'THERMAL_SPIKE', 'ATTITUDE_GLITCH', 'COMMS_BLACKOUT', 'MICROMETEOROID', 'SCIENTIFIC_SURPRISE']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string(),
  triggerMissionSecond: z.number(),
  timeLimitSec: z.number().default(30),
  choices: z.array(MissionEventChoiceSchema)
});
export type MissionEvent = z.infer<typeof MissionEventSchema>;

// ==========================================
// 7. Simulation State & Telemetry
// ==========================================
export const MissionPhaseSchema = z.enum([
  'PRE_LAUNCH',
  'COUNTDOWN',
  'ASCENT',
  'ORBIT_INSERTION',
  'COMMISSIONING',
  'PRIMARY_SCIENCE',
  'CRISIS_ACTIVE',
  'MISSION_COMPLETE',
  'MISSION_ABORTED'
]);
export type MissionPhase = z.infer<typeof MissionPhaseSchema>;

export const GroundStationContactSchema = z.object({
  name: z.string(),
  location: z.string(),
  elevationDeg: z.number(),
  inContact: z.boolean(),
  signalStrengthPct: z.number()
});
export type GroundStationContact = z.infer<typeof GroundStationContactSchema>;

export const TelemetrySnapshotSchema = z.object({
  timestamp: z.number(),
  missionElapsedSeconds: z.number(),
  altitudeKm: z.number(),
  velocityKps: z.number(),
  trueAnomalyDeg: z.number(),
  inSunlight: booleanOrNumber(),
  batteryLevelPct: z.number(),
  solarPowerGenW: z.number(),
  powerDrawW: z.number(),
  temperatureCelsius: z.number(),
  dataBufferGb: z.number(),
  scienceDataDownlinkedGb: z.number(),
  activeGroundStation: z.string().nullable(),
  groundStations: z.array(GroundStationContactSchema),
  subsystemHealth: z.record(z.string(), z.number()) // 0 to 100%
});
function booleanOrNumber() {
  return z.boolean();
}
export type TelemetrySnapshot = z.infer<typeof TelemetrySnapshotSchema>;

export const MissionSimulationStateSchema = z.object({
  roomId: z.string(),
  phase: MissionPhaseSchema,
  missionClockSec: z.number(),
  speedMultiplier: z.number().default(1),
  isPaused: z.boolean().default(false),
  telemetry: TelemetrySnapshotSchema,
  activeEvent: MissionEventSchema.nullable(),
  resolvedEvents: z.array(
    z.object({
      eventId: z.string(),
      chosenChoiceId: z.string(),
      success: z.boolean(),
      timestampSec: z.number()
    })
  ),
  sciencePointsAccumulated: z.number(),
  missionLogs: z.array(
    z.object({
      id: z.string(),
      timeSec: z.number(),
      level: z.enum(['INFO', 'WARN', 'ERROR', 'SUCCESS']),
      source: z.string(),
      message: z.string()
    })
  )
});
export type MissionSimulationState = z.infer<typeof MissionSimulationStateSchema>;

// ==========================================
// 8. Mission Report
// ==========================================
export const MissionReportSchema = z.object({
  id: z.string(),
  roomCode: z.string(),
  scenarioId: z.string(),
  scenarioName: z.string(),
  spacecraftName: z.string(),
  outcome: z.enum(['OUTSTANDING_SUCCESS', 'MISSION_ACCOMPLISHED', 'PARTIAL_SUCCESS', 'MISSION_FAILURE']),
  finalScienceScore: z.number(),
  dataGatheredGb: z.number(),
  budgetRemainingMUSD: z.number(),
  missionDurationDays: z.number(),
  crisesResolved: z.number(),
  totalCrises: z.number(),
  teamEngineers: z.array(z.string()),
  accolades: z.array(z.string()),
  evaluationNotes: z.string(),
  completedAt: z.string()
});
export type MissionReport = z.infer<typeof MissionReportSchema>;

// ==========================================
// 9. Multiplayer Team & Room
// ==========================================
export const EngineerRoleSchema = z.enum([
  'FLIGHT_DIRECTOR',
  'SYSTEMS_ENGINEER',
  'TRAJECTORY_SPECIALIST',
  'SCIENCE_LEAD'
]);
export type EngineerRole = z.infer<typeof EngineerRoleSchema>;

export const RoomStatusSchema = z.enum([
  'LOBBY',
  'MISSION_SETUP',
  'DESIGNING',
  'LAUNCH_READY',
  'ACTIVE_MISSION',
  'DEBRIEF',
  'CLOSED'
]);
export type RoomStatus = z.infer<typeof RoomStatusSchema>;

export const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: EngineerRoleSchema,
  isReady: z.boolean().default(false),
  isHost: z.boolean().default(false),
  connected: z.boolean().default(true),
  joinedAt: z.string(),
  lastActiveAt: z.string().optional()
});
export type TeamMember = z.infer<typeof TeamMemberSchema>;

export const MissionRoomSchema = z.object({
  code: z.string(),
  name: z.string(),
  hostId: z.string(),
  scenarioId: z.string().nullable(),
  design: SpacecraftDesignSchema.nullable(),
  launchConfig: LaunchConfigurationSchema.nullable(),
  members: z.array(TeamMemberSchema),
  status: RoomStatusSchema,
  maxPlayers: z.number().default(4),
  revision: z.number().default(1),
  lastUpdatedBy: z
    .object({
      memberId: z.string(),
      name: z.string(),
      role: EngineerRoleSchema,
      action: z.string()
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});
export type MissionRoom = z.infer<typeof MissionRoomSchema>;

// Standard Socket.IO Acknowledgement Response
export interface SocketResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Session Identity Information issued to participant (NOT broadcast)
export interface ParticipantSession {
  memberId: string;
  resumeToken: string;
  roomCode: string;
  name: string;
  role: EngineerRole;
  isHost: boolean;
}

// Client to Server Input Payloads
export const RoomCreateInputSchema = z.object({
  hostName: z.string().trim().min(1, 'Display name is required').max(32, 'Display name too long'),
  roomName: z.string().trim().max(48, 'Room name too long').optional()
});
export type RoomCreateInput = z.infer<typeof RoomCreateInputSchema>;

export const RoomJoinInputSchema = z.object({
  roomCode: z.string().trim().min(1, 'Room code is required'),
  name: z.string().trim().min(1, 'Display name is required').max(32, 'Display name too long'),
  role: EngineerRoleSchema.optional()
});
export type RoomJoinInput = z.infer<typeof RoomJoinInputSchema>;

export const RoomReconnectInputSchema = z.object({
  roomCode: z.string().trim().min(1, 'Room code is required'),
  memberId: z.string().uuid('Invalid member ID format'),
  resumeToken: z.string().min(16, 'Invalid resume token format')
});
export type RoomReconnectInput = z.infer<typeof RoomReconnectInputSchema>;

export const SetRoleInputSchema = z.object({
  roomCode: z.string().trim().min(1, 'Room code is required'),
  role: EngineerRoleSchema
});
export type SetRoleInput = z.infer<typeof SetRoleInputSchema>;

export const SetReadyInputSchema = z.object({
  roomCode: z.string().trim().min(1, 'Room code is required'),
  isReady: z.boolean()
});
export type SetReadyInput = z.infer<typeof SetReadyInputSchema>;

export const RoomLeaveInputSchema = z.object({
  roomCode: z.string().trim().min(1, 'Room code is required')
});
export type RoomLeaveInput = z.infer<typeof RoomLeaveInputSchema>;

export const AdvanceLobbyInputSchema = z.object({
  roomCode: z.string().trim().min(1, 'Room code is required')
});
export type AdvanceLobbyInput = z.infer<typeof AdvanceLobbyInputSchema>;

// Phase 2 Collaborative Mission Planning Schemas
export const GetPlanInputSchema = z.object({
  roomCode: z.string().trim().min(1, 'Room code is required')
});
export type GetPlanInput = z.infer<typeof GetPlanInputSchema>;

export const UpdateScenarioInputSchema = z.object({
  roomCode: z.string().trim().min(1, 'Room code is required'),
  scenarioId: z.string().trim().min(1, 'Scenario ID is required'),
  baseRevision: z.number().int().nonnegative('Base revision must be non-negative').optional(),
  requestId: z.string().optional()
});
export type UpdateScenarioInput = z.infer<typeof UpdateScenarioInputSchema>;

export const PartialDesignPayloadSchema = z.object({
  name: z.string().trim().min(1).max(64).optional(),
  busId: z.string().optional(),
  selectedComponentIds: z.array(z.string()).min(1, 'At least one component is required')
});

export const UpdateDesignInputSchema = z.object({
  roomCode: z.string().trim().min(1, 'Room code is required'),
  design: SpacecraftDesignSchema.or(PartialDesignPayloadSchema),
  baseRevision: z.number().int().nonnegative('Base revision must be non-negative').optional(),
  requestId: z.string().optional()
});
export type UpdateDesignInput = z.infer<typeof UpdateDesignInputSchema>;

export const PartialLaunchPayloadSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  orbitId: z.string().min(1, 'Orbit ID is required'),
  launchSite: z.string().optional()
});

export const UpdateLaunchInputSchema = z.object({
  roomCode: z.string().trim().min(1, 'Room code is required'),
  launchConfig: LaunchConfigurationSchema.or(PartialLaunchPayloadSchema),
  baseRevision: z.number().int().nonnegative('Base revision must be non-negative').optional(),
  requestId: z.string().optional()
});
export type UpdateLaunchInput = z.infer<typeof UpdateLaunchInputSchema>;

// Socket Payload Types
export interface SocketEventsClientToServer {
  'room:create': (
    data: RoomCreateInput,
    callback: (res: SocketResponse<{ room: MissionRoom; session: ParticipantSession }>) => void
  ) => void;
  'room:join': (
    data: RoomJoinInput,
    callback: (res: SocketResponse<{ room: MissionRoom; session: ParticipantSession }>) => void
  ) => void;
  'room:reconnect': (
    data: RoomReconnectInput,
    callback: (res: SocketResponse<{ room: MissionRoom; session: ParticipantSession }>) => void
  ) => void;
  'room:setRole': (
    data: SetRoleInput,
    callback?: (res: SocketResponse<{ room: MissionRoom }>) => void
  ) => void;
  'room:setReady': (
    data: SetReadyInput,
    callback?: (res: SocketResponse<{ room: MissionRoom; allReady: boolean }>) => void
  ) => void;
  'room:advanceLobby': (
    data: AdvanceLobbyInput,
    callback?: (res: SocketResponse<{ room: MissionRoom }>) => void
  ) => void;
  'room:leave': (
    data: RoomLeaveInput,
    callback?: (res: SocketResponse<{ message: string }>) => void
  ) => void;
  'plan:get': (
    data: GetPlanInput,
    callback?: (res: SocketResponse<{ room: MissionRoom }>) => void
  ) => void;
  'scenario:select': (
    data: UpdateScenarioInput,
    callback?: (res: SocketResponse<{ room: MissionRoom }>) => void
  ) => void;
  'design:update': (
    data: UpdateDesignInput,
    callback?: (res: SocketResponse<{ room: MissionRoom }>) => void
  ) => void;
  'launch:configure': (
    data: UpdateLaunchInput,
    callback?: (res: SocketResponse<{ room: MissionRoom }>) => void
  ) => void;
  'mission:startLaunch': (data: { roomCode: string }) => void;
  'mission:eventChoice': (data: { roomCode: string; eventId: string; choiceId: string }) => void;
  'mission:setSpeed': (data: { roomCode: string; speedMultiplier: number }) => void;
  'mission:togglePause': (data: { roomCode: string }) => void;
  'chat:send': (data: { roomCode: string; sender: string; role: EngineerRole; message: string }) => void;
}

export interface SocketEventsServerToClient {
  'room:updated': (room: MissionRoom) => void;
  'room:presence': (data: { memberId: string; name: string; connected: boolean; timestamp: string }) => void;
  'room:hostChanged': (data: { previousHostId: string; newHostId: string; newHostName: string }) => void;
  'plan:rejected': (data: { code: string; message: string; room?: MissionRoom }) => void;
  'simulation:tick': (state: MissionSimulationState) => void;
  'mission:eventTriggered': (event: MissionEvent) => void;
  'mission:eventResolved': (data: { eventId: string; choiceId: string; success: boolean; message: string }) => void;
  'mission:completed': (report: MissionReport) => void;
  'chat:message': (data: { id: string; sender: string; role: EngineerRole; message: string; timestamp: string }) => void;
  'error:notification': (message: string) => void;
}
