import React from 'react';
import { LaunchVehicle, MissionScenario, OrbitProfile, SpacecraftDesign } from '@orbital/contracts';
import {
  calculateVehicleOrbitCapacity,
  getDetailedLaunchValidation
} from '@orbital/simulation-engine';
import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  CheckCircle2,
  DollarSign,
  Maximize2,
  Minimize2,
  RefreshCw,
  Rocket,
  ShieldCheck,
  X,
  XCircle
} from 'lucide-react';

interface LaunchVehicleComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: LaunchVehicle[];
  selectedVehicleId: string;
  selectedOrbit: OrbitProfile;
  currentDesign: SpacecraftDesign;
  scenarioBudgetMUSD: number;
  selectedScenario?: MissionScenario;
  onSelectVehicle: (vehicle: LaunchVehicle) => void;
}

export function LaunchVehicleComparisonModal({
  isOpen,
  onClose,
  vehicles,
  selectedVehicleId,
  selectedOrbit,
  currentDesign,
  scenarioBudgetMUSD,
  selectedScenario,
  onSelectVehicle
}: LaunchVehicleComparisonModalProps) {
  if (!isOpen) return null;

  const orbitCategory =
    (selectedOrbit as any).category ||
    (selectedOrbit.id === 'orbit-polar' ? 'POLAR' : selectedOrbit.type);

  const spacecraftMassKg = currentDesign.resources.totalMassKg;
  const spacecraftCostMUSD = currentDesign.resources.totalCostMUSD;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-space-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-space-900/60">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
              <span>M03 // COMPARATIVE ASTRODYNAMICS</span>
              <span>•</span>
              <span>MULTI-VEHICLE TRADE STUDY</span>
            </div>
            <h3 className="text-xl lg:text-2xl font-extrabold text-white flex items-center space-x-2">
              <ArrowUpDown className="w-5 h-5 text-cyan-400" />
              <span>Launch Vehicle Specification & Capability Matrix</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Comparing all fleet boosters against target trajectory{' '}
              <strong className="text-cyan-300">
                {selectedOrbit.name} ({orbitCategory})
              </strong>{' '}
              with spacecraft payload mass{' '}
              <strong className="text-white">{spacecraftMassKg.toLocaleString()} kg</strong> and budget{' '}
              <strong className="text-white">${scenarioBudgetMUSD}M</strong>.
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

        {/* Scrollable Matrix Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
          <table className="w-full text-xs font-mono border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase tracking-wider w-44 bg-space-900/30 rounded-l-xl">
                  Specification Parameter
                </th>
                {vehicles.map((v) => {
                  const isSelected = v.id === selectedVehicleId;
                  return (
                    <th
                      key={v.id}
                      className={`text-center py-3 px-4 transition-all ${
                        isSelected
                          ? 'bg-amber-950/40 border-t-2 border-amber-500 text-white'
                          : 'text-slate-300'
                      }`}
                    >
                      <div className="font-extrabold text-sm mb-0.5">{v.name}</div>
                      <div className="text-[10px] text-amber-400 font-normal">{v.class} Class</div>
                      <div className="text-[9px] text-slate-500 font-normal truncate max-w-[150px] mx-auto">
                        {v.manufacturer}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {/* 1. Target Orbit Capacity */}
              <tr className="bg-space-900/40 font-bold">
                <td className="py-3 px-4 text-cyan-300">Target Capacity ({orbitCategory})</td>
                {vehicles.map((v) => {
                  const cap = calculateVehicleOrbitCapacity(v, selectedOrbit);
                  return (
                    <td key={v.id} className="py-3 px-4 text-center text-cyan-300 font-bold">
                      {cap.toLocaleString()} kg
                    </td>
                  );
                })}
              </tr>

              {/* 2. Payload Mass Margin */}
              <tr>
                <td className="py-3 px-4 text-slate-400">Payload Mass Margin</td>
                {vehicles.map((v) => {
                  const cap = calculateVehicleOrbitCapacity(v, selectedOrbit);
                  const margin = Number((cap - spacecraftMassKg).toFixed(1));
                  const isOk = margin >= 0;
                  return (
                    <td
                      key={v.id}
                      className={`py-3 px-4 text-center font-bold ${isOk ? 'text-emerald-400' : 'text-rose-400'}`}
                    >
                      {margin >= 0 ? `+${margin.toLocaleString()} kg` : `${margin.toLocaleString()} kg`}
                    </td>
                  );
                })}
              </tr>

              {/* 3. LEO Payload Capacity */}
              <tr>
                <td className="py-3 px-4 text-slate-400">LEO Capacity (400 km)</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="py-3 px-4 text-center text-slate-200">
                    {v.payloadCapacityLeoKg.toLocaleString()} kg
                  </td>
                ))}
              </tr>

              {/* 4. GTO Payload Capacity */}
              <tr>
                <td className="py-3 px-4 text-slate-400">GTO Capacity</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="py-3 px-4 text-center text-slate-200">
                    {v.payloadCapacityGtoKg.toLocaleString()} kg
                  </td>
                ))}
              </tr>

              {/* 5. TLI Payload Capacity */}
              <tr>
                <td className="py-3 px-4 text-slate-400">TLI / Deep Space Capacity</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="py-3 px-4 text-center text-slate-200">
                    {v.payloadCapacityTliKg.toLocaleString()} kg
                  </td>
                ))}
              </tr>

              {/* 6. Launch Unit Cost */}
              <tr className="bg-space-900/20">
                <td className="py-3 px-4 text-emerald-400 font-bold">Booster Launch Cost</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="py-3 px-4 text-center text-emerald-400 font-bold">
                    ${v.launchCostMUSD}M
                  </td>
                ))}
              </tr>

              {/* 7. Specific Cost ($/kg to Target Orbit) */}
              <tr>
                <td className="py-3 px-4 text-slate-400">Specific Cost ($/kg to Target)</td>
                {vehicles.map((v) => {
                  const cap = calculateVehicleOrbitCapacity(v, selectedOrbit);
                  const costPerKg = Math.round((v.launchCostMUSD * 1000000) / cap);
                  return (
                    <td key={v.id} className="py-3 px-4 text-center text-slate-300">
                      ${costPerKg.toLocaleString()}/kg
                    </td>
                  );
                })}
              </tr>

              {/* 8. Flight Reliability */}
              <tr>
                <td className="py-3 px-4 text-slate-400">Mission Reliability</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="py-3 px-4 text-center text-slate-200">
                    <span className="flex items-center justify-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{v.successRatePercent}%</span>
                    </span>
                  </td>
                ))}
              </tr>

              {/* 9. Fairing Dimensions (Diameter x Height) */}
              <tr>
                <td className="py-3 px-4 text-slate-400">Fairing Dimensions (Dia × Ht)</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="py-3 px-4 text-center text-slate-200">
                    {v.fairingDiameterM}m × {v.fairingHeightM}m
                  </td>
                ))}
              </tr>

              {/* 10. Reusability Architecture */}
              <tr>
                <td className="py-3 px-4 text-slate-400">Reusability Architecture</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="py-3 px-4 text-center">
                    {v.reusable ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Reusable Core</span>
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-space-900 text-slate-400 border border-slate-800">
                        Expendable
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* 11. Technical Compatibility (Independent from Budget) */}
              <tr className="bg-space-900/30">
                <td className="py-3 px-4 text-slate-300 font-bold">Technical Suitability</td>
                {vehicles.map((v) => {
                  const val = getDetailedLaunchValidation(
                    v,
                    selectedOrbit,
                    spacecraftMassKg,
                    scenarioBudgetMUSD,
                    spacecraftCostMUSD,
                    undefined,
                    selectedScenario
                  );
                  return (
                    <td key={v.id} className="py-3 px-4 text-center">
                      {val.isTechnicallyCompatible ? (
                        <span className="text-emerald-400 font-bold flex items-center justify-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>TECHNICALLY OK</span>
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold flex items-center justify-center space-x-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>TECHNICAL DEFICIT</span>
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* 12. Mission Mandate Compatibility */}
              <tr className="bg-space-900/30">
                <td className="py-3 px-4 text-slate-300 font-bold">Mission Mandate</td>
                {vehicles.map((v) => {
                  const val = getDetailedLaunchValidation(
                    v,
                    selectedOrbit,
                    spacecraftMassKg,
                    scenarioBudgetMUSD,
                    spacecraftCostMUSD,
                    undefined,
                    selectedScenario
                  );
                  return (
                    <td key={v.id} className="py-3 px-4 text-center">
                      {val.isMissionSuitable ? (
                        <span className="text-emerald-400 font-bold flex items-center justify-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>MANDATE MET</span>
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold flex items-center justify-center space-x-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>MANDATE UNMET</span>
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* 13. Budget Clearance Status */}
              <tr className="bg-space-900/30">
                <td className="py-3 px-4 text-slate-300 font-bold">Budget Status</td>
                {vehicles.map((v) => {
                  const val = getDetailedLaunchValidation(
                    v,
                    selectedOrbit,
                    spacecraftMassKg,
                    scenarioBudgetMUSD,
                    spacecraftCostMUSD,
                    undefined,
                    selectedScenario
                  );
                  return (
                    <td key={v.id} className="py-3 px-4 text-center">
                      {val.budgetStatus === 'WITHIN_BUDGET' ? (
                        <span className="text-emerald-400 font-bold">WITHIN BASE BUDGET</span>
                      ) : val.budgetStatus === 'CONTINGENCY_USED' ? (
                        <span className="text-amber-300 font-bold">BUFFER UTILIZED</span>
                      ) : (
                        <span className="text-rose-400 font-bold">
                          BUDGET EXCEEDED (+${val.budgetOverrunMUSD}M)
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* 14. Overall Clearance Status */}
              <tr className="bg-space-900/40">
                <td className="py-3 px-4 text-white font-bold uppercase">Launch Clearance Gate</td>
                {vehicles.map((v) => {
                  const val = getDetailedLaunchValidation(
                    v,
                    selectedOrbit,
                    spacecraftMassKg,
                    scenarioBudgetMUSD,
                    spacecraftCostMUSD,
                    undefined,
                    selectedScenario
                  );
                  return (
                    <td key={v.id} className="py-3 px-4 text-center">
                      {val.isOverallCleared ? (
                        <span className="px-2 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                          ✓ AUTHORIZED
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-800 text-[10px] font-bold">
                          ✗ WITHHELD
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* 15. Interactive Selection Button */}
              <tr className="bg-space-900/60">
                <td className="py-4 px-4 text-slate-400 font-bold uppercase">Selection Action</td>
                {vehicles.map((v) => {
                  const isSelected = v.id === selectedVehicleId;
                  const val = getDetailedLaunchValidation(
                    v,
                    selectedOrbit,
                    spacecraftMassKg,
                    scenarioBudgetMUSD,
                    spacecraftCostMUSD,
                    undefined,
                    selectedScenario
                  );

                  return (
                    <td key={v.id} className="py-4 px-4 text-center">
                      {isSelected ? (
                        <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl font-bold bg-amber-500 text-black text-xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>ACTIVE VEHICLE</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectVehicle(v);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors border ${
                            val.isOverallCleared
                              ? 'bg-space-850 hover:bg-space-800 text-cyan-300 border-cyan-500/50'
                              : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60'
                          }`}
                        >
                          {val.isOverallCleared ? 'Select Booster' : 'Select (Withheld)'}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Disclaimer */}
        <div className="p-4 border-t border-slate-800 bg-space-900/40 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
          <span>
            Single source of truth: <code>@orbital/game-data</code> • Independent technical vs budget evaluation
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-space-850 hover:bg-space-800 text-white border border-slate-700 transition-colors"
          >
            Close Matrix View
          </button>
        </div>
      </div>
    </div>
  );
}
