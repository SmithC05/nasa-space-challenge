import React, { useState } from 'react';
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
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  FileCheck,
  Globe2,
  Layers,
  Lock,
  Maximize2,
  Orbit,
  Radio,
  RefreshCw,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Weight,
  X,
  XCircle
} from 'lucide-react';

interface LaunchConfigurationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicle: LaunchVehicle;
  selectedOrbit: OrbitProfile;
  currentDesign: SpacecraftDesign;
  selectedScenario: MissionScenario;
  launchConfig: LaunchConfiguration;
  onConfirmLaunch: () => void;
  onNavigateToOrbit: () => void;
  onNavigateToVehicle: () => void;
}

export function LaunchConfigurationReviewModal({
  isOpen,
  onClose,
  selectedVehicle,
  selectedOrbit,
  currentDesign,
  selectedScenario,
  launchConfig,
  onConfirmLaunch,
  onNavigateToOrbit,
  onNavigateToVehicle
}: LaunchConfigurationReviewModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmedSuccess, setIsConfirmedSuccess] = useState(false);

  if (!isOpen) return null;

  const spacecraftMassKg = currentDesign.resources.totalMassKg;
  const spacecraftCostMUSD = currentDesign.resources.totalCostMUSD;

  // Single source of truth: synchronous evaluation from simulation engine
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

  // Status mapping: VALID, WARNING, CRITICAL, BLOCKED
  const overallStatus = validation.overallStatus;

  const handleConfirm = () => {
    if (!validation.isOverallCleared) return;

    setIsConfirming(true);
    setTimeout(() => {
      setIsConfirming(false);
      setIsConfirmedSuccess(true);
      setTimeout(() => {
        onConfirmLaunch();
        onClose();
      }, 1000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-space-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 border-b border-slate-800 bg-space-900/80">
          <div>
            <div className="flex items-center space-x-2 text-xs text-cyan-400 mb-1">
              <span>M03 // STAGE 5 OF 6</span>
              <span>•</span>
              <span>LAUNCH CONFIGURATION REVIEW & CLEARANCE</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-cyan-400" />
              <span>Flight Integration & Launch Clearance Package</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Mission: <strong className="text-white">{selectedScenario.name}</strong> ({selectedScenario.code}) • Spacecraft:{' '}
              <strong className="text-cyan-300">{currentDesign.name}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-center">
            {/* Status Pill Badge: VALID, WARNING, CRITICAL, BLOCKED */}
            <div
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 border shadow-md ${
                overallStatus === 'VALID'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                  : overallStatus === 'WARNING'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                    : overallStatus === 'CRITICAL'
                      ? 'bg-rose-950/90 text-rose-300 border-rose-600 animate-pulse'
                      : 'bg-rose-950/80 text-rose-300 border-rose-800/80'
              }`}
            >
              {overallStatus === 'VALID' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>STATUS: VALID</span>
                </>
              ) : overallStatus === 'WARNING' ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>STATUS: WARNING</span>
                </>
              ) : overallStatus === 'CRITICAL' ? (
                <>
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span>STATUS: CRITICAL</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>STATUS: BLOCKED</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-space-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-space-850 transition-colors"
              title="Close review modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 6-Stage Workflow Progression Indicator */}
        <div className="bg-space-900/40 border-b border-slate-800/80 px-6 py-2.5 overflow-x-auto text-[11px]">
          <div className="flex items-center justify-between min-w-[620px] text-slate-400">
            <span className="flex items-center space-x-1 text-emerald-400 font-bold">
              <Check className="w-3.5 h-3.5" />
              <span>1. Spacecraft Ready</span>
            </span>
            <span className="text-slate-600">→</span>
            <button
              onClick={onNavigateToOrbit}
              className="flex items-center space-x-1 hover:text-cyan-300 transition-colors text-emerald-400 font-bold"
              title="Return to Orbit Selection"
            >
              <Check className="w-3.5 h-3.5" />
              <span>2. Orbit Selected</span>
            </button>
            <span className="text-slate-600">→</span>
            <button
              onClick={onNavigateToVehicle}
              className="flex items-center space-x-1 hover:text-cyan-300 transition-colors text-emerald-400 font-bold"
              title="Return to Vehicle Selection"
            >
              <Check className="w-3.5 h-3.5" />
              <span>3. Vehicle Selected</span>
            </button>
            <span className="text-slate-600">→</span>
            <span
              className={`flex items-center space-x-1 font-bold ${
                validation.isOverallCleared ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {validation.isOverallCleared ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              <span>4. Validation Gates</span>
            </span>
            <span className="text-slate-600">→</span>
            <span className="flex items-center space-x-1 text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>5. Review Configuration</span>
            </span>
            <span className="text-slate-600">→</span>
            <span
              className={`flex items-center space-x-1 font-bold ${
                isConfirmedSuccess
                  ? 'text-emerald-400'
                  : validation.isOverallCleared
                    ? 'text-slate-300'
                    : 'text-slate-600'
              }`}
            >
              <Rocket className="w-3 h-3" />
              <span>6. Confirm Launch</span>
            </span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. Quad Key Specification Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Spacecraft Payload Card */}
            <div className="p-3.5 rounded-2xl bg-space-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase">
                <span>Spacecraft Payload</span>
                <span className="text-slate-400">{currentDesign.selectedComponentIds.length} parts</span>
              </div>
              <div className="text-white font-bold text-sm truncate" title={currentDesign.name}>
                {currentDesign.name}
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Wet Mass:</span>
                <span className="font-bold text-cyan-300">{spacecraftMassKg.toLocaleString()} kg</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Fairing Clearance:</span>
                <span
                  className={`font-semibold ${
                    validation.isFairingCompatible ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {validation.isFairingCompatible ? 'OK (Stowed)' : 'EXCEEDED'}
                </span>
              </div>
            </div>

            {/* Target Orbit Card */}
            <div className="p-3.5 rounded-2xl bg-space-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase">
                <span>Target Trajectory</span>
                <span className="text-cyan-400 font-bold bg-space-950 px-1 py-0.5 rounded border border-slate-800">
                  {orbitCategory}
                </span>
              </div>
              <div className="text-white font-bold text-sm truncate" title={selectedOrbit.name}>
                {selectedOrbit.name}
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Altitude:</span>
                <span className="font-bold text-slate-200">
                  {selectedOrbit.perigeeKm.toLocaleString()} × {selectedOrbit.apogeeKm.toLocaleString()} km
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Inclination:</span>
                <span>{selectedOrbit.inclinationDeg}° • {selectedOrbit.orbitalPeriodMin} min</span>
              </div>
            </div>

            {/* Selected Vehicle Card */}
            <div className="p-3.5 rounded-2xl bg-space-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase">
                <span>Selected Booster</span>
                <span className="text-amber-400 font-bold">{selectedVehicle.class} Class</span>
              </div>
              <div className="text-white font-bold text-sm truncate" title={selectedVehicle.name}>
                {selectedVehicle.name}
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Target Cap:</span>
                <span className="font-bold text-slate-200">
                  {validation.effectiveCapacityKg.toLocaleString()} kg
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Margin Reserve:</span>
                <span
                  className={`font-bold ${
                    validation.isPayloadCompatible ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {validation.payloadMarginKg >= 0
                    ? `+${validation.payloadMarginKg.toLocaleString()} kg`
                    : `${validation.payloadMarginKg.toLocaleString()} kg`}
                </span>
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="p-3.5 rounded-2xl bg-space-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase">
                <span>Mission Finances</span>
                <span
                  className={`text-[10px] font-bold px-1 py-0.5 rounded ${
                    validation.budgetStatus === 'WITHIN_BUDGET'
                      ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800'
                      : validation.budgetStatus === 'CONTINGENCY_USED'
                        ? 'text-amber-400 bg-amber-950/60 border border-amber-800'
                        : 'text-rose-400 bg-rose-950/60 border border-rose-800'
                  }`}
                >
                  {validation.budgetStatus === 'WITHIN_BUDGET'
                    ? 'IN BUDGET'
                    : validation.budgetStatus === 'CONTINGENCY_USED'
                      ? 'BUFFER'
                      : 'OVERRUN'}
                </span>
              </div>
              <div className="text-white font-extrabold text-sm">
                ${validation.totalMissionCostMUSD}M Total
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Spacecraft / Booster:</span>
                <span>
                  ${validation.spacecraftCostMUSD}M / ${validation.boosterCostMUSD}M
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Budget Ceiling:</span>
                <span className="text-slate-300 font-semibold">${validation.maxBudgetWithBufferMUSD}M (+15%)</span>
              </div>
            </div>
          </div>

          {/* 2. Independent Multi-Gate Verification Table */}
          <div className="bg-space-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-3.5 bg-space-850/80 border-b border-slate-800 flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Multi-Gate Readiness & Certification Audit</span>
              </h4>
              <span className="text-[10px] text-slate-500">
                Single Source of Truth: Simulation Engine ASTRO-2026
              </span>
            </div>

            <div className="divide-y divide-slate-800/60 text-xs">
              {/* Gate 1: Payload Mass Capacity */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span>Gate 1: Payload Mass & Margin Reserve</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({spacecraftMassKg.toLocaleString()} kg vs {validation.effectiveCapacityKg.toLocaleString()} kg capacity)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {validation.isPayloadCompatible
                      ? `Certified: Positive mass margin of +${validation.payloadMarginKg.toLocaleString()} kg reserve (${((validation.payloadMarginKg / validation.effectiveCapacityKg) * 100).toFixed(1)}%).`
                      : `Deficit: Spacecraft mass exceeds booster target capacity by ${Math.abs(validation.payloadMarginKg)} kg.`}
                  </p>
                </div>
                <div className="shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs inline-flex items-center space-x-1 ${
                      validation.isPayloadCompatible
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {validation.isPayloadCompatible ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>COMPATIBLE</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>OVERLOADED</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Gate 2: Fairing Dimensions Envelope */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span>Gate 2: Dynamic Fairing Clearance</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({selectedVehicle.fairingDiameterM}m Dia × {selectedVehicle.fairingHeightM}m Height)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {validation.isFairingCompatible
                      ? `Certified: Stowed spacecraft bus envelope satisfies acoustic shroud internal clearance.`
                      : `Deficit: Spacecraft envelope exceeds dynamic usable fairing constraints.`}
                  </p>
                </div>
                <div className="shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs inline-flex items-center space-x-1 ${
                      validation.isFairingCompatible
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {validation.isFairingCompatible ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>CLEARANCE OK</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>ENVELOPE EXCEEDED</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Gate 3: Booster Flight Profile Certification */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span>Gate 3: Vehicle Flight Profile Certification</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      (Class: {selectedVehicle.class} • Upper Stage Capability)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {validation.isOrbitCompatible
                      ? `Certified: ${selectedVehicle.name} supports direct flight injection into ${selectedOrbit.name}.`
                      : `Deficit: ${selectedVehicle.name} lacks upper-stage delta-V or certification for ${selectedOrbit.name}.`}
                  </p>
                </div>
                <div className="shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs inline-flex items-center space-x-1 ${
                      validation.isOrbitCompatible
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {validation.isOrbitCompatible ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>CERTIFIED</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>RESTRICTED</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Gate 4: Mission Mandate & Coverage Requirements */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span>Gate 4: Mission Science Mandate & Coverage</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({selectedScenario.name})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {validation.missionSuitabilityReasons[0] ||
                      `${selectedOrbit.name} evaluated against ${selectedScenario.name} requirements.`}
                  </p>
                </div>
                <div className="shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs inline-flex items-center space-x-1 ${
                      validation.missionSuitabilityStatus === 'OPTIMAL'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : validation.missionSuitabilityStatus === 'ACCEPTABLE_WITH_WARNING'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {validation.missionSuitabilityStatus === 'OPTIMAL' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>OPTIMAL</span>
                      </>
                    ) : validation.missionSuitabilityStatus === 'ACCEPTABLE_WITH_WARNING' ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>ACCEPTABLE (WARNING)</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>MANDATE UNMET</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Gate 5: Mission Fiscal Budget Allowance */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span>Gate 5: Fiscal Budget Clearance</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      (Total: ${validation.totalMissionCostMUSD}M • Ceiling: ${validation.maxBudgetWithBufferMUSD}M)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {validation.budgetStatus === 'WITHIN_BUDGET'
                      ? `Within Base Budget: $${validation.budgetBufferRemainingMUSD}M margin remaining under base $${validation.baseBudgetMUSD}M allowance.`
                      : validation.budgetStatus === 'CONTINGENCY_USED'
                        ? `Buffer Utilized: Utilizing 15% contingency reserve. Remaining buffer: $${validation.budgetBufferRemainingMUSD}M.`
                        : `Deficit: Total mission cost exceeds maximum allowable 15% budget buffer by $${validation.budgetOverrunMUSD}M.`}
                  </p>
                </div>
                <div className="shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs inline-flex items-center space-x-1 ${
                      validation.isWithinBaseBudget
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : validation.isWithinContingencyBudget
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {validation.isWithinBaseBudget ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>CLEARED</span>
                      </>
                    ) : validation.isWithinContingencyBudget ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>BUFFER USED</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>OVER BUDGET</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Diagnostic Section: Warnings & Blocking Errors */}
          {validation.allErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm text-rose-400">
                <AlertOctagon className="w-5 h-5 shrink-0" />
                <span>CONFIRMATION BLOCKED — MANDATORY VALIDATION GATES FAILED</span>
              </div>
              <p className="text-[11px] text-rose-300 pl-7">
                Flight configuration cannot be confirmed for launch authorization. Review the failing gates and apply corrective actions:
              </p>
              <div className="pl-7 space-y-1.5 text-[11px]">
                {validation.allErrors.map((err, i) => (
                  <div key={i} className="text-rose-300 font-semibold">
                    • Deficit: {err}
                  </div>
                ))}
              </div>
              {validation.recommendations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-rose-900/60 pl-7 space-y-1 text-[11px] text-amber-300">
                  <div className="font-bold text-amber-400">Suggested Corrective Actions:</div>
                  {validation.recommendations.map((rec, i) => (
                    <div key={i}>→ {rec}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {validation.warnings.length > 0 && validation.allErrors.length === 0 && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/80 text-amber-200 text-xs space-y-1.5">
              <div className="flex items-center space-x-2 font-bold text-sm text-amber-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>OPERATIONAL ADVISORIES & COVERAGE LIMITATIONS</span>
              </div>
              <p className="text-[11px] text-amber-300/90 pl-7">
                The configuration satisfies all mandatory physical and budget gates, but operational limitations apply:
              </p>
              <div className="pl-7 space-y-1 text-[11px] text-amber-300">
                {validation.warnings.map((w, i) => (
                  <div key={i}>⚠ {w}</div>
                ))}
              </div>
            </div>
          )}

          {validation.isOverallCleared && validation.warnings.length === 0 && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs space-y-1">
              <div className="flex items-center space-x-2 font-bold text-sm text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>FLIGHT CONFIGURATION FULLY CERTIFIED & OPTIMAL</span>
              </div>
              <p className="text-[11px] text-emerald-300/90 pl-7 leading-relaxed">
                All 5 flight integration gates passed with zero warnings. Positive mass margin (+{validation.payloadMarginKg.toLocaleString()} kg), within base fiscal budget (${validation.totalMissionCostMUSD}M ≤ ${validation.baseBudgetMUSD}M), and flight profile optimal for {selectedScenario.name}. Ready for Developer 04 Mission Operations handoff.
              </p>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-space-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToOrbit();
              }}
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-space-850 hover:bg-space-800 text-slate-300 border border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Orbit</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToVehicle}
              }
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-space-850 hover:bg-space-800 text-slate-300 border border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Vehicle</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-space-850 hover:bg-space-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!validation.isOverallCleared || isConfirming || isConfirmedSuccess}
              className={`px-6 py-3 rounded-xl font-extrabold text-sm flex items-center space-x-2 shadow-xl transition-all ${
                isConfirmedSuccess
                  ? 'bg-emerald-500 text-black font-extrabold'
                  : isConfirming
                    ? 'bg-amber-500 text-black animate-pulse'
                    : validation.isOverallCleared
                      ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-blue-400 text-black glow-cyan cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              {isConfirmedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CONFIGURATION CONFIRMED & HANDED OFF!</span>
                </>
              ) : isConfirming ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>TRANSMITTING HANDOFF PACKAGE...</span>
                </>
              ) : validation.isOverallCleared ? (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>CONFIRM LAUNCH CONFIGURATION</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>CONFIRMATION BLOCKED</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
