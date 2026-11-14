import React from 'react';
import { LaunchVehicle, OrbitProfile, SpacecraftDesign } from '@orbital/contracts';
import {
  calculateVehicleOrbitCapacity,
  getDetailedLaunchValidation
} from '@orbital/simulation-engine';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Maximize2,
  Percent,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Weight,
  XCircle
} from 'lucide-react';

interface LaunchVehicleCardProps {
  vehicle: LaunchVehicle;
  isSelected: boolean;
  selectedOrbit: OrbitProfile;
  currentDesign: SpacecraftDesign;
  scenarioBudgetMUSD: number;
  onSelect: (vehicle: LaunchVehicle) => void;
}

export function LaunchVehicleCard({
  vehicle,
  isSelected,
  selectedOrbit,
  currentDesign,
  scenarioBudgetMUSD,
  onSelect
}: LaunchVehicleCardProps) {
  const spacecraftMassKg = currentDesign.resources.totalMassKg;
  const spacecraftCostMUSD = currentDesign.resources.totalCostMUSD;

  // Single source of truth: evaluate technical & budget metrics synchronously
  const validation = getDetailedLaunchValidation(
    vehicle,
    selectedOrbit,
    spacecraftMassKg,
    scenarioBudgetMUSD,
    spacecraftCostMUSD
  );

  const orbitCategory =
    (selectedOrbit as any).category ||
    (selectedOrbit.id === 'orbit-polar' ? 'POLAR' : selectedOrbit.type);

  // Border & background visual state
  let stateBorder = 'border-slate-800 hover:border-slate-700 bg-space-950/80';
  if (isSelected) {
    stateBorder = 'border-amber-500 bg-space-850 shadow-xl glow-amber scale-[1.01]';
  } else if (!validation.isTechnicallyCompatible) {
    stateBorder = 'border-rose-900/60 hover:border-rose-700/80 bg-rose-950/10';
  } else if (!validation.isBudgetCleared) {
    stateBorder = 'border-amber-900/60 hover:border-amber-700/80 bg-amber-950/10';
  }

  return (
    <div
      onClick={() => onSelect(vehicle)}
      className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${stateBorder}`}
    >
      <div>
        {/* Top Badges & Meta */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-mono font-bold text-amber-400">
              {vehicle.class} Class
            </span>
            <span className="text-[10px] font-mono text-slate-500 px-1 py-0.5 rounded bg-space-900 border border-slate-800">
              {vehicle.name.startsWith('ORBITAL-SuperHeavy') ? 'Exploration Ref' : 'Fictional'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            {vehicle.reusable ? (
              <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 flex items-center space-x-1">
                <RefreshCw className="w-2.5 h-2.5" />
                <span>REUSABLE</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-space-900 border border-slate-800">
                EXPENDABLE
              </span>
            )}

            {/* Separate Technical Badge */}
            {validation.isTechnicallyCompatible ? (
              <span className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" />
                <span>TECH OK</span>
              </span>
            ) : !validation.isPayloadCompatible ? (
              <span className="flex items-center space-x-1 text-[10px] font-mono text-rose-400 bg-rose-950/70 border border-rose-800/70 px-1.5 py-0.5 rounded">
                <XCircle className="w-3 h-3" />
                <span>INSUFFICIENT</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-[10px] font-mono text-purple-400 bg-purple-950/70 border border-purple-800/70 px-1.5 py-0.5 rounded">
                <AlertCircle className="w-3 h-3" />
                <span>RESTRICTED</span>
              </span>
            )}

            {/* Separate Budget Badge if Exceeded */}
            {!validation.isBudgetCleared && (
              <span className="flex items-center space-x-1 text-[10px] font-mono text-amber-400 bg-amber-950/70 border border-amber-800/70 px-1.5 py-0.5 rounded">
                <AlertTriangle className="w-3 h-3" />
                <span>OVER BUDGET</span>
              </span>
            )}
          </div>
        </div>

        {/* Vehicle Name & Description */}
        <h4 className="font-bold text-white text-base mb-1 flex items-center space-x-1.5">
          <Rocket className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{vehicle.name}</span>
        </h4>
        <p className="text-xs text-slate-400 mb-2 line-clamp-2">{vehicle.description}</p>
        <p className="text-[10px] font-mono text-slate-500 mb-3">
          Manufacturer: <span className="text-slate-400">{vehicle.manufacturer}</span>
        </p>
      </div>

      <div className="space-y-2">
        {/* Target Orbit Capacity & Margin Ribbon */}
        <div className="p-2 rounded-xl bg-space-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">
              CAPACITY TO {orbitCategory}
            </span>
            <span className="text-cyan-300 font-bold text-sm">
              {validation.effectiveCapacityKg.toLocaleString()} kg
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">PAYLOAD MARGIN</span>
            <span
              className={`font-bold text-sm ${validation.isPayloadCompatible ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {validation.payloadMarginKg >= 0
                ? `+${validation.payloadMarginKg.toLocaleString()} kg`
                : `${validation.payloadMarginKg.toLocaleString()} kg`}
            </span>
          </div>
        </div>

        {/* Baseline Specs Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-space-950 p-2.5 rounded-xl border border-slate-800">
          <div>
            <span className="text-slate-500 block text-[10px]">BASELINE (LEO / GTO)</span>
            <span className="text-slate-200 font-semibold">
              {vehicle.payloadCapacityLeoKg.toLocaleString()} / {vehicle.payloadCapacityGtoKg.toLocaleString()} kg
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">FAIRING (DIA × HT)</span>
            <span className="text-slate-200 font-semibold">
              {vehicle.fairingDiameterM}m × {vehicle.fairingHeightM}m
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">LAUNCH COST</span>
            <span className="text-emerald-400 font-bold">${vehicle.launchCostMUSD}M</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">SUCCESS RELIABILITY</span>
            <span className="text-slate-200 font-bold flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-cyan-400 inline" />
              <span>{vehicle.successRatePercent}%</span>
            </span>
          </div>
        </div>

        {/* Card Footer: Independent Technical & Budget Clearance Indicators */}
        <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
          <span className="truncate max-w-[150px]" title={vehicle.simulationDisclaimer}>
            Simulation assumption
          </span>
          <div className="flex items-center space-x-2">
            {validation.isTechnicallyCompatible ? (
              <span className="text-emerald-400 font-bold">● TECH OK</span>
            ) : (
              <span className="text-rose-400 font-bold">▲ TECH DEFICIT</span>
            )}
            <span className="text-slate-600">|</span>
            {validation.isBudgetCleared ? (
              <span className="text-emerald-400 font-bold">● BUDGET OK</span>
            ) : (
              <span className="text-amber-400 font-bold">▲ BUDGET EXCEEDED</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
