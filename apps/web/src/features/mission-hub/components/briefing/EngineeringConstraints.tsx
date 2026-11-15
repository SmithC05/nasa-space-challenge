import React from 'react';
import { MissionScenario } from '@orbital/contracts';
import { LearningConceptId } from '../../types/learning.types';
import { ContextualInfoButton } from '../learning/ContextualInfoButton';
import { ShieldAlert, AlertTriangle, Cpu, Scale, DollarSign, CheckCircle2 } from 'lucide-react';

interface EngineeringConstraintsProps {
  scenario: MissionScenario;
  onOpenConcept?: (conceptId: LearningConceptId) => void;
}

export function EngineeringConstraints({ scenario, onOpenConcept }: EngineeringConstraintsProps) {
  // Scientific purpose of recommended instruments
  const instrumentPurposes: Record<string, string> = {
    'Synthetic Aperture Radar': 'High-power radar payload for ground topography and polar ice imaging through clouds and night.',
    'Multispectral Imager': 'Multi-band optical camera for surface vegetation, forest cover, and thermal wildfire detection.',
    'Fourier Spectrometer': 'Atmospheric gas scanner measuring greenhouse gas spikes and chemical concentrations.',
    'Gamma-Ray Spectrometer': 'Nuclear spectrometer detecting subsurface elemental hydrogen and water ice.',
    'Fluxgate Magnetometer': 'Sensitive magnetic field sensor mapping planetary crustal anomalies.',
    'Laser Optical Downlink': 'Next-gen high-bandwidth laser transmitter beaming data across interplanetary distances.',
    'Atmospheric Fourier Spectrometer': 'Infrared sensor analyzing Martian dust storms and seasonal pressure cycles.',
    'Optical Laser Terminal': 'Deep space laser transceiver providing high-rate telemetry return.',
    'High-Gain Dish': 'Parabolic steerable antenna maintaining direct radio contact with Earth.',
    'Long-Range Radar': 'Tracking radar calculating asteroid orbital velocities and spin dynamics.',
    'Infrared Spectrometer': 'Thermal scanner identifying mineral composition and water-bearing clay on asteroid rocks.',
    'Close-Proximity LIDAR': 'Laser ranging sensor for navigation during close asteroid rendezvous.'
  };

  // Plain-English hazard explanations
  const hazardSignificance: Record<string, string> = {
    'Frequent 35-minute orbital eclipses over polar night sectors.':
      'Craft enters total darkness every orbit: solar generation drops to zero; battery bank must power critical thermal and computer systems.',
    'Atomic oxygen erosion in low Earth orbit.':
      'Reactive atomic oxygen gradually erodes unshielded exterior polymers and optical coatings over extended orbital duration.',
    'Deep thermal swings between lunar sunlight (+120°C) and shadowed craters (-230°C).':
      'Severe thermal shock requires automated electrical heaters and multilayer insulation blankets to prevent battery freezing.',
    'Solar energetic particles outside Earth’s protective magnetosphere.':
      'High-energy cosmic radiation can cause microchip bit-flips and sensor anomalies; radiation-hardened components recommended.',
    'Severe solar flux reduction at 1.52 AU (requires oversized solar arrays or RTG).':
      'Solar intensity at Mars is less than half of Earth; craft needs doubled solar wing surface area or nuclear power.',
    'Round-trip light delay between 4 and 22 minutes requiring autonomous AOCS.':
      'Direct real-time joystick control is physically impossible; attitude control loops must be autonomous.',
    'Micro-meteorite bombardment and irregular tumbling gravity fields.':
      'Faceted tumbling asteroids create chaotic orbital mechanics and unpredictable gravity wells.',
    'Near-zero solar flux in deep space requiring RTG or high-efficiency concentrated arrays.':
      'Extremely weak sunlight requires alternative nuclear thermoelectric generators or massive battery reserves.'
  };

  return (
    <div className="rounded-3xl bg-space-900/80 border border-slate-800 p-6 sm:p-7 shadow-xl">
      <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 font-bold mb-1">
        <ShieldAlert className="w-4 h-4" />
        <span>ENGINEERING CONSTRAINTS & LIMITATIONS</span>
      </div>
      <h3 className="text-xl font-black text-white mb-5">
        Spacecraft Design Boundaries
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Mandatory Restrictions */}
        <div className="p-5 rounded-2xl bg-space-950/85 border border-red-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800">
                MANDATORY RESTRICTIONS
              </span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>

            <h4 className="text-sm font-bold text-white mb-3">
              Hard Engineering Caps
            </h4>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-space-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-300">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Maximum Mass: {scenario.maxMassKg} kg</span>
                  </div>
                  {onOpenConcept && (
                    <ContextualInfoButton
                      conceptId="payload-capacity"
                      label="Payload Capacity"
                      onOpenConcept={onOpenConcept}
                      size="sm"
                    />
                  )}
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Rocket payload fairings have strict physical lift thresholds. Exceeding {scenario.maxMassKg} kg will cause launch validation failure.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-space-900/90 border border-slate-800">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-300">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Budget Cap: ${scenario.budgetMUSD}M</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Allocated space agency program budget. All structural modules, instruments, and testing must fit inside this limit.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-red-300 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <span>Enforced strictly during Spacecraft Lab assembly.</span>
          </div>
        </div>

        {/* 2. Recommended Engineering Considerations */}
        <div className="p-5 rounded-2xl bg-space-950/85 border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                  RECOMMENDED INSTRUMENTS
                </span>
                {onOpenConcept && (
                  <ContextualInfoButton
                    conceptId="scientific-instruments"
                    label="Scientific Instruments"
                    onOpenConcept={onOpenConcept}
                    size="sm"
                  />
                )}
              </div>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>

            <h4 className="text-sm font-bold text-white mb-3">
              Optimal Scientific Payload
            </h4>

            <div className="space-y-2.5">
              {scenario.recommendedInstruments.map((inst, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-space-900/90 border border-slate-800">
                  <div className="text-xs font-mono font-bold text-cyan-300">
                    {inst}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    {instrumentPurposes[inst] || 'Specialized payload tailored for this environment.'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>Select these components in Developer 02's Lab.</span>
          </div>
        </div>

        {/* 3. Environmental Hazards */}
        <div className="p-5 rounded-2xl bg-space-950/85 border border-amber-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800">
                ENVIRONMENTAL HAZARDS
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>

            <h4 className="text-sm font-bold text-white mb-3">
              Operational Threats
            </h4>

            <div className="space-y-2.5">
              {scenario.environmentalHazards.map((haz, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/40">
                  <div className="text-xs font-bold text-amber-300 flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{haz}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {hazardSignificance[haz] || 'Requires appropriate thermal and electrical design.'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-amber-300 flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>Factor into power balance and thermal insulation.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

