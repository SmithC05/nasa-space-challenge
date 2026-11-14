import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Header } from '../layouts/Header';
import { Footer } from '../layouts/Footer';
import { MissionHub } from '../features/mission-hub/MissionHub';
import { SpacecraftLab } from '../features/spacecraft-lab/SpacecraftLab';
import { OrbitLaunchStudio } from '../features/orbit-launch/OrbitLaunchStudio';
import { MissionOperations } from '../features/mission-operations/MissionOperations';
import { MultiplayerLobby } from '../features/multiplayer/MultiplayerLobby';
import { getSocket } from '../services/socket';

export function App() {
  const {
    activeTab,
    setActiveRoom,
    setSimulationState,
    addChatMessage,
    setMissionReport
  } = useGameStore();

  useEffect(() => {
    const socket = getSocket();

    socket.on('room:updated', (room) => {
      setActiveRoom(room);
    });

    socket.on('simulation:tick', (state) => {
      setSimulationState(state);
    });

    socket.on('chat:message', (msg) => {
      addChatMessage(msg);
    });

    socket.on('mission:completed', (report) => {
      setMissionReport(report);
    });

    return () => {
      socket.off('room:updated');
      socket.off('simulation:tick');
      socket.off('chat:message');
      socket.off('mission:completed');
    };
  }, [setActiveRoom, setSimulationState, addChatMessage, setMissionReport]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-space-950 text-slate-100">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {activeTab === 'hub' && <MissionHub />}
        {activeTab === 'lab' && <SpacecraftLab />}
        {activeTab === 'orbit' && <OrbitLaunchStudio />}
        {activeTab === 'ops' && <MissionOperations />}
        {activeTab === 'multiplayer' && <MultiplayerLobby />}
      </main>
      <Footer />
    </div>
  );
}
