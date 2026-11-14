import { LaunchConfiguration, LaunchVehicle, MissionScenario, OrbitProfile, SpacecraftDesign } from '@orbital/contracts';
import { LaunchHandoffPackage } from '@orbital/simulation-engine';

export type LaunchStageId =
  | 'STAGE_1_PRE_LAUNCH'
  | 'STAGE_2_COUNTDOWN'
  | 'STAGE_3_IGNITION'
  | 'STAGE_4_LIFTOFF'
  | 'STAGE_5_ATMOSPHERIC_ASCENT'
  | 'STAGE_6_STAGE_SEPARATION'
  | 'STAGE_7_SPACECRAFT_DEPLOYMENT'
  | 'STAGE_8_ORBIT_INSERTION'
  | 'STAGE_9_OPERATIONS_HANDOFF';

export interface StageDefinition {
  id: LaunchStageId;
  index: number;
  label: string;
  shortTitle: string;
  nominalDurationSec: number;
  description: string;
}

export const LAUNCH_STAGES: StageDefinition[] = [
  {
    id: 'STAGE_1_PRE_LAUNCH',
    index: 1,
    label: 'Stage 1 — Pre-Launch Readiness',
    shortTitle: 'Pre-Launch',
    nominalDurationSec: 4,
    description: 'Final flight telemetry checks, range safety clearance, and pad readiness confirmation.'
  },
  {
    id: 'STAGE_2_COUNTDOWN',
    index: 2,
    label: 'Stage 2 — Terminal Countdown',
    shortTitle: 'Countdown',
    nominalDurationSec: 10,
    description: 'Terminal automated launch sequencer countdown from T-10s to engine start.'
  },
  {
    id: 'STAGE_3_IGNITION',
    index: 3,
    label: 'Stage 3 — Main Engine Ignition',
    shortTitle: 'Ignition',
    nominalDurationSec: 3,
    description: 'First stage main engines ignite, turbulent exhaust plume and acoustic deluge suppression.'
  },
  {
    id: 'STAGE_4_LIFTOFF',
    index: 4,
    label: 'Stage 4 — Pad Clear & Liftoff',
    shortTitle: 'Liftoff',
    nominalDurationSec: 6,
    description: 'Hold-down clamps release. The launch vehicle clears the tower and begins vertical climb.'
  },
  {
    id: 'STAGE_5_ATMOSPHERIC_ASCENT',
    index: 5,
    label: 'Stage 5 — Atmospheric Ascent & Max-Q',
    shortTitle: 'Atmospheric Ascent',
    nominalDurationSec: 8,
    description: 'Climbing through troposphere into space. Pitch-over gravity turn and trans-sonic transition.'
  },
  {
    id: 'STAGE_6_STAGE_SEPARATION',
    index: 6,
    label: 'Stage 6 — Stage & Fairing Separation',
    shortTitle: 'Stage Separation',
    nominalDurationSec: 6,
    description: 'First stage MECO, pneumatic separation, upper stage vacuum ignition, and fairing jettison.'
  },
  {
    id: 'STAGE_7_SPACECRAFT_DEPLOYMENT',
    index: 7,
    label: 'Stage 7 — Spacecraft Deployment',
    shortTitle: 'Spacecraft Deploy',
    nominalDurationSec: 6,
    description: 'Spacecraft separates from payload adapter, stabilizes orientation, and deploys solar wings.'
  },
  {
    id: 'STAGE_8_ORBIT_INSERTION',
    index: 8,
    label: 'Stage 8 — Orbital Insertion Certified',
    shortTitle: 'Orbit Insertion',
    nominalDurationSec: 6,
    description: 'Insertion into target trajectory parameters verified. Spacecraft operational in orbit.'
  },
  {
    id: 'STAGE_9_OPERATIONS_HANDOFF',
    index: 9,
    label: 'Stage 9 — Mission Operations Handoff',
    shortTitle: 'Ops Handoff',
    nominalDurationSec: 0,
    description: 'Telecommand authorization handed off to Developer 04 Mission Operations Center.'
  }
];

export interface LaunchTelemetry {
  stageId: LaunchStageId;
  missionElapsedSec: number;
  altitudeKm: number;
  velocityMps: number;
  downrangeKm: number;
  throttlePct: number;
  stage1PropellantPct: number;
  stage2PropellantPct: number;
  gForce: number;
  machNumber: number;
  fairingJettisoned: boolean;
  boosterSeparated: boolean;
  spacecraftSeparated: boolean;
  solarPanelsDeployed: boolean;
  orbitInsertionConfirmed: boolean;
}

export interface CinematicLaunchProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicle: LaunchVehicle;
  selectedOrbit: OrbitProfile;
  currentDesign: SpacecraftDesign;
  selectedScenario: MissionScenario;
  launchConfig: LaunchConfiguration;
  launchHandoff: LaunchHandoffPackage | null;
  onCompleteHandoff: () => void;
}
