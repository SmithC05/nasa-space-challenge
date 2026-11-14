export interface EarthVisualizationState {
  showEarth: boolean;
  showAtmosphere: boolean;
  showClouds: boolean;
  showStars: boolean;
  isRotating: boolean;
}

export const DEFAULT_EARTH_VISUALIZATION_STATE: EarthVisualizationState = {
  showEarth: true,
  showAtmosphere: true,
  showClouds: true,
  showStars: true,
  isRotating: true
};

export interface EarthVisualizationControlProps {
  state: EarthVisualizationState;
  onToggle: <K extends keyof EarthVisualizationState>(key: K) => void;
  onResetCamera: () => void;
}
