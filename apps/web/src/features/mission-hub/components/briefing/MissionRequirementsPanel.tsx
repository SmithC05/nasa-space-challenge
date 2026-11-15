import React from 'react';
import { MissionScenario } from '@orbital/contracts';
import { LearningConceptId } from '../../types/learning.types';
import { RequirementMetric } from './RequirementMetric';
import {
  DollarSign,
  Weight,
  Clock,
  Compass,
  Trophy,
  Wifi,
  Sliders
} from 'lucide-react';

interface MissionRequirementsPanelProps {
  scenario: MissionScenario;
  onOpenConcept?: (conceptId: LearningConceptId) => void;
}

export function MissionRequirementsPanel({ scenario, onOpenConcept }: MissionRequirementsPanelProps) {
  // Beginner-friendly explanations of orbit types
  const orbitExplanations: Record<string, string> = {
    SSO: 'Sun-Synchronous Orbit: passes over Earth poles at consistent solar lighting for clear daily photography.',
    LEO: 'Low Earth Orbit: closest to Earth (300-800 km) providing high image detail and lower rocket fuel costs.',
    TLI: 'Trans-Lunar Injection: high-energy orbital trajectory escaping Earth gravity towards the Moon.',
    GTO: 'Geostationary Transfer Orbit: elliptical stepping-stone orbit used to travel to high altitudes.',
    GEO: 'Geostationary Orbit: orbits at the exact rotation speed of Earth, hovering continuously over one hemisphere.',
    MOLNIYA: 'Highly elliptical orbit optimized for high-latitude polar communications.'
  };

  const orbitDesc =
    orbitExplanations[scenario.targetOrbitType] ||
    `Target operational trajectory for scientific research around ${scenario.targetBody}.`;

  return (
    <div className="rounded-3xl bg-space-900/80 border border-slate-800 p-6 sm:p-7 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold">
          <Sliders className="w-4 h-4" />
          <span>MISSION REQUIREMENTS & RESOURCE LIMITS</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
          CANONICAL SCENARIO DATA
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <RequirementMetric
          label="Mission Budget"
          value={`$${scenario.budgetMUSD}`}
          unit="MUSD"
          explanation="Total funding for satellite chassis, solar arrays, propulsion, and ground telemetry."
          icon={DollarSign}
          accentColor="emerald"
        />

        <RequirementMetric
          label="Payload Mass Cap"
          value={scenario.maxMassKg}
          unit="kg"
          explanation="Maximum spacecraft weight permitted by your launch rocket payload fairing."
          icon={Weight}
          accentColor="cyan"
          conceptId="payload-capacity"
          onOpenConcept={onOpenConcept}
        />

        <RequirementMetric
          label="Mission Duration"
          value={scenario.durationDays}
          unit="Days"
          explanation="Configured active operational lifetime in orbit for research and observation."
          icon={Clock}
          accentColor="purple"
        />

        <RequirementMetric
          label="Target Orbit Profile"
          value={scenario.targetOrbitType}
          unit="Orbit"
          explanation={orbitDesc}
          icon={Compass}
          accentColor="blue"
          conceptId="orbital-selection"
          onOpenConcept={onOpenConcept}
        />

        <RequirementMetric
          label="Min Science Output"
          value={scenario.minSciencePoints}
          unit="Points"
          explanation="Required scientific data return to achieve primary mission completion and NASA approval."
          icon={Trophy}
          accentColor="amber"
          conceptId="earth-observation"
          onOpenConcept={onOpenConcept}
        />

        <RequirementMetric
          label="Min Downlink Rate"
          value={scenario.minBandwidthMbps}
          unit="Mbps"
          explanation="Minimum radio telemetry transmission bandwidth required to stream sensor observations home."
          icon={Wifi}
          accentColor="cyan"
          conceptId="space-communication"
          onOpenConcept={onOpenConcept}
        />
      </div>
    </div>
  );
}

