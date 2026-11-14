import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitProfile } from '@orbital/contracts';
import {
  DEFAULT_EARTH_VISUALIZATION_STATE,
  DEFAULT_CAMERA_POSITION,
  EarthAtmosphere,
  EarthCameraControls,
  EarthCloudLayer,
  EarthGlobe,
  EarthVisualizationControls,
  EarthVisualizationState,
  StarField,
  SunLighting
} from './earth';
import {
  DEFAULT_ORBIT_VISUAL_SETTINGS,
  EquatorialReferencePlane,
  OrbitComparisonView,
  OrbitControlsToolbar,
  OrbitInfoOverlay,
  OrbitPathRenderer,
  OrbitVisualSettings,
  SpacecraftMarker,
  getOrbitColorForProfile,
  getOrbitDisplayCategory,
  getOrbitDisplayName,
  getRecommendedCameraDistance
} from './orbit';

interface EarthOrbitCanvasProps {
  orbit?: OrbitProfile;
  isLaunching?: boolean;
}

export function EarthOrbitCanvas({ orbit, isLaunching = false }: EarthOrbitCanvasProps) {
  // Phase 2 Earth visualization state
  const [earthState, setEarthState] = useState<EarthVisualizationState>(
    DEFAULT_EARTH_VISUALIZATION_STATE
  );

  // Phase 3 Orbital visualization state
  const [orbitSettings, setOrbitSettings] = useState<OrbitVisualSettings>(
    DEFAULT_ORBIT_VISUAL_SETTINGS
  );

  // Interactive triggers
  const [resetCameraTrigger, setResetCameraTrigger] = useState(0);
  const [frameCameraTrigger, setFrameCameraTrigger] = useState(0);
  const [spacecraftResetTrigger, setSpacecraftResetTrigger] = useState(0);

  // Recommended camera distance for current orbit (wide for GEO, closer for LEO)
  const cameraTargetDistance = useMemo(() => {
    return orbit ? getRecommendedCameraDistance(orbit) : 7.0;
  }, [orbit]);

  const isGeoOrbit = orbit?.type === 'GEO';

  // Toggle handlers
  const handleEarthToggle = <K extends keyof EarthVisualizationState>(key: K) => {
    setEarthState((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleOrbitToggle = <K extends keyof OrbitVisualSettings>(key: K) => {
    setOrbitSettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleResetCamera = () => {
    setResetCameraTrigger((prev) => prev + 1);
  };

  const handleFrameOrbit = () => {
    setFrameCameraTrigger((prev) => prev + 1);
  };

  const handleResetSpacecraft = () => {
    setSpacecraftResetTrigger((prev) => prev + 1);
  };

  return (
    <div className="relative w-full h-[440px] lg:h-[540px] bg-space-950 rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* =================================================================== */}
      {/* 3D WEBGL VIEWPORT */}
      {/* =================================================================== */}
      <Canvas
        camera={{ position: DEFAULT_CAMERA_POSITION, fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#030712']} />

        {/* 1. Realistic Directional Sunlight and Ambient Deep Space Fill */}
        <SunLighting />

        {/* 2. Deep Celestial Starfield */}
        <StarField visible={earthState.showStars} />

        {/* 3. Core 3D Earth Globe with NASA Blue Marble Satellite Textures */}
        <EarthGlobe visible={earthState.showEarth} isRotating={earthState.isRotating} />

        {/* 4. Rayleigh Scattering Atmospheric Limb Glow */}
        <EarthAtmosphere visible={earthState.showAtmosphere && earthState.showEarth} />

        {/* 5. Independent Meteorological Cloud Layer */}
        <EarthCloudLayer
          visible={earthState.showClouds && earthState.showEarth}
          isRotating={earthState.isRotating}
        />

        {/* 6. Equatorial Reference Plane & Earth Equator Guide */}
        <EquatorialReferencePlane
          showEquatorialPlane={orbitSettings.showEquatorialPlane}
          showEarthEquator={orbitSettings.showEarthEquator && earthState.showEarth}
        />

        {/* 7. Orbital Paths Rendering */}
        {orbitSettings.showOrbitPath && orbit && (
          <>
            {orbitSettings.comparisonMode ? (
              // Multi-Orbit Comparison View (LEO, SSO, Polar, GEO)
              <OrbitComparisonView selectedOrbit={orbit} visible={true} />
            ) : (
              // Single Selected Orbit View
              <OrbitPathRenderer orbit={orbit} isSelected={true} visible={true} />
            )}
          </>
        )}

        {/* 8. Procedural Spacecraft Satellite Marker with Animated Movement */}
        {orbit && (
          <SpacecraftMarker
            orbit={orbit}
            visible={orbitSettings.showSpacecraft && orbitSettings.showOrbitPath}
            isAnimating={orbitSettings.isSpacecraftAnimating}
            speedMultiplier={orbitSettings.spacecraftSpeedMultiplier}
            resetTrigger={spacecraftResetTrigger}
          />
        )}

        {/* 9. Bounded Interactive Camera Controls with Framing Capability */}
        <EarthCameraControls
          resetTrigger={resetCameraTrigger}
          frameTrigger={frameCameraTrigger}
          targetDistance={cameraTargetDistance}
          minDistance={2.6}
          maxDistance={32.0} // Extended to allow full GEO orbit ring inspection
        />
      </Canvas>

      {/* =================================================================== */}
      {/* HUD OVERLAYS & CONTROLS */}
      {/* =================================================================== */}

      {/* Top Left: Orbit Information HUD (Collapsible) */}
      {orbit && <OrbitInfoOverlay orbit={orbit} />}

      {/* Top Right: Phase 2 Earth Environment Controls */}
      <EarthVisualizationControls
        state={earthState}
        onToggle={handleEarthToggle}
        onResetCamera={handleResetCamera}
      />

      {/* Bottom Left: Phase 3 Orbital Visualization Controls */}
      <OrbitControlsToolbar
        settings={orbitSettings}
        onToggle={handleOrbitToggle}
        onResetSpacecraft={handleResetSpacecraft}
        onFrameOrbit={handleFrameOrbit}
        isGeoOrbit={isGeoOrbit}
      />

      {/* Bottom Right: Real-time Telemetry & Mode Badge */}
      <div className="absolute bottom-3 right-4 z-10 text-[11px] font-mono text-slate-400 bg-space-900/80 px-2.5 py-1 rounded-lg border border-slate-800 pointer-events-none backdrop-blur-sm flex items-center space-x-2">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: orbit ? getOrbitColorForProfile(orbit) : '#22d3ee' }}
        />
        <span>
          {orbitSettings.comparisonMode
            ? 'COMPARISON MODE • ALL 4 REGIMES'
            : `${orbit ? getOrbitDisplayName(orbit).toUpperCase() : 'ORBIT'} • ${orbit?.inclinationDeg ?? 0}° INC`}
        </span>
      </div>
    </div>
  );
}
