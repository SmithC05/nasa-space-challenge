import React from 'react';
import { Rocket, Users, ChevronRight, Play } from 'lucide-react';

interface LandingActionsProps {
  onStartMission: () => void;
  onOpenMultiplayer: () => void;
  hasResumableMission: boolean;
  onResumeMission: () => void;
  activeScenarioCode?: string;
}

export function LandingActions({
  onStartMission,
  onOpenMultiplayer,
  hasResumableMission,
  onResumeMission,
  activeScenarioCode
}: LandingActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 pt-1">
      {/* Primary Action: START MISSION */}
      <button
        onClick={onStartMission}
        className="group relative inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-extrabold font-mono text-sm tracking-wider shadow-xl glow-cyan transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-space-950"
      >
        <span className="flex items-center space-x-2.5">
          <Rocket className="w-4 h-4 text-black transform group-hover:rotate-12 transition-transform duration-300" />
          <span>START MISSION</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </span>
      </button>

      {/* Secondary Action: MULTIPLAYER */}
      <button
        onClick={onOpenMultiplayer}
        className="inline-flex items-center justify-center px-6 py-4 rounded-2xl bg-space-900/90 hover:bg-space-850 border border-slate-700/80 hover:border-cyan-500/50 text-white font-mono text-sm tracking-wider transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
      >
        <span className="flex items-center space-x-2.5">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>MULTIPLAYER CREW</span>
        </span>
      </button>

      {/* Conditional Resumable Action: CONTINUE MISSION */}
      {hasResumableMission && (
        <button
          onClick={onResumeMission}
          className="inline-flex items-center justify-center px-6 py-4 rounded-2xl bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/80 hover:border-emerald-400 text-emerald-300 font-mono text-sm tracking-wider transition-all duration-300 shadow-lg glow-emerald animate-pulse hover:animate-none"
          title={`Resume flight (${activeScenarioCode || 'ACTIVE'})`}
        >
          <span className="flex items-center space-x-2.5">
            <Play className="w-4 h-4 fill-current text-emerald-400" />
            <span>RESUME SAVED FLIGHT</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900 border border-emerald-600 text-emerald-200">
              {activeScenarioCode || 'LIVE'}
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
