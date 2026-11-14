import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EarthOrbitCanvas } from '../../three/EarthOrbitCanvas';
import {
  AlertCircle,
  CheckCircle,
  Compass,
  DollarSign,
  Fuel,
  Orbit,
  Play,
  Rocket,
  ShieldAlert,
  Sparkles,
  Weight
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
    startMissionLaunch,
    setActiveTab
  } = useGameStore();

  const [isLaunchingAnim, setIsLaunchingAnim] = useState(false);

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
            <span>ASTRODYNAMICS SIMULATOR</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white">
            Orbital Insertion & Launch Configuration
          </h2>
        </div>

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

      {/* 3D Earth Orbit Viewer */}
      <EarthOrbitCanvas orbit={selectedOrbit} isLaunching={isLaunchingAnim} />

      {/* Orbit Profile Selection */}
      <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Orbit className="w-4 h-4 text-cyan-400" />
          <span>1. Select Target Orbital Trajectory</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {orbitProfiles.map((orbit) => {
            const isSelected = selectedOrbit.id === orbit.id;
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
                    <span className="text-xs font-mono font-bold text-cyan-400">{orbit.type}</span>
                    <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-space-900">
                      {orbit.inclinationDeg}° Inc
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">{orbit.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{orbit.description}</p>
                </div>

                <div className="text-[11px] font-mono space-y-1 bg-space-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 flex justify-between">
                    <span>Alt:</span>
                    <span className="text-slate-200">{orbit.perigeeKm} × {orbit.apogeeKm} km</span>
                  </div>
                  <div className="text-slate-400 flex justify-between">
                    <span>Period:</span>
                    <span className="text-cyan-300">{orbit.orbitalPeriodMin} min</span>
                  </div>
                  <div className="text-slate-400 flex justify-between">
                    <span>Req ΔV:</span>
                    <span className="text-amber-300">{orbit.requiredDeltaVMps} m/s</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Launch Vehicle Selection & Compatibility Validation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vehicles Grid */}
        <div className="lg:col-span-8 bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Rocket className="w-4 h-4 text-amber-400" />
            <span>2. Select Launch Vehicle</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {launchVehicles.map((vehicle) => {
              const isSelected = selectedVehicle.id === vehicle.id;
              return (
                <div
                  key={vehicle.id}
                  onClick={() => selectVehicle(vehicle)}
                  className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-space-850 border-amber-500 shadow-md glow-amber scale-[1.01]'
                      : 'bg-space-950/80 border-slate-800 hover:border-slate-700 hover:bg-space-850/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-amber-400">{vehicle.class} Booster</span>
                      {vehicle.reusable && (
                        <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
                          REUSABLE
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-white text-base mb-1">{vehicle.name}</h4>
                    <p className="text-xs text-slate-400 mb-3">{vehicle.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-space-950 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">PAYLOAD (LEO)</span>
                      <span className="text-cyan-300 font-bold">{vehicle.payloadCapacityLeoKg} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">PAYLOAD (GTO)</span>
                      <span className="text-cyan-300 font-bold">{vehicle.payloadCapacityGtoKg} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">LAUNCH COST</span>
                      <span className="text-emerald-400 font-bold">${vehicle.launchCostMUSD}M</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">SUCCESS RATE</span>
                      <span className="text-slate-200 font-bold">{vehicle.successRatePercent}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Launch Readiness Validation Check */}
        <div className="lg:col-span-4 bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>3. Flight Integration Checklist</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">SPACECRAFT MASS</span>
                <span className="text-white font-bold text-sm">{currentDesign.resources.totalMassKg} kg</span>
              </div>

              <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">PAYLOAD MARGIN ON BOOSTER</span>
                <span className={`font-bold text-sm ${launchConfig.payloadMarginKg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {launchConfig.payloadMarginKg >= 0 ? `+${launchConfig.payloadMarginKg} kg reserve` : `OVERLOADED: ${launchConfig.payloadMarginKg} kg`}
                </span>
              </div>

              <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">LAUNCH SITE & PAD</span>
                <span className="text-cyan-300 font-medium">{launchConfig.launchSite}</span>
              </div>

              <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">BOOSTER HARDWARE COST</span>
                <span className="text-emerald-400 font-bold text-sm">${launchConfig.estimatedCostMUSD}M</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            {launchConfig.isCompatible ? (
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Launch vehicle compatible with target orbit. Range safety cleared.</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Incompatible launch configuration. Upgrade to heavier booster or reduce payload mass.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
