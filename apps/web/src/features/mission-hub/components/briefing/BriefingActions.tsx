import React from 'react';
import { ChevronLeft, ChevronRight, Users, Rocket, Lock } from 'lucide-react';

interface BriefingActionsProps {
  isAvailable: boolean;
  campaignTitle: string;
  onBackToSelection: () => void;
  onProceedToLab: () => void;
  onOpenMultiplayer: () => void;
}

export function BriefingActions({
  isAvailable,
  campaignTitle,
  onBackToSelection,
  onProceedToLab,
  onOpenMultiplayer
}: BriefingActionsProps) {
  return (
    <div className="sticky bottom-4 z-30 rounded-2xl bg-space-950/95 backdrop-blur-xl border border-cyan-500/40 p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Quick Summary / Status */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
          <Rocket className="w-5 h-5 transform -rotate-45" />
        </div>
        <div>
          <div className="text-xs font-mono font-bold text-white flex items-center space-x-2">
            <span>READY FOR SPACECRAFT ASSEMBLY</span>
            <span className="text-slate-600">•</span>
            <span className={isAvailable ? 'text-emerald-400' : 'text-amber-400'}>
              {isAvailable ? 'FLIGHT APPROVED' : 'COMING SOON'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {campaignTitle} • Next Module: Spacecraft Lab (Developer 02)
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onBackToSelection}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-mono text-slate-400 hover:text-white hover:bg-space-900 rounded-xl border border-transparent hover:border-slate-700 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Change Frontier</span>
        </button>

        <button
          type="button"
          onClick={onOpenMultiplayer}
          className="hidden md:inline-flex px-4 py-2.5 rounded-xl bg-space-900 hover:bg-space-850 text-white font-mono text-xs border border-slate-700 items-center space-x-2 transition-colors"
        >
          <Users className="w-4 h-4 text-purple-400" />
          <span>Co-op Lobby</span>
        </button>

        {isAvailable ? (
          <button
            type="button"
            onClick={onProceedToLab}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold font-mono text-xs sm:text-sm flex items-center space-x-2 shadow-lg glow-cyan transition-all"
          >
            <span>PROCEED TO SPACECRAFT DESIGN</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="px-6 py-2.5 rounded-xl bg-space-900 border border-slate-800 text-slate-500 font-mono text-xs sm:text-sm flex items-center space-x-2 cursor-not-allowed opacity-80"
            title="This campaign is in pre-flight development and not yet playable."
          >
            <Lock className="w-3.5 h-3.5" />
            <span>DEV 02 LAB (COMING SOON)</span>
          </button>
        )}
      </div>
    </div>
  );
}

