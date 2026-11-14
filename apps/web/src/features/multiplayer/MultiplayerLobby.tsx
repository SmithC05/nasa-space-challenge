import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EngineerRole } from '@orbital/contracts';
import {
  createRoom,
  joinRoom,
  setMemberReady,
  setMemberRole,
  startLaunchSocket
} from '../../services/socket';
import {
  Check,
  CheckCircle2,
  Copy,
  MessageSquare,
  Radio,
  Rocket,
  Send,
  Shield,
  UserCheck,
  Users
} from 'lucide-react';

const ROLES: { id: EngineerRole; title: string; desc: string; color: string }[] = [
  {
    id: 'FLIGHT_DIRECTOR',
    title: 'Flight Director',
    desc: 'Overall mission command, launch go/no-go authorization, crisis management.',
    color: 'text-amber-400 border-amber-500/40 bg-amber-950/40'
  },
  {
    id: 'SYSTEMS_ENGINEER',
    title: 'Systems Engineer',
    desc: 'Spacecraft architect, chassis, electrical power balance, thermal loop.',
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40'
  },
  {
    id: 'TRAJECTORY_SPECIALIST',
    title: 'Trajectory Specialist',
    desc: 'Orbital mechanics, target trajectory, launch vehicle compatibility.',
    color: 'text-purple-400 border-purple-500/40 bg-purple-950/40'
  },
  {
    id: 'SCIENCE_LEAD',
    title: 'Science Lead',
    desc: 'Instrument payloads, science data return, downlink bandwidth allocation.',
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40'
  }
];

