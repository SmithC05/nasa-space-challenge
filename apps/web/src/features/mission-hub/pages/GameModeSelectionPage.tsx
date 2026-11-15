import React from 'react';
import { MissionScenario, EngineerRole } from '@orbital/contracts';
import { getCampaignDisplayConfig } from '../data/mission-display-config';
import { SinglePlayerOption } from '../components/game-mode/SinglePlayerOption';
import { MultiplayerOption } from '../components/game-mode/MultiplayerOption';
import { RoomOperationResult } from '../types/multiplayer-entry.types';
import {
  ChevronLeft,
  Compass,
  DollarSign,
  Weight,
  Clock,
  Sparkles,
  ShieldCheck,
  Globe2
} from 'lucide-react';

interface GameModeSelectionPageProps {
  scenario: MissionScenario;
  onSelectSolo: () => void;
  onEnterMultiplayerLobby: (result: RoomOperationResult, role: EngineerRole) => void;
  onBackToBriefing: () => void;
}

export function GameModeSelectionPage({
  scenario,
  onSelectSolo,
  onEnterMultiplayerLobby,
  onBackToBriefing
}: GameModeSelectionPageProps) {
  const config = getCampaignDisplayConfig(scenario.id);
  const isAvailable = config.availability === 'AVAILABLE';

  return (
    <div className="relative z-10 space-y-8 animate-fadeIn pb-24">
      {/* 1. Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToBriefing}
          className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-mono font-bold rounded-xl bg-space-900/90 text-slate-300 border border-slate-700 hover:text-white hover:border-cyan-500/60 hover:bg-space-850 transition-all shadow-md group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>RETURN TO MISSION BRIEFING</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[9px] rounded bg-space-950 border border-slate-700 text-slate-400">⌫</kbd>
        </button>

        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold hidden sm:inline-block">
          STEP 2 // GAME MODE ASSIGNMENT
        </span>
      </div>

      {/* 2. Header & Selected Mission Summary Card */}
      <div className="rounded-3xl bg-gradient-to-b from-space-900/90 via-space-900 to-space-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold mb-1.5">
          <Sparkles className="w-4 h-4" />
          <span>MISSION CONFIGURATION</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          HOW WILL YOU COMMAND YOUR MISSION?
        </h1>

        <p className="mt-2 text-slate-300 max-w-3xl text-sm sm:text-base leading-relaxed">
          Choose your command style. Take full control as an independent mission engineer or assemble a crew to explore the challenges of space together.
        </p>

        {/* Selected Mission Summary Banner */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-space-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-[1px] flex-shrink-0 shadow-md">
              <div className="w-full h-full bg-space-950 rounded-[11px] flex items-center justify-center text-cyan-400">
                <Globe2 className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-1">
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                  {config.code}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-white font-semibold">TARGET: {config.destination}</span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-400 font-semibold">{config.displayDifficulty}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {config.displayTitle}: <span className="text-slate-300 font-normal">{config.tagline}</span>
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                {config.scientificObjective}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono self-start md:self-auto flex-shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-space-900 border border-slate-800 text-slate-300">
              <span className="text-slate-500">BUDGET:</span> <span className="text-emerald-400 font-bold">${scenario.budgetMUSD}M</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-space-900 border border-slate-800 text-slate-300">
              <span className="text-slate-500">MASS:</span> <span className="text-cyan-300 font-bold">{scenario.maxMassKg} kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Two Large Mode Cards: Solo vs Cooperative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SinglePlayerOption
          onStartSolo={onSelectSolo}
          isAvailable={isAvailable}
        />

        <MultiplayerOption
          scenarioId={scenario.id}
          onEnterLobby={onEnterMultiplayerLobby}
          isAvailable={isAvailable}
        />
      </div>

      {/* 4. Bottom Navigation Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBackToBriefing}
          className="text-xs font-mono text-slate-400 hover:text-white transition-colors flex items-center space-x-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Mission Briefing Dossier</span>
        </button>

        <span className="text-[11px] font-mono text-slate-500">
          ORBITAL // NASA SPACE APPS 2026
        </span>
      </div>
    </div>
  );
}

