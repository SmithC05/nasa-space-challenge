import React from 'react';
import { MissionScenario } from '@orbital/contracts';
import { getCampaignDisplayConfig } from '../data/mission-display-config';
import { MissionCard } from './MissionCard';

interface MissionGridProps {
  scenarios: MissionScenario[];
  selectedScenario: MissionScenario;
  onSelectScenario: (scenario: MissionScenario) => void;
  onViewDetails: (scenario: MissionScenario) => void;
  onStartOrPreview: (scenario: MissionScenario) => void;
}

export function MissionGrid({
  scenarios,
  selectedScenario,
  onSelectScenario,
  onViewDetails,
  onStartOrPreview
}: MissionGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {scenarios.map((scenario) => {
        const config = getCampaignDisplayConfig(scenario.id);
        const isSelected = selectedScenario.id === scenario.id;

        return (
          <MissionCard
            key={scenario.id}
            scenario={scenario}
            config={config}
            isSelected={isSelected}
            onSelect={() => onSelectScenario(scenario)}
            onViewDetails={() => onViewDetails(scenario)}
            onStartOrPreview={() => onStartOrPreview(scenario)}
          />
        );
      })}
    </div>
  );
}