export function MultiplayerLobby() {
  const {
    activeRoom,
    setActiveRoom,
    currentMemberId,
    setCurrentMemberId,
    currentRole,
    setCurrentRole,
    chatMessages,
    sendChat,
    setActiveTab
  } = useGameStore();

  const [userName, setUserName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleCreate = () => {
    if (!userName.trim()) {
      setStatusMsg('Please enter your Engineer Call-sign.');
      return;
    }
    createRoom(userName, `${userName}'s Mission`, (res) => {
      if (res.success && res.room) {
        setActiveRoom(res.room);
        setCurrentMemberId(res.memberId || null);
        setCurrentRole('FLIGHT_DIRECTOR');
        setStatusMsg(null);
      } else {
        setStatusMsg(res.error || 'Failed to create room.');
      }
    });
  };

  const handleJoin = () => {
    if (!userName.trim() || !roomCodeInput.trim()) {
      setStatusMsg('Please enter both your Call-sign and Room Code.');
      return;
    }
    joinRoom(roomCodeInput.toUpperCase(), userName, currentRole, (res) => {
      if (res.success && res.room) {
        setActiveRoom(res.room);
        setCurrentMemberId(res.memberId || null);
        setStatusMsg(null);
      } else {
        setStatusMsg(res.error || 'Failed to join room.');
      }
    });
  };

  const handleCopyCode = () => {
    if (activeRoom) {
      navigator.clipboard.writeText(activeRoom.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendChat(chatInput);
      setChatInput('');
    }
  };

  const currentMember = activeRoom?.members.find((m) => m.id === currentMemberId);
  const isHost = currentMember?.isHost || false;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-space-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
          <span>M05 // MULTIPLAYER COLLABORATION</span>
          <span>•</span>
          <span>SYNCHRONIZED TEAM OPERATIONS</span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-extrabold text-white">
          Mission Operations Crew Room
        </h2>
        <p className="mt-2 text-slate-300 text-sm max-w-3xl">
          Collaborate with up to 4 mission engineers in real time. Divide responsibilities between
          Flight Command, Spacecraft Systems, Trajectory, and Science.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs font-mono">
          {statusMsg}
        </div>
      )}

      {!activeRoom ? (
        /* Create / Join Room Screen */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Create Room */}
          <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase mb-3">
                <Users className="w-4 h-4" />
                <span>Create New Mission Room</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Host Mission as Flight Director</h3>
              <p className="text-xs text-slate-400 mb-4">
                Initialize a synchronized mission control room and generate a 4-letter room code for your crew.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">CALL-SIGN / NAME</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Flight Commander"
                    className="w-full bg-space-950 text-white px-3 py-2 rounded-xl border border-slate-700 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold font-mono text-xs shadow-lg glow-cyan transition-all"
            >
              CREATE MISSION ROOM
            </button>
          </div>

          {/* Join Room */}
          <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs font-bold uppercase mb-3">
                <Radio className="w-4 h-4" />
                <span>Join Existing Mission</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Join an Active Crew</h3>
              <p className="text-xs text-slate-400 mb-4">
                Enter the 4-letter room code provided by your Flight Director.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">CALL-SIGN / NAME</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Lead Engineer"
                    className="w-full bg-space-950 text-white px-3 py-2 rounded-xl border border-slate-700 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">ROOM CODE</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. NOVA"
                    className="w-full bg-space-950 text-white px-3 py-2 rounded-xl border border-slate-700 focus:border-cyan-500 focus:outline-none uppercase tracking-widest text-center font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleJoin}
              className="mt-6 w-full py-3 rounded-xl bg-space-800 hover:bg-space-700 text-white font-extrabold font-mono text-xs border border-slate-700 transition-colors"
            >
              CONNECT TO ROOM
            </button>
          </div>
        </div>
      ) : (
        /* Active Multiplayer Room Roster & Chat */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Crew Roster & Roles */}
          <div className="lg:col-span-7 space-y-6">
            {/* Room Code Banner */}
            <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400 block">ROOM CODE</span>
                <span className="text-3xl font-extrabold font-mono text-cyan-400 tracking-widest">
                  {activeRoom.code}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-xl bg-space-950 hover:bg-space-850 text-xs font-mono text-slate-300 border border-slate-700 flex items-center space-x-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'COPIED' : 'COPY CODE'}</span>
              </button>
            </div>

            {/* Crew Members List */}
            <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Flight Crew Manifest ({activeRoom.members.length} / 4 Engineers)</span>
              </h3>

              <div className="space-y-3">
                {activeRoom.members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-space-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{member.name}</span>
                        {member.isHost && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                            COMMANDER
                          </span>
                        )}
                        {member.id === currentMemberId && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-cyan-400 mt-1">
                        ROLE: {member.role.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-mono px-2.5 py-1 rounded-full ${
                          member.isReady
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-900 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {member.isReady ? 'READY' : 'PREPARING'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Role Selection Grid for current user */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Assign Engineering Responsibility
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {ROLES.map((r) => {
                    const isSelected = currentRole === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          setCurrentRole(r.id);
                          if (currentMemberId) {
                            setMemberRole(activeRoom.code, currentMemberId, r.id);
                          }
                        }}
                        className={`text-left p-3 rounded-xl border text-xs font-mono transition-all ${
                          isSelected
                            ? `${r.color} font-bold`
                            : 'bg-space-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold mb-1">{r.title}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{r.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ready & Launch Actions */}
              <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (currentMemberId) {
                      setMemberReady(activeRoom.code, currentMemberId, !currentMember?.isReady);
                    }
                  }}
                  className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold border transition-colors ${
                    currentMember?.isReady
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-space-950 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {currentMember?.isReady ? 'STATUS: READY' : 'MARK READY'}
                </button>

                <button
                  onClick={() => {
                    startLaunchSocket(activeRoom.code);
                    setActiveTab('ops');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-black font-extrabold font-mono text-xs shadow-lg glow-cyan"
                >
                  COMMENCE MULTIPLAYER LAUNCH
                </button>
              </div>
            </div>
          </div>

          {/* Right: Tactical Radio Chat */}
          <div className="lg:col-span-5 bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-[580px]">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Tactical Flight Radio Comm</span>
            </h3>

            {/* Chat Messages */}
            <div className="flex-1 bg-space-950 rounded-2xl border border-slate-800/80 p-4 overflow-y-auto space-y-3 font-mono text-xs">
              {chatMessages.length === 0 ? (
                <div className="text-slate-400 text-center py-12">
                  Radio channel active. Transmit commands to your engineering team.
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="bg-space-900/80 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="text-cyan-400 font-bold">{msg.sender} ({msg.role})</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className="text-slate-200">{msg.message}</div>
                  </div>
                ))
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="mt-3 flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Transmit tactical message..."
                className="flex-1 bg-space-950 text-white font-mono text-xs px-3 py-2.5 rounded-xl border border-slate-700 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-bold transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
