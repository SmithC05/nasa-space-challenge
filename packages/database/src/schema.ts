import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text
} from 'drizzle-orm/pg-core';

export const missionsTable = pgTable('missions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  tagline: text('tagline').notNull(),
  description: text('description').notNull(),
  targetBody: text('target_body').notNull(),
  difficulty: text('difficulty').notNull(),
  budgetMUSD: doublePrecision('budget_musd').notNull(),
  maxMassKg: doublePrecision('max_mass_kg').notNull(),
  targetOrbitType: text('target_orbit_type').notNull(),
  minSciencePoints: integer('min_science_points').notNull(),
  minBandwidthMbps: doublePrecision('min_bandwidth_mbps').notNull(),
  durationDays: integer('duration_days').notNull(),
  data: jsonb('data').notNull() // Full MissionScenario
});

export const spacecraftDesignsTable = pgTable('spacecraft_designs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  scenarioId: text('scenario_id').notNull(),
  busId: text('bus_id').notNull(),
  selectedComponentIds: jsonb('selected_component_ids').notNull(),
  resources: jsonb('resources').notNull(),
  validation: jsonb('validation').notNull(),
  lastUpdatedBy: text('last_updated_by'),
  updatedAt: text('updated_at').notNull()
});

export const launchConfigsTable = pgTable('launch_configs', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull(),
  orbitId: text('orbit_id').notNull(),
  spacecraftMassKg: doublePrecision('spacecraft_mass_kg').notNull(),
  isCompatible: boolean('is_compatible').notNull(),
  payloadMarginKg: doublePrecision('payload_margin_kg').notNull(),
  estimatedCostMUSD: doublePrecision('estimated_cost_musd').notNull(),
  launchSite: text('launch_site').notNull(),
  createdAt: text('created_at').notNull()
});

export const missionRoomsTable = pgTable('mission_rooms', {
  code: text('code').primaryKey(),
  name: text('name').notNull(),
  hostId: text('host_id').notNull(),
  scenarioId: text('scenario_id'),
  status: text('status').notNull().default('LOBBY'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const teamMembersTable = pgTable('team_members', {
  id: text('id').primaryKey(),
  roomCode: text('room_code').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  isReady: boolean('is_ready').notNull().default(false),
  isHost: boolean('is_host').notNull().default(false),
  joinedAt: text('joined_at').notNull()
});

export const missionReportsTable = pgTable('mission_reports', {
  id: text('id').primaryKey(),
  roomCode: text('room_code').notNull(),
  scenarioId: text('scenario_id').notNull(),
  scenarioName: text('scenario_name').notNull(),
  spacecraftName: text('spacecraft_name').notNull(),
  outcome: text('outcome').notNull(),
  finalScienceScore: integer('final_science_score').notNull(),
  dataGatheredGb: doublePrecision('data_gathered_gb').notNull(),
  budgetRemainingMUSD: doublePrecision('budget_remaining_musd').notNull(),
  missionDurationDays: integer('mission_duration_days').notNull(),
  crisesResolved: integer('crises_resolved').notNull(),
  totalCrises: integer('total_crises').notNull(),
  teamEngineers: jsonb('team_engineers').notNull(),
  accolades: jsonb('accolades').notNull(),
  evaluationNotes: text('evaluation_notes').notNull(),
  completedAt: text('completed_at').notNull()
});
