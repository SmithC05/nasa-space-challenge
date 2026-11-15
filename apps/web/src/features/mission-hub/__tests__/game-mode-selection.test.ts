import { describe, it, expect } from 'vitest';
import { MockMultiplayerService } from '../services/multiplayer-entry.mock';
import { ROLE_DEFINITIONS } from '../components/game-mode/TeamRoleCard';
import { EngineerRole } from '@orbital/contracts';

describe('Feature E: Game Mode Selection and Multiplayer Entry', () => {
  const service = new MockMultiplayerService();

  it('1. should define all 4 canonical engineer team roles without contract deviation', () => {
    const roles: EngineerRole[] = [
      'FLIGHT_DIRECTOR',
      'SYSTEMS_ENGINEER',
      'TRAJECTORY_SPECIALIST',
      'SCIENCE_LEAD'
    ];

    roles.forEach((r) => {
      const def = ROLE_DEFINITIONS[r];
      expect(def).toBeDefined();
      expect(def.title).toBeTruthy();
      expect(def.responsibility).toBeTruthy();
      expect(def.icon).toBeDefined();
    });
  });

  it('2. should verify single-player capability titles and role definitions', () => {
    expect(ROLE_DEFINITIONS.FLIGHT_DIRECTOR.title).toBe('Flight Director');
    expect(ROLE_DEFINITIONS.SYSTEMS_ENGINEER.title).toBe('Systems Engineer');
    expect(ROLE_DEFINITIONS.TRAJECTORY_SPECIALIST.title).toBe('Trajectory Specialist');
    expect(ROLE_DEFINITIONS.SCIENCE_LEAD.title).toBe('Science Lead');
  });

  it('3. should create a mission room and return explicit mock flag in demo mode', async () => {
    const result = await service.createMissionRoom({
      hostName: 'Cmdr Shepard',
      roomName: 'Artemis Squadron',
      role: 'FLIGHT_DIRECTOR',
      scenarioId: 'scenario-earth-sentinel'
    });

    expect(result.success).toBe(true);
    expect(result.isMock).toBe(true);
    expect(result.room).toBeDefined();
    expect(result.room?.code).toMatch(/^SIM-[A-Z0-9]{4}$/);
    expect(result.room?.members).toHaveLength(1);
    expect(result.room?.members[0].name).toBe('Cmdr Shepard');
    expect(result.room?.members[0].role).toBe('FLIGHT_DIRECTOR');
    expect(result.room?.scenarioId).toBe('scenario-earth-sentinel');
  });

  it('4. should join an existing mission room and preserve scenario context', async () => {
    // Create a room first
    const createRes = await service.createMissionRoom({
      hostName: 'Host Flight Director',
      roomName: 'Lunar Recon Alpha',
      role: 'FLIGHT_DIRECTOR',
      scenarioId: 'scenario-earth-sentinel'
    });
    const code = createRes.room!.code;

    // Join the room
    const joinRes = await service.joinMissionRoom({
      roomCode: code,
      name: 'Specialist Tali',
      role: 'SYSTEMS_ENGINEER'
    });

    expect(joinRes.success).toBe(true);
    expect(joinRes.room?.code).toBe(code);
    expect(joinRes.room?.members).toHaveLength(2);
    expect(joinRes.room?.members[1].name).toBe('Specialist Tali');
    expect(joinRes.room?.members[1].role).toBe('SYSTEMS_ENGINEER');
  });

  it('5. should reject room join when code format is too short or invalid', async () => {
    const failRes = await service.joinMissionRoom({
      roomCode: 'X',
      name: 'Rookie',
      role: 'SCIENCE_LEAD'
    });

    expect(failRes.success).toBe(false);
    expect(failRes.error).toContain('Invalid mission room code format');
  });

  it('6. should enforce team capacity limit of 4 players max per room', async () => {
    const room = await service.createMissionRoom({
      hostName: 'Captain 1',
      roomName: 'Full Squadron Test',
      role: 'FLIGHT_DIRECTOR',
      scenarioId: 'scenario-earth-sentinel'
    });
    const code = room.room!.code;

    // Add 2nd, 3rd, 4th players
    await service.joinMissionRoom({ roomCode: code, name: 'Eng 2', role: 'SYSTEMS_ENGINEER' });
    await service.joinMissionRoom({ roomCode: code, name: 'Nav 3', role: 'TRAJECTORY_SPECIALIST' });
    await service.joinMissionRoom({ roomCode: code, name: 'Sci 4', role: 'SCIENCE_LEAD' });

    // Try to add 5th player (should fail due to 4-player capacity cap)
    const fifthJoin = await service.joinMissionRoom({
      roomCode: code,
      name: 'Extra 5',
      role: 'SYSTEMS_ENGINEER'
    });

    expect(fifthJoin.success).toBe(false);
    expect(fifthJoin.error).toContain('maximum capacity (4/4');
  });
});

