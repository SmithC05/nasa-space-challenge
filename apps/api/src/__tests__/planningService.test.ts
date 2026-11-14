import { beforeEach, describe, expect, it } from 'vitest';
import { RoomService } from '../services/roomService';
import { MISSION_SCENARIOS, ORBIT_PROFILES, LAUNCH_VEHICLES } from '@orbital/game-data';

describe('Phase 2: Collaborative Mission Planning (Unit Tests)', () => {
  let roomService: RoomService;

  beforeEach(() => {
    roomService = new RoomService(60000);
  });

  describe('1. Initial Planning State', () => {
    it('creates room with complete authoritative baseline planning state', async () => {
      const { room, session } = await roomService.createRoom('Gene Kranz', 'Apollo Test');

      expect(room.scenarioId).toBe('scenario-earth-sentinel');
      expect(room.design).not.toBeNull();
      expect(room.design?.scenarioId).toBe('scenario-earth-sentinel');
      expect(room.design?.selectedComponentIds.length).toBeGreaterThan(0);
      expect(room.design?.resources.totalMassKg).toBeGreaterThan(0);
      expect(room.launchConfig).not.toBeNull();
      expect(room.launchConfig?.spacecraftMassKg).toBe(room.design?.resources.totalMassKg);
      expect(room.revision).toBe(1);
      expect(room.lastUpdatedBy).toBeDefined();
    });

    it('supplies new joiners and reconnecting members with the latest authoritative snapshot', async () => {
      const { room: created, session: hostSession } = await roomService.createRoom('Host', 'Sync Room');

      // Update scenario as host (FLIGHT_DIRECTOR)
      const secondScenario = MISSION_SCENARIOS[1];
      await roomService.updateScenario(created.code, hostSession.memberId, secondScenario.id, created.revision);

      // Join new member
      const { room: joined } = await roomService.joinRoom(created.code, 'Crew Member', 'SCIENCE_LEAD');

      expect(joined.scenarioId).toBe(secondScenario.id);
      expect(joined.design?.scenarioId).toBe(secondScenario.id);
      expect(joined.revision).toBe(3); // create=1, updateScenario=2, joinRoom=3
    });
  });

  describe('2. Role-Based Authorization', () => {
    it('allows SCIENCE_LEAD and FLIGHT_DIRECTOR to update scenario, rejects others', async () => {
      const { room, session: hostSession } = await roomService.createRoom('Flight Dir', 'Auth Room');
      const { session: scienceLead } = await roomService.joinRoom(room.code, 'Science Officer', 'SCIENCE_LEAD');
      const { session: trajectorySpec } = await roomService.joinRoom(room.code, 'Navigator', 'TRAJECTORY_SPECIALIST');

      const targetScenario = MISSION_SCENARIOS[2];

      // Trajectory specialist cannot change scenario
      await expect(
        roomService.updateScenario(room.code, trajectorySpec.memberId, targetScenario.id, room.planningRevision)
      ).rejects.toMatchObject({
        code: 'FORBIDDEN'
      });

      // Science lead CAN change scenario
      const res1 = await roomService.updateScenario(room.code, scienceLead.memberId, targetScenario.id, room.planningRevision);
      expect(res1.room.scenarioId).toBe(targetScenario.id);

      // Flight Director CAN also change scenario
      const nextScenario = MISSION_SCENARIOS[0];
      const res2 = await roomService.updateScenario(room.code, hostSession.memberId, nextScenario.id, res1.room.planningRevision);
      expect(res2.room.scenarioId).toBe(nextScenario.id);
    });

    it('allows SYSTEMS_ENGINEER and FLIGHT_DIRECTOR to update spacecraft design, rejects others', async () => {
      const { room, session: hostSession } = await roomService.createRoom('Flight Dir', 'Design Auth');
      const { session: systemsEng } = await roomService.joinRoom(room.code, 'Systems Chief', 'SYSTEMS_ENGINEER');
      const { session: scienceLead } = await roomService.joinRoom(room.code, 'Biologist', 'SCIENCE_LEAD');

      const newComponentIds = [
        'bus-smallsat-standard',
        'power-solar-standard-wings',
        'power-batt-li-ion',
        'comms-omni-patch'
      ];

      // Science lead cannot modify spacecraft design
      await expect(
        roomService.updateDesign(room.code, scienceLead.memberId, { selectedComponentIds: newComponentIds }, room.planningRevision)
      ).rejects.toMatchObject({
        code: 'FORBIDDEN'
      });

      // Systems engineer can update design
      const res = await roomService.updateDesign(
        room.code,
        systemsEng.memberId,
        { selectedComponentIds: newComponentIds, name: 'Enhanced Orbiter' },
        room.planningRevision
      );
      expect(res.room.design?.name).toBe('Enhanced Orbiter');
      expect(res.room.design?.selectedComponentIds).toEqual(newComponentIds);
    });

    it('allows TRAJECTORY_SPECIALIST and FLIGHT_DIRECTOR to update launch configuration, rejects others', async () => {
      const { room, session: hostSession } = await roomService.createRoom('Flight Dir', 'Launch Auth');
      const { session: systemsEng } = await roomService.joinRoom(room.code, 'Engineer', 'SYSTEMS_ENGINEER');
      const { session: trajectorySpec } = await roomService.joinRoom(room.code, 'Pilot', 'TRAJECTORY_SPECIALIST');

      const targetOrbit = ORBIT_PROFILES[2]; // GTO
      const targetVehicle = LAUNCH_VEHICLES[2]; // Atlas-V Heavy

      // Systems engineer cannot update launch config
      await expect(
        roomService.updateLaunchConfig(
          room.code,
          systemsEng.memberId,
          { vehicleId: targetVehicle.id, orbitId: targetOrbit.id },
          room.planningRevision
        )
      ).rejects.toMatchObject({
        code: 'FORBIDDEN'
      });

      // Trajectory specialist can update launch config
      const res = await roomService.updateLaunchConfig(
        room.code,
        trajectorySpec.memberId,
        { vehicleId: targetVehicle.id, orbitId: targetOrbit.id },
        room.planningRevision
      );
      expect(res.room.launchConfig?.vehicleId).toBe(targetVehicle.id);
      expect(res.room.launchConfig?.orbitId).toBe(targetOrbit.id);
    });
  });

  describe('3. Revision Control & Conflict Handling', () => {
    it('accepts matching baseRevision and increments revision monotonically', async () => {
      const { room, session } = await roomService.createRoom('Host', 'Rev Room');
      expect(room.planningRevision).toBe(1);

      const targetScenario = MISSION_SCENARIOS[1];
      const res = await roomService.updateScenario(room.code, session.memberId, targetScenario.id, room.planningRevision);

      expect(res.room.planningRevision).toBe(2);
      expect(res.room.scenarioId).toBe(targetScenario.id);
    });

    it('rejects stale baseRevision with REVISION_CONFLICT and returns latest snapshot', async () => {
      const { room, session: hostSession } = await roomService.createRoom('Host', 'Conflict Room');
      const { session: systemsEng } = await roomService.joinRoom(room.code, 'Engineer', 'SYSTEMS_ENGINEER');

      // First update brings planning revision to 2
      const firstUpdate = await roomService.updateScenario(
        room.code,
        hostSession.memberId,
        MISSION_SCENARIOS[1].id,
        room.planningRevision
      );
      expect(firstUpdate.room.planningRevision).toBe(2);

      // Competing update attempts change based on stale revision 1
      try {
        await roomService.updateDesign(
          room.code,
          systemsEng.memberId,
          { selectedComponentIds: ['bus-smallsat-standard', 'comms-ka-dish'] },
          1 // stale revision!
        );
        expect.unreachable('Should have thrown REVISION_CONFLICT');
      } catch (err: any) {
        expect(err.code).toBe('REVISION_CONFLICT');
        expect(err.currentSnapshot).toBeDefined();
        expect(err.currentSnapshot.planningRevision).toBe(2);
      }
    });

    it('handles idempotent duplicate requests with requestId', async () => {
      const { room, session } = await roomService.createRoom('Host', 'Idempotent Room');
      const targetScenario = MISSION_SCENARIOS[1];
      const reqId = 'req-12345';

      const firstCall = await roomService.updateScenario(
        room.code,
        session.memberId,
        targetScenario.id,
        room.planningRevision,
        reqId
      );
      expect(firstCall.isMaterialChange).toBe(true);
      expect(firstCall.room.planningRevision).toBe(2);

      // Duplicate request retry
      const secondCall = await roomService.updateScenario(
        room.code,
        session.memberId,
        targetScenario.id,
        2,
        reqId
      );
      expect(secondCall.isMaterialChange).toBe(false);
      expect(secondCall.room.planningRevision).toBe(2); // no extra revision increment
    });
  });

  describe('4. Readiness Invalidation on Material Change', () => {
    it('resets readiness of all members when a material planning change occurs', async () => {
      const { room, session: hostSession } = await roomService.createRoom('Host', 'Ready Room');
      const { session: crewSession } = await roomService.joinRoom(room.code, 'Crew', 'SCIENCE_LEAD');

      // Both mark ready
      roomService.setMemberReady(room.code, hostSession.memberId, true);
      roomService.setMemberReady(room.code, crewSession.memberId, true);

      const beforeUpdate = roomService.getRoomSnapshot(room.code)!;
      expect(beforeUpdate.members.every((m) => m.isReady)).toBe(true);

      // Material change: change scenario
      const { room: afterUpdate } = await roomService.updateScenario(
        room.code,
        hostSession.memberId,
        MISSION_SCENARIOS[1].id,
        beforeUpdate.planningRevision
      );

      // Readiness must be reset for all members
      expect(afterUpdate.members.every((m) => !m.isReady)).toBe(true);
    });

    it('allows participants to mark ready again in MISSION_SETUP after planning changes', async () => {
      // 1. Create a room
      const { room, session: hostSession } = await roomService.createRoom('Flight Lead', 'Mission Setup Room');
      const { session: crewSession } = await roomService.joinRoom(room.code, 'Crew Specialist', 'SCIENCE_LEAD');

      // Both ready in LOBBY and host advances to MISSION_SETUP
      roomService.setMemberReady(room.code, hostSession.memberId, true);
      roomService.setMemberReady(room.code, crewSession.memberId, true);
      const advanced = roomService.advanceLobby(room.code, hostSession.memberId);
      expect(advanced.room.status).toBe('MISSION_SETUP');

      // 3. Make a material planning update
      const targetScenario = MISSION_SCENARIOS[1];
      const { room: updatedRoom } = await roomService.updateScenario(
        room.code,
        crewSession.memberId,
        targetScenario.id,
        advanced.room.planningRevision
      );

      // 4. Confirm every participant becomes unready
      expect(updatedRoom.members.every((m) => !m.isReady)).toBe(true);

      // 5. Allow each participant to become ready again in MISSION_SETUP
      const hostReady = roomService.setMemberReady(room.code, hostSession.memberId, true);
      expect(hostReady.allReady).toBe(false);
      expect(hostReady.member.isReady).toBe(true);

      const crewReady = roomService.setMemberReady(room.code, crewSession.memberId, true);
      expect(crewReady.member.isReady).toBe(true);

      // 6. Confirm all-ready status is calculated correctly
      expect(crewReady.allReady).toBe(true);
      const finalSnapshot = roomService.getRoomSnapshot(room.code)!;
      expect(finalSnapshot.members.every((m) => m.isReady)).toBe(true);
    });

    it('does NOT reset readiness if the update is a no-op', async () => {
      const { room, session: hostSession } = await roomService.createRoom('Host', 'NoOp Room');
      roomService.setMemberReady(room.code, hostSession.memberId, true);

      const beforeSnapshot = roomService.getRoomSnapshot(room.code)!;
      expect(beforeSnapshot.members[0].isReady).toBe(true);

      // Re-selecting the exact same scenario
      const res = await roomService.updateScenario(
        room.code,
        hostSession.memberId,
        beforeSnapshot.scenarioId!,
        beforeSnapshot.planningRevision
      );

      expect(res.isMaterialChange).toBe(false);
      expect(res.room.members[0].isReady).toBe(true);
      expect(res.room.planningRevision).toBe(beforeSnapshot.planningRevision);
    });
  });

  describe('5. Spacecraft Bus Validation (Exactly One Bus)', () => {
    it('accepts valid configuration with exactly one bus', async () => {
      const { room, session } = await roomService.createRoom('Host', 'Bus Valid');
      const validComponents = [
        'bus-smallsat-standard',
        'power-solar-standard-wings',
        'power-batt-li-ion'
      ];

      const res = await roomService.updateDesign(
        room.code,
        session.memberId,
        { selectedComponentIds: validComponents, busId: 'bus-smallsat-standard' },
        room.planningRevision
      );

      expect(res.room.design?.busId).toBe('bus-smallsat-standard');
      expect(res.room.design?.selectedComponentIds).toContain('bus-smallsat-standard');
      expect(res.room.design?.resources.totalMassKg).toBeGreaterThan(0);
    });

    it('rejects spacecraft configuration missing a bus', async () => {
      const { room, session } = await roomService.createRoom('Host', 'Bus Missing');
      const missingBus = ['power-solar-standard-wings', 'power-batt-li-ion'];

      await expect(
        roomService.updateDesign(
          room.code,
          session.memberId,
          { selectedComponentIds: missingBus },
          room.planningRevision
        )
      ).rejects.toMatchObject({
        code: 'MISSING_BUS'
      });
    });

    it('rejects invalid or non-existent bus ID', async () => {
      const { room, session } = await roomService.createRoom('Host', 'Bus Invalid ID');
      const components = ['bus-smallsat-standard', 'power-batt-li-ion'];

      await expect(
        roomService.updateDesign(
          room.code,
          session.memberId,
          { selectedComponentIds: components, busId: 'bogus-bus-id-999' },
          room.planningRevision
        )
      ).rejects.toMatchObject({
        code: 'INVALID_BUS_ID'
      });
    });

    it('rejects busId not included in selectedComponentIds', async () => {
      const { room, session } = await roomService.createRoom('Host', 'Bus Not Selected');
      const components = ['bus-smallsat-standard', 'power-batt-li-ion'];

      await expect(
        roomService.updateDesign(
          room.code,
          session.memberId,
          { selectedComponentIds: components, busId: 'bus-deepspace-heavy' },
          room.planningRevision
        )
      ).rejects.toMatchObject({
        code: 'BUS_NOT_SELECTED'
      });
    });

    it('rejects conflicting multiple-bus selections', async () => {
      const { room, session } = await roomService.createRoom('Host', 'Bus Multiple');
      const multipleBuses = [
        'bus-smallsat-standard',
        'bus-deepspace-heavy',
        'power-solar-standard-wings'
      ];

      await expect(
        roomService.updateDesign(
          room.code,
          session.memberId,
          { selectedComponentIds: multipleBuses },
          room.planningRevision
        )
      ).rejects.toMatchObject({
        code: 'MULTIPLE_BUSES'
      });
    });
  });

  describe('6. Idempotency and Role Authorization Boundary', () => {
    it('ensures idempotency cannot bypass role authorization', async () => {
      const { room, session: hostSession } = await roomService.createRoom('Flight Dir', 'Idempotency Auth');
      const { session: scienceSession } = await roomService.joinRoom(room.code, 'Science', 'SCIENCE_LEAD');

      const reqId = 'shared-request-id-123';

      // 1. Host performs valid update with reqId
      const hostRes = await roomService.updateScenario(
        room.code,
        hostSession.memberId,
        MISSION_SCENARIOS[1].id,
        room.planningRevision,
        reqId
      );
      expect(hostRes.room.scenarioId).toBe(MISSION_SCENARIOS[1].id);

      // 2. Science lead (who cannot update launch configuration) tries to replay reqId on launch update
      await expect(
        roomService.updateLaunchConfig(
          room.code,
          scienceSession.memberId,
          { vehicleId: LAUNCH_VEHICLES[0].id, orbitId: ORBIT_PROFILES[0].id },
          hostRes.room.planningRevision,
          reqId
        )
      ).rejects.toMatchObject({
        code: 'FORBIDDEN'
      });
    });
  });
});
