import { create } from 'zustand';
import {
  ComponentDefinition,
  EngineerRole,
  LaunchConfiguration,
  LaunchVehicle,
  MissionEvent,
  MissionReport,
  MissionRoom,
  MissionScenario,
  MissionSimulationState,
  OrbitProfile,
  SpacecraftDesign
} from '@orbital/contracts';
import {
  LAUNCH_VEHICLES,
  MISSION_EVENTS,
  MISSION_SCENARIOS,
  ORBIT_PROFILES,
  SPACECRAFT_COMPONENTS
} from '@orbital/game-data';
import {
  calculateSpacecraftResources,
  createInitialSimulationState,
  generateMissionReport,
  resolveMissionEvent,
  tickSimulation,
  validateLaunchConfiguration,
  validateSpacecraftDesign
} from '@orbital/simulation-engine';
import {
  configureLaunchSocket,
  getMissionPlan,
  selectScenarioSocket,
  sendChatMessage,
  startLaunchSocket,
  submitEventChoiceSocket,
  updateDesignSocket
} from '../services/socket';

export type ActiveTab = 'hub' | 'lab' | 'orbit' | 'ops' | 'multiplayer';

interface GameState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Scenarios
  scenarios: MissionScenario[];
  selectedScenario: MissionScenario;
  selectScenario: (scenario: MissionScenario) => void;

  // Spacecraft Lab
  components: ComponentDefinition[];
  selectedComponentIds: string[];
  currentDesign: SpacecraftDesign;
  toggleComponent: (componentId: string) => void;
  setDesignName: (name: string) => void;

  // Orbit & Launch
  orbitProfiles: OrbitProfile[];
  selectedOrbit: OrbitProfile;
  launchVehicles: LaunchVehicle[];
  selectedVehicle: LaunchVehicle;
  launchConfig: LaunchConfiguration;
  selectOrbit: (orbit: OrbitProfile) => void;
  selectVehicle: (vehicle: LaunchVehicle) => void;

  // Simulation & Operations
  simulationState: MissionSimulationState | null;
  setSimulationState: (state: MissionSimulationState | null) => void;
  resolveEventChoice: (eventId: string, choiceId: string) => void;
  setSpeedMultiplier: (speed: number) => void;
  togglePause: () => void;
  startMissionLaunch: () => void;
  missionReport: MissionReport | null;
  setMissionReport: (report: MissionReport | null) => void;

  // Multiplayer
  activeRoom: MissionRoom | null;
  currentMemberId: string | null;
  resumeToken: string | null;
  currentRole: EngineerRole;
  allReady: boolean;
  chatMessages: { id: string; sender: string; role: EngineerRole; message: string; timestamp: string }[];
  setActiveRoom: (room: MissionRoom | null) => void;
  setCurrentMemberId: (id: string | null) => void;
  setResumeToken: (token: string | null) => void;
  setCurrentRole: (role: EngineerRole) => void;
  setAllReady: (allReady: boolean) => void;
  addChatMessage: (msg: { id: string; sender: string; role: EngineerRole; message: string; timestamp: string }) => void;
  sendChat: (message: string) => void;

  // Local tick interval for single player mode
  localTimer: NodeJS.Timeout | null;
  recalculateDesign: () => void;
}

const defaultScenario = MISSION_SCENARIOS[0];
const defaultOrbit = ORBIT_PROFILES[1]; // SSO
const defaultVehicle = LAUNCH_VEHICLES[1]; // Phoenix
const initialComponentIds = [
  'bus-smallsat-standard',
  'power-solar-standard-wings',
  'power-batt-li-ion',
  'comms-ka-dish',
  'inst-multispectral-imager',
  'aocs-reaction-wheels'
];

function buildDesign(name: string, scenario: MissionScenario, orbit: OrbitProfile, compIds: string[]): SpacecraftDesign {
  const selectedComps = SPACECRAFT_COMPONENTS.filter((c) => compIds.includes(c.id));
  const busComp = selectedComps.find((c) => c.category === 'bus');
  const resources = calculateSpacecraftResources(selectedComps, scenario, orbit);
  const validation = validateSpacecraftDesign(selectedComps, resources, scenario);

  return {
    id: `design-${scenario.id}`,
    name,
    scenarioId: scenario.id,
    busId: busComp?.id || 'bus-smallsat-standard',
    selectedComponentIds: compIds,
    resources,
    validation,
    updatedAt: new Date().toISOString()
  };
}

