import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-space-950 py-6 px-4 text-center font-mono text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div>
          <span className="text-slate-300 font-bold">ORBITAL: Mission Control</span> — 2026 NASA Space Apps Challenge
        </div>
        <div className="text-[11px] text-slate-400">
          Design. Launch. Operate. Discover. • 5 Modules • PGlite PostgreSQL Architecture
        </div>
      </div>
    </footer>
  );
}
