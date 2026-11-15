import React, { useState } from 'react';
import { MissionScenario } from '@orbital/contracts';
import { ObjectiveCard, ObjectiveCategory } from './ObjectiveCard';
import { Target, CheckCircle, PlusCircle, Sparkles, HelpCircle } from 'lucide-react';

interface MissionObjectiveSectionProps {
  scenario: MissionScenario;
}

export function MissionObjectiveSection({ scenario }: MissionObjectiveSectionProps) {
  const [activeTab, setActiveTab] = useState<'mandatory' | 'optional' | 'bonus'>('mandatory');

  // Contextual "why it matters" explanations for canonical objectives
  const whyItMattersMap: Record<string, string> = {
    'Map polar ice thickness with Synthetic Aperture Radar (SAR) or LiDAR.':
      'Polar ice regulates global sea levels; precise thickness measurements help climate scientists predict melting rates and prevent coastal disasters.',
    'Maintain continuous orbital downlink to ground stations.':
      'Observations are useless if they remain trapped onboard; constant downlink ensures real-time hazard warnings reach disaster response teams.',
    'Achieve positive power balance across high-latitude solar eclipses.':
      'Satellites spend 35 minutes in dark Earth shadow every orbit; a net positive power loop ensures survival without brownouts.',
    'Detect localized methane leaks over major industrial corridors.':
      'Methane is 28x more potent than CO2 as a greenhouse gas; pinpointing leaks enables immediate industrial containment.',
    'Maintain battery depth-of-discharge below 60%.':
      'Draining batteries too deeply degrades lithium-ion cells over time; preserving 40%+ reserve extends satellite lifespan for years.',
    'Execute Trans-Lunar Injection and lunar orbit capture with onboard propulsion.':
      'Reaching lunar orbit requires precise propulsion burns to avoid missing the Moon or crashing into its surface.',
    'Conduct neutron & gamma-ray spectrometry over the lunar south pole.':
      'Hydrogen signatures reveal subsurface water ice hidden inside dark craters, vital for future astronaut drinking water and rocket fuel.',
    'Map surface elevation with sub-meter laser altimetry.':
      'High-precision terrain maps reveal boulder hazards and safe landing zones for Artemis astronaut landings.',
    'Map lunar magnetic anomalies (mascons).':
      'Unusual mass concentrations cause gravitational tugs that can disrupt low orbits if unmapped.',
    'Provide relay communications beacon for landed robotic rovers.':
      'Rovers inside deep craters cannot see Earth directly; an overhead satellite acts as a vital communications lifeline.',
    'Monitor global Martian dust storm genesis in real time.':
      'Dust storms can blot out the Sun globally within hours, leaving solar rovers powerless and blinded.',
    'Map atmospheric trace gas concentrations (methane and water vapor).':
      'Trace gases offer clues about ancient microbial life and active geological subsurface processes.',
    'Demonstrate deep space optical laser communications to Earth.':
      'Laser beams transmit 10x to 100x more data across deep space than conventional radio dishes.',
    'Survive severe dust attenuation on solar array power generation.':
      'Fine red dust coats solar arrays; smart power throttling prevents permanent satellite freezing.',
    'Calibrate ionospheric perturbation models during solar flares.':
      'Solar radiation storms scramble GPS and radar; calibration models help future crewed missions navigate safely.'
  };

  const getWhyItMatters = (title: string, category: ObjectiveCategory): string => {
    if (whyItMattersMap[title]) return whyItMattersMap[title];
    if (category === 'MANDATORY') {
      return 'Essential milestone required to satisfy core mission contracts and secure flight certification.';
    }
    return 'Secondary goal that earns supplementary scientific prestige and rewards optimal engineering efficiency.';
  };

  return (
    <div className="rounded-3xl bg-space-900/80 border border-slate-800 p-6 sm:p-7 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold mb-1">
            <Target className="w-4 h-4" />
            <span>MISSION OBJECTIVES</span>
          </div>
          <h3 className="text-xl font-black text-white">
            Target Goals & Deliverables
          </h3>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-space-950 border border-slate-800 self-start sm:self-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('mandatory')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'mandatory'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Mandatory ({scenario.primaryObjectives.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('optional')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'optional'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Optional ({scenario.secondaryObjectives.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bonus')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'bonus'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bonus (0)</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'mandatory' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-300 mb-2 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Core requirements: all mandatory objectives must be fulfilled to pass the mission.</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {scenario.primaryObjectives.map((obj, i) => (
              <ObjectiveCard
                key={i}
                title={obj}
                category="MANDATORY"
                whyItMatters={getWhyItMatters(obj, 'MANDATORY')}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'optional' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-300 mb-2 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Secondary milestones: not strictly required, but significantly boost your mission evaluation rating.</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {scenario.secondaryObjectives.map((obj, i) => (
              <ObjectiveCard
                key={i}
                title={obj}
                category="OPTIONAL"
                whyItMatters={getWhyItMatters(obj, 'OPTIONAL')}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bonus' && (
        <div className="p-8 rounded-2xl bg-space-950/80 border border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-space-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-2">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h4 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
            NO BONUS OBJECTIVES CONFIGURED
          </h4>
          <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
            This campaign currently defines canonical mandatory and secondary objectives only. No supplemental bonus objectives are configured in the current flight plan.
          </p>
        </div>
      )}
    </div>
  );
}

