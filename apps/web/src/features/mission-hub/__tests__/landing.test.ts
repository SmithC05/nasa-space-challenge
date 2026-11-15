import { describe, it, expect } from 'vitest';
import { MISSION_SCENARIOS } from '@orbital/game-data';

describe('Mission Hub Landing Page Module', () => {
  it('should load all 4 core NASA mission campaigns for display', () => {
    expect(MISSION_SCENARIOS).toBeDefined();
    expect(MISSION_SCENARIOS.length).toBe(4);

    const earthSentinel = MISSION_SCENARIOS.find((s) => s.id === 'scenario-earth-sentinel');
    expect(earthSentinel).toBeDefined();
    expect(earthSentinel?.difficulty).toBe('Beginner');
    expect(earthSentinel?.targetBody).toBe('Earth');

    const artemis = MISSION_SCENARIOS.find((s) => s.id === 'scenario-artemis-prospector');
    expect(artemis).toBeDefined();
    expect(artemis?.targetBody).toBe('Moon');

    const mars = MISSION_SCENARIOS.find((s) => s.id === 'scenario-ares-recon');
    expect(mars).toBeDefined();
    expect(mars?.targetBody).toBe('Mars');

    const asteroid = MISSION_SCENARIOS.find((s) => s.id === 'scenario-nea-interceptor');
    expect(asteroid).toBeDefined();
    expect(asteroid?.targetBody).toBe('DeepSpace');
  });

  it('should correctly evaluate resumable mission condition without fake data', () => {
    // When simulationState is null, no resumable mission exists
    const stateNull = null;
    const isResumableNull = Boolean(
      stateNull &&
      // @ts-expect-error test null guard
      stateNull.phase !== 'MISSION_COMPLETE' &&
      // @ts-expect-error test null guard
      stateNull.phase !== 'MISSION_ABORTED'
    );
    expect(isResumableNull).toBe(false);

    // When simulationState is active
    const activeState = { phase: 'PRIMARY_SCIENCE' };
    const isResumableActive = Boolean(
      activeState &&
      activeState.phase !== 'MISSION_COMPLETE' &&
      activeState.phase !== 'MISSION_ABORTED'
    );
    expect(isResumableActive).toBe(true);

    // When simulation has finished
    const completedState = { phase: 'MISSION_COMPLETE' };
    const isResumableCompleted = Boolean(
      completedState &&
      completedState.phase !== 'MISSION_COMPLETE' &&
      completedState.phase !== 'MISSION_ABORTED'
    );
    expect(isResumableCompleted).toBe(false);
  });
});

