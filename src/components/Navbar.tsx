import React from 'react';
import { Mission } from '../types';
import { Volume2, VolumeX, RotateCcw, Terminal, BookOpen, FlaskConical, Award, Cpu, Lock, Unlock, Compass, CheckCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  currentMission: Mission;
  missions: Mission[];
  onSelectMission: (missionId: string) => void;
  onResetCode: () => void;
  engineStatus: string;
  activeTab: 'operations' | 'sandbox' | 'codex' | 'logs';
  setActiveTab: (tab: 'operations' | 'sandbox' | 'codex' | 'logs') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  solvedCount: number;
  progressionMode: 'structured' | 'free';
  onToggleProgressionMode: () => void;
  solvedMissions: string[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMission,
  missions,
  onSelectMission,
  onResetCode,
  engineStatus,
  activeTab,
  setActiveTab,
  soundEnabled,
  onToggleSound,
  solvedCount,
  progressionMode,
  onToggleProgressionMode,
  solvedMissions,
}) => {
  const solvedSet = new Set(solvedMissions);

  return (
    <header className="border-b border-[#334155] bg-[#0f172a] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none z-20 font-mono">
      {/* Brand & Telemetry Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="font-['Orbitron'] font-bold text-amber-400 tracking-wider text-sm">
            SYS_CODEX
          </span>
          <span className="text-[#64748b] hidden sm:inline">v2.5_WASM</span>
        </div>

        <div className="h-4 w-px bg-[#334155] hidden sm:block" />

        {/* Mission Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="mission-nav" className="text-[#94a3b8] font-medium hidden md:inline">
            NODE:
          </label>
          <select
            id="mission-nav"
            value={currentMission.id}
            onChange={(e) => {
              sound.playClick();
              onSelectMission(e.target.value);
            }}
            className="bg-[#1e293b] border border-[#334155] hover:border-amber-500/50 text-amber-300 font-mono text-xs rounded px-2.5 py-1 outline-none transition focus:ring-1 focus:ring-amber-400 max-w-[200px] sm:max-w-[260px] md:max-w-xs truncate cursor-pointer"
          >
            {missions.map((m) => {
              const isSolved = solvedSet.has(m.id);
              const isLocked =
                progressionMode === 'structured' &&
                m.prerequisiteId &&
                !solvedSet.has(m.prerequisiteId) &&
                !isSolved;

              return (
                <option key={m.id} value={m.id} disabled={Boolean(isLocked)}>
                  {isLocked ? '🔒 ' : isSolved ? '✓ ' : '• '}
                  {m.id}: {m.title}
                </option>
              );
            })}
          </select>
        </div>

        {/* Progression Mode Toggle Switch */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleProgressionMode();
          }}
          title={
            progressionMode === 'structured'
              ? 'Structured Mode: Nodes unlock in sequence. Click to switch to Free Exploration.'
              : 'Free Exploration Mode: All curriculum nodes unlocked. Click to switch to Structured.'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-bold uppercase transition ${
            progressionMode === 'structured'
              ? 'bg-amber-950/40 border-amber-500/70 text-amber-300'
              : 'bg-cyan-950/40 border-cyan-500/70 text-cyan-300'
          }`}
        >
          {progressionMode === 'structured' ? (
            <>
              <Lock className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">STRUCTURED</span>
            </>
          ) : (
            <>
              <Compass className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">FREE EXPLORATION</span>
            </>
          )}
        </button>
      </div>

      {/* Center Nav Modes */}
      <nav className="flex items-center bg-[#1e293b]/80 border border-[#334155] rounded p-0.5 text-xs">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('operations');
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded transition ${
            activeTab === 'operations'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-[#94a3b8] hover:text-slate-100 hover:bg-[#334155]/50'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Workstation</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('sandbox');
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded transition ${
            activeTab === 'sandbox'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-[#94a3b8] hover:text-slate-100 hover:bg-[#334155]/50'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Sandbox</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('codex');
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded transition ${
            activeTab === 'codex'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-[#94a3b8] hover:text-slate-100 hover:bg-[#334155]/50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Codex Docs</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('logs');
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded transition ${
            activeTab === 'logs'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-[#94a3b8] hover:text-slate-100 hover:bg-[#334155]/50'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Progress ({solvedCount}/{missions.length})</span>
        </button>
      </nav>

      {/* Action Controls & Hardware Status */}
      <div className="flex items-center gap-2">
        {/* Dedicated Pyodide Worker Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1e293b] border border-[#334155] font-mono text-[11px]">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span className="text-[#64748b]">WORKER:</span>
          <span
            className={
              engineStatus === 'READY'
                ? 'text-emerald-400 font-semibold'
                : engineStatus === 'RUNNING'
                ? 'text-amber-400 animate-pulse'
                : engineStatus === 'LOADING'
                ? 'text-cyan-300 animate-pulse'
                : 'text-red-400'
            }
          >
            {engineStatus === 'READY'
              ? 'ONLINE (PYODIDE 0.26)'
              : engineStatus === 'RUNNING'
              ? 'RUNNING WORKER'
              : engineStatus === 'LOADING'
              ? 'INITIALIZING WASM'
              : 'WORKER FAULT'}
          </span>
        </div>

        {/* Audio Mute Switch */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute audio telemetry' : 'Enable audio telemetry'}
          className="p-1.5 rounded bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:text-amber-400 hover:border-amber-400/50 transition"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Reset Code */}
        {activeTab === 'operations' && (
          <button
            onClick={() => {
              sound.playClick();
              onResetCode();
            }}
            title="Reset code to starter template"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:text-slate-100 hover:border-[#475569] transition text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Code</span>
          </button>
        )}
      </div>
    </header>
  );
};
