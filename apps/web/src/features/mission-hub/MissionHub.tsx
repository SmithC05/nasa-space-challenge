import React from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  DollarSign,
  Globe2,
  Radio,
  Rocket,
  ShieldAlert,
  Users
} from 'lucide-react';

export function MissionHub() {
  const { scenarios, selectedScenario, selectScenario, setActiveTab } = useGameStore();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-space-900 via-space-850 to-space-900 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-3 mb-3">
            <span className="px-3 py-1 text-xs font-mono font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              M01 // MISSION HUB
            </span>
            <span className="text-xs font-mono text-slate-400">
              2026 NASA SPACE APPS CHALLENGE
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Scientific Mission Command
          </h1>
          <p className="mt-3 text-slate-300 leading-relaxed text-sm lg:text-base">
            Select an operational planetary science scenario. Review engineering constraints,
            orbital profiles, and scientific objectives before designing your spacecraft in the Lab.
          </p>
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map((scenario) => {
          const isSelected = selectedScenario.id === scenario.id;
          return (
            <div
              key={scenario.id}
              onClick={() => selectScenario(scenario)}
              className={`cursor-pointer rounded-2xl p-5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-space-850 border-2 border-cyan-500 shadow-lg glow-cyan scale-[1.02]'
                  : 'bg-space-900/80 border border-slate-800 hover:border-slate-600 hover:bg-space-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-space-950 border border-slate-700 text-slate-300">
                    {scenario.code}
                  </span>
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                      scenario.difficulty === 'Beginner'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : scenario.difficulty === 'Intermediate'
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                          : scenario.difficulty === 'Advanced'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {scenario.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base lg:text-lg mb-1">{scenario.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{scenario.tagline}</p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-space-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-4">
                  <div>
                    <span className="text-slate-400 block">BUDGET</span>
                    <span className="text-emerald-400 font-semibold">${scenario.budgetMUSD}M</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">MAX MASS</span>
                    <span className="text-cyan-400 font-semibold">{scenario.maxMassKg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">TARGET</span>
                    <span className="text-amber-400 font-semibold">{scenario.targetBody}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">ORBIT</span>
                    <span className="text-purple-400 font-semibold">{scenario.targetOrbitType}</span>
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="flex items-center space-x-1.5 text-xs font-mono text-cyan-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ACTIVE SCENARIO</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Scenario Briefing Detail */}
      <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xs font-mono text-cyan-400 tracking-wider">
                PRIMARY MISSION PROFILE // {selectedScenario.code}
              </span>
              <span className="text-xs font-mono text-slate-400">• {selectedScenario.targetBody} Exploration</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white">
              {selectedScenario.name}
            </h2>
            <p className="mt-2 text-slate-300 max-w-4xl text-sm lg:text-base leading-relaxed">
              {selectedScenario.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('lab')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold font-mono text-sm flex items-center space-x-2 shadow-lg glow-cyan transition-all"
            >
              <span>CONFIGURE SPACECRAFT</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('multiplayer')}
              className="px-5 py-3 rounded-xl bg-space-800 hover:bg-space-700 text-white font-mono text-sm border border-slate-700 flex items-center space-x-2 transition-colors"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>COOPERATIVE LOBBY</span>
            </button>
          </div>
        </div>

        {/* Detailed Briefing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Primary Objectives */}
          <div className="bg-space-950/70 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase mb-3">
              <Award className="w-4 h-4" />
              <span>Mission Objectives</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {selectedScenario.primaryObjectives.map((obj, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Environmental Hazards */}
          <div className="bg-space-950/70 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold uppercase mb-3">
              <ShieldAlert className="w-4 h-4" />
              <span>Environmental Hazards</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {selectedScenario.environmentalHazards.map((haz, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <span>{haz}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Scientific Payload */}
          <div className="bg-space-950/70 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold uppercase mb-3">
              <Cpu className="w-4 h-4" />
              <span>Payload Requirements</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              To maximize science score, equip instruments matching target physics:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedScenario.recommendedInstruments.map((inst, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-[11px] font-mono rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300"
                >
                  {inst}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
