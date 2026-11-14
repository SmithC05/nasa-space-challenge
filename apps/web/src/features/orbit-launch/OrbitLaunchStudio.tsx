import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EarthOrbitCanvas } from '../../three/EarthOrbitCanvas';
import { LaunchVehicleCard } from './LaunchVehicleCard';
import { LaunchVehicleComparisonModal } from './LaunchVehicleComparisonModal';
import { FlightIntegrationChecklist } from './FlightIntegrationChecklist';
import { LaunchEducationalGuide } from './LaunchEducationalGuide';
import {
  ArrowUpDown,
  BookOpen,
  Orbit,
  Rocket
} from 'lucide-react';

export function OrbitLaunchStudio() {
  const {
    orbitProfiles,
    selectedOrbit,
    selectOrbit,
    launchVehicles,
    selectedVehicle,
    selectVehicle,
    launchConfig,
    currentDesign,
    selectedScenario,
    startMissionLaunch,
    setActiveTab
  } = useGameStore();

  const [isLaunchingAnim, setIsLaunchingAnim] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isEduGuideOpen, setIsEduGuideOpen] = useState(false);

  const selectedCategory =
    (selectedOrbit as any).category ||
    (selectedOrbit.id === 'orbit-polar' ? 'POLAR' : selectedOrbit.type);

  const handleLaunchClick = () => {
    setIsLaunchingAnim(true);
    setTimeout(() => {
      startMissionLaunch();
      setActiveTab('ops');
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-space-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <span>M03 // ORBIT & LAUNCH STUDIO</span>
            <span>•</span>
            <span>PHASE 4: VEHICLE CATALOG & SELECTION</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white">
            Orbital Insertion & Launch Configuration
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Compare Fleet Button */}
          <button
            type="button"
            onClick={() => setIsComparisonOpen(true)}
            className="px-4 py-3 rounded-xl font-mono text-xs font-bold bg-space-850 hover:bg-space-800 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 flex items-center space-x-1.5 shadow-md transition-colors"
          >
            <ArrowUpDown className="w-4 h-4 text-cyan-400" />
            <span>COMPARE FLEET</span>
          </button>

          {/* Educational Primer Button */}
          <button
            type="button"
            onClick={() => setIsEduGuideOpen(true)}
            className="px-4 py-3 rounded-xl font-mono text-xs font-bold bg-space-850 hover:bg-space-800 text-slate-300 border border-slate-700 hover:border-slate-600 flex items-center space-x-1.5 shadow-md transition-colors"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>FLIGHT PRIMER</span>
          </button>

          {/* Authorize Launch Button */}
          <button
            onClick={handleLaunchClick}
            disabled={!launchConfig.isCompatible || isLaunchingAnim}
            className={`px-6 py-3 rounded-xl font-extrabold font-mono text-sm flex items-center space-x-2 shadow-xl transition-all ${
              isLaunchingAnim
                ? 'bg-amber-500 text-black animate-pulse'
                : launchConfig.isCompatible
                  ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-blue-400 text-black glow-cyan'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Rocket className={`w-5 h-5 ${isLaunchingAnim ? 'animate-bounce' : ''}`} />
            <span>{isLaunchingAnim ? 'IGNITION & LIFTOFF...' : 'AUTHORIZE LAUNCH'}</span>
          </button>
        </div>
      </div>

      {/* 3D Earth Orbit Viewer */}
      <EarthOrbitCanvas orbit={selectedOrbit} isLaunching={isLaunchingAnim} />

      {/* 1. Orbit Profile Selection */}
      <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <Orbit className="w-4 h-4 text-cyan-400" />
            <span>1. Select Target Orbital Trajectory</span>
          </h3>
          <span className="text-xs font-mono text-slate-500 hidden sm:inline">
            Single Source of Truth: Phase 1 Catalog
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {orbitProfiles.map((orbit) => {
            const isSelected = selectedOrbit.id === orbit.id;
            const orbitCategory =
              (orbit as any).category || (orbit.id === 'orbit-polar' ? 'POLAR' : orbit.type);

            return (
              <div
                key={orbit.id}
                onClick={() => selectOrbit(orbit)}
                className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-space-850 border-cyan-500 shadow-md glow-cyan scale-[1.02]'
                    : 'bg-space-950/80 border-slate-800 hover:border-slate-700 hover:bg-space-850/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-space-900 border border-slate-800 text-cyan-400">
                      {orbitCategory}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-space-900">
                      {orbit.inclinationDeg}° Inc
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">{orbit.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{orbit.description}</p>
                </div>

                <div className="text-[11px] font-mono space-y-1 bg-space-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 flex justify-between">
                    <span>Altitude:</span>
                    <span className="text-slate-200">
                      {orbit.perigeeKm.toLocaleString()} × {orbit.apogeeKm.toLocaleString()} km
                    </span>
                  </div>
                  <div className="text-slate-400 flex justify-between">
                    <span>Period:</span>
                    <span className="text-cyan-300">{orbit.orbitalPeriodMin} min</span>
                  </div>
                  <div className="text-slate-400 flex justify-between">
                    <span>Req ΔV:</span>
                    <span className="text-amber-300">{orbit.requiredDeltaVMps.toLocaleString()} m/s</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2 & 3. Launch Vehicle Selection Grid & Flight Integration Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vehicles Grid */}
        <div className="lg:col-span-8 bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <Rocket className="w-4 h-4 text-amber-400" />
              <span>2. Select Launch Vehicle</span>
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                Target Regime: <strong className="text-cyan-400">{selectedCategory}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsComparisonOpen(true)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-2 flex items-center space-x-1"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Compare Matrix</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {launchVehicles.map((vehicle) => (
              <LaunchVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isSelected={selectedVehicle.id === vehicle.id}
                selectedOrbit={selectedOrbit}
                currentDesign={currentDesign}
                scenarioBudgetMUSD={selectedScenario.budgetMUSD}
                selectedScenario={selectedScenario}
                onSelect={selectVehicle}
              />
            ))}
          </div>
        </div>

        {/* Flight Integration Checklist */}
        <div className="lg:col-span-4">
          <FlightIntegrationChecklist
            selectedVehicle={selectedVehicle}
            selectedOrbit={selectedOrbit}
            currentDesign={currentDesign}
            selectedScenario={selectedScenario}
            launchConfig={launchConfig}
          />
        </div>
      </div>

      {/* Comparison Modal */}
      <LaunchVehicleComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        vehicles={launchVehicles}
        selectedVehicleId={selectedVehicle.id}
        selectedOrbit={selectedOrbit}
        currentDesign={currentDesign}
        scenarioBudgetMUSD={selectedScenario.budgetMUSD}
        selectedScenario={selectedScenario}
        onSelectVehicle={selectVehicle}
      />

      {/* Educational Guide Modal */}
      <LaunchEducationalGuide
        isOpen={isEduGuideOpen}
        onClose={() => setIsEduGuideOpen(false)}
      />
    </div>
  );
}
