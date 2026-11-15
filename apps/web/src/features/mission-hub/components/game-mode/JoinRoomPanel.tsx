import React, { useState } from 'react';
import { EngineerRole } from '@orbital/contracts';
import { multiplayerEntryService } from '../../services/multiplayer-entry.adapter';
import { RoomOperationResult } from '../../types/multiplayer-entry.types';
import { RoomCodeInput } from './RoomCodeInput';
import { TeamRoleOverview } from './TeamRoleOverview';
import { Users, Loader2, AlertTriangle, ArrowRight, Radio } from 'lucide-react';

interface JoinRoomPanelProps {
  onSuccess: (result: RoomOperationResult, role: EngineerRole) => void;
  onCancel: () => void;
}

export function JoinRoomPanel({ onSuccess, onCancel }: JoinRoomPanelProps) {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('Specialist');
  const [selectedRole, setSelectedRole] = useState<EngineerRole>('SYSTEMS_ENGINEER');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLive = multiplayerEntryService.isLiveConnection();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMessage('Please enter a valid mission room code.');
      return;
    }

    if (cleanCode.length < 3) {
      setErrorMessage('Room code format too short. Check your crew invitation.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await multiplayerEntryService.joinMissionRoom({
        roomCode: cleanCode,
        name: playerName.trim() || 'Crew Specialist',
        role: selectedRole
      });

      setIsLoading(false);

      if (result.success && result.room) {
        onSuccess(result, selectedRole);
      } else {
        setErrorMessage(result.error || 'Unable to join specified mission room.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'An unexpected connection failure occurred.');
    }
  };

  return (
    <form onSubmit={handleJoin} className="p-6 rounded-3xl bg-space-950/90 border border-cyan-500/40 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold mb-1">
            <Radio className="w-4 h-4" />
            <span>JOIN MISSION ROOM</span>
          </div>
          <h3 className="text-xl font-black text-white">
            Connect to an Active Flight Squad
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Enter the 4-8 character room access code from your commander.
          </p>
        </div>

        <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold self-start sm:self-auto flex items-center space-x-1.5 ${
          isLive ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-900 text-slate-400 border-slate-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          <span>{isLive ? 'LIVE SOCKET ONLINE' : 'DEMO ADAPTER MODE'}</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RoomCodeInput
          value={roomCode}
          onChange={(val) => setRoomCode(val)}
          disabled={isLoading}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-bold text-slate-300">
            YOUR CALLSIGN / NAME
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={isLoading}
            required
            placeholder="e.g. Flight Engineer"
            className="w-full px-4 py-3 rounded-xl bg-space-950 border border-slate-700/80 text-white text-sm font-mono focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-mono font-bold text-slate-300">
          SELECT YOUR DESIRED ROLE
        </label>
        <TeamRoleOverview
          selectedRole={selectedRole}
          onSelectRole={(r) => setSelectedRole(r)}
          isSelectable={!isLoading}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading || !roomCode.trim()}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold font-mono text-xs sm:text-sm flex items-center space-x-2 shadow-lg glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>SEARCHING FOR ROOM...</span>
            </>
          ) : (
            <>
              <span>JOIN MISSION SQUAD</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

