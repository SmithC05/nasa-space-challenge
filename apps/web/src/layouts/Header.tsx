import React, { useEffect, useState } from 'react';
import { useGameStore, ActiveTab } from '../store/gameStore';
import { fetchHealth } from '../services/api';
import {
  Activity,
  Compass,
  Cpu,
  Globe,
  Radio,
  Rocket,
  Users
} from 'lucide-react';

const TABS: { id: ActiveTab; label: string; code: string; icon: any }[] = [
  { id: 'hub', label: 'Mission Hub', code: 'M01', icon: Globe },
  { id: 'lab', label: 'Spacecraft Lab', code: 'M02', icon: Cpu },
  { id: 'orbit', label: 'Orbit & Launch', code: 'M03', icon: Compass },
  { id: 'ops', label: 'Mission Operations', code: 'M04', icon: Activity },
  { id: 'multiplayer', label: 'Multiplayer Crew', code: 'M05', icon: Users }
];

export function Header() {
  const { activeTab, setActiveTab, activeRoom, currentDesign, selectedScenario } = useGameStore();
  const [dbStatus, setDbStatus] = useState<string>('checking');

  useEffect(() => {
    fetchHealth().then((res) => {
      setDbStatus(res.database === 'connected' ? 'PGlite' : 'Online');
    });
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-space-950/90 backdrop-blur-xl border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Mission Tag */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg glow-cyan">
            <Rocket className="w-5 h-5 text-white transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white text-lg tracking-wider">ORBITAL</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                2026 NASA SPACE APPS
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              MISSION CONTROL • <span className="text-slate-300">{selectedScenario.code}</span>
            </div>
          </div>
        </div>

        {/* Module Switcher Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center space-x-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 glow-cyan font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-space-900 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] text-cyan-500 font-bold">{tab.code}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* System & Multiplayer Room Status */}
        <div className="hidden lg:flex items-center space-x-3 text-xs font-mono">
          {activeRoom && (
            <div className="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-300 flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>ROOM: {activeRoom.code}</span>
            </div>
          )}

          <div className="px-2.5 py-1 rounded-lg bg-space-900 border border-slate-800 text-slate-300 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">DB:</span>
            <span className="text-emerald-400 font-semibold">{dbStatus}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
