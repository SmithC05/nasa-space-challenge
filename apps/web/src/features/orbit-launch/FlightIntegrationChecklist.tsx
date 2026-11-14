import React from 'react';
import {
  LaunchConfiguration,
  LaunchVehicle,
  MissionScenario,
  OrbitProfile,
  SpacecraftDesign
} from '@orbital/contracts';
import {
  calculateVehicleOrbitCapacity,
  getDetailedLaunchValidation
} from '@orbital/simulation-engine';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Compass,
  DollarSign,
  Maximize2,
  RefreshCw,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Weight,
  XCircle
} from 'lucide-react';

interface FlightIntegrationChecklistProps {
  selectedVehicle: LaunchVehicle;
  selectedOrbit: OrbitProfile;
  currentDesign: SpacecraftDesign;
  selectedScenario: MissionScenario;
  launchConfig: LaunchConfiguration;
}

export function FlightIntegrationChecklist({
  selectedVehicle,
  selectedOrbit,
  currentDesign,
  selectedScenario,
  launchConfig
}: FlightIntegrationChecklistProps) {
  const spacecraftMassKg = currentDesign.resources.totalMassKg;
  const spacecraftCostMUSD = currentDesign.resources.totalCostMUSD;

  // Single source of truth: Evaluate full technical, budget, and mission status synchronously from selectedVehicle
  const validation = getDetailedLaunchValidation(
    selectedVehicle,
    selectedOrbit,
    spacecraftMassKg,
    selectedScenario.budgetMUSD,
    spacecraftCostMUSD,
    undefined,
    selectedScenario
  );

  const orbitCategory =
    (selectedOrbit as any).category ||
    (selectedOrbit.id === 'orbit-polar' ? 'POLAR' : selectedOrbit.type);

  return (
    <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>3. Flight Integration Checklist</span>
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-950 border border-slate-800 text-slate-400">
            SYNC: {selectedVehicle.id}
          </span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {/* 1. Target Orbit */}
          <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-500 text-[10px] uppercase">1. TARGET TRAJECTORY</span>
              <span className="text-[10px] font-bold text-cyan-400 bg-space-900 px-1.5 py-0.5 rounded border border-slate-800">
                {orbitCategory}
              </span>
            </div>
            <div className="text-white font-bold text-sm">{selectedOrbit.name}</div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              {selectedOrbit.perigeeKm.toLocaleString()} × {selectedOrbit.apogeeKm.toLocaleString()} km • {selectedOrbit.inclinationDeg}° Inclination
            </div>
          </div>

          {/* 2. Spacecraft Name & Total Mass */}
          <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-slate-500 text-[10px] uppercase">2. SPACECRAFT WET MASS</span>
              <span className="text-slate-400 text-[10px]">{currentDesign.name}</span>
            </div>
            <div className="text-white font-bold text-sm flex items-center justify-between">
              <span>{spacecraftMassKg.toLocaleString()} kg</span>
              <span className="text-slate-400 text-xs font-normal">Payload Total</span>
            </div>
          </div>

          {/* 3 & 4. Selected Vehicle & Effective Target Capacity */}
          <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-slate-500 text-[10px] uppercase">3. SELECTED LAUNCH VEHICLE</span>
              <span className="text-amber-400 text-[10px] font-bold">{selectedVehicle.class} Booster</span>
            </div>
            <div className="text-white font-bold text-sm flex items-center justify-between">
              <span>{selectedVehicle.name}</span>
              <span className="text-cyan-300 font-bold">{validation.effectiveCapacityKg.toLocaleString()} kg cap</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Mfr: {selectedVehicle.manufacturer}</span>
              <span>Reliability: {selectedVehicle.successRatePercent}%</span>
            </div>
          </div>

          {/* 5. Remaining Payload Margin */}
          <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-slate-500 text-[10px] uppercase">4. REMAINING PAYLOAD MARGIN</span>
              <span className={`text-[10px] font-bold ${validation.isPayloadCompatible ? 'text-emerald-400' : 'text-rose-400'}`}>
                {validation.isPayloadCompatible ? 'PAYLOAD COMPATIBLE' : 'INSUFFICIENT CAPACITY'}
              </span>
            </div>
            <div
              className={`font-bold text-sm ${validation.isPayloadCompatible ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {validation.payloadMarginKg >= 0
                ? `+${validation.payloadMarginKg.toLocaleString()} kg reserve (${((validation.payloadMarginKg / validation.effectiveCapacityKg) * 100).toFixed(1)}%)`
                : `OVERLOADED: ${validation.payloadMarginKg.toLocaleString()} kg deficit`}
            </div>
          </div>

          {/* 6. Fairing Dimensions & Compatibility */}
          <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-slate-500 text-[10px] uppercase">5. FAIRING ENVELOPE</span>
              <span className={`text-[10px] font-bold ${validation.isFairingCompatible ? 'text-emerald-400' : 'text-rose-400'}`}>
                {validation.isFairingCompatible ? 'CLEARANCE OK' : 'ENVELOPE EXCEEDED'}
              </span>
            </div>
            <div className="text-white font-bold text-sm flex items-center justify-between">
              <span>{selectedVehicle.fairingDiameterM}m Dia × {selectedVehicle.fairingHeightM}m Height</span>
              <span className="text-slate-400 text-xs font-normal">Acoustic Shroud</span>
            </div>
          </div>

          {/* 7, 8, 9, 10. Costs, Budget Allowance & Overrun Breakdown */}
          <div className="bg-space-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[10px] uppercase">6. MISSION BUDGET & COSTS</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  validation.budgetStatus === 'WITHIN_BUDGET'
                    ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60'
                    : validation.budgetStatus === 'CONTINGENCY_USED'
                      ? 'text-amber-400 bg-amber-950/60 border border-amber-800/60'
                      : 'text-rose-400 bg-rose-950/60 border border-rose-800/60'
                }`}
              >
                {validation.budgetStatus === 'WITHIN_BUDGET'
                  ? 'WITHIN BASE BUDGET'
                  : validation.budgetStatus === 'CONTINGENCY_USED'
                    ? '15% BUFFER UTILIZED'
                    : 'BUDGET EXCEEDED'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/60">
              <div>
                <span className="text-slate-500 block text-[10px]">SPACECRAFT COST</span>
                <span className="text-slate-200 font-bold">${validation.spacecraftCostMUSD}M</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">BOOSTER COST</span>
                <span className="text-emerald-400 font-bold">${validation.boosterCostMUSD}M</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">TOTAL MISSION COST</span>
                <span className="text-white font-extrabold text-xs">${validation.totalMissionCostMUSD}M</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">MAX BUDGET (+15%)</span>
                <span className="text-slate-300 font-bold">${validation.maxBudgetWithBufferMUSD}M (Base: ${validation.baseBudgetMUSD}M)</span>
              </div>
            </div>

            {/* Overrun or Buffer status display */}
            <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              {validation.budgetStatus === 'BUDGET_EXCEEDED' ? (
                <>
                  <span className="text-rose-400 font-bold flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 inline" />
                    <span>BUDGET OVERRUN:</span>
                  </span>
                  <span className="text-rose-400 font-extrabold">+${validation.budgetOverrunMUSD}M over max ceiling</span>
                </>
              ) : (
                <>
                  <span className="text-emerald-400 font-medium">Contingency Buffer Remaining:</span>
                  <span className="text-emerald-400 font-bold">${validation.budgetBufferRemainingMUSD}M reserve</span>
                </>
              )}
            </div>
          </div>

          {/* 7. Technical Compatibility Status (Separated from Budget & Mission) */}
          <div className="bg-space-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-500 text-[10px] uppercase">7. TECHNICAL SUITABILITY</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded flex items-center space-x-1 ${
                validation.isTechnicallyCompatible
                  ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800'
                  : 'text-rose-400 bg-rose-950/60 border border-rose-800'
              }`}
            >
              {validation.isTechnicallyCompatible ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>TECHNICALLY COMPATIBLE</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>TECHNICAL DEFICIT</span>
                </>
              )}
            </span>
          </div>

          {/* 8. Mission Suitability & Regime Mandate */}
          <div className="bg-space-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[10px] uppercase">8. MISSION SUITABILITY & MANDATE</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center space-x-1 ${
                  validation.missionSuitabilityStatus === 'OPTIMAL'
                    ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60'
                    : validation.missionSuitabilityStatus === 'ACCEPTABLE_WITH_WARNING'
                      ? 'text-amber-400 bg-amber-950/60 border border-amber-800/60'
                      : 'text-rose-400 bg-rose-950/60 border border-rose-800/60'
                }`}
              >
                {validation.missionSuitabilityStatus === 'OPTIMAL' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>OPTIMAL PROFILE</span>
                  </>
                ) : validation.missionSuitabilityStatus === 'ACCEPTABLE_WITH_WARNING' ? (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    <span>LIMITED COVERAGE</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" />
                    <span>MANDATE UNMET</span>
                  </>
                )}
              </span>
            </div>
            <div className="text-[11px] text-slate-300">
              {validation.missionSuitabilityReasons[0] || `${selectedOrbit.name} evaluated for ${selectedScenario.name}`}
            </div>
            {validation.polarCoverageSatisfied ? (
              <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
                <span>✓ Polar Latitudes Coverage Satisfied (≥90° access)</span>
              </div>
            ) : (
              <div className="text-[10px] text-amber-400/90 flex items-center space-x-1">
                <span>⚠ No direct polar coverage (restricted to equatorial/mid latitudes)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 12. Overall Launch Clearance Gate */}
      <div className="mt-5 pt-4 border-t border-slate-800">
        {validation.isOverallCleared ? (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-400 text-xs font-mono space-y-1">
            <div className="flex items-center space-x-2 font-bold text-sm text-emerald-300">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>LAUNCH CLEARANCE AUTHORIZED</span>
            </div>
            <p className="text-[11px] text-emerald-300/90 leading-relaxed pl-7">
              All flight integration gates passed: positive mass margin (+{validation.payloadMarginKg} kg reserve), budget verified within allowance (${validation.totalMissionCostMUSD}M ≤ ${validation.maxBudgetWithBufferMUSD}M ceiling), and orbital regime certified for {selectedScenario.name}.
            </p>
            {validation.warnings.length > 0 && (
              <div className="mt-2 pl-7 pt-2 border-t border-emerald-800/40 text-[10px] text-amber-300 space-y-1">
                {validation.warnings.map((w, i) => (
                  <div key={i}>⚠ {w}</div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-800/80 text-rose-300 text-xs font-mono space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-sm text-rose-400">
              <XCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>LAUNCH CLEARANCE WITHHELD</span>
            </div>
            <div className="pl-7 space-y-1 text-[11px] text-rose-300/90">
              {/* Note if technically compatible + budget cleared, but mission unsuitable */}
              {validation.isTechnicallyCompatible && validation.isBudgetCleared && !validation.isMissionSuitable && (
                <div className="text-amber-300 font-semibold">
                  • Vehicle is TECHNICALLY COMPATIBLE (+{validation.payloadMarginKg} kg margin) and WITHIN BUDGET (${validation.totalMissionCostMUSD}M ≤ ${validation.maxBudgetWithBufferMUSD}M), but launch clearance is withheld because target orbit does not satisfy {selectedScenario.name} requirements.
                </div>
              )}
              {/* Note if technically compatible, but budget exceeded */}
              {validation.isTechnicallyCompatible && !validation.isBudgetCleared && validation.isMissionSuitable && (
                <div className="text-amber-300 font-semibold">
                  • Vehicle is TECHNICALLY COMPATIBLE with {selectedOrbit.name} (+{validation.payloadMarginKg} kg margin), but launch clearance is withheld due to budget overrun.
                </div>
              )}
              {validation.missionErrors.map((err, i) => (
                <div key={i} className="text-rose-400 font-bold">
                  • {err}
                </div>
              ))}
              {validation.technicalErrors.map((err, i) => (
                <div key={i} className="text-rose-400">
                  • Technical Deficit: {err}
                </div>
              ))}
              {validation.budgetErrors.map((err, i) => (
                <div key={i} className="text-amber-400">
                  • Budget Exceeded: {err}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
