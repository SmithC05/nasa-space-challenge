import React from 'react';
import { MissionScenario } from '@orbital/contracts';
import {
  validateMissionStart,
  MissionStartValidationResult,
  MissionStartValidationOptions
} from '../utils/validate-mission-start';
import { Rocket, Lock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface MissionStartButtonProps {
  scenario: MissionScenario | null | undefined;
  gameMode: 'single' | 'multiplayer' | null | undefined;
  onStartMission: () => void;
  options?: MissionStartValidationOptions;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MissionStartButton({
  scenario,
  gameMode,
  onStartMission,
  options,
  size = 'md',
  className = ''
}: MissionStartButtonProps) {
  const validation: MissionStartValidationResult = validateMissionStart(scenario, gameMode, options);

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-2.5 text-xs sm:text-sm',
    lg: 'px-8 py-3.5 text-sm sm:text-base'
  };

  if (!validation.isValid) {
    return (
      <button
        type="button"
        disabled
        title={validation.message}
        className={`rounded-xl bg-space-900 border border-slate-800 text-slate-500 font-mono font-bold flex items-center justify-center space-x-2 cursor-not-allowed opacity-75 ${sizeClasses[size]} ${className}`}
      >
        <Lock className="w-4 h-4 flex-shrink-0" />
        <span>{validation.statusLabel.toUpperCase()}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onStartMission}
      className={`rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold font-mono flex items-center justify-center space-x-2 shadow-lg glow-cyan transition-all hover:scale-[1.02] active:scale-[0.98] ${sizeClasses[size]} ${className}`}
    >
      <span>START MISSION BUILD</span>
      <Rocket className="w-4 h-4 transform -rotate-45" />
    </button>
  );
}

