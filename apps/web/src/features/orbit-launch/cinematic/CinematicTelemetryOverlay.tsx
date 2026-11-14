import React from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Compass,
  FastForward,
  Flame,
  Globe2,
  Layers,
  Lock,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { LAUNCH_STAGES, LaunchStageId, LaunchTelemetry } from './types';
import { LaunchConfiguration, LaunchVehicle, MissionScenario, OrbitProfile, SpacecraftDesign } from '@orbital/contracts';

interface CinematicTelemetryOverlayProps {
  stageId: LaunchStageId;
  countdownSeconds: number;
  telemetry: LaunchTelemetry;
  vehicle: LaunchVehicle;
  orbit: OrbitProfile;
  spacecraft: SpacecraftDesign;
  scenario: MissionScenario;
  launchConfig: LaunchConfiguration;
  isConfirmed: boolean;
  isPaused: boolean;
  isMuted: boolean;
  isReducedMotion: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onToggleReducedMotion: () => void;
  onSkipStage: () => void;
  onSkipToEnd: () => void;
  onReplay: () => void;
  onStartCountdown: () => void;
  onProceedToOps: () => void;
  onClose: () => void;
}

export function CinematicTelemetryOverlay({
  stageId,
  countdownSeconds,
  telemetry,
  vehicle,
  orbit,
  spacecraft,
  scenario,
  launchConfig,
  isConfirmed,
  isPaused,
  isMuted,
  isReducedMotion,
  onTogglePause,
  onToggleMute,
  onToggleReducedMotion,
  onSkipStage,
  onSkipToEnd,
  onReplay,
  onStartCountdown,
  onProceedToOps,
  onClose
}: CinematicTelemetryOverlayProps) {
  const currentStageDef = LAUNCH_STAGES.find((s) => s.id === stageId) || LAUNCH_STAGES[0];

  const formatMET = (totalSec: number) => {
    if (stageId === 'STAGE_1_PRE_LAUNCH') return 'T-00:00:10 (STANDBY)';
    if (stageId === 'STAGE_2_COUNTDOWN') {
      const secStr = Math.max(0, Math.ceil(countdownSeconds)).toString().padStart(2, '0');
      return `T-00:00:${secStr}`;
    }
    const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSec % 60).toString().padStart(2, '0');
    return `T+${h}:${m}:${s}`;
  };

  const orbitCategory = (orbit as any).category || (orbit.id === 'orbit-polar' ? 'POLAR' : orbit.type);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 font-mono text-white select-none z-30">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & MET CLOCK */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-space-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-2xl pointer-events-auto">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
            <Rocket className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2 text-[10px] text-cyan-400">
              <span>M03 // MISSION LAUNCH SIMULATOR</span>
              <span>•</span>
              <span>PHASE 6: CINEMATIC FLIGHT SEQUENCE</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center space-x-2">
              <span>{scenario.name}</span>
              <span className="text-slate-500 text-sm">({scenario.code})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Vehicle: <strong className="text-amber-400">{vehicle.name}</strong> • Spacecraft:{' '}
              <strong className="text-cyan-300">{spacecraft.name}</strong> • Target Orbit:{' '}
              <strong className="text-white">{orbit.name} ({orbitCategory})</strong>
            </p>
          </div>
        </div>

        {/* MET Clock & Close */}
        <div className="flex items-center space-x-3 self-end sm:self-center">
          <div className="px-4 py-2 rounded-xl bg-space-900 border border-slate-700/80 text-right">
            <span className="text-[10px] block text-slate-400 uppercase tracking-widest">MISSION ELAPSED TIME</span>
            <span className="text-base sm:text-lg font-extrabold text-cyan-300 font-mono">
              {formatMET(telemetry.missionElapsedSec)}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-space-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-space-850 transition-colors"
            title="Exit launch view"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. 9-STAGE WORKFLOW PROGRESSION RIBBON */}
      {/* ============================================================== */}
      <div className="my-2 bg-space-950/70 backdrop-blur-sm border border-slate-800/80 rounded-2xl px-4 py-2 overflow-x-auto pointer-events-auto">
        <div className="flex items-center justify-between min-w-[840px] text-xs">
          {LAUNCH_STAGES.map((st, i) => {
            const isCompleted = currentStageDef.index > st.index;
            const isCurrent = currentStageDef.index === st.index;

            return (
              <React.Fragment key={st.id}>
                <div
                  className={`flex items-center space-x-1.5 transition-colors ${
                    isCurrent
                      ? 'text-cyan-300 font-bold bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800 shadow-sm'
                      : isCompleted
                        ? 'text-emerald-400 font-medium'
                        : 'text-slate-600'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] border ${
                      isCurrent
                        ? 'bg-cyan-900 border-cyan-600 text-cyan-200'
                        : isCompleted
                          ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                          : 'bg-space-900 border-slate-800 text-slate-600'
                    }`}
                  >
                    {isCompleted ? '✓' : st.index}
                  </span>
                  <span className="text-[11px] whitespace-nowrap">{st.shortTitle}</span>
                </div>
                {i < LAUNCH_STAGES.length - 1 && <span className="text-slate-700 text-xs">→</span>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. CENTER DYNAMIC STAGE OVERLAYS (STAGES 1 TO 9) */}
      {/* ============================================================== */}
      <div className="flex-1 flex items-center justify-center pointer-events-none">
        {/* STAGE 1: PRE-LAUNCH READINESS */}
        {stageId === 'STAGE_1_PRE_LAUNCH' && (
          <div className="max-w-xl w-full bg-space-950/90 backdrop-blur-md border border-slate-800 p-6 rounded-3xl shadow-2xl pointer-events-auto animate-fadeIn text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Stage 1: Pre-Launch Readiness & Pad Telemetry</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-space-900 text-slate-400 border border-slate-800">
                LC-39A PAD SECURE
              </span>
            </div>

            {/* Verification checklist items */}
            <div className="space-y-2 text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-xl bg-space-900/60 border border-slate-800">
                <span className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Phase 5 Flight Integration Certification</span>
                </span>
                <span className={`text-[10px] font-bold ${isConfirmed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isConfirmed ? 'CONFIRMED' : 'UNCONFIRMED / BLOCKED'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-space-900/60 border border-slate-800">
                <span className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Propellant Loading (RP-1 / LOX Tanks 100%)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">FLIGHT LOAD COMPLETE</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-space-900/60 border border-slate-800">
                <span className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Payload Fairing Acoustic Shroud Seal</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">NOMINAL (1.2 ATM)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-space-900/60 border border-slate-800">
                <span className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Eastern Range Safety & Downrange Assets</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">RANGE GREEN</span>
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Single Source of Truth: <code>@orbital/simulation-engine</code>
              </span>

              {isConfirmed && launchConfig.isCompatible ? (
                <button
                  type="button"
                  onClick={onStartCountdown}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-blue-400 text-black font-extrabold text-sm flex items-center space-x-2 shadow-xl glow-cyan"
                >
                  <Rocket className="w-4 h-4" />
                  <span>INITIATE COUNTDOWN (T-10s)</span>
                </button>
              ) : (
                <div className="px-4 py-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>LAUNCH BLOCKED (UNAUTHORIZED CONFIGURATION)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STAGE 2: TERMINAL COUNTDOWN */}
        {stageId === 'STAGE_2_COUNTDOWN' && (
          <div className="text-center space-y-2 pointer-events-auto animate-fadeIn">
            <div className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
              TERMINAL LAUNCH SEQUENCER
            </div>
            <div className="text-6xl sm:text-8xl lg:text-9xl font-black font-mono text-cyan-300 drop-shadow-[0_0_35px_rgba(34,211,238,0.7)] animate-pulse">
              T-{Math.max(0, Math.ceil(countdownSeconds)).toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-center space-x-3 pt-2">
              <span className="px-3 py-1 rounded-full bg-space-950/80 border border-cyan-800 text-cyan-300 font-bold">
                AUTO SEQUENCE STARTED
              </span>
              <button
                type="button"
                onClick={onSkipStage}
                className="px-3 py-1 rounded-full bg-space-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-colors"
              >
                Skip to Ignition ➔
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: IGNITION */}
        {stageId === 'STAGE_3_IGNITION' && (
          <div className="text-center space-y-2 pointer-events-auto animate-fadeIn">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-950/90 border border-amber-600 text-amber-300 font-bold text-sm shadow-xl animate-pulse">
              <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
              <span>MAIN ENGINE IGNITION SEQUENCE INITIATED</span>
            </div>
            <div className="text-xs text-slate-300">
              Chamber pressure rising • Acoustic water deluge suppression activated
            </div>
          </div>
        )}

        {/* STAGE 6: STAGE & FAIRING SEPARATION */}
        {stageId === 'STAGE_6_STAGE_SEPARATION' && (
          <div className="text-center space-y-2 pointer-events-auto animate-fadeIn">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-600 text-cyan-300 font-bold text-sm shadow-xl">
              <Layers className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>FIRST STAGE SEPARATION & FAIRING JETTISON</span>
            </div>
            <div className="text-xs text-slate-300">
              Vacuum engine ignition confirmed • Payload fairing halves jettisoned
            </div>
          </div>
        )}

        {/* STAGE 7: SPACECRAFT DEPLOYMENT */}
        {stageId === 'STAGE_7_SPACECRAFT_DEPLOYMENT' && (
          <div className="text-center space-y-2 pointer-events-auto animate-fadeIn">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-600 text-emerald-300 font-bold text-sm shadow-xl">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>SPACECRAFT SEPARATION & SOLAR ARRAY DEPLOYMENT</span>
            </div>
            <div className="text-xs text-slate-300">
              {spacecraft.name} released • Solar arrays locked in sun-tracking orientation
            </div>
          </div>
        )}

        {/* STAGE 8: ORBITAL INSERTION CERTIFIED */}
        {stageId === 'STAGE_8_ORBIT_INSERTION' && (
          <div className="text-center space-y-2 pointer-events-auto animate-fadeIn">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500 text-emerald-300 font-bold text-sm shadow-2xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>ORBITAL INSERTION SUCCESSFUL — TRAJECTORY CERTIFIED</span>
            </div>
            <div className="text-xs text-slate-200">
              {orbit.name} ({orbit.perigeeKm} × {orbit.apogeeKm} km, {orbit.inclinationDeg}°, {orbit.orbitalPeriodMin} min)
            </div>
          </div>
        )}

        {/* STAGE 9: MISSION OPERATIONS HANDOFF */}
        {stageId === 'STAGE_9_OPERATIONS_HANDOFF' && (
          <div className="max-w-xl w-full bg-space-950/95 backdrop-blur-md border border-slate-800 p-6 rounded-3xl shadow-2xl pointer-events-auto animate-fadeIn text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="text-base font-extrabold text-white">
                  Stage 9: Mission Operations Center Handoff
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                READY FOR OPS
              </span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Ascent and spacecraft deployment sequence completed successfully. The confirmed flight configuration package and live orbital telemetry are ready for transfer to Developer 04 (Mission Operations Center).
            </p>

            {/* Handoff Specs Card */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-space-900 border border-slate-800 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">PAYLOAD SPACECRAFT</span>
                <span className="font-bold text-white">{spacecraft.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">BOOSTER STAGE</span>
                <span className="font-bold text-amber-400">{vehicle.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">TARGET ORBIT</span>
                <span className="font-bold text-cyan-300">{orbit.name} ({orbitCategory})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">MISSION COST</span>
                <span className="font-bold text-emerald-400">${launchConfig.totalCostMUSD ?? 121.4}M Total</span>
              </div>
            </div>

            {/* Handoff Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onReplay}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-space-850 hover:bg-space-800 text-slate-300 border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>REPLAY LAUNCH</span>
              </button>

              <button
                type="button"
                onClick={onProceedToOps}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-blue-400 text-black font-extrabold text-xs flex items-center justify-center space-x-2 shadow-xl glow-cyan"
              >
                <span>PROCEED TO MISSION OPERATIONS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 4. BOTTOM TELEMETRY HUD & PLAYBACK CONTROLS */}
      {/* ============================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pointer-events-auto">
        {/* Left: Flight Telemetry Dashboard (Altitude, Velocity, Downrange, Throttles) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-space-950/85 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 shadow-2xl text-xs">
          <div className="p-2 rounded-xl bg-space-900 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase">ALTITUDE</span>
            <span className="text-sm sm:text-base font-extrabold text-white">
              {telemetry.altitudeKm.toFixed(1)} km
            </span>
          </div>

          <div className="p-2 rounded-xl bg-space-900 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase">VELOCITY</span>
            <span className="text-sm sm:text-base font-extrabold text-cyan-300">
              {telemetry.velocityMps >= 1000
                ? `${(telemetry.velocityMps / 1000).toFixed(2)} km/s`
                : `${Math.round(telemetry.velocityMps)} m/s`}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-space-900 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase">DOWNRANGE</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-200">
              {telemetry.downrangeKm.toFixed(1)} km
            </span>
          </div>

          <div className="p-2 rounded-xl bg-space-900 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase">ACCELERATION</span>
            <span className="text-sm sm:text-base font-extrabold text-amber-400">
              {telemetry.gForce.toFixed(2)} G
            </span>
          </div>
        </div>

        {/* Right: Playback Controls (Play/Pause, Skip Stage, Skip to End, Replay, Audio, Reduced Motion) */}
        <div className="flex items-center space-x-2 bg-space-950/85 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800 shadow-2xl self-end">
          {/* Play / Pause */}
          <button
            type="button"
            onClick={onTogglePause}
            className="p-2 rounded-xl bg-space-900 hover:bg-space-850 border border-slate-700 text-slate-200 hover:text-white transition-colors"
            title={isPaused ? 'Resume sequence' : 'Pause sequence'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Skip Stage */}
          <button
            type="button"
            onClick={onSkipStage}
            className="p-2 rounded-xl bg-space-900 hover:bg-space-850 border border-slate-700 text-slate-200 hover:text-white transition-colors flex items-center space-x-1"
            title="Advance to next launch stage"
          >
            <FastForward className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-bold hidden sm:inline">Next Stage</span>
          </button>

          {/* Skip to Handoff */}
          <button
            type="button"
            onClick={onSkipToEnd}
            className="px-2.5 py-1.5 rounded-xl bg-space-900 hover:bg-space-850 border border-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] font-bold hidden sm:inline"
            title="Fast forward to operations handoff"
          >
            Skip to End
          </button>

          {/* Replay */}
          <button
            type="button"
            onClick={onReplay}
            className="p-2 rounded-xl bg-space-900 hover:bg-space-850 border border-slate-700 text-slate-200 hover:text-white transition-colors"
            title="Replay from pre-launch"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
          </button>

          <span className="text-slate-700">|</span>

          {/* Mute / Unmute */}
          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-space-900 hover:bg-space-850 border border-slate-700 text-slate-200 hover:text-white transition-colors"
            title={isMuted ? 'Unmute launch sound' : 'Mute launch sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Reduced Motion Toggle */}
          <button
            type="button"
            onClick={onToggleReducedMotion}
            className={`p-2 rounded-xl border transition-colors ${
              isReducedMotion
                ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                : 'bg-space-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={isReducedMotion ? 'Reduced Motion: ON (Camera shake disabled)' : 'Reduced Motion: OFF'}
          >
            {isReducedMotion ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
