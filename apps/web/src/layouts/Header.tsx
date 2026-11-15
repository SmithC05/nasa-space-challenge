import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const TABS: { id: ActiveTab; label: string; code: string; icon: any; route: string }[] = [
  { id: 'hub', label: 'Mission Hub', code: 'M01', icon: Globe, route: '/missions' },
  { id: 'lab', label: 'Spacecraft Lab', code: 'M02', icon: Cpu, route: '/spacecraft-design' },
  { id: 'orbit', label: 'Orbit & Launch', code: 'M03', icon: Compass, route: '/orbit' },
  { id: 'ops', label: 'Mission Operations', code: 'M04', icon: Activity, route: '/operations' },
  { id: 'multiplayer', label: 'Multiplayer Crew', code: 'M05', icon: Users, route: '/multiplayer' }
];

export function Header() {
  const navigate = useNavigate();
  const { activeTab, setActiveTab, activeRoom, currentDesign, selectedScenario } = useGameStore();
  const [dbStatus, setDbStatus] = useState<string>('checking');

  useEffect(() => {
    fetchHealth().then((res) => {
      setDbStatus(res.database === 'connected' ? 'PGlite' : 'Online');
    });
  }, []);

  const handleTabClick = (tab: typeof TABS[number]) => {
    setActiveTab(tab.id);
    navigate(tab.route);
  };

  const handleBrandClick = () => {
    setActiveTab('hub');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-space-950/95 backdrop-blur-2xl border-b border-slate-800/80 px-6 lg:px-10 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-8">
        {/* Brand & Mission Tag */}
        <button
          type="button"
          onClick={handleBrandClick}
          className="flex items-center space-x-3.5 flex-shrink-0 text-left hover:opacity-90 transition-opacity cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[1px] shadow-lg glow-cyan group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-space-950 rounded-[11px] flex items-center justify-center">
              <Rocket className="w-5 h-5 text-cyan-400 transform -rotate-45" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-black text-white text-lg tracking-wider">ORBITAL</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 font-bold tracking-wide">
                2026 NASA SPACE APPS
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center space-x-1.5">
              <span>MISSION CONTROL</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-semibold">{selectedScenario.code}</span>
            </div>
          </div>
        </button>

        {/* Module Switcher Tabs with proper spacing */}
        <nav className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono flex items-center space-x-2 transition-all duration-200 whitespace-nowrap border ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-200 border-cyan-500/50 glow-cyan font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-900/90 border-slate-800/60 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-800/80' : 'bg-space-950 text-slate-500 border border-slate-800'
                }`}>
                  {tab.code}
                </span>
                <span className="tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* System & Multiplayer Room Status */}
        <div className="hidden lg:flex items-center space-x-3 text-xs font-mono flex-shrink-0">
          {activeRoom && (
            <div className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-800/80 text-purple-300 flex items-center space-x-2 shadow-sm">
              <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="font-bold">ROOM: {activeRoom.code}</span>
            </div>
          )}

          <div className="px-3 py-1.5 rounded-xl bg-space-900 border border-slate-800/90 text-slate-300 flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-500/30" />
            <span className="text-slate-400">DB:</span>
            <span className="text-emerald-400 font-bold">{dbStatus}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
