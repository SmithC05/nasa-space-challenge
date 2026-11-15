import React from 'react';
import { KeyRound } from 'lucide-react';

interface RoomCodeInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export function RoomCodeInput({
  value,
  onChange,
  error,
  disabled = false
}: RoomCodeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Force uppercase and remove invalid characters
    const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 12);
    onChange(clean);
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-mono font-bold text-slate-300">
        MISSION ROOM CODE
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <KeyRound className="w-4 h-4 text-cyan-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="e.g. SIM-A4B9"
          className={`w-full pl-10 pr-4 py-3 rounded-xl bg-space-950 border font-mono text-sm tracking-wider uppercase text-white placeholder-slate-600 focus:outline-none transition-all ${
            error
              ? 'border-red-500 focus:ring-2 focus:ring-red-400/50'
              : 'border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30'
          }`}
        />
      </div>

      {error ? (
        <p className="text-xs text-red-400 font-mono flex items-center space-x-1 pt-0.5">
          <span>⚠</span>
          <span>{error}</span>
        </p>
      ) : (
        <p className="text-[11px] text-slate-400 font-mono">
          Enter the room code shared by your flight commander.
        </p>
      )}
    </div>
  );
}

