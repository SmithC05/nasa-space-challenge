import React, { useState } from 'react';
import { LandingNavigation } from '../components/LandingNavigation';
import { LandingHero } from '../components/LandingHero';
import { SecondaryEntryCards } from '../components/SecondaryEntryCards';
import { LearningCenterModal } from '../components/LearningCenterModal';
import { MissionScenario } from '@orbital/contracts';

interface LandingPageProps {
  onStartMission: () => void;
  onOpenMultiplayer: () => void;
  onOpenMissionGallery: () => void;
  scenarios: MissionScenario[];
  hasResumableMission: boolean;
  onResumeMission: () => void;
  activeScenarioCode?: string;
}

export function LandingPage({
  onStartMission,
  onOpenMultiplayer,
  onOpenMissionGallery,
  scenarios,
  hasResumableMission,
  onResumeMission,
  activeScenarioCode
}: LandingPageProps) {
  const [learningModalOpen, setLearningModalOpen] = useState(false);

  return (
    <div className="relative z-10 space-y-8 animate-fadeIn">
      {/* 1. Landing Navigation */}
      <LandingNavigation
        activeView="landing"
        onNavigateHome={() => {
          // Already home
        }}
        onNavigateMissions={onStartMission}
        onOpenLearning={() => setLearningModalOpen(true)}
        onNavigateMultiplayer={onOpenMultiplayer}
        hasResumableMission={hasResumableMission}
        onResumeMission={onResumeMission}
      />

      {/* 2. Main Cinematic Hero */}
      <LandingHero
        onStartMission={onStartMission}
        onOpenMultiplayer={onOpenMultiplayer}
        hasResumableMission={hasResumableMission}
        onResumeMission={onResumeMission}
        activeScenarioCode={activeScenarioCode}
      />

      {/* 3. Secondary Feature Entry Cards */}
      <SecondaryEntryCards
        onOpenMissionGallery={onOpenMissionGallery}
        onOpenLearningCenter={() => setLearningModalOpen(true)}
        scenarios={scenarios}
      />

      {/* 4. Aerospace Science Learning Modal */}
      <LearningCenterModal
        isOpen={learningModalOpen}
        onClose={() => setLearningModalOpen(false)}
        onExploreMissions={() => {
          setLearningModalOpen(false);
          onStartMission();
        }}
      />
    </div>
  );
}

