import React from 'react';
import { MissionScenario } from '@orbital/contracts';
import { CampaignDisplayConfig } from '../data/mission-display-config';
import { MissionAvailability } from './MissionAvailability';
import { MissionDifficulty } from './MissionDifficulty';
import {
  Rocket,
  ChevronRight,
  Info,
  Clock,
  Compass,
  CheckCircle2,
  Wrench,
  Lock
} from 'lucide-react';

interface MissionCardProps {
  scenario: MissionScenario;
  config: CampaignDisplayConfig;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  onStartOrPreview: () => void;
}

export function MissionCard({
  scenario,
  config,
  isSelected,
  onSelect,
  onViewDetails,
  onStartOrPreview
}: MissionCardProps) {
  const isPlayable = config.availability === 'AVAILABLE';

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-3xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer border ${
        isSelected
          ? 'bg-space-850/95 border-cyan-400 shadow-2xl glow-cyan scale-[1.01]'
          : 'bg-space-900/80 border-slate-800 hover:border-slate-700 hover:bg-space-850/90 hover:-translate-y-1'
      }`}
    >
      {/* ============================================================== */}
      {/* 1. CAMPAIGN ARTWORK HEADER WITH OVERLAYS */}
      {/* ============================================================== */}
      <div className="relative h-44 w-full overflow-hidden bg-space-950">
        <img
          src={config.artworkUrl}
          alt={config.displayTitle}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Cinematic gradient overlays for contrast and depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-space-900/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-space-950/60 via-transparent to-transparent" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-space-950/90 text-cyan-300 border border-slate-700 font-bold backdrop-blur-md">
            {config.code}
          </span>
          <MissionAvailability availability={config.availability} size="sm" />
        </div>

        {/* Bottom Floating Info inside Artwork */}
        <div className="absolute bottom-2.5 inset-x-3.5 flex items-center justify-between z-10 text-[11px] font-mono">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-space-950/80 border border-slate-800 text-slate-300 backdrop-blur-md">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span className="font-bold">{config.destination}</span>
          </div>
          <MissionDifficulty difficulty={config.displayDifficulty} />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CAMPAIGN METADATA & OBJECTIVES */}
      {/* ============================================================== */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Tagline & Title */}
          <div className="mb-2">
            <span className="text-[10px] font-mono tracking-wider font-extrabold text-cyan-400 uppercase">
              {config.tagline}
            </span>
            <h3 className="text-xl font-black text-white tracking-tight mt-0.5 group-hover:text-cyan-300 transition-colors">
              {config.displayTitle}
            </h3>
          </div>

          {/* Scientific Objective (Friendly 70% Plain English) */}
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-3">
            {config.scientificObjective}
          </p>

          {/* Estimated Playtime */}
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 mb-3.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>ESTIMATED:</span>
            <span className="text-slate-200 font-semibold">{config.estimatedPlaytime}</span>
          </div>

          {/* Primary Engineering Challenges */}
          <div className="bg-space-950/80 rounded-xl p-3 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center space-x-1 text-[10px] font-mono font-bold text-slate-400 uppercase">
              <Wrench className="w-3 h-3 text-cyan-400" />
              <span>Engineering Focus</span>
            </div>
            <ul className="text-[11px] text-slate-300 space-y-1">
              {config.primaryChallenges.slice(0, 2).map((ch, idx) => (
                <li key={idx} className="flex items-center space-x-1.5 truncate">
                  <span className="w-1 h-1 rounded-full bg-cyan-400" />
                  <span className="truncate">{ch}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Selected Scenario Active Checkmark Indicator */}
        {isSelected && (
          <div className="flex items-center space-x-1.5 text-xs font-mono text-cyan-400 font-bold py-1">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>SELECTED CAMPAIGN</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. CARD ACTION BUTTONS */}
        {/* ============================================================== */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
          {/* View Details Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-space-800 hover:bg-space-700 text-slate-300 hover:text-white font-mono text-xs flex items-center justify-center space-x-1 border border-slate-700/80 transition-colors"
            title="View complete mission specifications and engineering challenges"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>

          {/* Start / Preview Primary Action */}
          {isPlayable ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartOrPreview();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-extrabold font-mono text-xs flex items-center justify-center space-x-1 shadow-md glow-cyan transition-all"
            >
              <span>START</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartOrPreview();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-space-950 hover:bg-space-850 text-slate-400 hover:text-slate-200 font-mono text-xs flex items-center justify-center space-x-1 border border-slate-800 transition-colors"
              title="Preview mission overview (gameplay coming in upcoming release)"
            >
              <span>PREVIEW</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

