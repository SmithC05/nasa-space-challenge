import React from 'react';
import { EngineerRole } from '@orbital/contracts';
import { Shield, Cpu, Compass, Eye, CheckCircle2 } from 'lucide-react';

interface TeamRoleCardProps {
  role: EngineerRole;
  isSelected?: boolean;
  onSelectRole?: (role: EngineerRole) => void;
  isSelectable?: boolean;
}

export const ROLE_DEFINITIONS: Record<
  EngineerRole,
  {
    title: string;
    icon: typeof Shield;
    color: string;
    badgeStyle: string;
    responsibility: string;
  }
> = {
  FLIGHT_DIRECTOR: {
    title: 'Flight Director',
    icon: Shield,
    color: 'text-amber-400',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/80',
    responsibility:
      'Leads the mission team, coordinates decisions and oversees overall mission progress.'
  },
  SYSTEMS_ENGINEER: {
    title: 'Systems Engineer',
    icon: Cpu,
    color: 'text-cyan-400',
    badgeStyle: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/80',
    responsibility:
      'Manages spacecraft systems, engineering configuration, mass, electrical power and subsystem compatibility.'
  },
  TRAJECTORY_SPECIALIST: {
    title: 'Trajectory Specialist',
    icon: Compass,
    color: 'text-purple-400',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/80',
    responsibility:
      'Focuses on orbital planning, spacecraft trajectories, launch opportunities and navigation.'
  },
  SCIENCE_LEAD: {
    title: 'Science Lead',
    icon: Eye,
    color: 'text-emerald-400',
    badgeStyle: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80',
    responsibility:
      'Manages scientific objectives, observation requirements and scientific instrument selection.'
  }
};

export function TeamRoleCard({
  role,
  isSelected = false,
  onSelectRole,
  isSelectable = false
}: TeamRoleCardProps) {
  const def = ROLE_DEFINITIONS[role];
  const Icon = def.icon;

  const handleClick = () => {
    if (isSelectable && onSelectRole) {
      onSelectRole(role);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
        isSelectable ? 'cursor-pointer' : ''
      } ${
        isSelected
          ? 'bg-gradient-to-b from-cyan-950/40 to-space-950 border-cyan-500/70 shadow-lg glow-cyan ring-1 ring-cyan-500/30'
          : 'bg-space-950/80 border-slate-800/90 hover:border-slate-700'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-7 h-7 rounded-lg bg-space-900 border border-slate-800 flex items-center justify-center ${def.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${def.badgeStyle}`}>
              {role.replace('_', ' ')}
            </span>
          </div>
          {isSelected && (
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          )}
        </div>

        <h4 className="text-sm font-bold text-white mt-1">
          {def.title}
        </h4>

        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
          {def.responsibility}
        </p>
      </div>

      {isSelectable && (
        <div className="mt-3 pt-2 border-t border-slate-850 text-[10px] font-mono text-slate-400 text-right">
          {isSelected ? '✓ SELECTED ROLE' : 'CLICK TO SELECT'}
        </div>
      )}
    </div>
  );
}

