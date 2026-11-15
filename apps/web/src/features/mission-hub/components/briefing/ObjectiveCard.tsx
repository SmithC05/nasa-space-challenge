import React from 'react';
import { Target, Clock, AlertCircle } from 'lucide-react';

export type ObjectiveCategory = 'MANDATORY' | 'OPTIONAL' | 'BONUS';

interface ObjectiveCardProps {
  title: string;
  category: ObjectiveCategory;
  whyItMatters: string;
}

export function ObjectiveCard({ title, category, whyItMatters }: ObjectiveCardProps) {
  const categoryStyles = {
    MANDATORY: {
      badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/80',
      border: 'border-cyan-500/30 hover:border-cyan-400/60',
      icon: 'text-cyan-400'
    },
    OPTIONAL: {
      badge: 'bg-purple-950/80 text-purple-300 border-purple-700/80',
      border: 'border-purple-500/30 hover:border-purple-400/60',
      icon: 'text-purple-400'
    },
    BONUS: {
      badge: 'bg-amber-950/80 text-amber-300 border-amber-700/80',
      border: 'border-amber-500/30 hover:border-amber-400/60',
      icon: 'text-amber-400'
    }
  };

  const current = categoryStyles[category];

  return (
    <div className={`p-4 rounded-2xl bg-space-950/85 border ${current.border} transition-all duration-200 shadow-sm flex flex-col justify-between`}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${current.badge}`}>
            {category} OBJECTIVE
          </span>
          <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>PENDING IN-FLIGHT EXECUTION</span>
          </span>
        </div>

        <div className="flex items-start space-x-2.5 mt-2">
          <Target className={`w-4 h-4 mt-0.5 flex-shrink-0 ${current.icon}`} />
          <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
            {title}
          </h4>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-300 leading-relaxed flex items-start space-x-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-cyan-400/80 flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-400 font-semibold font-mono text-[10px]">WHY IT MATTERS: </span>
          <span>{whyItMatters}</span>
        </div>
      </div>
    </div>
  );
}

