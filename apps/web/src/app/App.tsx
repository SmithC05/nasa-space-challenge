import React, { useEffect, Suspense } from 'react';
import { useGameStore } from '../store/gameStore';
import { Header } from '../layouts/Header';
import { Footer } from '../layouts/Footer';
import { MissionRoutes } from '../features/mission-hub/navigation/MissionRoutes';
import { getSocket } from '../services/socket';

export function App() {
  const {
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
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        <Suspense fallback={<div className="p-8 text-center font-mono text-cyan-400 animate-pulse">INITIALIZING TELEMETRY INTERFACE...</div>}>
          <MissionRoutes />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
