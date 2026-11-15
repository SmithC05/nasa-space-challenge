export type LearningConceptId =
  | 'earth-observation'
  | 'orbital-selection'
  | 'scientific-instruments'
  | 'payload-capacity'
  | 'space-communication';

export type LearningCategory =
  | 'Space Science'
  | 'Orbital Mechanics'
  | 'Spacecraft Engineering'
  | 'Space Communication';

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface LearningConcept {
  id: LearningConceptId;
  title: string;
  category: LearningCategory;
  shortExplanation: string;
  whyItMatters: string;
  connectionToOrbital: string;
  expandedPoints: string[];
  keyTerms: KeyTerm[];
  relatedConcepts: LearningConceptId[];
}

