import React, { useState } from 'react';
import { Mission, DiagnosticReport } from '../types';
import { AlertCircle, CheckCircle2, XCircle, Clock, ChevronRight, HelpCircle, Check, BookOpen, Sparkles, Lock } from 'lucide-react';
import { sound } from '../utils/audio';

interface BriefingPanelProps {
  mission: Mission;
  diagnosticReport: DiagnosticReport | null;
  onOpenLadder: () => void;
  investigateSolved: boolean;
  onSolveInvestigate: () => void;
  isLocked?: boolean;
  prerequisiteMissionTitle?: string;
  onJumpToPrerequisite?: () => void;
}

export const BriefingPanel: React.FC<BriefingPanelProps> = ({
  mission,
  diagnosticReport,
  onOpenLadder,
  investigateSolved,
  onSolveInvestigate,
  isLocked,
  prerequisiteMissionTitle,
  onJumpToPrerequisite,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [investigateFeedback, setInvestigateFeedback] = useState<string | null>(null);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Build':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800/80';
      case 'Repair':
        return 'bg-amber-950 text-amber-300 border-amber-800/80';
      case 'Optimize':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800/80';
      case 'Investigate':
        return 'bg-purple-950 text-purple-300 border-purple-800/80';
      case 'Create':
        return 'bg-rose-950 text-rose-300 border-rose-800/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    sound.playClick();
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleVerifyInvestigate = () => {
    if (!mission.investigateQuestions) return;
    const allCorrect = mission.investigateQuestions.every((q, i) => selectedAnswers[i] === q.correctIndex);
    if (allCorrect) {
      sound.playSuccess();
      setInvestigateFeedback('PREDICTION VERIFIED: Cognitive model aligned with interpreter mechanics!');
      onSolveInvestigate();
    } else {
      sound.playAlert();
      setInvestigateFeedback('PREDICTION DIVERGENCE: Review variable state mutations and try again.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1322] border border-[#334155] rounded overflow-y-auto p-4 gap-4 text-xs font-mono select-none">
      {/* Locked Notice (if structured mode prerequisite not satisfied) */}
      {isLocked && (
        <div className="bg-amber-950/40 border border-amber-500/70 rounded p-3 flex items-center justify-between gap-3 text-amber-300">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-[11px]">NODE PREREQUISITE PENDING</div>
              <div className="text-[10px] text-amber-200/80 font-sans">
                Complete {prerequisiteMissionTitle || mission.prerequisiteId} to unlock this node in Structured Mode.
              </div>
            </div>
          </div>
          {onJumpToPrerequisite && (
            <button
              onClick={onJumpToPrerequisite}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] uppercase transition shrink-0"
            >
              Go to Prereq
            </button>
          )}
        </div>
      )}

      {/* Node & Metadata Banner */}
      <div className="flex flex-col gap-1 border-b border-[#334155]/60 pb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">
            {mission.blockTitle}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getCategoryBadge(mission.category)}`}>
            {mission.category} MODE
          </span>
        </div>
        <h1 className="text-base sm:text-lg font-bold text-slate-100 font-['Rajdhani'] tracking-wide">
          {mission.title}
        </h1>
        <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
          <span>TARGET: <code className="text-amber-300">{mission.targetFilename}</code></span>
          <span>•</span>
          <span>VERIFICATION: <code className="text-cyan-300 uppercase">{mission.verificationMode}</code></span>
        </div>
      </div>

      {/* Concept Briefing Card */}
      {mission.conceptBrief && (
        <div className="bg-[#0f172a] border border-[#334155] rounded p-3 flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>CORE CONCEPT // INSTRUCTION</span>
          </div>
          <p className="text-slate-200 leading-relaxed font-sans text-xs">
            {mission.conceptBrief}
          </p>
        </div>
      )}

      {/* Operational Dispatch / Narrative Alert */}
      <div className="bg-[#111827] border-l-2 border-amber-500 rounded-r p-3 flex flex-col gap-1.5 shadow-inner">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>MISSION OBJECTIVE</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans text-xs">
          {mission.briefing}
        </p>
        <p className="text-[#94a3b8] italic text-[11px] font-sans border-t border-[#1f2937] pt-1 mt-1">
          {mission.narrativeContext}
        </p>
      </div>

      {/* Learning Objectives Checklist */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold tracking-wider text-[#64748b] uppercase">
          OPERATIONAL OBJECTIVES
        </span>
        <ul className="flex flex-col gap-1 font-sans text-xs text-slate-300">
          {mission.learningObjectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold mt-0.5">▸</span>
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Interactive Investigate Quiz (if category is Investigate) */}
      {mission.category === 'Investigate' && mission.investigateQuestions && (
        <div className="bg-[#1e1b4b]/40 border border-purple-800/60 rounded p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>COGNITIVE TRACE // PREDICTION CHECK</span>
            </div>
            {investigateSolved && (
              <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                <Check className="w-3.5 h-3.5" /> VERIFIED
              </span>
            )}
          </div>

          <p className="text-[#c4b5fd] text-xs font-sans">
            Before running diagnostics, trace the code mentally and predict its execution behavior:
          </p>

          <div className="flex flex-col gap-3">
            {mission.investigateQuestions.map((q, qIdx) => (
              <div key={qIdx} className="flex flex-col gap-1.5 bg-[#0f172a]/60 p-2.5 rounded border border-purple-900/40">
                <span className="font-sans text-xs text-slate-200 font-medium">
                  {qIdx + 1}. {q.question}
                </span>
                <div className="grid grid-cols-1 gap-1.5 mt-1 font-sans text-xs">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[qIdx] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                        className={`text-left px-2.5 py-1.5 rounded border transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-950/80 border-purple-400 text-purple-200 font-semibold'
                            : 'bg-[#1e293b]/50 border-[#334155] text-slate-400 hover:text-slate-200 hover:bg-[#334155]/40'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                      </button>
                    );
                  })}
                </div>
                {investigateSolved && (
                  <p className="text-[11px] text-emerald-300/90 font-sans italic mt-1 border-t border-purple-900/30 pt-1">
                    ✓ {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {!investigateSolved && (
            <button
              onClick={handleVerifyInvestigate}
              className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition self-start cursor-pointer"
            >
              Verify Mental Model
            </button>
          )}

          {investigateFeedback && (
            <div className={`p-2 rounded text-[11px] font-sans ${
              investigateSolved ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' : 'bg-red-950/60 text-red-300 border border-red-800'
            }`}>
              {investigateFeedback}
            </div>
          )}
        </div>
      )}

      {/* Test Vectors Matrix */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-[#64748b] uppercase">
            TEST HARNESS VECTORS ({mission.testCases.length})
          </span>
          {diagnosticReport && (
            <span className={`text-[11px] font-bold ${
              diagnosticReport.passed ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {diagnosticReport.passed ? 'ALL PASSED' : 'DISCREPANCY DETECTED'}
            </span>
          )}
        </div>

        <div className="border border-[#334155] rounded overflow-hidden">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#1e293b] text-[#94a3b8] uppercase text-[10px]">
              <tr>
                <th className="py-1.5 px-2.5 font-medium">Vector / Target</th>
                <th className="py-1.5 px-2 font-medium">Expected Output</th>
                <th className="py-1.5 px-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/60 bg-[#0c1222]">
              {mission.testCases.map((tc, idx) => {
                const result = diagnosticReport?.testResults[idx];
                const isPassed = result?.passed;
                return (
                  <tr key={idx} className="hover:bg-[#1e293b]/30">
                    <td className="py-2 px-2.5">
                      <div className="font-semibold text-slate-200">{tc.name}</div>
                      <div className="text-[10px] text-[#64748b] truncate max-w-[140px] sm:max-w-[200px]" title={tc.description || JSON.stringify(tc.input)}>
                        {tc.description || `in: ${JSON.stringify(tc.input)}`}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-amber-300/90 font-mono">
                      {JSON.stringify(tc.expectedOutput)}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {!result ? (
                        <span className="inline-flex items-center gap-1 text-[#64748b] text-[10px]">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      ) : isPassed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 font-bold text-[10px]">
                          <XCircle className="w-3 h-3" /> FAIL
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5-Stage Adaptive Ladder CTA Box */}
      <div className="mt-auto pt-2 border-t border-[#334155]/60 flex items-center justify-between gap-3 bg-[#0f172a] p-3 rounded border">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> 5-STAGE ASSISTANCE LADDER
          </span>
          <span className="text-[10px] text-[#94a3b8] font-sans">
            Need guidance? Reveal escalating nudges, rules, & micro-examples.
          </span>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            onOpenLadder();
          }}
          className="px-3 py-1.5 rounded bg-[#1e293b] hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40 text-[11px] font-bold uppercase tracking-wider transition flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>Open Ladder</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
