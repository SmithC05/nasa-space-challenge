import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { SpacecraftCanvas } from '../../three/SpacecraftCanvas';
import { ComponentCategory } from '@orbital/contracts';
import {
  AlertCircle,
  AlertTriangle,
  Battery,
  BatteryCharging,
  CheckCircle,
  ChevronRight,
  Cpu,
  DollarSign,
  Flame,
  Radio,
  Save,
  ShieldCheck,
  Sun,
  Weight,
  Wifi
} from 'lucide-react';
import { saveDesign } from '../../services/api';

const CATEGORIES: { id: ComponentCategory; label: string; icon: any }[] = [
  { id: 'bus', label: 'Chassis / Bus', icon: Cpu },
  { id: 'power', label: 'Power & Storage', icon: BatteryCharging },
  { id: 'propulsion', label: 'Propulsion', icon: Flame },
  { id: 'communications', label: 'Communications', icon: Radio },
  { id: 'instruments', label: 'Science Instruments', icon: Wifi },
  { id: 'thermal_aocs', label: 'Thermal & AOCS', icon: Sun }
];

export function SpacecraftLab() {
  const {
    components,
    selectedComponentIds,
    toggleComponent,
    currentDesign,
    setDesignName,
    selectedScenario,
    setActiveTab
  } = useGameStore();

  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('bus');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const filteredComponents = components.filter((c) => c.category === activeCategory);
  const selectedCompsList = components.filter((c) => selectedComponentIds.includes(c.id));

  const { resources, validation } = currentDesign;

  const handleSave = async () => {
    setSaveStatus('Saving design...');
    const ok = await saveDesign(currentDesign);
    setSaveStatus(ok ? 'Design saved to local database!' : 'Saved in local session');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Spacecraft Name */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-space-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <span>M02 // SPACECRAFT DESIGN LAB</span>
            <span>•</span>
            <span>MISSION: {selectedScenario.code}</span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={currentDesign.name}
              onChange={(e) => setDesignName(e.target.value)}
              className="bg-space-950 text-white font-extrabold text-xl lg:text-2xl px-3 py-1.5 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none"
              placeholder="Spacecraft Name"
            />
            <span className="text-xs font-mono text-slate-400">
              ({selectedComponentIds.length} modules equipped)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            className="px-4 py-2.5 rounded-xl bg-space-800 hover:bg-space-700 text-slate-200 font-mono text-xs border border-slate-700 flex items-center space-x-2 transition-colors"
          >
            <Save className="w-4 h-4 text-cyan-400" />
            <span>{saveStatus || 'SAVE DESIGN'}</span>
          </button>
          <button
            onClick={() => setActiveTab('orbit')}
            disabled={!validation.isValid}
            className={`px-5 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center space-x-2 shadow-lg transition-all ${
              validation.isValid
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black glow-cyan'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>PROCEED TO ORBIT</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: 3D Visualizer + Telemetry Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Satellite Modeler */}
        <div className="lg:col-span-7">
          <SpacecraftCanvas selectedComponents={selectedCompsList} />
        </div>

        {/* Right: Telemetry & Engineering Resource Gauges */}
        <div className="lg:col-span-5 bg-space-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Subsystem Engineering Telemetry</span>
              <span className={`text-xs px-2 py-0.5 rounded ${validation.isValid ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                {validation.isValid ? 'VALID FLIGHT CONFIG' : 'ENGINEERING WARNINGS'}
              </span>
            </h3>

            {/* Gauge Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              {/* Mass Gauge */}
              <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="flex items-center space-x-1.5">
                    <Weight className="w-3.5 h-3.5 text-cyan-400" />
                    <span>TOTAL MASS</span>
                  </span>
                  <span className={resources.massMarginKg < 0 ? 'text-rose-400' : 'text-slate-300'}>
                    {resources.totalMassKg} / {resources.maxMassKg} kg
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${resources.massMarginKg < 0 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                    style={{ width: `${Math.min(100, (resources.totalMassKg / resources.maxMassKg) * 100)}%` }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-right text-slate-400">
                  Margin: {resources.massMarginKg} kg
                </div>
              </div>

              {/* Budget Gauge */}
              <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="flex items-center space-x-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>BUDGET</span>
                  </span>
                  <span className={resources.costMarginMUSD < 0 ? 'text-rose-400' : 'text-slate-300'}>
                    ${resources.totalCostMUSD}M / ${resources.budgetMUSD}M
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${resources.costMarginMUSD < 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, (resources.totalCostMUSD / resources.budgetMUSD) * 100)}%` }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-right text-slate-400">
                  Margin: ${resources.costMarginMUSD}M
                </div>
              </div>

              {/* Power Day Margin */}
              <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="flex items-center space-x-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>DAY POWER</span>
                  </span>
                  <span className={resources.dayPowerMarginW < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    +{resources.dayPowerMarginW} W
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Gen: {resources.powerDayGenW}W</span>
                  <span>Draw: {resources.powerConsumptionW}W</span>
                </div>
              </div>

              {/* Battery Endurance in Eclipse */}
              <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="flex items-center space-x-1.5">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ECLIPSE ENDURANCE</span>
                  </span>
                  <span className={resources.batteryEnduranceMin < resources.eclipseDurationMin ? 'text-rose-400 font-bold' : 'text-cyan-400'}>
                    {resources.batteryEnduranceMin} min
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Eclipse: {resources.eclipseDurationMin} min</span>
                  <span>Cap: {resources.batteryCapacityWh} Wh</span>
                </div>
              </div>

              {/* Downlink Bandwidth */}
              <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="flex items-center space-x-1.5">
                    <Wifi className="w-3.5 h-3.5 text-purple-400" />
                    <span>DOWNLINK RATE</span>
                  </span>
                  <span className="text-purple-300 font-bold">
                    {resources.dataRateMbps} Mbps
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Target min: {selectedScenario.minBandwidthMbps} Mbps
                </div>
              </div>

              {/* Hardware Reliability Rating */}
              <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>RELIABILITY</span>
                  </span>
                  <span className="text-cyan-300 font-bold">
                    {resources.averageReliabilityPct}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Available Delta-V: {resources.deltaVAvailableMps} m/s
                </div>
              </div>
            </div>
          </div>

          {/* Validation Feedback Box */}
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
            {validation.errors.map((err, i) => (
              <div key={`err-${i}`} className="flex items-start space-x-2 text-rose-400 text-xs font-mono">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{err}</span>
              </div>
            ))}
            {validation.warnings.map((warn, i) => (
              <div key={`warn-${i}`} className="flex items-start space-x-2 text-amber-400 text-xs font-mono">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{warn}</span>
              </div>
            ))}
            {validation.errors.length === 0 && validation.warnings.length === 0 && (
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>All engineering design rules satisfied. Spacecraft ready for launch integration.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Component Catalog Navigation Tabs */}
      <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-800">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const equippedCount = components.filter(
              (c) => c.category === cat.id && selectedComponentIds.includes(c.id)
            ).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs flex items-center space-x-2 transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 glow-cyan'
                    : 'bg-space-950 text-slate-400 hover:text-white hover:bg-space-850 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
                {equippedCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-cyan-500 text-black text-[10px] font-bold flex items-center justify-center">
                    {equippedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Component Items List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredComponents.map((comp) => {
            const isEquipped = selectedComponentIds.includes(comp.id);
            return (
              <div
                key={comp.id}
                onClick={() => toggleComponent(comp.id)}
                className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                  isEquipped
                    ? 'bg-space-850 border-cyan-500 shadow-md glow-cyan'
                    : 'bg-space-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-space-850/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wide">
                      {comp.subCategory}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isEquipped
                          ? 'bg-cyan-500 text-black'
                          : 'bg-space-900 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isEquipped ? 'EQUIPPED' : 'SELECT'}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm mb-1">{comp.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{comp.description}</p>
                </div>

                {/* Specs pill badges */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono bg-space-950 p-2 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400">
                    Mass: <span className="text-cyan-300 font-semibold">{comp.massKg} kg</span>
                  </div>
                  <div className="text-slate-400">
                    Cost: <span className="text-emerald-300 font-semibold">${comp.costMUSD}M</span>
                  </div>
                  {(comp.powerGenerationW ?? 0) > 0 && (
                    <div className="text-slate-400">
                      Gen: <span className="text-amber-300 font-semibold">+{comp.powerGenerationW}W</span>
                    </div>
                  )}
                  {(comp.powerConsumptionW ?? 0) > 0 && (
                    <div className="text-slate-400">
                      Draw: <span className="text-rose-300 font-semibold">-{comp.powerConsumptionW}W</span>
                    </div>
                  )}
                  {(comp.batteryCapacityWh ?? 0) > 0 && (
                    <div className="text-slate-400">
                      Batt: <span className="text-emerald-300 font-semibold">{comp.batteryCapacityWh}Wh</span>
                    </div>
                  )}
                  {(comp.dataRateMbps ?? 0) > 0 && (
                    <div className="text-slate-400">
                      Rate: <span className="text-purple-300 font-semibold">{comp.dataRateMbps}Mbps</span>
                    </div>
                  )}
                  {(comp.deltaVMps ?? 0) > 0 && (
                    <div className="text-slate-400">
                      ΔV: <span className="text-cyan-300 font-semibold">{comp.deltaVMps}m/s</span>
                    </div>
                  )}
                  <div className="text-slate-400">
                    Rel: <span className="text-slate-200 font-semibold">{comp.reliabilityPercent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
