import { describe, it, expect } from 'vitest';
import {
  LEARNING_CONCEPTS,
  getLearningConcept,
  getAllLearningConcepts,
  getLearningConceptsByCategory
} from '../data/learning-content';
import { LearningConceptId } from '../types/learning.types';

describe('Feature D: Mission Information and Learning System', () => {
  const expectedConceptIds: LearningConceptId[] = [
    'earth-observation',
    'orbital-selection',
    'scientific-instruments',
    'payload-capacity',
    'space-communication'
  ];

  it('1. should define all five required educational concepts', () => {
    const all = getAllLearningConcepts();
    expect(all).toHaveLength(5);
    expectedConceptIds.forEach((id) => {
      expect(LEARNING_CONCEPTS[id]).toBeDefined();
    });
  });

  it('2. should verify Concept 01 (Earth Observation) specifications', () => {
    const concept = getLearningConcept('earth-observation');
    expect(concept.title).toBe('WHAT IS EARTH OBSERVATION?');
    expect(concept.category).toBe('Space Science');
    expect(concept.shortExplanation).toContain('collecting information about our planet using satellites');
    expect(concept.whyItMatters).toContain('observe large regions of Earth repeatedly');
    expect(concept.connectionToOrbital).toContain('Earth Sentinel');
    expect(concept.expandedPoints.length).toBeGreaterThanOrEqual(4);
    expect(concept.keyTerms.length).toBeGreaterThanOrEqual(2);
  });

  it('3. should verify Concept 02 (Orbital Selection) specifications', () => {
    const concept = getLearningConcept('orbital-selection');
    expect(concept.title).toBe('WHY DOES ORBITAL SELECTION MATTER?');
    expect(concept.category).toBe('Orbital Mechanics');
    expect(concept.shortExplanation).toContain('path a spacecraft follows around a celestial body');
    expect(concept.whyItMatters).toContain('Different orbits provide different observation opportunities');
    expect(concept.connectionToOrbital).toContain('Earth Sentinel');
    expect(concept.expandedPoints.some((p) => p.includes('Sun-Synchronous Orbit'))).toBe(true);
  });

  it('4. should verify Concept 03 (Scientific Instruments) specifications', () => {
    const concept = getLearningConcept('scientific-instruments');
    expect(concept.title).toBe('WHAT ARE SCIENTIFIC INSTRUMENTS?');
    expect(concept.category).toBe('Spacecraft Engineering');
    expect(concept.shortExplanation).toContain('devices installed on spacecraft to collect information');
    expect(concept.whyItMatters).toContain('Different instruments measure different things');
    expect(concept.connectionToOrbital).toContain('optical camera');
    expect(concept.expandedPoints.some((p) => p.includes('Synthetic Aperture Radar'))).toBe(true);
  });

  it('5. should verify Concept 04 (Payload Capacity) specifications', () => {
    const concept = getLearningConcept('payload-capacity');
    expect(concept.title).toBe('WHAT DOES PAYLOAD CAPACITY MEAN?');
    expect(concept.category).toBe('Spacecraft Engineering');
    expect(concept.shortExplanation).toContain('useful equipment or cargo that a launch vehicle or spacecraft can carry');
    expect(concept.whyItMatters).toContain('Spacecraft have mass limits');
    expect(concept.connectionToOrbital).toContain('Earth Sentinel');
    expect(concept.expandedPoints.some((p) => p.includes('Launch capacity'))).toBe(true);
  });

  it('6. should verify Concept 05 (Space Communication) specifications', () => {
    const concept = getLearningConcept('space-communication');
    expect(concept.title).toBe('WHY DOES SPACE COMMUNICATION MATTER?');
    expect(concept.category).toBe('Space Communication');
    expect(concept.shortExplanation).toContain('communication systems to send information to Earth');
    expect(concept.whyItMatters).toContain('Scientific observations are useful only when the collected information can be delivered');
    expect(concept.connectionToOrbital).toContain('ground stations on Earth');
    expect(concept.expandedPoints.some((p) => p.includes('Downlink'))).toBe(true);
  });

  it('7. should ensure all related concepts reference valid concept IDs', () => {
    getAllLearningConcepts().forEach((concept) => {
      concept.relatedConcepts.forEach((relId) => {
        expect(LEARNING_CONCEPTS[relId]).toBeDefined();
        expect(relId).not.toBe(concept.id);
      });
    });
  });

  it('8. should filter concepts accurately by category', () => {
    const science = getLearningConceptsByCategory('Space Science');
    expect(science).toHaveLength(1);
    expect(science[0].id).toBe('earth-observation');

    const orbital = getLearningConceptsByCategory('Orbital Mechanics');
    expect(orbital).toHaveLength(1);
    expect(orbital[0].id).toBe('orbital-selection');

    const engineering = getLearningConceptsByCategory('Spacecraft Engineering');
    expect(engineering).toHaveLength(2);

    const comms = getLearningConceptsByCategory('Space Communication');
    expect(comms).toHaveLength(1);
    expect(comms[0].id).toBe('space-communication');
  });
});

