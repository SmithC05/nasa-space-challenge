import React, { useState } from 'react';
import { MissionScenario } from '@orbital/contracts';
import { getCampaignDisplayConfig } from '../data/mission-display-config';
import { MissionGrid } from '../components/MissionGrid';
import { MissionDetailsPanel } from '../components/MissionDetailsPanel';
import { LandingNavigation } from '../components/LandingNavigation';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Rocket,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';

interface MissionSelectionPageProps {
  scenarios: MissionScenario[];
  selectedScenario: MissionScenario;
  onSelectScenario: (scenario: MissionScenario) => void;
  onProceedToBriefing: (scenario: MissionScenario) => void;
  onNavigateHome: () => void;
  onOpenLearning: () => void;
  onNavigateMultiplayer: () => void;
  hasResumableMission: boolean;
  onResumeMission: () => void;
}

export function MissionSelectionPage({
  scenarios,
  selectedScenario,
  onSelectScenario,
  onProceedToBriefing,
  onNavigateHome,
  onOpenLearning,
  onNavigateMultiplayer,
  hasResumableMission,
  onResumeMission
}: MissionSelectionPageProps) {
  const [detailsModalScenario, setDetailsModalScenario] = useState<MissionScenario | null>(null);

  const selectedConfig = getCampaignDisplayConfig(selectedScenario.id);
  const isSelectedPlayable = selectedConfig.availability === 'AVAILABLE';

  const availableCount = scenarios.filter(
    (s) => getCampaignDisplayConfig(s.id).availability === 'AVAILABLE'
  ).length;
  const comingSoonCount = scenarios.length - availableCount;

  return (
    <div className="relative min-h-[calc(100vh-160px)] space-y-8 animate-fadeIn">
      <div className="relative z-10 space-y-8">
        {/* 1. In-Hub Contextual Toolbar */}
        <LandingNavigation
          activeView="campaigns"
          onNavigateHome={onNavigateHome}
          onNavigateMissions={() => {
            // Already on missions
          }}
          onOpenLearning={onOpenLearning}
          onNavigateMultiplayer={onNavigateMultiplayer}
          hasResumableMission={hasResumableMission}
          onResumeMission={onResumeMission}
        />

        {/* 2. Mission Command Center Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-space-900/90 via-space-850/80 to-space-900/90 backdrop-blur-xl border border-slate-800/80 p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-xl bg-space-950 text-slate-300 border border-slate-700 hover:text-white hover:border-cyan-500/60 hover:bg-space-900 transition-all shadow-md group"
              >
                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>BACK TO HOME</span>
                <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[9px] rounded bg-space-900 border border-slate-700 text-slate-400">⌫</kbd>
              </button>
              <span className="px-3 py-1 text-xs font-mono font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                MISSION COMMAND CENTER
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-space-950 text-slate-300 border border-slate-800">
                {availableCount} PLAYABLE • {comingSoonCount} COMING SOON
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              CHOOSE YOUR NEXT FRONTIER
            </h1>
            <p className="mt-3 text-slate-300 leading-relaxed text-sm sm:text-base max-w-2xl font-sans">
              Every journey begins with a mission. Explore scientific opportunities, discover new worlds and prepare for the challenges beyond Earth.
            </p>
          </div>
        </div>

        {/* 3. The 4 Campaign Cards Grid */}
        <MissionGrid
          scenarios={scenarios}
          selectedScenario={selectedScenario}
          onSelectScenario={onSelectScenario}
          onViewDetails={(scenario) => setDetailsModalScenario(scenario)}
          onStartOrPreview={(scenario) => {
            onSelectScenario(scenario);
            const cfg = getCampaignDisplayConfig(scenario.id);
            if (cfg.availability === 'AVAILABLE') {
              onProceedToBriefing(scenario);
            } else {
              setDetailsModalScenario(scenario);
            }
          }}
        />

        {/* 4. Active Selection Action Banner */}
        <div className="rounded-3xl bg-space-900/90 backdrop-blur-xl border border-slate-800/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  ACTIVE SELECTION // {selectedConfig.code}
                </span>
                <span className="text-xs font-mono text-slate-400">• {selectedConfig.destination}</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                {selectedConfig.displayTitle}: <span className="text-slate-300 font-normal">{selectedConfig.tagline}</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setDetailsModalScenario(selectedScenario)}
              className="flex-1 md:flex-none px-4 py-3 rounded-xl bg-space-800 hover:bg-space-700 text-slate-300 hover:text-white font-mono text-xs border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>MISSION DETAILS</span>
            </button>

            {isSelectedPlayable ? (
              <button
                type="button"
                onClick={() => onProceedToBriefing(selectedScenario)}
                className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-extrabold font-mono text-xs flex items-center justify-center space-x-2 shadow-lg glow-cyan transition-all"
              >
                <Rocket className="w-4 h-4 text-black" />
                <span>START MISSION</span>
                <ChevronRight className="w-4 h-4 text-black" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDetailsModalScenario(selectedScenario)}
                className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-space-950 text-slate-400 hover:text-slate-200 font-mono text-xs border border-slate-800 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>PREVIEW BRIEFING (COMING SOON)</span>
              </button>
            )}
          </div>
        </div>

        {/* 5. Expanded Mission Information Modal with Interactive 3D Planet */}
        <MissionDetailsPanel
          scenario={detailsModalScenario}
          isOpen={Boolean(detailsModalScenario)}
          onClose={() => setDetailsModalScenario(null)}
          onStartMission={(scenario) => {
            onSelectScenario(scenario);
            onProceedToBriefing(scenario);
          }}
        />
      </div>
    </div>
  );
}

