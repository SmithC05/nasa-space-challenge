import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { LaunchStageId, LaunchTelemetry } from './types';
import { Rocket3DModel } from './Rocket3DModel';
import { LaunchPadEnvironment3D } from './LaunchPadEnvironment3D';
import { CinematicCameraRig } from './CinematicCameraRig';
import { CinematicTelemetryOverlay } from './CinematicTelemetryOverlay';
import { launchAudio } from './audioSynthesizer';
import { useGameStore } from '../../../store/gameStore';
import {
  EarthAtmosphere,
  EarthCloudLayer,
  EarthGlobe,
  SunLighting
} from '../../../three/earth';
import { OrbitPathRenderer } from '../../../three/orbit';

interface CinematicLaunchSequenceProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToOps?: () => void;
}

export function CinematicLaunchSequence({
  isOpen,
  onClose,
  onProceedToOps
}: CinematicLaunchSequenceProps) {
  const store = useGameStore();
  const selectedVehicle = store.selectedVehicle;
  const selectedOrbit = store.selectedOrbit;
  const currentDesign = store.currentDesign;
  const selectedScenario = store.selectedScenario;
  const launchConfig = store.launchConfig;
  const launchHandoff = store.launchHandoff;
  const startMissionLaunch = store.startMissionLaunch;
  const setActiveTab = store.setActiveTab;

  const isConfirmed = launchConfig.status === 'CONFIRMED' || launchHandoff !== null;
  const isCompatible = launchConfig.isCompatible;

  // Animation timeline state
  const [stageId, setStageId] = useState<LaunchStageId>('STAGE_1_PRE_LAUNCH');
  const [countdownSeconds, setCountdownSeconds] = useState(10);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Dynamic 3D animation values driven by GSAP / requestAnimationFrame
  const [rocketAltitudeMeters, setRocketAltitudeMeters] = useState(0);
  const [throttle, setThrottle] = useState(0);
  const [isIgnited, setIsIgnited] = useState(false);
  const [cameraShake, setCameraShake] = useState(0);
  const [boosterSeparated, setBoosterSeparated] = useState(false);
  const [boosterSeparationDist, setBoosterSeparationDist] = useState(0);
  const [fairingJettisoned, setFairingJettisoned] = useState(false);
  const [fairingOpenAngle, setFairingOpenAngle] = useState(0);
  const [spacecraftSeparated, setSpacecraftSeparated] = useState(false);
  const [spacecraftSeparationDist, setSpacecraftSeparationDist] = useState(0);
  const [solarDeploymentProgress, setSolarDeploymentProgress] = useState(0);

  // Live flight telemetry
  const [telemetry, setTelemetry] = useState<LaunchTelemetry>({
    stageId: 'STAGE_1_PRE_LAUNCH',
    missionElapsedSec: 0,
    altitudeKm: 0,
    velocityMps: 0,
    downrangeKm: 0,
    throttlePct: 0,
    stage1PropellantPct: 100,
    stage2PropellantPct: 100,
    gForce: 1.0,
    machNumber: 0,
    fairingJettisoned: false,
    boosterSeparated: false,
    spacecraftSeparated: false,
    solarPanelsDeployed: false,
    orbitInsertionConfirmed: false
  });

  // GSAP timeline reference for animation orchestration & cleanup
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLaunchingRef = useRef(false);

  // Reset sequence when modal opens
  useEffect(() => {
    if (isOpen) {
      resetSequence();
    } else {
      cleanupTimeline();
    }
    return () => {
      cleanupTimeline();
    };
  }, [isOpen]);

  const cleanupTimeline = () => {
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    launchAudio.cleanup();
    isLaunchingRef.current = false;
  };

  const resetSequence = () => {
    cleanupTimeline();
    setStageId('STAGE_1_PRE_LAUNCH');
    setCountdownSeconds(10);
    setIsPaused(false);
    setRocketAltitudeMeters(0);
    setThrottle(0);
    setIsIgnited(false);
    setCameraShake(0);
    setBoosterSeparated(false);
    setBoosterSeparationDist(0);
    setFairingJettisoned(false);
    setFairingOpenAngle(0);
    setSpacecraftSeparated(false);
    setSpacecraftSeparationDist(0);
    setSolarDeploymentProgress(0);

    setTelemetry({
      stageId: 'STAGE_1_PRE_LAUNCH',
      missionElapsedSec: 0,
      altitudeKm: 0,
      velocityMps: 0,
      downrangeKm: 0,
      throttlePct: 0,
      stage1PropellantPct: 100,
      stage2PropellantPct: 100,
      gForce: 1.0,
      machNumber: 0,
      fairingJettisoned: false,
      boosterSeparated: false,
      spacecraftSeparated: false,
      solarPanelsDeployed: false,
      orbitInsertionConfirmed: false
    });
  };

  // Stage 2: Countdown sequencer
  const startCountdown = () => {
    if (!isConfirmed || !isCompatible || isLaunchingRef.current) return;
    isLaunchingRef.current = true;

    setStageId('STAGE_2_COUNTDOWN');
    setCountdownSeconds(10);
    launchAudio.playCountdownBeep(false);

    let sec = 10;
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    countdownIntervalRef.current = setInterval(() => {
      sec -= 1;
      setCountdownSeconds(sec);

      if (sec > 0) {
        launchAudio.playCountdownBeep(sec === 1);
      }

      // Ignition at T-3 seconds
      if (sec === 3) {
        setIsIgnited(true);
        setThrottle(0.65);
        setCameraShake(0.6);
        launchAudio.startRocketRoar(0.5);
      }

      // Liftoff at T-0
      if (sec <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        executeFlightTimeline();
      }
    }, 1000);
  };

  // Master GSAP Flight Timeline (Stages 3 to 9)
  const executeFlightTimeline = () => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const animState = {
      alt: 0,
      thr: 1.0,
      shake: 0.8,
      boosterDist: 0,
      fairingAngle: 0,
      craftDist: 0,
      solarProgress: 0,
      metSec: 0,
      downrange: 0,
      vel: 15
    };

    const tl = gsap.timeline({
      onUpdate: () => {
        setRocketAltitudeMeters(animState.alt);
        setThrottle(animState.thr);
        setCameraShake(animState.shake);
        setBoosterSeparationDist(animState.boosterDist);
        setFairingOpenAngle(animState.fairingAngle);
        setSpacecraftSeparationDist(animState.craftDist);
        setSolarDeploymentProgress(animState.solarProgress);

        setTelemetry((prev) => ({
          ...prev,
          missionElapsedSec: Math.floor(animState.metSec),
          altitudeKm: animState.alt * 0.05,
          velocityMps: animState.vel,
          downrangeKm: animState.downrange,
          throttlePct: Math.round(animState.thr * 100),
          stage1PropellantPct: Math.max(0, Math.round(100 - animState.metSec * 1.4)),
          stage2PropellantPct: animState.metSec > 40 ? Math.max(10, Math.round(100 - (animState.metSec - 40) * 1.5)) : 100,
          gForce: Math.min(3.8, Math.max(1.0, 1.0 + (animState.vel / 2800) * 2.5)),
          machNumber: Math.round((animState.vel / 340) * 10) / 10
        }));
      }
    });

    timelineRef.current = tl;

    // --- STAGE 3: IGNITION & PAD CLAMP RELEASE (0s -> 2s) ---
    tl.add(() => {
      setStageId('STAGE_3_IGNITION');
      setIsIgnited(true);
      launchAudio.startRocketRoar(0.7);
    }, 0);

    tl.to(animState, {
      thr: 1.0,
      shake: 0.9,
      duration: 1.5,
      ease: 'power2.in'
    }, 0);

    // --- STAGE 4: LIFTOFF (2s -> 7s) ---
    tl.add(() => {
      setStageId('STAGE_4_LIFTOFF');
      launchAudio.setRoarIntensity(0.9);
    }, 1.5);

    tl.to(animState, {
      alt: 18,
      vel: 120,
      metSec: 10,
      downrange: 1.5,
      shake: 0.7,
      duration: 5.0,
      ease: 'power1.in'
    }, 1.5);

    // --- STAGE 5: ATMOSPHERIC ASCENT & MAX-Q (7s -> 13s) ---
    tl.add(() => {
      setStageId('STAGE_5_ATMOSPHERIC_ASCENT');
      launchAudio.setRoarIntensity(0.75);
    }, 6.5);

    tl.to(animState, {
      alt: 65,
      vel: 1650,
      metSec: 42,
      downrange: 48,
      shake: 0.35,
      duration: 6.0,
      ease: 'power2.out'
    }, 6.5);

    // --- STAGE 6: STAGE SEPARATION & FAIRING JETTISON (13s -> 18s) ---
    tl.add(() => {
      setStageId('STAGE_6_STAGE_SEPARATION');
      setBoosterSeparated(true);
      setFairingJettisoned(true);
      setTelemetry((prev) => ({ ...prev, boosterSeparated: true, fairingJettisoned: true }));
      launchAudio.playStageSeparationThud();
      launchAudio.setRoarIntensity(0.35);
    }, 12.5);

    tl.to(animState, {
      alt: 110,
      vel: 4200,
      metSec: 68,
      downrange: 160,
      boosterDist: 14,
      fairingAngle: 0.65,
      shake: 0.1,
      duration: 5.0,
      ease: 'power2.inOut'
    }, 12.5);

    // --- STAGE 7: SPACECRAFT DEPLOYMENT (18s -> 23s) ---
    tl.add(() => {
      setStageId('STAGE_7_SPACECRAFT_DEPLOYMENT');
      setSpacecraftSeparated(true);
      setTelemetry((prev) => ({ ...prev, spacecraftSeparated: true }));
      launchAudio.stopRocketRoar(1.2);
      launchAudio.playDeploymentChime();
    }, 17.5);

    tl.to(animState, {
      alt: 145,
      vel: 7450,
      metSec: 90,
      downrange: 350,
      craftDist: 6.5,
      solarProgress: 1.0,
      shake: 0,
      duration: 5.0,
      ease: 'power1.out',
      onComplete: () => {
        setTelemetry((prev) => ({ ...prev, solarPanelsDeployed: true }));
      }
    }, 17.5);

    // --- STAGE 8: ORBIT INSERTION (23s -> 28s) ---
    tl.add(() => {
      setStageId('STAGE_8_ORBIT_INSERTION');
      setTelemetry((prev) => ({ ...prev, orbitInsertionConfirmed: true }));
    }, 22.5);

    tl.to(animState, {
      alt: 160,
      vel: 7680,
      metSec: 120,
      downrange: 580,
      duration: 4.5,
      ease: 'none'
    }, 22.5);

    // --- STAGE 9: OPERATIONS HANDOFF (28s) ---
    tl.add(() => {
      setStageId('STAGE_9_OPERATIONS_HANDOFF');
      setTelemetry((prev) => ({ ...prev, stageId: 'STAGE_9_OPERATIONS_HANDOFF' }));
    }, 27.0);
  };

  // Playback Control Handlers
  const handleTogglePause = () => {
    if (timelineRef.current) {
      if (isPaused) {
        timelineRef.current.resume();
        setIsPaused(false);
      } else {
        timelineRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    launchAudio.setMuted(nextMuted);
  };

  const handleToggleReducedMotion = () => {
    setIsReducedMotion((prev) => !prev);
  };

  const handleSkipStage = () => {
    if (stageId === 'STAGE_1_PRE_LAUNCH') {
      startCountdown();
    } else if (stageId === 'STAGE_2_COUNTDOWN') {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      executeFlightTimeline();
    } else if (timelineRef.current) {
      const currentTime = timelineRef.current.time();
      if (currentTime < 1.5) timelineRef.current.time(1.6);
      else if (currentTime < 6.5) timelineRef.current.time(6.6);
      else if (currentTime < 12.5) timelineRef.current.time(12.6);
      else if (currentTime < 17.5) timelineRef.current.time(17.6);
      else if (currentTime < 22.5) timelineRef.current.time(22.6);
      else if (currentTime < 27.0) timelineRef.current.time(27.1);
    }
  };

  const handleSkipToEnd = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (timelineRef.current) {
      timelineRef.current.time(27.1);
    } else {
      executeFlightTimeline();
      setTimeout(() => {
        timelineRef.current?.time(27.1);
      }, 50);
    }
    launchAudio.stopRocketRoar(0.1);
  };

  const handleReplay = () => {
    resetSequence();
  };

  const handleProceedToOps = () => {
    // Pass real confirmed handoff to Developer 04
    startMissionLaunch();
    setActiveTab('ops');
    onProceedToOps?.();
    onClose();
  };

  if (!isOpen) return null;

  const showOrbitEarthView = stageId === 'STAGE_8_ORBIT_INSERTION' || stageId === 'STAGE_9_OPERATIONS_HANDOFF';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 overflow-hidden animate-fadeIn select-none font-mono">
      {/* 3D WebGL Canvas Viewport */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [16, 5, 18], fov: 45 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          {/* Universal Sunlight illumination */}
          <SunLighting />

          {/* Camera Controller Driven by Stage State & Rocket Altitude */}
          <CinematicCameraRig
            stageId={stageId}
            rocketAltitudeMeters={rocketAltitudeMeters}
            cameraShakeIntensity={cameraShake}
            isReducedMotion={isReducedMotion}
          />

          {/* Stage 1 to 7: Terrestrial Launchpad & Atmospheric Environment */}
          {!showOrbitEarthView && (
            <>
              <LaunchPadEnvironment3D
                altitudeKm={telemetry.altitudeKm}
                isIgnited={isIgnited}
                smokeIntensity={isIgnited ? 1.0 : 0.0}
              />

              <Rocket3DModel
                vehicle={selectedVehicle}
                spacecraft={currentDesign}
                altitudeMeters={rocketAltitudeMeters}
                throttle={throttle}
                isIgnited={isIgnited}
                boosterSeparated={boosterSeparated}
                boosterSeparationDist={boosterSeparationDist}
                fairingJettisoned={fairingJettisoned}
                fairingOpenAngle={fairingOpenAngle}
                spacecraftSeparated={spacecraftSeparated}
                spacecraftSeparationDist={spacecraftSeparationDist}
                solarDeploymentProgress={solarDeploymentProgress}
              />
            </>
          )}

          {/* Stage 8 & 9: Transition to 3D Earth Orbit Scene */}
          {showOrbitEarthView && (
            <group>
              <color attach="background" args={['#030712']} />
              <EarthGlobe />
              <EarthCloudLayer />
              <EarthAtmosphere />
              <OrbitPathRenderer orbit={selectedOrbit} isSelected={true} />

              {/* Spacecraft in final orbit */}
              <group position={[0, 0, 0]}>
                <Rocket3DModel
                  vehicle={selectedVehicle}
                  spacecraft={currentDesign}
                  altitudeMeters={rocketAltitudeMeters}
                  throttle={0}
                  isIgnited={false}
                  boosterSeparated={true}
                  boosterSeparationDist={100}
                  fairingJettisoned={true}
                  fairingOpenAngle={1.2}
                  spacecraftSeparated={true}
                  spacecraftSeparationDist={15}
                  solarDeploymentProgress={1.0}
                />
              </group>
            </group>
          )}
        </Canvas>
      </div>

      {/* Complete Telemetry & HUD Overlay */}
      <CinematicTelemetryOverlay
        stageId={stageId}
        countdownSeconds={countdownSeconds}
        telemetry={telemetry}
        vehicle={selectedVehicle}
        orbit={selectedOrbit}
        spacecraft={currentDesign}
        scenario={selectedScenario}
        launchConfig={launchConfig}
        isConfirmed={isConfirmed}
        isPaused={isPaused}
        isMuted={isMuted}
        isReducedMotion={isReducedMotion}
        onTogglePause={handleTogglePause}
        onToggleMute={handleToggleMute}
        onToggleReducedMotion={handleToggleReducedMotion}
        onSkipStage={handleSkipStage}
        onSkipToEnd={handleSkipToEnd}
        onReplay={handleReplay}
        onStartCountdown={startCountdown}
        onProceedToOps={handleProceedToOps}
        onClose={onClose}
      />
    </div>
  );
}
