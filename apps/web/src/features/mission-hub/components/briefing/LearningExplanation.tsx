import React, { useState } from 'react';
import { LearningConceptId } from '../../types/learning.types';
import { BookOpen, ChevronDown, ChevronUp, Globe2, Weight, Compass, Radio, ArrowRight } from 'lucide-react';

interface LearningItem {
  id: string;
  conceptId: LearningConceptId;
  title: string;
  subtitle: string;
  content: string;
  icon: typeof Globe2;
  color: string;
}

interface LearningExplanationProps {
  onOpenConcept?: (conceptId: LearningConceptId) => void;
}

export function LearningExplanation({ onOpenConcept }: LearningExplanationProps) {
  const [expandedId, setExpandedId] = useState<string | null>('earth-obs');

  const items: LearningItem[] = [
    {
      id: 'earth-obs',
      conceptId: 'earth-observation',
      title: 'What is Earth Observation?',
      subtitle: 'Monitoring our home world from orbit',
      content:
        'Earth observation means collecting information about our planet using satellites and scientific instruments. High-resolution cameras, thermal infrared sensors, and radar allow scientists to track environmental changes, map polar ice melt, and spot forest fires through smoke plumes.',
      icon: Globe2,
      color: 'text-cyan-400'
    },
    {
      id: 'mass-matters',
      conceptId: 'payload-capacity',
      title: 'Why Does Payload Mass Matter?',
      subtitle: 'Rocket power and weight limits',
      content:
        'Spacecraft have strict carrying capacities. Every extra kilogram of equipment requires additional rocket thrust and fuel to reach orbital velocity (approx. 28,000 km/h). Keeping your satellite light reduces launch expenses and ensures your craft can reach its intended destination orbit.',
      icon: Weight,
      color: 'text-emerald-400'
    },
    {
      id: 'orbit-importance',
      conceptId: 'orbital-selection',
      title: 'Why is an Orbit Important?',
      subtitle: 'Paths through gravitational space',
      content:
        'A spacecraft’s orbit determines which regions it passes over and how frequently it revisits them. For example, a Sun-Synchronous Orbit (SSO) crosses Earth’s poles at the exact same local solar time each day, providing identical shadow angles for reliable comparison photography.',
      icon: Compass,
      color: 'text-purple-400'
    },
    {
      id: 'data-delivery',
      conceptId: 'space-communication',
      title: 'What is Scientific Data Delivery?',
      subtitle: 'Beaming discoveries back to Earth',
      content:
        'After gathering sensor readings and imagery in space, the satellite must store and transmit this data to ground station antennas on Earth. Ensuring adequate radio frequency bandwidth and antenna power prevents data backlogs and lost research.',
      icon: Radio,
      color: 'text-amber-400'
    }
  ];

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="rounded-3xl bg-space-900/80 border border-slate-800 p-6 sm:p-7 shadow-xl">
      <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-bold mb-1">
        <BookOpen className="w-4 h-4" />
        <span>AEROSPACE LEARNING ACADEMY</span>
      </div>
      <h3 className="text-xl font-black text-white mb-2">
        Core Concepts for Beginner Astronauts
      </h3>
      <p className="text-xs text-slate-300 mb-5 max-w-2xl">
        Understand the real science and engineering principles that guide satellite mission design:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-space-950/90 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/20'
                  : 'bg-space-950/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleExpand(item.id)}
                className="w-full p-4 text-left flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-space-900 border border-slate-800 flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 text-xs text-slate-300 leading-relaxed border-t border-slate-850/80 space-y-2.5">
                  <p>{item.content}</p>
                  {onOpenConcept && (
                    <button
                      type="button"
                      onClick={() => onOpenConcept(item.conceptId)}
                      className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors pt-1"
                    >
                      <span>OPEN FULL CONCEPT DOSSIER</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

