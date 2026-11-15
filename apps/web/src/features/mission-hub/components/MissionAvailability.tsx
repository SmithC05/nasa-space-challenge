import React from 'react';
import { CampaignAvailability } from '../data/mission-display-config';
import { CheckCircle2, Clock } from 'lucide-react';

interface MissionAvailabilityProps {
  availability: CampaignAvailability;
  size?: 'sm' | 'md';
}

export function MissionAvailability({ availability, size = 'sm' }: MissionAvailabilityProps) {
  if (availability === 'AVAILABLE') {
    return (
      <span
        className={`inline-flex items-center space-x-1.5 font-mono font-bold rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 shadow-sm ${
          size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>AVAILABLE</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center space-x-1.5 font-mono font-bold rounded-full bg-slate-900/90 text-slate-400 border border-slate-700/80 shadow-sm ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      }`}
    >
      <Clock className="w-3 h-3 text-slate-400" />
      <span>COMING SOON</span>
    </span>
  );
}

