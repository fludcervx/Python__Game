import React from 'react';
import { Mission, UserProgress } from '../types';
import { Award, CheckCircle2, Lock, ArrowRight, ShieldCheck, Compass, Cpu } from 'lucide-react';
import { sound } from '../utils/audio';

interface MissionLogsViewProps {
  missions: Mission[];
  userProgress: UserProgress;
  onSelectMission: (missionId: string) => void;
  onClose: () => void;
}

export const MissionLogsView: React.FC<MissionLogsViewProps> = ({
  missions,
  userProgress,
  onSelectMission,
  onClose
}) => {
  const solvedSet = new Set(userProgress.solvedMissions);
  const totalMissions = missions.length;
  const solvedCount = solvedSet.size;
  const percentComplete = Math.round((solvedCount / totalMissions) * 100);
  const isStructured = userProgress.progressionMode === 'structured';

  // Group missions by block
  const blocksMap = new Map<number, { title: string; missions: Mission[] }>();
  missions.forEach((m) => {
    if (!blocksMap.has(m.blockId)) {
      blocksMap.set(m.blockId, { title: m.blockTitle, missions: [] });
    }
    blocksMap.get(m.blockId)!.missions.push(m);
  });

  const blocks = Array.from(blocksMap.entries()).sort(([a], [b]) => a - b);

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto select-none font-mono text-xs">
      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#0f172a] border border-[#334155] p-3.5 rounded flex items-center gap-3">
          <div className="p-2.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#64748b] uppercase font-bold">SYSTEM RESTORATION</div>
            <div className="text-xl font-bold text-amber-300 font-['Orbitron']">
              {percentComplete}%
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] border border-[#334155] p-3.5 rounded flex items-center gap-3">
          <div className="p-2.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#64748b] uppercase font-bold">SOLVED NODES</div>
            <div className="text-xl font-bold text-emerald-400 font-['Orbitron']">
              {solvedCount} / {totalMissions}
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] border border-[#334155] p-3.5 rounded flex items-center gap-3">
          <div className="p-2.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {isStructured ? <Lock className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[10px] text-[#64748b] uppercase font-bold">ACTIVE PROGRESSION</div>
            <div className="text-sm font-bold text-cyan-300 font-mono uppercase">
              {isStructured ? 'STRUCTURED SEQUENTIAL' : 'FREE EXPLORATION'}
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Blocks Roadmap */}
      <div className="flex flex-col gap-4">
        {blocks.map(([blockId, blockData]) => {
          const blockSolvedCount = blockData.missions.filter(m => solvedSet.has(m.id)).length;
          const isBlockComplete = blockSolvedCount === blockData.missions.length;

          return (
            <div
              key={blockId}
              className="bg-[#0c1222] border border-[#334155] rounded overflow-hidden flex flex-col"
            >
              {/* Block Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f172a] border-b border-[#334155]">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isBlockComplete ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-400'}`} />
                  <span className="font-bold text-slate-100 font-['Rajdhani'] text-sm tracking-wide">
                    {blockData.title}
                  </span>
                </div>
                <span className="text-[11px] text-[#94a3b8]">
                  {blockSolvedCount} / {blockData.missions.length} NODES RESTORED
                </span>
              </div>

              {/* Missions Grid */}
              <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {blockData.missions.map((m) => {
                  const isSolved = solvedSet.has(m.id);
                  const isLocked =
                    isStructured &&
                    m.prerequisiteId &&
                    !solvedSet.has(m.prerequisiteId) &&
                    !isSolved;

                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        sound.playClick();
                        onSelectMission(m.id);
                        onClose();
                      }}
                      className={`p-3 rounded border transition flex flex-col justify-between gap-2.5 cursor-pointer ${
                        isSolved
                          ? 'bg-emerald-950/20 border-emerald-800/80 hover:border-emerald-500'
                          : isLocked
                          ? 'bg-[#13192b]/40 border-[#1e293b] opacity-75 hover:opacity-100 hover:border-amber-500/50'
                          : 'bg-[#1e293b]/40 border-[#334155] hover:border-amber-400 hover:bg-[#1e293b]'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#64748b] font-mono">{m.id}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            isSolved ? 'bg-emerald-900/60 text-emerald-300' : 'bg-[#1e293b] text-slate-400'
                          }`}>
                            {m.category}
                          </span>
                        </div>
                        <div className="font-bold text-slate-200 text-xs">{m.title}</div>
                        <p className="text-[11px] text-[#94a3b8] font-sans line-clamp-2">{m.briefing}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#334155]/40 text-[10px]">
                        <span className="text-[#64748b]">{m.difficulty}</span>
                        {isSolved ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> VERIFIED
                          </span>
                        ) : isLocked ? (
                          <span className="text-amber-400/90 font-medium flex items-center gap-1">
                            <Lock className="w-3 h-3" /> LOCKED
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            LAUNCH <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
