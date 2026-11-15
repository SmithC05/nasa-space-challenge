import React from 'react';
import { MissionScenario } from '@orbital/contracts';
import { getCampaignDisplayConfig } from '../../data/mission-display-config';
import { LearningConceptId } from '../../types/learning.types';
import { MissionOrbit3DViewer } from '../MissionOrbit3DViewer';
import {
  Sparkles,
  DollarSign,
  Weight,
  Compass,
  Clock,
  Trophy,
  Wifi,
  HelpCircle,
  Activity
} from 'lucide-react';

interface MissionOverviewProps {
  scenario: MissionScenario;
  onOpenConcept?: (conceptId: LearningConceptId) => void;
}

export function MissionOverview({ scenario, onOpenConcept }: MissionOverviewProps) {
  const config = getCampaignDisplayConfig(scenario.id);

  const orbitExplanations: Record<string, string> = {
    SSO: 'Sun-Synchronous Orbit: passes over Earth poles with constant solar lighting for daily observations.',
    LEO: 'Low Earth Orbit: closest to Earth (300-800 km) providing high image detail and lower rocket fuel costs.',
    TLI: 'Trans-Lunar Injection: high-energy orbital trajectory escaping Earth gravity towards the Moon.',
    GTO: 'Geostationary Transfer Orbit: elliptical stepping-stone orbit used to travel to high altitudes.',
    GEO: 'Geostationary Orbit: orbits at the exact rotation speed of Earth, hovering continuously over one hemisphere.',
    MOLNIYA: 'Highly elliptical orbit optimized for high-latitude polar communications.'
  };

  const orbitDesc =
    orbitExplanations[scenario.targetOrbitType] ||
    `Target operational trajectory for scientific research around ${scenario.targetBody}.`;

  return (
    <div className="rounded-3xl bg-gradient-to-b from-space-900/90 via-space-900 to-space-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
      {/* Header Info */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-2">
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
              {config.code}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-space-950 text-slate-300 border border-slate-800 font-semibold">
              TARGET: {config.destination}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
              {config.displayDifficulty}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800 font-semibold">
              {config.estimatedPlaytime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {config.displayTitle}
          </h1>
          <p className="text-cyan-400 font-mono text-sm sm:text-base font-semibold mt-1">
            {config.tagline}
          </p>

          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            {scenario.description || config.scientificObjective}
          </p>
        </div>

        {/* Status Pill Indicator */}
        <div className="flex flex-col gap-2 min-w-[200px]">
          <div className="p-3.5 rounded-2xl bg-space-950/80 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>CAMPAIGN STATUS</span>
            </div>
            <div className="text-sm font-bold font-mono text-cyan-300 mt-1 flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${config.availability === 'AVAILABLE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{config.availability === 'AVAILABLE' ? 'OPERATIONAL • PLAYABLE' : 'PRE-FLIGHT DEVELOPMENT'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Celestial Reconnaissance & Telemetry Readout (Side-by-side on desktop) */}
      <div className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 3D Planet & Orbit Canvas */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col min-h-[380px] lg:min-h-[460px]">
          <MissionOrbit3DViewer
            destination={config.destination}
            missionName={config.displayTitle}
            targetOrbit={`${scenario.targetOrbitType} Orbit`}
          />
        </div>

        {/* Integrated Flight Parameters & Telemetry Console Aside 3D View */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-between rounded-3xl bg-space-950/85 backdrop-blur-md border border-cyan-500/30 p-5 sm:p-6 shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/90">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-white tracking-wider">
                  FLIGHT SPECIFICATIONS
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                LIVE TELEMETRY
              </span>
            </div>

            {/* 6 Integrated Telemetry Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {/* Metric 1: Budget */}
              <div className="p-3 rounded-2xl bg-space-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>MISSION BUDGET</span>
                  </div>
                  <span className="text-base font-black font-mono text-emerald-400">
                    ${scenario.budgetMUSD} <span className="text-xs text-slate-400 font-normal">MUSD</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Total program funding for satellite chassis, solar arrays, propulsion, and ground telemetry.
                </p>
              </div>

              {/* Metric 2: Mass Cap */}
              <div className="p-3 rounded-2xl bg-space-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                    <Weight className="w-3.5 h-3.5 text-cyan-400" />
                    <span>PAYLOAD MASS CAP</span>
                    {onOpenConcept && (
                      <button
                        type="button"
                        onClick={() => onOpenConcept('payload-capacity')}
                        className="text-cyan-400 hover:text-cyan-300 hover:scale-110 transition-transform"
                        title="Learn what payload capacity means"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <span className="text-base font-black font-mono text-cyan-300">
                    {scenario.maxMassKg} <span className="text-xs text-slate-400 font-normal">kg</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Maximum spacecraft weight permitted by your launch rocket payload fairing.
                </p>
              </div>

              {/* Metric 3: Orbit Profile */}
              <div className="p-3 rounded-2xl bg-space-900/60 border border-slate-800/80 hover:border-blue-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                    <Compass className="w-3.5 h-3.5 text-sky-400" />
                    <span>TARGET ORBIT</span>
                    {onOpenConcept && (
                      <button
                        type="button"
                        onClick={() => onOpenConcept('orbital-selection')}
                        className="text-sky-400 hover:text-sky-300 hover:scale-110 transition-transform"
                        title="Learn why orbit selection matters"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <span className="text-base font-black font-mono text-sky-300">
                    {scenario.targetOrbitType} <span className="text-xs text-slate-400 font-normal">Orbit</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {orbitDesc}
                </p>
              </div>

              {/* Metric 4: Mission Duration */}
              <div className="p-3 rounded-2xl bg-space-900/60 border border-slate-800/80 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>MISSION LIFESPAN</span>
                  </div>
                  <span className="text-base font-black font-mono text-purple-300">
                    {scenario.durationDays} <span className="text-xs text-slate-400 font-normal">Days</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Configured active operational lifetime in orbit for research and observation.
                </p>
              </div>

              {/* Metric 5: Min Science Output */}
              <div className="p-3 rounded-2xl bg-space-900/60 border border-slate-800/80 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>MIN SCIENCE RETURN</span>
                    {onOpenConcept && (
                      <button
                        type="button"
                        onClick={() => onOpenConcept('earth-observation')}
                        className="text-amber-400 hover:text-amber-300 hover:scale-110 transition-transform"
                        title="Learn about scientific instruments"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <span className="text-base font-black font-mono text-amber-300">
                    {scenario.minSciencePoints} <span className="text-xs text-slate-400 font-normal">Points</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Scientific data return required to achieve primary mission completion.
                </p>
              </div>

              {/* Metric 6: Min Downlink Rate */}
              <div className="p-3 rounded-2xl bg-space-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                    <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                    <span>DOWNLINK BANDWIDTH</span>
                    {onOpenConcept && (
                      <button
                        type="button"
                        onClick={() => onOpenConcept('space-communication')}
                        className="text-cyan-400 hover:text-cyan-300 hover:scale-110 transition-transform"
                        title="Learn about space communication"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <span className="text-base font-black font-mono text-cyan-300">
                    {scenario.minBandwidthMbps} <span className="text-xs text-slate-400 font-normal">Mbps</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Minimum telemetry transmission bandwidth required to stream sensor observations home.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

