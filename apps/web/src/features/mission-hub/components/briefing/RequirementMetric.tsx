import React from 'react';
import { LucideIcon } from 'lucide-react';
import { LearningConceptId } from '../../types/learning.types';
import { ContextualInfoButton } from '../learning/ContextualInfoButton';

interface RequirementMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  explanation: string;
  icon: LucideIcon;
  accentColor?: 'cyan' | 'emerald' | 'purple' | 'amber' | 'blue';
  conceptId?: LearningConceptId;
  onOpenConcept?: (conceptId: LearningConceptId) => void;
}

export function RequirementMetric({
  label,
  value,
  unit,
  explanation,
  icon: Icon,
  accentColor = 'cyan',
  conceptId,
  onOpenConcept
}: RequirementMetricProps) {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/30',
      iconBg: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/80',
      valueText: 'text-cyan-300'
    },
    emerald: {
      border: 'border-emerald-500/30',
      iconBg: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
      valueText: 'text-emerald-400'
    },
    purple: {
      border: 'border-purple-500/30',
      iconBg: 'bg-purple-950/80 text-purple-400 border-purple-800/80',
      valueText: 'text-purple-300'
    },
    amber: {
      border: 'border-amber-500/30',
      iconBg: 'bg-amber-950/80 text-amber-400 border-amber-800/80',
      valueText: 'text-amber-300'
    },
    blue: {
      border: 'border-blue-500/30',
      iconBg: 'bg-blue-950/80 text-blue-400 border-blue-800/80',
      valueText: 'text-blue-300'
    }
  };

  const style = colorMap[accentColor];

  return (
    <div className={`p-4 rounded-2xl bg-space-950/85 border ${style.border} flex flex-col justify-between hover:border-cyan-400/50 transition-all duration-200 shadow-sm group`}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-mono text-slate-400 tracking-wider uppercase font-semibold">
              {label}
            </span>
            {conceptId && onOpenConcept && (
              <ContextualInfoButton
                conceptId={conceptId}
                label={label}
                onOpenConcept={onOpenConcept}
                size="sm"
              />
            )}
          </div>
          <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${style.iconBg}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1.5 mt-1">
          <span className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${style.valueText}`}>
            {value}
          </span>
          {unit && (
            <span className="text-xs font-mono text-slate-400 font-bold uppercase">
              {unit}
            </span>
          )}
        </div>
      </div>

      <p className="text-[11px] text-slate-300 mt-2.5 leading-relaxed border-t border-slate-800/80 pt-2 font-normal">
        {explanation}
      </p>
    </div>
  );
}

