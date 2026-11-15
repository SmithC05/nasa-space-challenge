import React from 'react';
import { LearningConcept } from '../../types/learning.types';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';

interface LearningCardProps {
  concept: LearningConcept;
  onSelect: (conceptId: LearningConcept['id']) => void;
}

export function LearningCard({ concept, onSelect }: LearningCardProps) {
  const categoryBadgeColors = {
    'Space Science': 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
    'Orbital Mechanics': 'bg-purple-950/80 text-purple-300 border-purple-800',
    'Spacecraft Engineering': 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    'Space Communication': 'bg-blue-950/80 text-blue-300 border-blue-800'
  };

  const badgeStyle = categoryBadgeColors[concept.category] || 'bg-slate-900 text-slate-300 border-slate-700';

  return (
    <div
      onClick={() => onSelect(concept.id)}
      className="p-5 rounded-2xl bg-space-950/85 border border-slate-800 hover:border-cyan-500/50 hover:bg-space-900/90 transition-all duration-200 cursor-pointer shadow-sm flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
            {concept.category.toUpperCase()}
          </span>
          <BookOpen className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
        </div>

        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
          {concept.title}
        </h4>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed line-clamp-3">
          {concept.shortExplanation}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <span className="text-[11px] text-slate-400 group-hover:text-slate-300">
          View Guide
        </span>
        <div className="flex items-center space-x-1 text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
          <span>EXPLORE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

