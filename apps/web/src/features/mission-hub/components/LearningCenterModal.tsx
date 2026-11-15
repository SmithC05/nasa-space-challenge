import React, { useState } from 'react';
import { getAllLearningConcepts } from '../data/learning-content';
import { LearningConceptId, LearningCategory } from '../types/learning.types';
import { LearningCard } from './learning/LearningCard';
import { LearningDrawer } from './learning/LearningDrawer';
import { BookOpen, X, Compass, Filter, Sparkles } from 'lucide-react';

interface LearningCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreMissions: () => void;
}

export function LearningCenterModal({
  isOpen,
  onClose,
  onExploreMissions
}: LearningCenterModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeConceptId, setActiveConceptId] = useState<LearningConceptId | null>(null);

  if (!isOpen) return null;

  const allConcepts = getAllLearningConcepts();
  const categories: Array<'All' | LearningCategory> = [
    'All',
    'Space Science',
    'Orbital Mechanics',
    'Spacecraft Engineering',
    'Space Communication'
  ];

  const filteredConcepts =
    selectedCategory === 'All'
      ? allConcepts
      : allConcepts.filter((c) => c.category === selectedCategory);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="learning-modal-title"
      >
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-space-900 border border-cyan-500/40 p-6 lg:p-8 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="relative z-10 flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    AEROSPACE LEARNING CENTER
                  </span>
                  <span className="text-xs font-mono text-slate-400">5 CORE CONCEPTS</span>
                </div>
                <h2 id="learning-modal-title" className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Space Science & Spacecraft Engineering
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-space-800 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none font-mono text-xs">
            <span className="text-slate-500 text-xs mr-1 hidden sm:inline flex items-center">
              <Filter className="w-3 h-3 mr-1" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold shadow-sm'
                    : 'bg-space-950/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Concepts Grid (Scrollable) */}
          <div className="relative z-10 overflow-y-auto pr-1 flex-1 max-h-[50vh] scrollbar-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredConcepts.map((concept) => (
                <LearningCard
                  key={concept.id}
                  concept={concept}
                  onSelect={(id) => setActiveConceptId(id)}
                />
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-800 mt-4">
            <div className="text-xs text-slate-400 hidden sm:block">
              Click any concept card to open the interactive dossier.
            </div>
            <div className="flex items-center space-x-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white hover:bg-space-800 transition-colors"
              >
                CLOSE
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExploreMissions();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-extrabold font-mono text-xs flex items-center space-x-2 shadow-lg glow-cyan transition-all"
              >
                <Compass className="w-4 h-4" />
                <span>EXPLORE MISSIONS</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Concept Details Drawer */}
      <LearningDrawer
        conceptId={activeConceptId}
        onClose={() => setActiveConceptId(null)}
        onSelectConcept={(id) => setActiveConceptId(id)}
      />
    </>
  );
}
