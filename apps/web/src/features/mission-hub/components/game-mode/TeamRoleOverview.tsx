import React from 'react';
import { EngineerRole } from '@orbital/contracts';
import { TeamRoleCard } from './TeamRoleCard';
import { Users, ShieldCheck } from 'lucide-react';

interface TeamRoleOverviewProps {
  selectedRole?: EngineerRole;
  onSelectRole?: (role: EngineerRole) => void;
  isSelectable?: boolean;
}

export function TeamRoleOverview({
  selectedRole,
  onSelectRole,
  isSelectable = false
}: TeamRoleOverviewProps) {
  const roles: EngineerRole[] = [
    'FLIGHT_DIRECTOR',
    'SYSTEMS_ENGINEER',
    'TRAJECTORY_SPECIALIST',
    'SCIENCE_LEAD'
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-400 font-bold mb-0.5">
            <Users className="w-4 h-4" />
            <span>FLIGHT CREW SPECIALIZATIONS</span>
          </div>
          <h4 className="text-base font-bold text-white">
            Available Mission Roles (Max 4 Crew Members)
          </h4>
        </div>

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-xl bg-purple-950/80 border border-purple-800/80 text-purple-300 font-mono text-xs self-start sm:self-auto font-bold shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>TEAM CAPACITY: 4 PLAYERS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {roles.map((role) => (
          <TeamRoleCard
            key={role}
            role={role}
            isSelected={selectedRole === role}
            onSelectRole={onSelectRole}
            isSelectable={isSelectable}
          />
        ))}
      </div>
    </div>
  );
}

