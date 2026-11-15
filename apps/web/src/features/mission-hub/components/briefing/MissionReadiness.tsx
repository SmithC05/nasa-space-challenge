import React from 'react';
import { MissionScenario } from '@orbital/contracts';
import { CheckCircle2, ShieldCheck, CheckSquare, Square } from 'lucide-react';

interface MissionReadinessProps {
  scenario: MissionScenario;
  isAcknowledged: boolean;
  onToggleAcknowledge: () => void;
}

export function MissionReadiness({
  scenario,
  isAcknowledged,
  onToggleAcknowledge
}: MissionReadinessProps) {
  const checklist = [
    { id: 'science', label: 'Scientific Target', value: scenario.targetBody },
    { id: 'mandatory', label: 'Primary Objectives', value: `${scenario.primaryObjectives.length} Core Tasks` },
    { id: 'budget', label: 'Budget Cap', value: `$${scenario.budgetMUSD}M USD` },
    { id: 'mass', label: 'Mass Ceiling', value: `${scenario.maxMassKg} kg` },
    { id: 'constraints', label: 'Flight Hazards', value: `${scenario.environmentalHazards.length} Threat Vectors` },
    { id: 'instruments', label: 'Required Sensors', value: `${scenario.recommendedInstruments.length} Designated` }
  ];

  return (
    <div className="rounded-2xl bg-space-950/90 backdrop-blur-md border border-cyan-500/30 p-4 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Indicator */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-white tracking-wider">
                PRE-FLIGHT READINESS CHECKLIST
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                isAcknowledged
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-space-900 text-slate-400 border border-slate-700'
              }`}>
                {isAcknowledged ? '6/6 VERIFIED' : 'PENDING SIGN-OFF'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Verify mission parameters before entering the Spacecraft Design Lab.
            </div>
          </div>
        </div>

        {/* Right Toggle */}
        <button
          type="button"
          onClick={onToggleAcknowledge}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 self-start lg:self-auto border ${
            isAcknowledged
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
              : 'bg-space-900 text-slate-300 border-slate-700 hover:text-white hover:border-cyan-500/50'
          }`}
        >
          {isAcknowledged ? (
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Square className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>{isAcknowledged ? 'ALL PARAMETERS VERIFIED' : 'ACKNOWLEDGE CHECKLIST'}</span>
        </button>
      </div>

      {/* 6 Inline Checklist Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-3 pt-3 border-t border-slate-800/80">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={`px-2.5 py-2 rounded-xl border flex items-center space-x-2 transition-colors ${
              isAcknowledged
                ? 'bg-space-900/80 border-emerald-500/40 text-slate-200'
                : 'bg-space-900/40 border-slate-800 text-slate-400'
            }`}
          >
            <CheckCircle2
              className={`w-3.5 h-3.5 flex-shrink-0 ${
                isAcknowledged ? 'text-emerald-400' : 'text-slate-600'
              }`}
            />
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider truncate text-slate-400">
                {item.label}
              </div>
              <div className="text-xs font-bold text-white truncate font-mono">
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

