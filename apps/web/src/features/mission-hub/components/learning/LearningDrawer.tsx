import React, { useEffect } from 'react';
import { LearningConceptId } from '../../types/learning.types';
import { getLearningConcept } from '../../data/learning-content';
import {
  X,
  BookOpen,
  Sparkles,
  Target,
  ArrowRight,
  Info,
  Layers,
  HelpCircle
} from 'lucide-react';

interface LearningDrawerProps {
  conceptId: LearningConceptId | null;
  onClose: () => void;
  onSelectConcept: (conceptId: LearningConceptId) => void;
}

export function LearningDrawer({
  conceptId,
  onClose,
  onSelectConcept
}: LearningDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (conceptId) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [conceptId, onClose]);

  if (!conceptId) return null;

  const concept = getLearningConcept(conceptId);
  if (!concept) return null;

  const categoryColorMap = {
    'Space Science': 'bg-cyan-950 text-cyan-300 border-cyan-700/80',
    'Orbital Mechanics': 'bg-purple-950 text-purple-300 border-purple-700/80',
    'Spacecraft Engineering': 'bg-emerald-950 text-emerald-300 border-emerald-800',
    'Space Communication': 'bg-blue-950 text-blue-300 border-blue-700/80'
  };

  const badgeStyle = categoryColorMap[concept.category] || 'bg-slate-900 text-slate-300 border-slate-700';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="learning-drawer-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl h-full bg-space-950 border-l border-cyan-500/30 p-6 sm:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800/80 pb-4 mb-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${badgeStyle}`}>
                  {concept.category.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ORBITAL FLIGHT ACADEMY
                </span>
              </div>
              <h2 id="learning-drawer-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {concept.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close learning drawer"
              className="p-2 rounded-xl bg-space-900 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section 1: Beginner Explanation */}
          <div className="mb-6">
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>THE BASICS</span>
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed bg-space-900/60 border border-slate-800/80 p-4 rounded-2xl">
              {concept.shortExplanation}
            </p>
          </div>

          {/* Section 2: Why It Matters in Space Missions */}
          <div className="mb-6">
            <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WHY IT MATTERS</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-2xl">
              {concept.whyItMatters}
            </p>
          </div>

          {/* Section 3: Connection to ORBITAL Gameplay */}
          <div className="mb-6">
            <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5" />
              <span>CONNECTION TO ORBITAL</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-purple-950/20 border border-purple-900/40 p-4 rounded-2xl">
              {concept.connectionToOrbital}
            </p>
          </div>

          {/* Section 4: Deeper Dive Points */}
          <div className="mb-6">
            <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>KEY DETAILS & DEEPER DIVE</span>
            </h3>
            <div className="space-y-2">
              {concept.expandedPoints.map((point, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-space-900/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Glossary Terms */}
          {concept.keyTerms.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>KEY TERMINOLOGY</span>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {concept.keyTerms.map((term, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-space-900/50 border border-slate-800/60">
                    <div className="text-xs font-bold text-white font-mono mb-0.5">
                      {term.term}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      {term.definition}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Related Topics */}
          {concept.relatedConcepts.length > 0 && (
            <div className="mb-6 pt-4 border-t border-slate-800/80">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                RELATED CONCEPTS
              </h3>
              <div className="flex flex-wrap gap-2">
                {concept.relatedConcepts.map((relId) => {
                  const relConcept = getLearningConcept(relId);
                  if (!relConcept) return null;
                  return (
                    <button
                      key={relId}
                      type="button"
                      onClick={() => onSelectConcept(relId)}
                      className="px-3 py-1.5 rounded-xl bg-space-900 hover:bg-space-850 border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center space-x-1.5 group"
                    >
                      <span>{relConcept.title.replace('WHAT IS ', '').replace('WHY DOES ', '').replace('WHAT DOES ', '').replace('?', '')}</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500">
            PRESS ESC OR CLICK OUTSIDE TO CLOSE
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-space-900 hover:bg-space-850 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}

