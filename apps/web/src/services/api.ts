import {
  ComponentDefinition,
  LaunchConfiguration,
  LaunchVehicle,
  MissionReport,
  MissionScenario,
  OrbitProfile,
  SpacecraftDesign
} from '@orbital/contracts';
import {
  LAUNCH_VEHICLES,
  MISSION_SCENARIOS,
  ORBIT_PROFILES,
  SPACECRAFT_COMPONENTS
} from '@orbital/game-data';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function fetchHealth(): Promise<{ status: string; database?: string }> {
  try {
    const res = await fetch(`${API_URL}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', database: 'unavailable' };
  }
}

export async function fetchScenarios(): Promise<MissionScenario[]> {
  try {
    const res = await fetch(`${API_URL}/api/scenarios`);
    if (!res.ok) throw new Error('Failed to fetch scenarios');
    return await res.json();
  } catch (err) {
    console.warn('Using offline scenario data:', err);
    return MISSION_SCENARIOS;
  }
}

export async function fetchComponents(): Promise<ComponentDefinition[]> {
  try {
    const res = await fetch(`${API_URL}/api/components`);
    if (!res.ok) throw new Error('Failed to fetch components');
    return await res.json();
  } catch (err) {
    return SPACECRAFT_COMPONENTS;
  }
}

export async function fetchOrbits(): Promise<OrbitProfile[]> {
  try {
    const res = await fetch(`${API_URL}/api/orbits`);
    if (!res.ok) throw new Error('Failed to fetch orbits');
    return await res.json();
  } catch (err) {
    return ORBIT_PROFILES;
  }
}

export async function fetchLaunchVehicles(): Promise<LaunchVehicle[]> {
  try {
    const res = await fetch(`${API_URL}/api/orbits/vehicles`);
    if (!res.ok) throw new Error('Failed to fetch vehicles');
    return await res.json();
  } catch (err) {
    return LAUNCH_VEHICLES;
  }
}

export async function saveDesign(design: SpacecraftDesign): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/designs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ design })
    });
    return res.ok;
  } catch (err) {
    console.warn('Design save error:', err);
    return false;
  }
}

export async function saveMissionReport(report: MissionReport): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report })
    });
    return res.ok;
  } catch (err) {
    console.warn('Report save error:', err);
    return false;
  }
}
