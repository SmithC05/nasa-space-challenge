import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useGameStore } from '../../../store/gameStore';
import { LandingPage } from '../pages/LandingPage';
import { MissionSelectionPage } from '../pages/MissionSelectionPage';
import { MissionBriefingPage } from '../pages/MissionBriefingPage';
import { GameModeSelectionPage } from '../pages/GameModeSelectionPage';
import { MissionNavigationGuard } from './MissionNavigationGuard';
import { MissionIntegrationPlaceholder } from '../components/MissionIntegrationPlaceholder';
import { Selection3DBackground } from '../components/Selection3DBackground';
import { LearningCenterModal } from '../components/LearningCenterModal';
import { missionStartService } from '../services/mission-start.service';
import { getCampaignDisplayConfig } from '../data/mission-display-config';
import { AlertCircle } from 'lucide-react';

const SpacecraftLab = lazy(() =>
  import('../../spacecraft-lab/SpacecraftLab').then((m) => ({ default: m.SpacecraftLab }))
);
const OrbitLaunchStudio = lazy(() =>
  import('../../orbit-launch/OrbitLaunchStudio').then((m) => ({ default: m.OrbitLaunchStudio }))
);
const MissionOperations = lazy(() =>
  import('../../mission-operations/MissionOperations').then((m) => ({ default: m.MissionOperations }))
);
const MultiplayerLobby = lazy(() =>
  import('../../multiplayer/MultiplayerLobby').then((m) => ({ default: m.MultiplayerLobby }))
);

