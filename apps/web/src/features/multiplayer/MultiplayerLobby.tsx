import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { EngineerRole } from '@orbital/contracts';
import {
  advanceLobbySocket,
  createRoom,
  joinRoom,
  leaveRoomSocket,
  setMemberReady,
  setMemberRole
} from '../../services/socket';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  LogOut,
  MessageSquare,
  Radio,
  Rocket,
  Send,
  Shield,
  UserCheck,
  Users,
  Wifi,
  WifiOff
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
    setResumeToken,
    currentRole,
    setCurrentRole,
    allReady,
    chatMessages,
    sendChat,
    setActiveTab
  } = useGameStore();

  const [userName, setUserName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleCreate = () => {
    if (!userName.trim()) {
      setStatusMsg({ text: 'Please enter your Engineer Call-sign.', isError: true });
      return;
    }
    createRoom(userName.trim(), `${userName.trim()}'s Mission`, (res) => {
      if (res.success && res.data) {
        setActiveRoom(res.data.room);
        setCurrentMemberId(res.data.session.memberId);
        setResumeToken(res.data.session.resumeToken);
        setCurrentRole('FLIGHT_DIRECTOR');
        setStatusMsg(null);
      } else {
        setStatusMsg({ text: res.error?.message || 'Failed to create room.', isError: true });
      }
    });
  };

  const handleJoin = () => {
    if (!userName.trim() || !roomCodeInput.trim()) {
      setStatusMsg({ text: 'Please enter both your Call-sign and Room Code.', isError: true });
      return;
    }
    joinRoom(roomCodeInput.toUpperCase().trim(), userName.trim(), currentRole, (res) => {
      if (res.success && res.data) {
        setActiveRoom(res.data.room);
        setCurrentMemberId(res.data.session.memberId);
        setResumeToken(res.data.session.resumeToken);
        setCurrentRole(res.data.session.role);
        setStatusMsg(null);
      } else {
        setStatusMsg({ text: res.error?.message || 'Failed to join room.', isError: true });
      }
    });
  };

  const handleLeave = () => {
    if (activeRoom) {
      leaveRoomSocket(activeRoom.code, () => {
        setActiveRoom(null);
        setCurrentMemberId(null);
        setResumeToken(null);
      });
    }
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

  const handleAdvanceLobby = () => {
    if (!activeRoom) return;
    advanceLobbySocket(activeRoom.code, (res) => {
      if (res.success && res.data?.room) {
        setActiveRoom(res.data.room);
        setActiveTab('lab');
      } else {
        setStatusMsg({ text: res.error?.message || 'Cannot advance lobby.', isError: true });
      }
    });
  };

  const currentMember = activeRoom?.members.find((m) => m.id === currentMemberId);
  const isHost = currentMember?.isHost || (activeRoom?.hostId === currentMemberId);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-space-900 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <span>M05 // MULTIPLAYER COLLABORATION</span>
            <span>•</span>
            <span>PHASE 1: PLAYER IDENTITY & ROOM MANAGEMENT</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white">
            Mission Operations Crew Room
          </h2>
          <p className="mt-1 text-slate-300 text-sm max-w-3xl">
            Real-time guest identity, cryptographic resume tokens, 4-player capacity enforcement, and host migration.
          </p>
        </div>

        {activeRoom && (
          <button
            onClick={handleLeave}
            className="px-4 py-2 rounded-xl bg-space-950 hover:bg-rose-950/80 text-rose-300 border border-rose-800 text-xs font-mono flex items-center space-x-2 transition-colors w-fit"
          >
            <LogOut className="w-4 h-4" />
            <span>LEAVE ROOM</span>
          </button>
        )}
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-mono flex items-center space-x-2 ${
            statusMsg.isError
              ? 'bg-rose-950/90 border border-rose-800 text-rose-300'
              : 'bg-emerald-950/90 border border-emerald-800 text-emerald-300'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{statusMsg.text}</span>
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
                <span>Create Mission Room</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Host Mission as Flight Director</h3>
              <p className="text-xs text-slate-400 mb-4">
                Initializes a secure room and issues an authenticated resume token. Maximum 4 engineers per mission.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">CALL-SIGN / NAME</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Commander Shepard"
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
              <h3 className="text-lg font-bold text-white mb-2">Join Flight Crew</h3>
              <p className="text-xs text-slate-400 mb-4">
                Enter the 4-character room code from your Flight Director.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">CALL-SIGN / NAME</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Flight Engineer"
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
                    placeholder="e.g. 7KNP"
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
            {/* Room Code & Status Banner */}
            <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400 block">ROOM CODE</span>
                <span className="text-3xl font-extrabold font-mono text-cyan-400 tracking-widest">
                  {activeRoom.code}
                </span>
                <span className="text-xs font-mono text-slate-400 block mt-1">
                  STATUS: <span className="text-cyan-300 font-bold">{activeRoom.status}</span> (REV {activeRoom.revision})
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

            {/* Crew Members List with Presence Status */}
            <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Flight Crew Manifest ({activeRoom.members.length} / {activeRoom.maxPlayers} Engineers)</span>
              </h3>

              <div className="space-y-3">
                {activeRoom.members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-space-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        {/* Presence Indicator */}
                        {member.connected ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Connected" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" title="Disconnected (Grace Period Active)" />
                        )}

                        <span className="font-bold text-white text-sm">{member.name}</span>

                        {member.isHost && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                            HOST / COMMANDER
                          </span>
                        )}

                        {member.id === currentMemberId && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            YOU
                          </span>
                        )}

                        {!member.connected && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                            DISCONNECTED (RECONNECTING...)
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

              {/* Role Selection Grid */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Assign Your Engineering Responsibility
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {ROLES.map((r) => {
                    const isSelected = currentRole === r.id;
                    const takenByOther = activeRoom.members.some(
                      (m) => m.id !== currentMemberId && m.connected && m.role === r.id
                    );

                    return (
                      <button
                        key={r.id}
                        disabled={takenByOther}
                        onClick={() => {
                          setMemberRole(activeRoom.code, r.id, (res) => {
                            if (res.success && res.data?.room) {
                              setActiveRoom(res.data.room);
                              setCurrentRole(r.id);
                              setStatusMsg(null);
                            } else {
                              setStatusMsg({ text: res.error?.message || 'Failed to assign role.', isError: true });
                            }
                          });
                        }}
                        className={`text-left p-3 rounded-xl border text-xs font-mono transition-all ${
                          takenByOther
                            ? 'bg-space-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
                            : isSelected
                              ? `${r.color} font-bold`
                              : 'bg-space-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">{r.title}</span>
                          {takenByOther && (
                            <span className="text-[10px] text-slate-500 font-mono">ASSIGNED</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">{r.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Readiness & Host Stage Advancement Actions */}
              <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <button
                  onClick={() => {
                    const nextReady = !currentMember?.isReady;
                    setMemberReady(activeRoom.code, nextReady, (res) => {
                      if (res.success && res.data?.room) {
                        setActiveRoom(res.data.room);
                        setStatusMsg(null);
                      } else {
                        setStatusMsg({ text: res.error?.message || 'Could not change readiness.', isError: true });
                      }
                    });
                  }}
                  className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold border transition-colors ${
                    currentMember?.isReady
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-space-950 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {currentMember?.isReady ? 'STATUS: READY (CLICK TO UNREADY)' : 'MARK READY'}
                </button>

                {isHost ? (
                  <button
                    disabled={!allReady}
                    onClick={handleAdvanceLobby}
                    className={`px-6 py-2.5 rounded-xl font-extrabold font-mono text-xs shadow-lg transition-all flex items-center space-x-2 ${
                      allReady
                        ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-black glow-cyan'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>ADVANCE LOBBY TO MISSION SETUP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="text-xs font-mono text-slate-400 flex items-center space-x-2">
                    {allReady ? (
                      <span className="text-emerald-400">All crew ready. Awaiting Flight Director...</span>
                    ) : (
                      <span>Waiting for all crew to mark READY</span>
                    )}
                  </div>
                )}
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
                <div className="text-slate-500 text-center py-12">
                  Radio channel active. Transmit commands to your engineering crew.
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
