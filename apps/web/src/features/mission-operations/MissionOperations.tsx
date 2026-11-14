import React from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Award,
  Battery,
  BatteryCharging,
  CheckCircle2,
  Clock,
  FastForward,
  Flame,
  Globe2,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Shield,
  Signal,
  Sun,
  Thermometer,
  Wifi,
  Zap
} from 'lucide-react';

export function MissionOperations() {
  const {
    simulationState,
    resolveEventChoice,
    setSpeedMultiplier,
    togglePause,
    startMissionLaunch,
    missionReport,
    selectedScenario,
    currentDesign,
    setActiveTab
  } = useGameStore();

  if (!simulationState) {
    return (
      <div className="bg-space-900 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto my-12 shadow-2xl">
        <Radio className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-extrabold text-white mb-2">Spacecraft Pre-Launch State</h2>
        <p className="text-slate-400 text-sm mb-6">
          The spacecraft [{currentDesign.name}] is resting on the launch pad awaiting flight authorization.
        </p>
        <button
          onClick={startMissionLaunch}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-black font-extrabold font-mono text-sm shadow-lg glow-cyan"
        >
          START TERMINAL COUNTDOWN
        </button>
      </div>
    );
  }

  const { telemetry, phase, missionClockSec, speedMultiplier, isPaused, activeEvent, missionLogs, sciencePointsAccumulated } = simulationState;

  // Format Mission Elapsed Time (MET) HH:MM:SS
  const formatMET = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSec % 60).toString().padStart(2, '0');
    return `T+${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Operations Telemetry Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-space-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <span>M04 // MISSION OPERATIONS CENTER</span>
            <span>•</span>
            <span className="text-emerald-400">FLIGHT DIRECTORS CONSOLE</span>
          </div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white">
              {currentDesign.name}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                phase === 'MISSION_COMPLETE'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : phase === 'MISSION_ABORTED'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                    : phase === 'PRIMARY_SCIENCE'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {phase.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* MET Clock & Simulation Speed Controls */}
        <div className="flex items-center space-x-4 bg-space-950/80 p-2.5 rounded-2xl border border-slate-800">
          <div className="text-right pr-3 border-r border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">MISSION ELAPSED TIME</span>
            <span className="text-xl font-mono font-extrabold text-cyan-400 tracking-wider">
              {formatMET(missionClockSec)}
            </span>
          </div>

          <div className="flex items-center space-x-1 font-mono text-xs">
            <button
              onClick={togglePause}
              className={`p-2 rounded-lg border transition-colors ${
                isPaused
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-space-900 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeedMultiplier(speed)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                  speedMultiplier === speed
                    ? 'bg-cyan-500 text-black border-cyan-400'
                    : 'bg-space-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Crisis Event Popup / Alert Banner */}
      {activeEvent && (
        <div className="bg-gradient-to-r from-rose-950/90 via-space-900 to-rose-950/90 border-2 border-rose-500 rounded-3xl p-6 shadow-2xl glow-red animate-pulse-fast">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-rose-600 rounded-2xl text-white">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                  ANOMALY IN PROGRESS // {activeEvent.severity} PRIORITY
                </span>
                <span className="text-xs font-mono text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                  ACTION REQUIRED
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">{activeEvent.title}</h3>
              <p className="text-sm text-slate-200 mb-4">{activeEvent.description}</p>

              {/* Action Choices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeEvent.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => resolveEventChoice(activeEvent.id, choice.id)}
                    className="text-left bg-space-950/90 hover:bg-space-850 border border-rose-500/50 hover:border-rose-400 p-4 rounded-xl transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-sm group-hover:text-rose-300">
                        {choice.label}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-semibold">
                        {Math.round(choice.successProbability * 100)}% Success
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{choice.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Operations Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Orbital Mechanics */}
        <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono flex items-center space-x-1.5">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <span>ORBIT TRACK</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              NOMINAL
            </span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">ALTITUDE:</span>
              <span className="text-white font-bold">{telemetry.altitudeKm} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">VELOCITY:</span>
              <span className="text-white font-bold">{telemetry.velocityKps} km/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">TRUE ANOMALY:</span>
              <span className="text-cyan-300">{telemetry.trueAnomalyDeg}°</span>
            </div>
          </div>
        </div>

        {/* Electrical Power & Battery */}
        <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono flex items-center space-x-1.5">
              {telemetry.inSunlight ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
              )}
              <span>POWER BUS</span>
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                telemetry.inSunlight
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                  : 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
              }`}
            >
              {telemetry.inSunlight ? 'IN SUNLIGHT' : 'IN ECLIPSE'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">BATTERY SOC:</span>
              <span
                className={`font-bold ${
                  telemetry.batteryLevelPct < 25
                    ? 'text-rose-400'
                    : telemetry.batteryLevelPct < 50
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                }`}
              >
                {telemetry.batteryLevelPct}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${
                  telemetry.batteryLevelPct < 25 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${telemetry.batteryLevelPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Gen: +{telemetry.solarPowerGenW}W</span>
              <span>Draw: -{telemetry.powerDrawW}W</span>
            </div>
          </div>
        </div>

        {/* Science Downlink & Ground Station */}
        <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono flex items-center space-x-1.5">
              <Signal className="w-4 h-4 text-purple-400" />
              <span>DSN LINK</span>
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                telemetry.activeGroundStation
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : 'bg-rose-950/80 text-rose-300 border-rose-800'
              }`}
            >
              {telemetry.activeGroundStation ? 'ACTIVE CONTACT' : 'LOSS OF SIGNAL'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">STATION:</span>
              <span className="text-white font-bold truncate max-w-[140px]">
                {telemetry.activeGroundStation || 'None (Buffer Active)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">BUFFER / DOWNLINK:</span>
              <span className="text-purple-300">
                {telemetry.dataBufferGb} GB / {telemetry.scienceDataDownlinkedGb} GB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">SCIENCE POINTS:</span>
              <span className="text-emerald-400 font-bold">{sciencePointsAccumulated} pts</span>
            </div>
          </div>
        </div>

        {/* Thermal Subsystem */}
        <div className="bg-space-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono flex items-center space-x-1.5">
              <Thermometer className="w-4 h-4 text-rose-400" />
              <span>THERMAL STATE</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              EQUILIBRIUM
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">TEMPERATURE:</span>
              <span className="text-white font-bold">{telemetry.temperatureCelsius}°C</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Range: -40°C to +85°C (Within operational limit)
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400">TARGET SCIENCE:</span>
              <span className="text-amber-400 font-bold">{selectedScenario.minSciencePoints} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ground Station Radar & Flight Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ground Station Network status */}
        <div className="lg:col-span-5 bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Deep Space Network (DSN) Antennas</span>
          </h3>

          <div className="space-y-3">
            {telemetry.groundStations.map((station) => (
              <div
                key={station.name}
                className={`p-3 rounded-xl border text-xs font-mono transition-colors flex items-center justify-between ${
                  station.inContact
                    ? 'bg-space-850 border-emerald-500 glow-emerald'
                    : 'bg-space-950/80 border-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold text-white text-sm">{station.name}</div>
                  <div className="text-[11px] text-slate-400">{station.location}</div>
                </div>

                <div className="text-right">
                  <div className={station.inContact ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {station.inContact ? 'LOCKED (140 Mbps)' : 'BELOW HORIZON'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Elev: {Math.round(station.elevationDeg)}° • Sig: {station.signalStrengthPct}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Tactical Flight Log Feed */}
        <div className="lg:col-span-7 bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Tactical Flight Telemetry Log</span>
          </h3>

          <div className="bg-space-950 rounded-2xl border border-slate-800/80 p-4 h-64 overflow-y-auto space-y-2 font-mono text-xs">
            {missionLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-2">
                <span className="text-slate-400 shrink-0">[{formatMET(log.timeSec)}]</span>
                <span
                  className={`font-bold shrink-0 ${
                    log.level === 'SUCCESS'
                      ? 'text-emerald-400'
                      : log.level === 'ERROR'
                        ? 'text-rose-400'
                        : log.level === 'WARN'
                          ? 'text-amber-400'
                          : 'text-cyan-400'
                  }`}
                >
                  [{log.source}]
                </span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Debrief Report Modal */}
      {missionReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-space-900 border-2 border-cyan-500 rounded-3xl max-w-2xl w-full p-8 shadow-2xl glow-cyan animate-fadeIn">
            <div className="flex items-center space-x-3 mb-4">
              <Award className="w-10 h-10 text-cyan-400" />
              <div>
                <span className="text-xs font-mono text-cyan-400 tracking-wider">
                  MISSION DEBRIEF REPORT // {missionReport.scenarioName}
                </span>
                <h3 className="text-2xl font-extrabold text-white">
                  {missionReport.outcome.replace('_', ' ')}
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6 bg-space-950 p-4 rounded-xl border border-slate-800">
              {missionReport.evaluationNotes}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono mb-6">
              <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">SCIENCE SCORE</span>
                <span className="text-emerald-400 font-extrabold text-lg">{missionReport.finalScienceScore}</span>
              </div>
              <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">DATA DOWNLINK</span>
                <span className="text-purple-300 font-extrabold text-lg">{missionReport.dataGatheredGb} GB</span>
              </div>
              <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">BUDGET SURPLUS</span>
                <span className="text-cyan-300 font-extrabold text-lg">${missionReport.budgetRemainingMUSD}M</span>
              </div>
              <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">CRISES MITIGATED</span>
                <span className="text-amber-400 font-extrabold text-lg">{missionReport.crisesResolved}</span>
              </div>
            </div>

            {missionReport.accolades.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  NASA Engineering Accolades
                </h4>
                <div className="space-y-1.5">
                  {missionReport.accolades.map((acc, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs font-mono text-cyan-300 bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-cyan-800/60">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>{acc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setActiveTab('hub')}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold font-mono text-xs transition-colors"
              >
                RETURN TO MISSION HUB
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
