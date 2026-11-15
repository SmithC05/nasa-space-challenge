import React, { useState } from 'react';
import { Rocket, Globe2, Compass, BookOpen, Users, Menu, X, Play } from 'lucide-react';

interface LandingNavigationProps {
  activeView: 'landing' | 'campaigns';
  onNavigateHome: () => void;
  onNavigateMissions: () => void;
  onOpenLearning: () => void;
  onNavigateMultiplayer: () => void;
  hasResumableMission: boolean;
  onResumeMission: () => void;
}

export function LandingNavigation({
  activeView,
  onNavigateHome,
  onNavigateMissions,
  onOpenLearning,
  onNavigateMultiplayer,
  hasResumableMission,
  onResumeMission
}: LandingNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav 
      aria-label="Mission Hub In-Page Navigation"
      className="relative z-30 mb-8 rounded-2xl bg-space-900/80 backdrop-blur-xl border border-slate-800/90 px-5 py-3 shadow-xl transition-all"
    >
      <div className="flex items-center justify-between">
        {/* Brand identity badge */}
        <button
          onClick={onNavigateHome}
          className="flex items-center space-x-3 text-left group transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-sm">
            <Rocket className="w-4 h-4 transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                ORBITAL
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-space-950 text-cyan-400 border border-cyan-800/80 font-bold">
                HUB
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 hidden sm:block">
              MISSION COMMAND
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-2 font-mono text-xs">
          <button
            onClick={onNavigateHome}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeView === 'landing'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-space-850 border border-transparent'
            }`}
          >
            <span>Home</span>
          </button>

          <button
            onClick={onNavigateMissions}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeView === 'campaigns'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-space-850 border border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Missions</span>
          </button>

          <button
            onClick={onOpenLearning}
            className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-space-850 transition-all flex items-center space-x-1.5 border border-transparent"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400/80" />
            <span>Flight Academy</span>
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1.5" />

          <button
            onClick={onNavigateMultiplayer}
            className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-space-850 transition-all flex items-center space-x-1.5 border border-slate-800 hover:border-slate-700"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Multiplayer</span>
          </button>

          {hasResumableMission && (
            <button
              onClick={onResumeMission}
              className="ml-2 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500 text-emerald-300 transition-all flex items-center space-x-1.5 animate-pulse"
              title="Return to active flight"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Resume Flight</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center space-x-2">
          {hasResumableMission && (
            <button
              onClick={onResumeMission}
              className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-mono flex items-center space-x-1"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Resume</span>
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-space-850 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-800/80 flex flex-col space-y-1.5 font-mono text-xs">
          <button
            onClick={() => {
              onNavigateHome();
              setMobileMenuOpen(false);
            }}
            className={`p-2 rounded-lg text-left transition-colors ${
              activeView === 'landing' ? 'bg-cyan-500/15 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-space-850'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigateMissions();
              setMobileMenuOpen(false);
            }}
            className={`p-2 rounded-lg text-left transition-colors flex items-center justify-between ${
              activeView === 'campaigns' ? 'bg-cyan-500/15 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-space-850'
            }`}
          >
            <span>Missions</span>
            <span className="text-[10px] text-cyan-400">4 DESTINATIONS</span>
          </button>
          <button
            onClick={() => {
              onOpenLearning();
              setMobileMenuOpen(false);
            }}
            className="p-2 rounded-lg text-left text-slate-300 hover:bg-space-850 transition-colors flex items-center justify-between"
          >
            <span>Flight Academy</span>
            <span className="text-[10px] text-emerald-400">GUIDES</span>
          </button>
          <button
            onClick={() => {
              onNavigateMultiplayer();
              setMobileMenuOpen(false);
            }}
            className="p-2 rounded-lg text-left text-cyan-300 hover:bg-space-850 transition-colors flex items-center space-x-2 border border-slate-800"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Multiplayer Crew</span>
          </button>
        </div>
      )}
    </nav>
  );
}
