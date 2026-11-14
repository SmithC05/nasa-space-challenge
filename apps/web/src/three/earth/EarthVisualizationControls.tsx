import React from 'react';
import {
  Camera,
  Cloud,
  Globe,
  Pause,
  Play,
  Sparkles,
  Wind
} from 'lucide-react';
import { EarthVisualizationControlProps } from './types';

export function EarthVisualizationControls({
  state,
  onToggle,
  onResetCamera
}: EarthVisualizationControlProps) {
  return (
    <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-1.5 bg-space-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl max-w-full">
      {/* 1. Earth Surface Toggle */}
      <button
        type="button"
        onClick={() => onToggle('showEarth')}
        title="Toggle Earth Surface"
        className={`px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg flex items-center space-x-1.5 transition-all duration-150 ${
          state.showEarth
            ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm'
            : 'bg-space-900/60 text-slate-500 border border-slate-800/80 hover:text-slate-300'
        }`}
      >
        <Globe className={`w-3.5 h-3.5 ${state.showEarth ? 'text-blue-400' : 'text-slate-500'}`} />
        <span>Earth</span>
      </button>

      {/* 2. Atmosphere Toggle */}
      <button
        type="button"
        onClick={() => onToggle('showAtmosphere')}
        title="Toggle Atmospheric Glow"
        className={`px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg flex items-center space-x-1.5 transition-all duration-150 ${
          state.showAtmosphere
            ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-sm'
            : 'bg-space-900/60 text-slate-500 border border-slate-800/80 hover:text-slate-300'
        }`}
      >
        <Wind className={`w-3.5 h-3.5 ${state.showAtmosphere ? 'text-cyan-400' : 'text-slate-500'}`} />
        <span>Atmosphere</span>
      </button>

      {/* 3. Clouds Toggle */}
      <button
        type="button"
        onClick={() => onToggle('showClouds')}
        title="Toggle Cloud Layer"
        className={`px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg flex items-center space-x-1.5 transition-all duration-150 ${
          state.showClouds
            ? 'bg-sky-600/30 text-sky-200 border border-sky-500/50 shadow-sm'
            : 'bg-space-900/60 text-slate-500 border border-slate-800/80 hover:text-slate-300'
        }`}
      >
        <Cloud className={`w-3.5 h-3.5 ${state.showClouds ? 'text-sky-300' : 'text-slate-500'}`} />
        <span>Clouds</span>
      </button>

      {/* 4. Stars Toggle */}
      <button
        type="button"
        onClick={() => onToggle('showStars')}
        title="Toggle Star Field"
        className={`px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg flex items-center space-x-1.5 transition-all duration-150 ${
          state.showStars
            ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-sm'
            : 'bg-space-900/60 text-slate-500 border border-slate-800/80 hover:text-slate-300'
        }`}
      >
        <Sparkles className={`w-3.5 h-3.5 ${state.showStars ? 'text-amber-400' : 'text-slate-500'}`} />
        <span>Stars</span>
      </button>

      <div className="w-[1px] h-5 bg-slate-800 mx-0.5 hidden sm:block" />

      {/* 5. Rotation Play / Pause */}
      <button
        type="button"
        onClick={() => onToggle('isRotating')}
        title={state.isRotating ? 'Pause Earth Rotation' : 'Resume Earth Rotation'}
        className={`px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg flex items-center space-x-1.5 transition-all duration-150 ${
          state.isRotating
            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-sm'
            : 'bg-space-900/60 text-amber-400 border border-amber-500/40 hover:text-amber-300'
        }`}
      >
        {state.isRotating ? (
          <>
            <Pause className="w-3.5 h-3.5 text-emerald-400" />
            <span>Rotating</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Paused</span>
          </>
        )}
      </button>

      {/* 6. Reset Camera */}
      <button
        type="button"
        onClick={onResetCamera}
        title="Reset Camera to Default View"
        className="px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-space-900/80 hover:bg-space-850 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 flex items-center space-x-1.5 transition-all duration-150 shadow-sm"
      >
        <Camera className="w-3.5 h-3.5 text-cyan-400" />
        <span>Reset View</span>
      </button>
    </div>
  );
}
