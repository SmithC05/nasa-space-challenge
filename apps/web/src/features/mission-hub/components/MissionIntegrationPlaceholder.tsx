import React from 'react';
import { MissionScenario } from '@orbital/contracts';
import { getCampaignDisplayConfig } from '../data/mission-display-config';
import {
  Cpu,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Rocket,
  ShieldAlert,
  Users,
  Compass,
  DollarSign,
  Weight
} from 'lucide-react';

interface MissionIntegrationPlaceholderProps {
  scenario: MissionScenario;
  gameMode: 'single' | 'multiplayer';
  onReturnToHub: () => void;
  onProceedToLiveLab?: () => void;
}

export function MissionIntegrationPlaceholder({
  scenario,
  gameMode,
  onReturnToHub,
  onProceedToLiveLab
}: MissionIntegrationPlaceholderProps) {
  const config = getCampaignDisplayConfig(scenario.id);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn py-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onReturnToHub}
          className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-mono font-bold rounded-xl bg-space-900/90 text-slate-300 border border-slate-700 hover:text-white hover:border-cyan-500/60 hover:bg-space-850 transition-all shadow-md group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>RETURN TO MISSION HUB</span>
        </button>

        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
          INTEGRATION HANDOFF STAGE // DEV 02
        </span>
      </div>

      {/* Main Placeholder Container */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-space-900 via-space-950 to-space-950 border border-cyan-500/30 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400 shadow-lg glow-cyan">
                <Cpu className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  SPACECRAFT DESIGN LAB
                </h1>
                <div className="text-xs font-mono text-cyan-400 mt-0.5">
                  MODULE 02 • SPACECRAFT ASSEMBLY WORKSTATION
                </div>
              </div>
            </div>

            {/* Official Badge: MODULE AWAITING INTEGRATION */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-800 text-xs font-mono font-bold shadow-md">
              <Clock className="w-4 h-4 animate-spin text-amber-400" />
              <span>MODULE AWAITING INTEGRATION</span>
            </div>
          </div>

          {/* Official Description */}
          <div className="p-4 rounded-2xl bg-space-900/60 border border-slate-800 text-slate-300 text-sm leading-relaxed">
            Your mission configuration has been prepared successfully. The Spacecraft Design Lab will be connected when the engineering module is integrated.
          </div>

          {/* Preserved Mission Configuration Details */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>PRESERVED APPLICATION-LEVEL MISSION STATE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              {/* Mission Title */}
              <div className="p-3.5 rounded-xl bg-space-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Selected Mission</div>
                <div className="text-white font-bold text-sm mt-0.5 truncate">{config.displayTitle}</div>
                <div className="text-[10px] text-cyan-400 font-semibold">{scenario.code}</div>
              </div>

              {/* Scenario ID */}
              <div className="p-3.5 rounded-xl bg-space-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Scenario ID</div>
                <div className="text-cyan-300 font-bold text-xs mt-0.5 truncate">{scenario.id}</div>
                <div className="text-[10px] text-slate-400 font-normal">Canonical Target: {scenario.targetBody}</div>
              </div>

              {/* Gameplay Mode */}
              <div className="p-3.5 rounded-xl bg-space-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Selected Game Mode</div>
                <div className="text-emerald-400 font-bold text-sm mt-0.5 capitalize flex items-center space-x-1.5">
                  {gameMode === 'multiplayer' ? <Users className="w-3.5 h-3.5" /> : <Rocket className="w-3.5 h-3.5" />}
                  <span>{gameMode === 'multiplayer' ? 'Multiplayer Crew' : 'Single-Player Solo'}</span>
                </div>
                <div className="text-[10px] text-slate-400">Preserved in Zustand</div>
              </div>

              {/* Mission Readiness Status */}
              <div className="p-3.5 rounded-xl bg-space-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Readiness Status</div>
                <div className="text-cyan-300 font-bold text-sm mt-0.5 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>READY TO START</span>
                </div>
                <div className="text-[10px] text-emerald-400">Flight Pre-Flight Approved</div>
              </div>
            </div>
          </div>

          {/* Quick Specifications Strip */}
          <div className="p-4 rounded-2xl bg-space-950/70 border border-slate-800/80 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[10px] font-mono text-slate-500">PROGRAM BUDGET</div>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">${scenario.budgetMUSD} MUSD</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-500">MASS FAIRING CAP</div>
              <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">{scenario.maxMassKg} kg</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-500">ORBIT TRAJECTORY</div>
              <div className="text-sm font-bold font-mono text-sky-300 mt-0.5">{scenario.targetOrbitType} Orbit</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={onReturnToHub}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-space-900 hover:bg-space-850 text-slate-300 hover:text-white font-mono text-xs border border-slate-700 transition-colors"
            >
              Return to Mission Hub
            </button>

            {onProceedToLiveLab && (
              <button
                type="button"
                onClick={onProceedToLiveLab}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold font-mono text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg glow-cyan transition-all"
              >
                <span>OPEN LIVE SPACECRAFT DESIGN LAB</span>
                <Rocket className="w-4 h-4 transform -rotate-45" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