export function MissionRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [learningModalOpen, setLearningModalOpen] = useState(false);
  const [availabilityWarning, setAvailabilityWarning] = useState<string | null>(null);

  const {
    scenarios,
    selectedScenario,
    selectScenario,
    gameMode,
    setGameMode,
    setActiveTab,
    simulationState,
    setActiveRoom,
    setCurrentMemberId,
    setCurrentRole
  } = useGameStore();

  const hasResumableMission = Boolean(
    simulationState &&
      simulationState.phase !== 'MISSION_COMPLETE' &&
      simulationState.phase !== 'MISSION_ABORTED'
  );

  // Synchronize route with activeTab in gameStore
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/spacecraft-design')) {
      setActiveTab('lab');
    } else if (path.startsWith('/orbit')) {
      setActiveTab('orbit');
    } else if (path.startsWith('/operations')) {
      setActiveTab('ops');
    } else if (path.startsWith('/multiplayer')) {
      setActiveTab('multiplayer');
    } else {
      setActiveTab('hub');
    }
  }, [location.pathname, setActiveTab]);

  // Global keyboard navigation: Backspace / Escape navigates back unless inside an input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl as HTMLElement)?.isContentEditable;

      if ((e.key === 'Backspace' && !isInput) || e.key === 'Escape') {
        if (learningModalOpen) {
          e.preventDefault();
          setLearningModalOpen(false);
          return;
        }

        const path = location.pathname;
        if (path.includes('/mode')) {
          e.preventDefault();
          navigate(`/missions/${selectedScenario.id}/briefing`);
        } else if (path.includes('/briefing')) {
          e.preventDefault();
          navigate('/missions');
        } else if (path === '/missions') {
          e.preventDefault();
          navigate('/');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location.pathname, learningModalOpen, navigate, selectedScenario.id]);

  return (
    <>
      {/* 0. Persistent 3D Floating Asteroid Field & Starfield Background across all views */}
      <Suspense fallback={<div className="fixed inset-0 bg-space-950 pointer-events-none -z-10" />}>
        <Selection3DBackground />
      </Suspense>

      {/* Availability Notice Modal if Coming Soon campaign is attempted */}
      {availabilityWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full p-6 rounded-3xl bg-space-900 border border-amber-500/50 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400 font-mono text-xs font-bold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>CAMPAIGN PRE-FLIGHT STATUS</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {availabilityWarning}
            </p>
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setAvailabilityWarning(null)}
                className="px-5 py-2 rounded-xl bg-space-800 hover:bg-space-700 text-white font-mono text-xs border border-slate-700 transition-colors"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      <Routes>
        {/* Route 1: Landing Page (Feature A) */}
        <Route
          path="/"
          element={
            <LandingPage
              onStartMission={() => navigate('/missions')}
              onOpenMultiplayer={() => navigate(`/missions/${selectedScenario.id}/mode`)}
              onOpenMissionGallery={() => navigate('/missions')}
              scenarios={scenarios}
              hasResumableMission={hasResumableMission}
              onResumeMission={() => {
                setActiveTab('ops');
                navigate('/operations');
              }}
              activeScenarioCode={selectedScenario?.code}
            />
          }
        />

        {/* Route 2: Mission Selection (Feature B) */}
        <Route
          path="/missions"
          element={
            <MissionSelectionPage
              scenarios={scenarios}
              selectedScenario={selectedScenario}
              onSelectScenario={(scenario) => selectScenario(scenario)}
              onProceedToBriefing={(scenario) => {
                selectScenario(scenario);
                navigate(`/missions/${scenario.id}/briefing`);
              }}
              onNavigateHome={() => navigate('/')}
              onOpenLearning={() => setLearningModalOpen(true)}
              onNavigateMultiplayer={() => navigate(`/missions/${selectedScenario.id}/mode`)}
              hasResumableMission={hasResumableMission}
              onResumeMission={() => {
                setActiveTab('ops');
                navigate('/operations');
              }}
            />
          }
        />

        {/* Route 3: Mission Briefing (Feature C & D) */}
        <Route
          path="/missions/:scenarioId/briefing"
          element={
            <MissionNavigationGuard>
              {(scenario) => {
                const config = getCampaignDisplayConfig(scenario.id);
                return (
                  <MissionBriefingPage
                    scenario={scenario}
                    onBackToSelection={() => navigate('/missions')}
                    onProceedToLab={() => {
                      if (config.availability !== 'AVAILABLE') {
                        setAvailabilityWarning(
                          `The "${config.displayTitle}" campaign is in pre-flight development. Only Earth Sentinel is certified for active flight in this release.`
                        );
                        return;
                      }
                      navigate(`/missions/${scenario.id}/mode`);
                    }}
                    onOpenMultiplayer={() => {
                      navigate(`/missions/${scenario.id}/mode`);
                    }}
                  />
                );
              }}
            </MissionNavigationGuard>
          }
        />

        {/* Route 4: Game Mode Selection (Feature E) */}
        <Route
          path="/missions/:scenarioId/mode"
          element={
            <MissionNavigationGuard>
              {(scenario) => (
                <GameModeSelectionPage
                  scenario={scenario}
                  onSelectSolo={() => {
                    const handoff = missionStartService.prepareHandoff(scenario, 'single');
                    if (handoff.success) {
                      navigate(handoff.targetRoute);
                    } else {
                      setAvailabilityWarning(handoff.result.message);
                    }
                  }}
                  onEnterMultiplayerLobby={(result, role) => {
                    setGameMode('multiplayer');
                    if (result.room) {
                      setActiveRoom(result.room);
                    }
                    if (result.memberId) {
                      setCurrentMemberId(result.memberId);
                    }
                    setCurrentRole(role);
                    const handoff = missionStartService.prepareHandoff(scenario, 'multiplayer', {
                      activeRoomId: result.room?.code,
                      isRoomConnected: true
                    });
                    if (handoff.success) {
                      navigate(handoff.targetRoute);
                    } else {
                      setAvailabilityWarning(handoff.result.message);
                    }
                  }}
                  onBackToBriefing={() => navigate(`/missions/${scenario.id}/briefing`)}
                />
              )}
            </MissionNavigationGuard>
          }
        />

        {/* Route 5: Spacecraft Design Lab Handoff (Developer 02) */}
        <Route
          path="/spacecraft-design"
          element={
            <Suspense fallback={<div className="p-8 text-center font-mono text-cyan-400 animate-pulse">INITIALIZING SPACECRAFT LAB...</div>}>
              <SpacecraftLab />
            </Suspense>
          }
        />

        {/* Route 6: Spacecraft Design Lab Integration Placeholder (Section 10 Case B) */}
        <Route
          path="/missions/placeholder"
          element={
            <MissionIntegrationPlaceholder
              scenario={selectedScenario}
              gameMode={gameMode}
              onReturnToHub={() => navigate('/missions')}
              onProceedToLiveLab={() => navigate('/spacecraft-design')}
            />
          }
        />

        {/* Shared Game Module Routes (Dev 03, Dev 04, Dev 05) */}
        <Route
          path="/orbit"
          element={
            <Suspense fallback={<div className="p-8 text-center font-mono text-cyan-400 animate-pulse">INITIALIZING ORBIT & LAUNCH...</div>}>
              <OrbitLaunchStudio />
            </Suspense>
          }
        />
        <Route
          path="/operations"
          element={
            <Suspense fallback={<div className="p-8 text-center font-mono text-cyan-400 animate-pulse">INITIALIZING MISSION OPERATIONS...</div>}>
              <MissionOperations />
            </Suspense>
          }
        />
        <Route
          path="/multiplayer"
          element={
            <Suspense fallback={<div className="p-8 text-center font-mono text-cyan-400 animate-pulse">INITIALIZING MULTIPLAYER CREW...</div>}>
              <MultiplayerLobby />
            </Suspense>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Learning Center Modal */}
      <LearningCenterModal
        isOpen={learningModalOpen}
        onClose={() => setLearningModalOpen(false)}
        onExploreMissions={() => {
          setLearningModalOpen(false);
          navigate('/missions');
        }}
      />
    </>
  );
}

