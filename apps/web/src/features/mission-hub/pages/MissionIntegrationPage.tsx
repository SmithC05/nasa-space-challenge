import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../../store/gameStore';
import { MissionIntegrationPlaceholder } from '../components/MissionIntegrationPlaceholder';

export function MissionIntegrationPage() {
  const navigate = useNavigate();
  const { selectedScenario, gameMode } = useGameStore();

  return (
    <MissionIntegrationPlaceholder
      scenario={selectedScenario}
      gameMode={gameMode}
      onReturnToHub={() => navigate('/missions')}
      onProceedToLiveLab={() => navigate('/spacecraft-design')}
    />
  );
}

