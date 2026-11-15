import React, { Suspense } from 'react';
import { Landing3DCanvas } from './Landing3DCanvas';
import { LandingActions } from './LandingActions';
import { Rocket, Globe2, Sparkles, Cpu } from 'lucide-react';

interface LandingHeroProps {
  onStartMission: () => void;
  onOpenMultiplayer: () => void;
  hasResumableMission: boolean;
  onResumeMission: () => void;
  activeScenarioCode?: string;
}

export function LandingHero({
  onStartMission,
  onOpenMultiplayer,
  hasResumableMission,
  onResumeMission,
  activeScenarioCode
}: LandingHeroProps) {
  return (
    <section 
      aria-label="ORBITAL Mission Command Hero"
      className="relative overflow-hidden rounded-3xl border border-slate-800/80 shadow-2xl min-h-[640px] flex flex-col justify-between"
    >
      {/* ============================================================== */}
      {/* 1. REAL LIVE 3D THREE.JS SPACE ENVIRONMENT (EARTH & SATELLITE) */}
      {/* ============================================================== */}
      <Suspense fallback={<div className="absolute inset-0 bg-space-950" />}>
        <Landing3DCanvas />
      </Suspense>

      {/* Atmospheric gradient overlay to ensure perfect text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-space-950 via-space-950/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-space-950 via-space-950/60 to-transparent pointer-events-none" />

      {/* ============================================================== */}
      {/* 2. FRIENDLY & EXCITING GAME CONTENT (70% accessible / 30% tech)*/}
      {/* ============================================================== */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-2xl">
        {/* Friendly Eyebrow Badge */}
        <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-space-900/90 border border-cyan-500/40 shadow-inner mb-6 backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
          </span>
          <span className="text-xs font-mono font-bold tracking-wider text-cyan-300">
            NASA SPACE APPS 2026 // SPACE ADVENTURE
          </span>
        </div>

        {/* Catchy, Readable Headings */}
        <div className="space-y-1.5 mb-5">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            BUILD. LAUNCH.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white">
              EXPLORE BEYOND.
            </span>
          </h1>
          <p className="text-lg sm:text-xl font-bold text-slate-200">
            Lead your space agency to the edges of the Solar System.
          </p>
        </div>

        {/* Clear, Engaging 70% Plain English Description */}
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-sans">
          Welcome to <span className="text-white font-semibold">ORBITAL</span>. Assemble your own real-world scientific satellites, launch them on powerful rockets, and discover what lies beyond Earth. Play solo or team up with your crew in 4-player co-op!
        </p>

        {/* Quick 3-Step Game Highlights (Initial Necessary Info) */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-space-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-mono text-xs font-bold mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>1. BUILD</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Snap together solar panels, antennas & science instruments.
            </p>
          </div>

          <div className="bg-space-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center space-x-1.5 text-blue-400 font-mono text-xs font-bold mb-1">
              <Rocket className="w-3.5 h-3.5" />
              <span>2. LAUNCH</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Select rockets & plot orbits around Earth, Moon & Mars.
            </p>
          </div>

          <div className="bg-space-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-mono text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3. DISCOVER</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Collect scientific data & resolve in-flight cosmic events.
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <LandingActions
          onStartMission={onStartMission}
          onOpenMultiplayer={onOpenMultiplayer}
          hasResumableMission={hasResumableMission}
          onResumeMission={onResumeMission}
          activeScenarioCode={activeScenarioCode}
        />
      </div>

      {/* ============================================================== */}
      {/* 3. SUBTLE BOTTOM STATUS BAR */}
      {/* ============================================================== */}
      <div className="relative z-10 p-4 sm:px-10 border-t border-slate-800/80 backdrop-blur-md bg-space-950/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-2">
          <Globe2 className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-semibold">PLAYABLE DESTINATIONS:</span>
          <span className="text-cyan-300">Earth Orbit • Moon • Mars • Deep Space</span>
        </div>

        <div className="flex items-center space-x-4 text-[11px] text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive 3D Simulation</span>
          </span>
          <span>Single-Player & 4-Player Co-Op</span>
        </div>
      </div>
    </section>
  );
}
