import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '../../../store/gameStore';
import { missionStartService } from '../services/mission-start.service';
import { MissionScenario } from '@orbital/contracts';
import { AlertTriangle, Compass, ArrowLeft } from 'lucide-react';

interface MissionNavigationGuardProps {
  children: (scenario: MissionScenario) => React.ReactNode;
}

export function MissionNavigationGuard({ children }: MissionNavigationGuardProps) {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const { selectedScenario, selectScenario } = useGameStore();

  const resolvedScenario = missionStartService.resolveScenario(scenarioId);

  // Sync route parameter to global store if valid and mismatched
  useEffect(() => {
    if (resolvedScenario && selectedScenario.id !== resolvedScenario.id) {
      selectScenario(resolvedScenario);
    }
  }, [resolvedScenario, selectedScenario.id, selectScenario]);

  // Gracefully handle invalid scenario ID
  if (!resolvedScenario) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-space-900/90 border border-amber-500/30 text-center space-y-5 shadow-2xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-950/80 border border-amber-700/80 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
            NAVIGATION RECOVERY PROTOCOL
          </span>
          <h2 className="text-2xl font-black text-white">INVALID MISSION IDENTIFIER</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            Mission identifier &quot;{scenarioId}&quot; does not match any campaign in the canonical orbital catalog.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/missions')}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-extrabold font-mono text-xs shadow-lg glow-cyan transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>RETURN TO MISSION SELECTION</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children(resolvedScenario)}</>;
}

