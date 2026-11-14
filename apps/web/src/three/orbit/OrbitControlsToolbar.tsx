import React from 'react';
import {
  Circle,
  Eye,
  EyeOff,
  Focus,
  Grid,
  Layers,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  Sparkle
} from 'lucide-react';
import { OrbitVisualSettings } from './types';

interface OrbitControlsToolbarProps {
  settings: OrbitVisualSettings;
  onToggle: <K extends keyof OrbitVisualSettings>(key: K) => void;
  onResetSpacecraft: () => void;
  onFrameOrbit: () => void;
  isGeoOrbit?: boolean;
}

export function OrbitControlsToolbar({
  settings,
  onToggle,
  onResetSpacecraft,
  onFrameOrbit,
  isGeoOrbit = false
}: OrbitControlsToolbarProps) {
  return (
    <div className="absolute bottom-3 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-space-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl pointer-events-auto">
      {/* 1. Orbit Path Toggle */}
      <button
        type="button"
        onClick={() => onToggle('showOrbitPath')}
        title="Toggle Orbit Trajectory Line"
        className={`px-2 py-1 text-xs font-mono font-medium rounded-lg flex items-center space-x-1 transition-all ${
          settings.showOrbitPath
            ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50'
            : 'bg-space-900/60 text-slate-500 border border-slate-800'
        }`}
      >
        <Orbit className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Path</span>
      </button>

      {/* 2. Spacecraft Marker Toggle */}
      <button
        type="button"
        onClick={() => onToggle('showSpacecraft')}
        title="Toggle Spacecraft Marker"
        className={`px-2 py-1 text-xs font-mono font-medium rounded-lg flex items-center space-x-1 transition-all ${
          settings.showSpacecraft
            ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
            : 'bg-space-900/60 text-slate-500 border border-slate-800'
        }`}
      >
        <Sparkle className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sat</span>
      </button>

      {/* 3. Spacecraft Animation Play / Pause */}
      <button
        type="button"
        onClick={() => onToggle('isSpacecraftAnimating')}
        title={settings.isSpacecraftAnimating ? 'Pause Spacecraft' : 'Resume Spacecraft'}
        className={`px-2 py-1 text-xs font-mono font-medium rounded-lg flex items-center space-x-1 transition-all ${
          settings.isSpacecraftAnimating
            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
            : 'bg-space-900/60 text-amber-400 border border-amber-500/40'
        }`}
      >
        {settings.isSpacecraftAnimating ? (
          <Pause className="w-3.5 h-3.5" />
        ) : (
          <Play className="w-3.5 h-3.5" />
        )}
      </button>

      {/* 4. Reset Spacecraft Position to T=0 */}
      <button
        type="button"
        onClick={onResetSpacecraft}
        title="Reset Satellite Position to T-0 (Node)"
        className="px-2 py-1 text-xs font-mono font-medium rounded-lg bg-space-900/80 hover:bg-space-850 text-slate-300 hover:text-white border border-slate-800 flex items-center space-x-1 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
      </button>

      <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />

      {/* 5. Compare All 4 Profiles Toggle */}
      <button
        type="button"
        onClick={() => onToggle('comparisonMode')}
        title="Compare All Orbits Simultaneously"
        className={`px-2 py-1 text-xs font-mono font-medium rounded-lg flex items-center space-x-1 transition-all ${
          settings.comparisonMode
            ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
            : 'bg-space-900/60 text-slate-500 border border-slate-800'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>Compare</span>
      </button>

      {/* 6. Equatorial Reference Plane Grid Toggle */}
      <button
        type="button"
        onClick={() => onToggle('showEquatorialPlane')}
        title="Toggle Celestial Equatorial Reference Plane"
        className={`px-2 py-1 text-xs font-mono font-medium rounded-lg flex items-center space-x-1 transition-all ${
          settings.showEquatorialPlane
            ? 'bg-sky-600/30 text-sky-300 border border-sky-500/50'
            : 'bg-space-900/60 text-slate-500 border border-slate-800'
        }`}
      >
        <Grid className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Plane</span>
      </button>

      {/* 7. Earth Equator Line Toggle */}
      <button
        type="button"
        onClick={() => onToggle('showEarthEquator')}
        title="Toggle Earth Surface Equator Line"
        className={`px-2 py-1 text-xs font-mono font-medium rounded-lg flex items-center space-x-1 transition-all ${
          settings.showEarthEquator
            ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50'
            : 'bg-space-900/60 text-slate-500 border border-slate-800'
        }`}
      >
        <Circle className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Equator</span>
      </button>

      {/* 8. Auto-Frame Camera for Orbit Distance */}
      <button
        type="button"
        onClick={onFrameOrbit}
        title={isGeoOrbit ? 'Frame Wide for GEO Orbit' : 'Frame Close for LEO/Polar Orbit'}
        className="px-2 py-1 text-xs font-mono font-medium rounded-lg bg-space-900/80 hover:bg-space-850 text-cyan-400 hover:text-cyan-300 border border-slate-800 flex items-center space-x-1 transition-colors"
      >
        <Focus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Frame</span>
      </button>
    </div>
  );
}
