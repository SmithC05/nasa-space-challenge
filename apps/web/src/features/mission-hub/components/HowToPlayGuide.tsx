import React from 'react';
import { Rocket, Wrench, Compass, Activity, Trophy } from 'lucide-react';

export function HowToPlayGuide() {
  const steps = [
    {
      num: '01',
      title: 'Choose Mission',
      badge: 'Active',
      icon: Compass,
      description: 'Review science goals and budget before departure.',
      status: 'active'
    },
    {
      num: '02',
      title: 'Build Spacecraft',
      badge: 'Next',
      icon: Wrench,
      description: 'Assemble your satellite hull, power systems, and scientific cameras.',
      status: 'upcoming'
    },
    {
      num: '03',
      title: 'Launch to Orbit',
      badge: 'Step 3',
      icon: Rocket,
      description: 'Select your booster rocket and calculate the flight trajectory.',
      status: 'upcoming'
    },
    {
      num: '04',
      title: 'Run Operations',
      badge: 'Step 4',
      icon: Activity,
      description: 'Point solar panels to the Sun, gather data, and beam discoveries home.',
      status: 'upcoming'
    }
  ];

  return (
    <div className="rounded-3xl bg-space-900/80 border border-slate-800 p-6 sm:p-7 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Trophy className="w-4 h-4" />
            <span>ORBITAL FLIGHT PATH</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            How ORBITAL Works in 4 Steps
          </h3>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80 self-start sm:self-auto">
          GAMEPLAY ROADMAP
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCurrent = step.status === 'active';
          return (
            <div
              key={step.num}
              className={`relative rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-gradient-to-b from-cyan-950/40 via-space-950 to-space-950 border-cyan-500/60 shadow-lg glow-cyan ring-1 ring-cyan-500/20'
                  : 'bg-space-950/80 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-black font-mono text-slate-600">
                    {step.num}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isCurrent
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                        : 'bg-space-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {step.badge}
                  </span>
                </div>

                <div className="flex items-center space-x-2.5 mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isCurrent
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'bg-space-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">
                    {step.title}
                  </h4>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

