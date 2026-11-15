import React from 'react';
import { Globe2, BookOpen, Users, ArrowUpRight, Sparkles, Orbit, Rocket } from 'lucide-react';
import { MissionScenario } from '@orbital/contracts';

interface SecondaryEntryCardsProps {
  onOpenMissionGallery: () => void;
  onOpenLearningCenter: () => void;
  scenarios: MissionScenario[];
}

export function SecondaryEntryCards({
  onOpenMissionGallery,
  onOpenLearningCenter,
  scenarios
}: SecondaryEntryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
      {/* 1. Mission Gallery Card */}
      <div 
        onClick={onOpenMissionGallery}
        className="group cursor-pointer relative overflow-hidden rounded-3xl bg-gradient-to-b from-space-900/90 to-space-950/90 border border-slate-800/90 hover:border-cyan-500/50 p-6 transition-all duration-300 shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <Globe2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-space-950 border border-slate-700 text-cyan-300 flex items-center space-x-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>4 MISSIONS READY</span>
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between group-hover:text-cyan-300 transition-colors">
          <span>MISSION CAMPAIGNS</span>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Choose where you want to fly. Protect Earth's polar climate, hunt for water on the Moon, scout Martian dust storms, or intercept a deep-space asteroid.
        </p>

        {/* 4 Destinations */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-3 border-t border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span>🌍</span>
            <span>Earth Sentinel</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <span>🌕</span>
            <span>Lunar Prospector</span>
          </div>
          <div className="flex items-center space-x-1.5 text-amber-400">
            <span>🔴</span>
            <span>Mars Weather</span>
          </div>
          <div className="flex items-center space-x-1.5 text-purple-400">
            <span>☄️</span>
            <span>Asteroid Defense</span>
          </div>
        </div>
      </div>

      {/* 2. Space Academy / Learning Center Card */}
      <div 
        onClick={onOpenLearningCenter}
        className="group cursor-pointer relative overflow-hidden rounded-3xl bg-gradient-to-b from-space-900/90 to-space-950/90 border border-slate-800/90 hover:border-emerald-500/50 p-6 transition-all duration-300 shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center space-x-1 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BEGINNER FRIENDLY</span>
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between group-hover:text-emerald-300 transition-colors">
          <span>FLIGHT ACADEMY</span>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          New to rocket science? Learn the basics of orbits, solar power, and satellite equipment in plain language with simple interactive guides.
        </p>

        {/* Learning Pills */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800/80">
          <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-space-950 border border-slate-800 text-slate-300">
            How Orbits Work
          </span>
          <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-space-950 border border-slate-800 text-slate-300">
            Solar Power & Batteries
          </span>
          <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-space-950 border border-slate-800 text-slate-300">
            Radar & Cameras
          </span>
        </div>
      </div>

      {/* 3. Multiplayer Crew Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-space-900/90 to-space-950/90 border border-slate-800/90 p-6 flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-800 text-blue-300 font-bold">
              4-PLAYER CO-OP
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mb-2">
            CREW MULTIPLAYER
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            Invite friends to your Mission Control room. Assign roles like Flight Director, Systems Engineer, and Science Lead to manage spacecraft together in real time.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="text-cyan-400 font-semibold">Real-Time Sockets</span>
          <span>Role Specialization</span>
        </div>
      </div>
    </div>
  );
}
