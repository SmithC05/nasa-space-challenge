import React, { Suspense } from 'react';
import { MissionScenario } from '@orbital/contracts';
import { getCampaignDisplayConfig } from '../data/mission-display-config';
import { MissionAvailability } from './MissionAvailability';
import { MissionDifficulty } from './MissionDifficulty';
import { Planet3DViewer } from './Planet3DViewer';
import {
  X,
  Rocket,
  Compass,
  Clock,
  Wrench,
  Award,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  DollarSign,
  Weight,
  Orbit
} from 'lucide-react';

interface MissionDetailsPanelProps {
  scenario: MissionScenario | null;
  isOpen: boolean;
  onClose: () => void;
  onStartMission: (scenario: MissionScenario) => void;
}

export function MissionDetailsPanel({
  scenario,
  isOpen,
  onClose,
  onStartMission
}: MissionDetailsPanelProps) {
  if (!isOpen || !scenario) return null;

  const config = getCampaignDisplayConfig(scenario.id);
  const isPlayable = config.availability === 'AVAILABLE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-space-900 border border-slate-700/80 p-6 lg:p-8 shadow-2xl glow-cyan text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-details-title"
      >
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-950 text-cyan-300 border border-slate-700 font-bold">
                {config.code}
              </span>
              <MissionAvailability availability={config.availability} size="sm" />
              <MissionDifficulty difficulty={config.displayDifficulty} />
            </div>
            <h2 id="mission-details-title" className="text-2xl font-black text-white tracking-tight">
              {config.displayTitle}
            </h2>
            <p className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
              {config.tagline}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="relative z-10 py-5 space-y-5 text-sm">
          {/* Live Interactive 3D Planet Destination Viewer */}
          <Suspense fallback={<div className="w-full h-56 rounded-2xl bg-space-950 animate-pulse" />}>
            <Planet3DViewer destination={config.destination} />
          </Suspense>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-space-950/70 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-300">
              TARGET CELESTIAL BODY: <strong className="text-cyan-400">{config.destination}</strong>
            </span>
            <span className="text-slate-400">
              ESTIMATED TIME: <strong className="text-slate-100">{config.estimatedPlaytime}</strong>
            </span>
          </div>

          {/* Scientific Objective */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase mb-1.5 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Scientific Objective</span>
            </h4>
            <p className="text-slate-200 leading-relaxed bg-space-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs sm:text-sm">
              {config.scientificObjective}
            </p>
          </div>

          {/* Canonical Mission Overview & Constraints */}
          <div className="grid grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-space-950/80 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">BUDGET</span>
              <span className="text-emerald-400 font-bold text-sm sm:text-base">
                ${scenario.budgetMUSD}M
              </span>
            </div>
            <div className="bg-space-950/80 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">MAX MASS</span>
              <span className="text-cyan-400 font-bold text-sm sm:text-base">
                {scenario.maxMassKg} kg
              </span>
            </div>
            <div className="bg-space-950/80 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">TARGET ORBIT</span>
              <span className="text-purple-400 font-bold text-sm sm:text-base">
                {scenario.targetOrbitType}
              </span>
            </div>
          </div>

          {/* Primary Engineering Challenges */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase mb-2 flex items-center space-x-1.5">
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span>Primary Engineering Challenges</span>
            </h4>
            <div className="space-y-1.5">
              {config.primaryChallenges.map((challenge, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-2 text-xs text-slate-300 bg-space-950/40 p-2.5 rounded-lg border border-slate-800/60"
                >
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{challenge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Playability Notice */}
          {!isPlayable && (
            <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Preview Release:</strong>
                This planetary campaign is currently in development. You can preview its mission parameters and challenges, but spacecraft assembly in the Lab is restricted until its release.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white hover:bg-space-800 transition-colors"
          >
            CLOSE
          </button>

          {isPlayable ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartMission(scenario);
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-extrabold font-mono text-xs flex items-center space-x-2 shadow-lg glow-cyan transition-all"
            >
              <span>START MISSION</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-space-800 text-slate-400 font-mono text-xs flex items-center space-x-1.5 border border-slate-700"
            >
              <span>PREVIEW ONLY</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