const initialDesign = buildDesign('Sentinel-1 Alpha', defaultScenario, defaultOrbit, initialComponentIds);
const initialLaunch = validateLaunchConfiguration(
  defaultVehicle,
  defaultOrbit,
  initialDesign.resources.totalMassKg,
  defaultScenario.budgetMUSD,
  initialDesign.resources.totalCostMUSD
);

export const useGameStore = create<GameState>((set, get) => ({
  activeTab: 'hub',
  setActiveTab: (tab) => set({ activeTab: tab }),

  scenarios: MISSION_SCENARIOS,
  selectedScenario: defaultScenario,
  selectScenario: (scenario) => {
    const { selectedOrbit, selectedComponentIds, currentDesign, activeRoom } = get();
    const updatedDesign = buildDesign(currentDesign.name, scenario, selectedOrbit, selectedComponentIds);
    const updatedLaunch = validateLaunchConfiguration(
      get().selectedVehicle,
      selectedOrbit,
      updatedDesign.resources.totalMassKg,
      scenario.budgetMUSD,
      updatedDesign.resources.totalCostMUSD
    );

    set({
      selectedScenario: scenario,
      currentDesign: updatedDesign,
      launchConfig: updatedLaunch
    });

    if (activeRoom) {
      const currentRev = activeRoom.planningRevision ?? activeRoom.revision;
      selectScenarioSocket(activeRoom.code, scenario.id, currentRev, (res) => {
        if (res.success && res.data?.room) {
          get().setActiveRoom(res.data.room);
        } else if (!res.success) {
          if (res.data?.room) {
            get().setActiveRoom(res.data.room);
          } else {
            getMissionPlan(activeRoom.code, (planRes) => {
              if (planRes.success && planRes.data?.room) {
                get().setActiveRoom(planRes.data.room);
              }
            });
          }
        }
      });
    }
  },

  components: SPACECRAFT_COMPONENTS,
  selectedComponentIds: initialComponentIds,
  currentDesign: initialDesign,

  toggleComponent: (componentId) => {
    const { selectedComponentIds, selectedScenario, selectedOrbit, currentDesign, activeRoom } = get();
    const comp = SPACECRAFT_COMPONENTS.find((c) => c.id === componentId);
    if (!comp) return;

    let updatedIds: string[];
    if (comp.category === 'bus') {
      // Single bus only: replace existing bus
      const nonBus = selectedComponentIds.filter(
        (id) => SPACECRAFT_COMPONENTS.find((c) => c.id === id)?.category !== 'bus'
      );
      updatedIds = [componentId, ...nonBus];
    } else {
      if (selectedComponentIds.includes(componentId)) {
        updatedIds = selectedComponentIds.filter((id) => id !== componentId);
      } else {
        updatedIds = [...selectedComponentIds, componentId];
      }
    }

    const updatedDesign = buildDesign(currentDesign.name, selectedScenario, selectedOrbit, updatedIds);
    const updatedLaunch = validateLaunchConfiguration(
      get().selectedVehicle,
      selectedOrbit,
      updatedDesign.resources.totalMassKg,
      selectedScenario.budgetMUSD,
      updatedDesign.resources.totalCostMUSD
    );

    set({
      selectedComponentIds: updatedIds,
      currentDesign: updatedDesign,
      launchConfig: updatedLaunch
    });

    if (activeRoom) {
      const currentRev = activeRoom.planningRevision ?? activeRoom.revision;
      updateDesignSocket(activeRoom.code, updatedDesign, currentRev, (res) => {
        if (res.success && res.data?.room) {
          get().setActiveRoom(res.data.room);
        } else if (!res.success) {
          if (res.data?.room) {
            get().setActiveRoom(res.data.room);
          } else {
            getMissionPlan(activeRoom.code, (planRes) => {
              if (planRes.success && planRes.data?.room) {
                get().setActiveRoom(planRes.data.room);
              }
            });
          }
        }
      });
    }
  },

  setDesignName: (name) => {
    const { currentDesign, activeRoom } = get();
    const updatedDesign = { ...currentDesign, name, updatedAt: new Date().toISOString() };
    set({ currentDesign: updatedDesign });
    if (activeRoom) {
      const currentRev = activeRoom.planningRevision ?? activeRoom.revision;
      updateDesignSocket(activeRoom.code, updatedDesign, currentRev, (res) => {
        if (res.success && res.data?.room) {
          get().setActiveRoom(res.data.room);
        } else if (!res.success) {
          if (res.data?.room) {
            get().setActiveRoom(res.data.room);
          } else {
            getMissionPlan(activeRoom.code, (planRes) => {
              if (planRes.success && planRes.data?.room) {
                get().setActiveRoom(planRes.data.room);
              }
            });
          }
        }
      });
    }
  },

  orbitProfiles: ORBIT_PROFILES,
  selectedOrbit: defaultOrbit,
  launchVehicles: LAUNCH_VEHICLES,
  selectedVehicle: defaultVehicle,
  launchConfig: initialLaunch,

  selectOrbit: (orbit) => {
    const { selectedVehicle, currentDesign, selectedScenario, activeRoom } = get();
    const updatedLaunch = validateLaunchConfiguration(
      selectedVehicle,
      orbit,
      currentDesign.resources.totalMassKg,
      selectedScenario.budgetMUSD,
      currentDesign.resources.totalCostMUSD
    );
    set({ selectedOrbit: orbit, launchConfig: updatedLaunch });
    if (activeRoom) {
      const currentRev = activeRoom.planningRevision ?? activeRoom.revision;
      configureLaunchSocket(activeRoom.code, updatedLaunch, currentRev, (res) => {
        if (res.success && res.data?.room) {
          get().setActiveRoom(res.data.room);
        } else if (!res.success) {
          if (res.data?.room) {
            get().setActiveRoom(res.data.room);
          } else {
            getMissionPlan(activeRoom.code, (planRes) => {
              if (planRes.success && planRes.data?.room) {
                get().setActiveRoom(planRes.data.room);
              }
            });
          }
        }
      });
    }
  },

  selectVehicle: (vehicle) => {
    const { selectedOrbit, currentDesign, selectedScenario, activeRoom } = get();
    const updatedLaunch = validateLaunchConfiguration(
      vehicle,
      selectedOrbit,
      currentDesign.resources.totalMassKg,
      selectedScenario.budgetMUSD,
      currentDesign.resources.totalCostMUSD
    );
    set({ selectedVehicle: vehicle, launchConfig: updatedLaunch });
    if (activeRoom) {
      const currentRev = activeRoom.planningRevision ?? activeRoom.revision;
      configureLaunchSocket(activeRoom.code, updatedLaunch, currentRev, (res) => {
        if (res.success && res.data?.room) {
          get().setActiveRoom(res.data.room);
        } else if (!res.success) {
          if (res.data?.room) {
            get().setActiveRoom(res.data.room);
          } else {
            getMissionPlan(activeRoom.code, (planRes) => {
              if (planRes.success && planRes.data?.room) {
                get().setActiveRoom(planRes.data.room);
              }
            });
          }
        }
      });
    }
  },

  recalculateDesign: () => {
    const { selectedScenario, selectedOrbit, selectedComponentIds, currentDesign } = get();
    const updatedDesign = buildDesign(currentDesign.name, selectedScenario, selectedOrbit, selectedComponentIds);
    set({ currentDesign: updatedDesign });
  },

  // Operations & Simulation
  simulationState: null,
  setSimulationState: (state) => set({ simulationState: state }),
  missionReport: null,
  setMissionReport: (report) => set({ missionReport: report }),

  resolveEventChoice: (eventId, choiceId) => {
    const { simulationState, activeRoom } = get();
    if (!simulationState) return;

    if (activeRoom) {
      submitEventChoiceSocket(activeRoom.code, eventId, choiceId);
    } else {
      // Local single player resolution
      const { nextState } = resolveMissionEvent(simulationState, eventId, choiceId);
      set({ simulationState: nextState });
    }
  },

  setSpeedMultiplier: (speed) => {
    const { simulationState } = get();
    if (simulationState) {
      set({ simulationState: { ...simulationState, speedMultiplier: speed } });
    }
  },

  togglePause: () => {
    const { simulationState } = get();
    if (simulationState) {
      set({ simulationState: { ...simulationState, isPaused: !simulationState.isPaused } });
    }
  },

  localTimer: null,
  startMissionLaunch: () => {
    const { currentDesign, selectedOrbit, selectedScenario, activeRoom, localTimer } = get();

    if (localTimer) {
      clearInterval(localTimer);
    }

    if (activeRoom) {
      startLaunchSocket(activeRoom.code);
      set({ activeTab: 'ops' });
      return;
    }

    // Single-player mode local simulation loop
    const initialState = createInitialSimulationState('SOLO-LOCAL', currentDesign, selectedOrbit);
    set({ simulationState: initialState, activeTab: 'ops', missionReport: null });

    const timer = setInterval(() => {
      const state = get().simulationState;
      if (!state) return;

      if (state.phase === 'MISSION_COMPLETE' || state.phase === 'MISSION_ABORTED') {
        clearInterval(timer);
        const report = generateMissionReport(state, selectedScenario, currentDesign, 'SOLO', ['Solo Flight Director']);
        set({ missionReport: report, localTimer: null });
        return;
      }

      const next = tickSimulation(state, currentDesign, selectedOrbit, MISSION_EVENTS, 1);
      set({ simulationState: next });
    }, 1000);

    set({ localTimer: timer });
  },

  // Multiplayer
  activeRoom: null,
  currentMemberId: null,
  resumeToken: null,
  currentRole: 'FLIGHT_DIRECTOR',
  allReady: false,
  chatMessages: [],
  setActiveRoom: (room) => {
    if (!room) {
      set({ activeRoom: null, allReady: false });
      return;
    }
    const currentRoom = get().activeRoom;
    if (currentRoom && room.code === currentRoom.code && room.revision < currentRoom.revision) {
      return; // Ignore stale snapshot
    }

    const memberId = get().currentMemberId;
    const self = room.members.find((m) => m.id === memberId);
    const connectedMembers = room.members.filter((m) => m.connected);
    const isAllReady = connectedMembers.length > 0 && connectedMembers.every((m) => m.isReady);

    const updates: Partial<GameState> = {
      activeRoom: room,
      allReady: isAllReady,
      currentRole: self ? self.role : get().currentRole
    };

    // Reconcile shared mission planning state from authoritative room snapshot
    if (room.scenarioId) {
      const matchedScenario = MISSION_SCENARIOS.find((s) => s.id === room.scenarioId);
      if (matchedScenario) {
        updates.selectedScenario = matchedScenario;
      }
    }

    if (room.design) {
      updates.currentDesign = room.design;
      if (room.design.selectedComponentIds) {
        updates.selectedComponentIds = room.design.selectedComponentIds;
      }
    }

    if (room.launchConfig) {
      updates.launchConfig = room.launchConfig;
      const matchedOrbit = ORBIT_PROFILES.find((o) => o.id === room.launchConfig?.orbitId);
      if (matchedOrbit) {
        updates.selectedOrbit = matchedOrbit;
      }
      const matchedVehicle = LAUNCH_VEHICLES.find((v) => v.id === room.launchConfig?.vehicleId);
      if (matchedVehicle) {
        updates.selectedVehicle = matchedVehicle;
      }
    }

    set(updates);
  },
  setCurrentMemberId: (id) => set({ currentMemberId: id }),
  setResumeToken: (token: string | null) => set({ resumeToken: token }),
  setCurrentRole: (role) => set({ currentRole: role }),
  setAllReady: (allReady: boolean) => set({ allReady }),
  addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages.slice(-40), msg] })),
  sendChat: (message) => {
    const { activeRoom, currentRole } = get();
    if (!message.trim()) return;
    if (activeRoom) {
      sendChatMessage(activeRoom.code, 'You', currentRole, message);
    } else {
      get().addChatMessage({
        id: `local-${Date.now()}`,
        sender: 'You (Flight Director)',
        role: currentRole,
        message,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  }
}));
