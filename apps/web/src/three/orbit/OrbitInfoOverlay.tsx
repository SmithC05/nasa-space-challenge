import React, { useState } from 'react';
import { OrbitProfile } from '@orbital/contracts';
import { getOrbitProfileById } from '@orbital/game-data';
import {
  ChevronDown,
  ChevronUp,
  Compass,
  Info,
  Layers,
  Orbit,
  ShieldCheck
} from 'lucide-react';
import {
  getOrbitColorForProfile,
  getOrbitDisplayCategory,
  getOrbitDisplayName
} from './types';

interface OrbitInfoOverlayProps {
  orbit: OrbitProfile;
}

export function OrbitInfoOverlay({ orbit }: OrbitInfoOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const detailed = getOrbitProfileById(orbit.id);
  const displayCategory = getOrbitDisplayCategory(orbit);
  const displayName = getOrbitDisplayName(orbit);
  const orbitColor = getOrbitColorForProfile(orbit);

  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col space-y-1.5 max-w-sm w-full pointer-events-auto">
      {/* 1. Header Badge */}
      <div className="flex items-center space-x-2">
        <span
          className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border backdrop-blur-md flex items-center space-x-1.5 shadow-md"
          style={{
            borderColor: `${orbitColor}80`,
            backgroundColor: '#030712cc',
            color: orbitColor
          }}
        >
          <Orbit className="w-3.5 h-3.5" />
          <span>{displayCategory} // {displayName}</span>
        </span>

        {/* Collapsible toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="px-2 py-1 text-[11px] font-mono rounded-lg bg-space-900/80 hover:bg-space-850 text-slate-300 border border-slate-800 flex items-center space-x-1 backdrop-blur-md transition-colors"
        >
          <span>{isExpanded ? 'Less' : 'Details'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* 2. Core Metrics Card */}
      <div className="bg-space-950/90 border border-slate-800/90 rounded-xl p-3 text-xs font-mono space-y-1.5 backdrop-blur-md shadow-xl">
        <div className="grid grid-cols-2 gap-2 text-slate-300">
          <div>
            <span className="text-[10px] text-slate-500 block">ALTITUDE</span>
            <span className="text-white font-bold">{orbit.perigeeKm} × {orbit.apogeeKm} km</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">INCLINATION</span>
            <span className="text-amber-400 font-bold">{orbit.inclinationDeg}°</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">PERIOD</span>
            <span className="text-cyan-400 font-bold">{orbit.orbitalPeriodMin} min</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">REQ ΔV</span>
            <span className="text-emerald-400 font-bold">{orbit.requiredDeltaVMps} m/s</span>
          </div>
        </div>

        {/* 3. Expanded Educational Information */}
        {isExpanded && detailed && (
          <div className="pt-2 border-t border-slate-800/80 space-y-2 text-[11px] animate-fadeIn">
            {/* Mission Suitability */}
            <div>
              <span className="text-slate-400 font-bold flex items-center space-x-1 mb-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>SUITABILITY:</span>
              </span>
              <p className="text-slate-300 leading-relaxed">
                {detailed.missionSuitability.suitabilityDescription}
              </p>
            </div>

            {/* Coverage Characteristics */}
            <div>
              <span className="text-slate-400 font-bold flex items-center space-x-1 mb-0.5">
                <Compass className="w-3 h-3 text-cyan-400" />
                <span>COVERAGE:</span>
              </span>
              <p className="text-slate-300 leading-relaxed">
                {detailed.coverageCharacteristics.description}
              </p>
            </div>

            {/* Educational Disclaimer */}
            <div className="p-1.5 rounded bg-space-900/60 border border-slate-800 text-[10px] text-slate-400 flex items-start space-x-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Educational approximation: Predefined Keplerian geometry with fixed inclination. Not a 6-DOF numerical astrodynamics engine.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
