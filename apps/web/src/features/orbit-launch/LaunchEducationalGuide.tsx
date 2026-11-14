import React from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Compass,
  Cpu,
  Feather,
  Flame,
  HelpCircle,
  Info,
  Layers,
  Maximize,
  Maximize2,
  Orbit,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Weight,
  X
} from 'lucide-react';

interface LaunchEducationalGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LaunchEducationalGuide({ isOpen, onClose }: LaunchEducationalGuideProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-space-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-space-900/70">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
              <span>ORBITAL ACADEMY // FLIGHT DYNAMICS 101</span>
              <span>•</span>
              <span>AEROSPACE PRIMER</span>
            </div>
            <h3 className="text-xl lg:text-2xl font-extrabold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>Launch Vehicles & Orbital Mechanics Primer</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Essential concepts for satellite engineers and flight dynamics directors.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-space-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-space-850 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Topics */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Topic 1: What a Launch Vehicle Does */}
          <div className="p-4 rounded-2xl bg-space-900/60 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2 font-mono">
              <Rocket className="w-4 h-4 text-cyan-400" />
              <span>1. What Does a Launch Vehicle Do?</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Getting to orbit is not just about going high into space; it is mostly about going fast horizontally. A satellite in Low Earth Orbit must reach a horizontal orbital velocity of roughly <strong>7.8 km/s (28,000 km/h)</strong> so that the curvature of its fall matches the curvature of Earth. Launch vehicles use multi-staging: shedding heavy empty propellant tanks along the way to maximize acceleration according to Tsiolkovsky’s rocket equation.
            </p>
          </div>

          {/* Topic 2: Payload Capacity & Mass Margins */}
          <div className="p-4 rounded-2xl bg-space-900/60 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2 font-mono">
              <Weight className="w-4 h-4 text-amber-400" />
              <span>2. Payload Capacity & Mass Margins</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Payload capacity is the maximum mass a booster can deliver to a specified orbit while meeting safety margins. Real space missions always require a <strong>positive payload mass margin (reserve)</strong> to absorb unforeseen propellant density variations, launch day thermal conditions, and instrument mass growth during fabrication.
            </p>
          </div>

          {/* Topic 3: Fairing Dimensions & Acoustic Shielding */}
          <div className="p-4 rounded-2xl bg-space-900/60 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2 font-mono">
              <Maximize2 className="w-4 h-4 text-sky-400" />
              <span>3. Payload Fairing Envelope</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              The payload fairing is the aerodynamic shell at the top of the rocket that shields delicate satellite sensors, solar panels, and star trackers from supersonic aerodynamic drag and extreme frictional heating during atmospheric ascent. Once the vehicle clears the dense atmosphere (~100 km altitude / Kármán line), the fairing halves split and are jettisoned to shed dead weight. A satellite must fit comfortably within the fairing’s <strong>dynamic clearance envelope</strong>.
            </p>
          </div>

          {/* Topic 4: Reusable vs. Expendable Rockets */}
          <div className="p-4 rounded-2xl bg-space-900/60 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2 font-mono">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>4. Reusable vs. Expendable Boosters</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Expendable rockets</strong> use all their fuel for the primary mission and discard their booster into the ocean, allowing maximum payload capacity at higher manufacturing cost per flight. <strong>Reusable rockets</strong> (like ORBITAL-Core) reserve ~15% of first-stage propellant to perform entry and landing burns, touching down on autonomous drone ships or landing pads. This drastically reduces commercial launch costs and allows rapid turnaround.
            </p>
          </div>

          {/* Topic 5: Launch Reliability */}
          <div className="p-4 rounded-2xl bg-space-900/60 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2 font-mono">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>5. Flight Heritage & Reliability</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Launch reliability reflects the statistical percentage of fully successful orbital insertions across historical flights. High-value scientific missions (like NASA space telescopes) typically mandate flight-proven vehicles with &gt;98% reliability to safeguard multi-hundred-million-dollar spacecraft assets.
            </p>
          </div>

          {/* Topic 6: Why Different Orbits Require Different Boosters */}
          <div className="p-4 rounded-2xl bg-space-900/60 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2 font-mono">
              <Orbit className="w-4 h-4 text-purple-400" />
              <span>6. Why Different Orbits Require Different Launch Capabilities</span>
            </h4>
            <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p>
                The energy required to reach an orbit depends heavily on its altitude and inclination:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                <li>
                  <strong className="text-slate-200">LEO (~400 km, 51.6°):</strong> Lowest launch energy requirement (~9,400 m/s ΔV). Launching eastward gets a free boost from Earth’s rotation (~400 m/s assist).
                </li>
                <li>
                  <strong className="text-slate-200">SSO &amp; Polar (~700-800 km, 90°-98°):</strong> Rockets launch north or south across the poles, getting zero assist from Earth’s eastward spin and actually needing to cancel eastward momentum for retrograde SSO orbits. This imposes a <strong>~22% payload capacity penalty</strong> compared to LEO.
                </li>
                <li>
                  <strong className="text-slate-200">GEO (35,786 km, 0°):</strong> Circularizing at 35,786 km requires massive cryogenic upper stages performing multiple burns (GTO transfer burn + apogee circularization burn at ~12,500 m/s total ΔV). Small boosters cannot achieve direct GEO insertion.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-space-900/40 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>ORBITAL Astrodynamics Curriculum • Educational Reference</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
