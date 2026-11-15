import React from 'react';
import { User, CheckCircle2, ChevronRight, Rocket, Shield } from 'lucide-react';

interface SinglePlayerOptionProps {
  onStartSolo: () => void;
  isAvailable?: boolean;
}

export function SinglePlayerOption({
  onStartSolo,
  isAvailable = true
}: SinglePlayerOptionProps) {
  const features = [
    'Independent spacecraft design',
    'Complete engineering responsibility',
    'Individual mission decisions',
    'Mission progress tracking',
    'Personal performance evaluation'
  ];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-space-900/90 via-space-950 to-space-950 border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 shadow-xl flex flex-col justify-between group">
      <div>
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-700/80 flex items-center justify-center text-cyan-400 shadow-sm group-hover:scale-105 transition-transform">
            <User className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-700/80 tracking-wider">
            SINGLE-PLAYER MODE
          </span>
        </div>

        {/* Titles */}
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          SOLO EXPEDITION
        </h3>
        <p className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mt-1">
          ONE PILOT. COMPLETE CONTROL.
        </p>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
          Take responsibility for every stage of your space mission. Design your spacecraft, manage engineering resources, plan your mission and make every operational decision independently.
        </p>

        {/* Feature List */}
        <div className="mt-6 space-y-2.5 pt-4 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-2">
            MODE CAPABILITIES:
          </span>
          {features.map((feature, i) => (
            <div key={i} className="flex items-center space-x-2.5 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-8 pt-4 border-t border-slate-800/80">
        {isAvailable ? (
          <button
            type="button"
            onClick={onStartSolo}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold font-mono text-sm flex items-center justify-center space-x-2 shadow-lg glow-cyan transition-all group-hover:shadow-cyan-500/20"
          >
            <Rocket className="w-4 h-4" />
            <span>START SOLO MISSION</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full py-3 px-6 rounded-2xl bg-space-900 border border-slate-800 text-slate-500 font-mono text-xs flex items-center justify-center space-x-2 cursor-not-allowed opacity-80"
          >
            <span>CAMPAIGN COMING SOON</span>
          </button>
        )}
      </div>
    </div>
  );
}

