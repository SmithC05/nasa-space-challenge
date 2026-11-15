import React, { useState } from 'react';
import { EngineerRole } from '@orbital/contracts';
import { RoomOperationResult } from '../../types/multiplayer-entry.types';
import { CreateRoomPanel } from './CreateRoomPanel';
import { JoinRoomPanel } from './JoinRoomPanel';
import { Users, CheckCircle2, ChevronRight, Plus, LogIn, ArrowLeft } from 'lucide-react';

interface MultiplayerOptionProps {
  scenarioId: string;
  onEnterLobby: (result: RoomOperationResult, role: EngineerRole) => void;
  isAvailable?: boolean;
}

export function MultiplayerOption({
  scenarioId,
  onEnterLobby,
  isAvailable = true
}: MultiplayerOptionProps) {
  const [subView, setSubView] = useState<'overview' | 'create' | 'join'>('overview');

  const features = [
    'Cooperative spacecraft design',
    'Shared mission resources',
    'Team-based engineering decisions',
    'Mission role specialization',
    'Collaborative problem solving'
  ];

  if (subView === 'create') {
    return (
      <CreateRoomPanel
        scenarioId={scenarioId}
        onSuccess={onEnterLobby}
        onCancel={() => setSubView('overview')}
      />
    );
  }

  if (subView === 'join') {
    return (
      <JoinRoomPanel
        onSuccess={onEnterLobby}
        onCancel={() => setSubView('overview')}
      />
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-space-900/90 via-space-950 to-space-950 border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 shadow-xl flex flex-col justify-between group">
      <div>
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-700/80 flex items-center justify-center text-purple-400 shadow-sm group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-purple-950/90 text-purple-300 border border-purple-700/80 tracking-wider">
            UP TO 4 SPECIALISTS
          </span>
        </div>

        {/* Titles */}
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          CO-OPERATIVE EXPEDITION
        </h3>
        <p className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mt-1">
          ONE CREW. ONE MISSION. SHARED DECISIONS.
        </p>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
          Join forces with other space enthusiasts. Assemble a team of up to four mission specialists and work together to design and operate a spacecraft.
        </p>

        {/* Feature List */}
        <div className="mt-6 space-y-2.5 pt-4 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-2">
            CREW CAPABILITIES:
          </span>
          {features.map((feature, i) => (
            <div key={i} className="flex items-center space-x-2.5 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons: Create Room or Join Room */}
      <div className="mt-8 pt-4 border-t border-slate-800/80 space-y-2.5">
        {isAvailable ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSubView('create')}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold font-mono text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg glow-purple transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>CREATE MISSION ROOM</span>
            </button>

            <button
              type="button"
              onClick={() => setSubView('join')}
              className="py-3 px-4 rounded-2xl bg-space-900 hover:bg-space-850 border border-slate-700 hover:border-purple-500/50 text-white font-mono text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all"
            >
              <LogIn className="w-4 h-4 text-purple-400" />
              <span>JOIN ROOM WITH CODE</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled
            className="w-full py-3 px-6 rounded-2xl bg-space-900 border border-slate-800 text-slate-500 font-mono text-xs flex items-center justify-center space-x-2 cursor-not-allowed opacity-80"
          >
            <span>MULTIPLAYER COMING SOON</span>
          </button>
        )}
      </div>
    </div>
  );
}

