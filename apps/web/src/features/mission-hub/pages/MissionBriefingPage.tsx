import React, { useState } from 'react';
import { MissionScenario } from '@orbital/contracts';
import { getCampaignDisplayConfig } from '../data/mission-display-config';
import { LearningConceptId } from '../types/learning.types';
import { MissionOverview } from '../components/briefing/MissionOverview';
import { BriefingActions } from '../components/briefing/BriefingActions';
import { LearningDrawer } from '../components/learning/LearningDrawer';
import { ChevronLeft } from 'lucide-react';

interface MissionBriefingPageProps {
  scenario: MissionScenario;
  onBackToSelection: () => void;
  onProceedToLab: () => void;
  onOpenMultiplayer: () => void;
}

export function MissionBriefingPage({
  scenario,
  onBackToSelection,
  onProceedToLab,
  onOpenMultiplayer
}: MissionBriefingPageProps) {
  const [activeConceptId, setActiveConceptId] = useState<LearningConceptId | null>(null);
  const config = getCampaignDisplayConfig(scenario.id);
  const isAvailable = config.availability === 'AVAILABLE';

  const handleProceed = () => {
    if (!isAvailable) return;
    onProceedToLab();
  };

  return (
    <div className="relative z-10 space-y-8 animate-fadeIn pb-24">
      {/* 1. Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBackToSelection}
            className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-mono font-bold rounded-xl bg-space-900/90 text-slate-300 border border-slate-700 hover:text-white hover:border-cyan-500/60 hover:bg-space-850 transition-all shadow-md group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>RETURN TO MISSION SELECTION</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[9px] rounded bg-space-950 border border-slate-700 text-slate-400">⌫</kbd>
          </button>
          <span className="hidden sm:inline-flex px-3 py-1 text-xs font-mono font-bold rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
            AEROSPACE BRIEFING DOSSIER
          </span>
        </div>

        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-space-950 text-slate-400 border border-slate-800">
          STEP 1 // PRE-FLIGHT BRIEFING
        </span>
      </div>

      {/* 2. Scientific Mission Overview with 3D Globe & Side Telemetry Specs */}
      <MissionOverview
        scenario={scenario}
        onOpenConcept={(id) => setActiveConceptId(id)}
      />

      {/* 3. Bottom Sticky Primary Action Bar */}
      <BriefingActions
        isAvailable={isAvailable}
        campaignTitle={config.displayTitle}
        onBackToSelection={onBackToSelection}
        onProceedToLab={handleProceed}
        onOpenMultiplayer={onOpenMultiplayer}
      />

      {/* Contextual Concept Learning Drawer */}
      <LearningDrawer
        conceptId={activeConceptId}
        onClose={() => setActiveConceptId(null)}
        onSelectConcept={(id) => setActiveConceptId(id)}
      />
    </div>
  );
}
