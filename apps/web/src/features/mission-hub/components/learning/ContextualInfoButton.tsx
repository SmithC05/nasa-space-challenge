import React from 'react';
import { Info, HelpCircle } from 'lucide-react';
import { LearningConceptId } from '../../types/learning.types';

interface ContextualInfoButtonProps {
  conceptId: LearningConceptId;
  label?: string;
  onOpenConcept: (conceptId: LearningConceptId) => void;
  size?: 'sm' | 'md';
  variant?: 'subtle' | 'badge' | 'icon-only';
  className?: string;
}

export function ContextualInfoButton({
  conceptId,
  label = 'Learn more',
  onOpenConcept,
  size = 'sm',
  variant = 'icon-only',
  className = ''
}: ContextualInfoButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenConcept(conceptId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onOpenConcept(conceptId);
    }
  };

  if (variant === 'badge') {
    return (
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Open learning guide for ${conceptId}`}
        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900/90 hover:border-cyan-500/80 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${className}`}
      >
        <Info className="w-3 h-3 text-cyan-400" />
        <span>INFO</span>
      </button>
    );
  }

  if (variant === 'subtle') {
    return (
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Open learning guide for ${conceptId}`}
        className={`inline-flex items-center space-x-1 text-slate-400 hover:text-cyan-300 transition-colors text-xs font-mono group focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded ${className}`}
      >
        <HelpCircle className="w-3.5 h-3.5 text-cyan-500/80 group-hover:text-cyan-300" />
        <span className="text-[11px] underline decoration-cyan-500/40 underline-offset-2">
          {label}
        </span>
      </button>
    );
  }

  // Default: icon-only button with tooltip accessibility
  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Open learning guide for ${conceptId}`}
      title={`Learn about this concept (${label})`}
      className={`inline-flex items-center justify-center p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/50 border border-transparent hover:border-cyan-800/60 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${className}`}
    >
      <Info className={size === 'sm' ? 'w-3.5 h-3.5 text-cyan-400' : 'w-4 h-4 text-cyan-400'} />
    </button>
  );
}

