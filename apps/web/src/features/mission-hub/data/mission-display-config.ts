import { MissionDifficulty, TargetBody } from '@orbital/contracts';

export type CampaignAvailability = 'AVAILABLE' | 'COMING_SOON';

export interface CampaignDisplayConfig {
  scenarioId: string;
  code: string;
  displayTitle: string;
  tagline: string;
  scientificObjective: string;
  displayDifficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  destination: 'EARTH' | 'MOON' | 'MARS' | 'DEEP SPACE';
  estimatedPlaytime: string;
  primaryChallenges: string[];
  availability: CampaignAvailability;
  artworkUrl: string;
  accentColor: string;
}

/**
 * UI Presentation overrides mapping canonical scenario IDs from @orbital/game-data
 * to user-approved display names, objectives, and availability statuses for Feature B.
 */
export const CAMPAIGN_DISPLAY_CONFIGS: Record<string, CampaignDisplayConfig> = {
  'scenario-earth-sentinel': {
    scenarioId: 'scenario-earth-sentinel',
    code: 'OPS-2601',
    displayTitle: 'EARTH SENTINEL',
    tagline: 'PROTECT OUR PLANET',
    scientificObjective:
      'Design an Earth-observation spacecraft to monitor environmental conditions and identify wildfire-affected regions.',
    displayDifficulty: 'BEGINNER',
    destination: 'EARTH',
    estimatedPlaytime: '15 – 20 MIN PLAYTIME',
    primaryChallenges: [
      'Scientific instrument selection',
      'Earth observation coverage',
      'Data collection and communication'
    ],
    availability: 'AVAILABLE',
    artworkUrl:
      'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
    accentColor: 'from-emerald-500/20 to-cyan-500/10'
  },
  'scenario-artemis-prospector': {
    scenarioId: 'scenario-artemis-prospector',
    code: 'LUNAR-2604',
    displayTitle: 'LUNAR FRONTIER',
    tagline: 'EXPLORE THE MOON',
    scientificObjective:
      'Design a mission to investigate potential water deposits near the lunar south pole.',
    displayDifficulty: 'INTERMEDIATE',
    destination: 'MOON',
    estimatedPlaytime: '25 – 30 MIN PLAYTIME',
    primaryChallenges: [
      'Lunar exploration',
      'Environmental and power constraints',
      'Scientific measurement planning'
    ],
    availability: 'COMING_SOON',
    artworkUrl:
      'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=1200&q=80',
    accentColor: 'from-sky-500/20 to-blue-500/10'
  },
  'scenario-ares-recon': {
    scenarioId: 'scenario-ares-recon',
    code: 'MARS-2609',
    displayTitle: 'MARS ODYSSEY',
    tagline: 'DISCOVER THE RED PLANET',
    scientificObjective:
      'Create an interplanetary mission to investigate the Martian environment.',
    displayDifficulty: 'ADVANCED',
    destination: 'MARS',
    estimatedPlaytime: '35 – 45 MIN PLAYTIME',
    primaryChallenges: [
      'Interplanetary mission planning',
      'Communication limitations',
      'Propulsion and mission reliability'
    ],
    availability: 'COMING_SOON',
    artworkUrl:
      'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
    accentColor: 'from-amber-500/20 to-rose-500/10'
  },
  'scenario-nea-interceptor': {
    scenarioId: 'scenario-nea-interceptor',
    code: 'DEF-2612',
    displayTitle: 'ASTEROID WATCH',
    tagline: 'INVESTIGATE SPACE ROCKS',
    scientificObjective:
      'Design a spacecraft to study a near-Earth asteroid.',
    displayDifficulty: 'ADVANCED',
    destination: 'DEEP SPACE',
    estimatedPlaytime: '45 – 60 MIN PLAYTIME',
    primaryChallenges: [
      'Spacecraft navigation',
      'Trajectory planning',
      'Propulsion and rendezvous concepts'
    ],
    availability: 'COMING_SOON',
    artworkUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    accentColor: 'from-purple-500/20 to-indigo-500/10'
  }
};

/**
 * Returns the presentation configuration for a given scenario ID,
 * falling back to sensible defaults if unmatched.
 */
export function getCampaignDisplayConfig(scenarioId: string): CampaignDisplayConfig {
  return (
    CAMPAIGN_DISPLAY_CONFIGS[scenarioId] || {
      scenarioId,
      code: 'OPS-DEMO',
      displayTitle: 'MISSION CAMPAIGN',
      tagline: 'EXPLORE SPACE',
      scientificObjective: 'Conduct planetary scientific exploration.',
      displayDifficulty: 'BEGINNER',
      destination: 'EARTH',
      estimatedPlaytime: '20 MIN PLAYTIME',
      primaryChallenges: ['Scientific payloads', 'Orbital planning'],
      availability: 'COMING_SOON',
      artworkUrl:
        'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
      accentColor: 'from-cyan-500/20 to-blue-500/10'
    }
  );
}

