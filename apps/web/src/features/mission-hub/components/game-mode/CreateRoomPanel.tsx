import React, { useState } from 'react';
import { EngineerRole } from '@orbital/contracts';
import { multiplayerEntryService } from '../../services/multiplayer-entry.adapter';
import { RoomOperationResult } from '../../types/multiplayer-entry.types';
import { TeamRoleOverview } from './TeamRoleOverview';
import { Rocket, Loader2, AlertTriangle, CheckCircle2, Radio, Info } from 'lucide-react';

interface CreateRoomPanelProps {
  scenarioId: string;
  onSuccess: (result: RoomOperationResult, role: EngineerRole) => void;
  onCancel: () => void;
}

export function CreateRoomPanel({
  scenarioId,
  onSuccess,
  onCancel
}: CreateRoomPanelProps) {
  const [hostName, setHostName] = useState('Flight Director');
  const [roomName, setRoomName] = useState('Orbital Mission Squad');
  const [selectedRole, setSelectedRole] = useState<EngineerRole>('FLIGHT_DIRECTOR');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdRoomResult, setCreatedRoomResult] = useState<RoomOperationResult | null>(null);

  const isLive = multiplayerEntryService.isLiveConnection();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await multiplayerEntryService.createMissionRoom({
        hostName: hostName.trim() || 'Flight Commander',
        roomName: roomName.trim() || 'Orbital Mission Squad',
        role: selectedRole,
        scenarioId
      });

      setIsLoading(false);

      if (result.success && result.room) {
        setCreatedRoomResult(result);
      } else {
        setErrorMessage(result.error || 'Failed to establish mission room.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'An unexpected connection error occurred.');
    }
  };

  if (createdRoomResult?.room) {
    return (
      <div className="p-6 rounded-3xl bg-space-950 border border-emerald-500/50 shadow-2xl space-y-5 animate-fadeIn">
        <div className="flex items-center space-x-3 text-emerald-400">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">
              Mission Room Established!
            </h4>
            <p className="text-xs text-slate-400 font-mono">
              Share the code below with your 3 co-engineers.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-space-900 border border-slate-800 text-center space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
            ROOM ACCESS CODE
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-cyan-300">
            {createdRoomResult.room.code}
          </div>
          <p className="text-xs text-slate-400">
            Assigned Role: <span className="text-white font-bold">{selectedRole.replace('_', ' ')}</span>
          </p>
        </div>

        {createdRoomResult.isMock && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-900/60 text-xs text-amber-300 flex items-start space-x-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <span>
              <strong>DEMO / MOCK ADAPTER ACTIVE:</strong> No live Socket.IO connection was detected at port 4000. You are proceeding in local cooperative simulation mode.
            </span>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => onSuccess(createdRoomResult, selectedRole)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-black font-extrabold font-mono text-xs sm:text-sm flex items-center space-x-2 shadow-lg glow-cyan transition-all"
          >
            <span>ENTER MULTIPLAYER LOBBY</span>
            <Rocket className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleCreate} className="p-6 rounded-3xl bg-space-950/90 border border-purple-500/40 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-400 font-bold mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>CREATE TEAM MISSION ROOM</span>
          </div>
          <h3 className="text-xl font-black text-white">
            Assemble Your Engineering Squad
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Set up a collaborative room for up to 4 specialists.
          </p>
        </div>

        <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold self-start sm:self-auto flex items-center space-x-1.5 ${
          isLive ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-900 text-slate-400 border-slate-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          <span>{isLive ? 'LIVE SOCKET ONLINE' : 'OFFLINE / DEMO ADAPTER'}</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-bold text-slate-300">
            YOUR CALLSIGN / NAME
          </label>
          <input
            type="text"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            disabled={isLoading}
            required
            placeholder="e.g. Commander Shepard"
            className="w-full px-4 py-2.5 rounded-xl bg-space-900 border border-slate-700 text-white text-xs font-mono focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-bold text-slate-300">
            ROOM NAME
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            disabled={isLoading}
            required
            placeholder="e.g. Artemis Pioneers"
            className="w-full px-4 py-2.5 rounded-xl bg-space-900 border border-slate-700 text-white text-xs font-mono focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-mono font-bold text-slate-300">
          SELECT YOUR CREW ROLE
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
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-extrabold font-mono text-xs sm:text-sm flex items-center space-x-2 shadow-lg glow-purple transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>ESTABLISHING ROOM...</span>
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              <span>CREATE MISSION ROOM</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

