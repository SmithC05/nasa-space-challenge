import React from 'react';

interface MissionDifficultyProps {
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | string;
}

export function MissionDifficulty({ difficulty }: MissionDifficultyProps) {
  const norm = difficulty.toUpperCase();

  if (norm === 'BEGINNER') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
        BEGINNER
      </span>
    );
  }

  if (norm === 'INTERMEDIATE') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
        INTERMEDIATE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
      ADVANCED
    </span>
  );
}

