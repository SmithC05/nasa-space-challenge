import React from 'react';
import { MissionStartValidationResult } from '../utils/validate-mission-start';
import { CheckCircle2, AlertTriangle, XCircle, Clock, Info } from 'lucide-react';

interface MissionStartStatusProps {
  validation: MissionStartValidationResult;
  showDetails?: boolean;
}

export function MissionStartStatus({ validation, showDetails = true }: MissionStartStatusProps) {
  const getStatusConfig = () => {
    switch (validation.status) {
      case 'READY_TO_START':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-950/70 border-emerald-800',
          badge: 'FLIGHT AUTHORIZED'
        };
      case 'MISSION_UNAVAILABLE':
        return {
          icon: Clock,
          color: 'text-amber-400',
          bg: 'bg-amber-950/70 border-amber-800',
          badge: 'PRE-FLIGHT DEV'
        };
      case 'MULTIPLAYER_NOT_READY':
        return {
          icon: AlertTriangle,
          color: 'text-purple-400',
          bg: 'bg-purple-950/70 border-purple-800',
          badge: 'CREW PENDING'
        };
      case 'MISSING_GAME_MODE':
        return {
          icon: Info,
          color: 'text-sky-400',
          bg: 'bg-sky-950/70 border-sky-800',
          badge: 'MODE REQUIRED'
        };
      default:
        return {
          icon: XCircle,
          color: 'text-rose-400',
          bg: 'bg-rose-950/70 border-rose-800',
          badge: 'VALIDATION REJECTED'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`p-3.5 rounded-2xl border ${config.bg} flex items-start space-x-3 text-xs font-mono`}>
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className={`font-bold ${config.color}`}>{validation.statusLabel}</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-space-950 border border-slate-700 text-slate-400">
            {config.badge}
          </span>
        </div>
        {showDetails && (
          <p className="text-slate-300 font-sans text-xs mt-1 leading-relaxed">
            {validation.message}
          </p>
        )}
      </div>
    </div>
  );
}

