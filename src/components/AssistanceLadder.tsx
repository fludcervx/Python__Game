import React from 'react';
import { StageAssistance } from '../types';
import { X, Unlock, Lock, ChevronDown, CheckCircle, Lightbulb, BookOpen, Bug, Code, Sparkles, Copy, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface AssistanceLadderProps {
  isOpen: boolean;
  onClose: () => void;
  assistance: StageAssistance;
  unlockedStage: number; // 1 to 5
  onUnlockNextStage: () => void;
  onApplyReferenceCode?: (code: string) => void;
}

export const AssistanceLadder: React.FC<AssistanceLadderProps> = ({
  isOpen,
  onClose,
  assistance,
  unlockedStage,
  onUnlockNextStage,
  onApplyReferenceCode
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyWorked = (code: string) => {
    sound.playClick();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#0c1222] border border-[#334155] rounded-lg shadow-2xl flex flex-col overflow-hidden text-xs font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="font-['Orbitron'] font-bold text-amber-300 text-sm tracking-wide">
              5-STAGE ASSISTANCE LADDER
            </span>
            <span className="text-[#64748b] text-[11px]">
              (STAGE {unlockedStage} OF 5 ACTIVE)
            </span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Stages Container */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 select-text">
          <p className="text-[#94a3b8] font-sans text-xs">
            Assistance is progressive: start with conceptual nudges, graduate to targeted rules, and only inspect worked code if completely blocked.
          </p>

          {/* STAGE 1: Conceptual Nudge */}
          <div className="border border-cyan-800/60 rounded bg-cyan-950/20 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                STAGE 1 // CONCEPTUAL NUDGE
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-900/40 border border-cyan-700/50">
                UNLOCKED
              </span>
            </div>
            <p className="font-sans text-xs text-slate-200 leading-relaxed">
              {assistance.stage1Nudge}
            </p>
          </div>

          {/* STAGE 2: Focused Reference & Rule Explanation */}
          <div className={`border rounded p-3 flex flex-col gap-2 transition ${
            unlockedStage >= 2
              ? 'border-blue-800/60 bg-blue-950/20'
              : 'border-[#334155]/40 bg-[#0f172a]/40 opacity-75'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-bold flex items-center gap-1.5 text-xs ${
                unlockedStage >= 2 ? 'text-blue-300' : 'text-[#64748b]'
              }`}>
                <BookOpen className="w-3.5 h-3.5" />
                STAGE 2 // FOCUSED REFERENCE & RULE
              </span>
              {unlockedStage >= 2 ? (
                <span className="text-[10px] text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-900/40 border border-blue-700/50">
                  UNLOCKED
                </span>
              ) : (
                <span className="text-[10px] text-[#64748b] flex items-center gap-1">
                  <Lock className="w-3 h-3" /> LOCKED
                </span>
              )}
            </div>

            {unlockedStage >= 2 ? (
              <div className="flex flex-col gap-2 font-sans text-xs">
                <div className="font-bold text-blue-200">{assistance.stage2Rule.title}</div>
                <p className="text-slate-300 leading-relaxed">{assistance.stage2Rule.explanation}</p>
                {assistance.stage2Rule.documentationSnippet && (
                  <pre className="font-mono bg-[#090d16] text-blue-300 p-2.5 rounded border border-blue-900/50 text-[11px] overflow-x-auto">
                    {assistance.stage2Rule.documentationSnippet}
                  </pre>
                )}
              </div>
            ) : (
              <p className="text-[#64748b] text-[11px] italic font-sans">
                Explains the underlying Python syntax rules and specifications for this challenge.
              </p>
            )}
          </div>

          {/* STAGE 3: Specific Error Diagnosis & Line AST */}
          <div className={`border rounded p-3 flex flex-col gap-2 transition ${
            unlockedStage >= 3
              ? 'border-amber-800/60 bg-amber-950/20'
              : 'border-[#334155]/40 bg-[#0f172a]/40 opacity-75'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-bold flex items-center gap-1.5 text-xs ${
                unlockedStage >= 3 ? 'text-amber-300' : 'text-[#64748b]'
              }`}>
                <Bug className="w-3.5 h-3.5" />
                STAGE 3 // SPECIFIC ERROR DIAGNOSIS & AST
              </span>
              {unlockedStage >= 3 ? (
                <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-900/40 border border-amber-700/50">
                  UNLOCKED
                </span>
              ) : (
                <span className="text-[10px] text-[#64748b] flex items-center gap-1">
                  <Lock className="w-3 h-3" /> LOCKED
                </span>
              )}
            </div>

            {unlockedStage >= 3 ? (
              <div className="flex flex-col gap-2 font-sans text-xs">
                <div className="text-amber-200 font-semibold leading-relaxed">
                  {assistance.stage3Diagnosis.probableCause}
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <strong className="text-amber-300">AST Analysis:</strong> {assistance.stage3Diagnosis.astClues}
                </p>
                {assistance.stage3Diagnosis.lineHints && (
                  <div className="text-[11px] text-amber-400 font-mono">
                    Investigate line(s): {assistance.stage3Diagnosis.lineHints.join(', ')}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[#64748b] text-[11px] italic font-sans">
                Pinpoints the exact code line and syntax tree cause of the malfunction.
              </p>
            )}
          </div>

          {/* STAGE 4: Guided Repair (Micro-Example) */}
          <div className={`border rounded p-3 flex flex-col gap-2 transition ${
            unlockedStage >= 4
              ? 'border-purple-800/60 bg-purple-950/20'
              : 'border-[#334155]/40 bg-[#0f172a]/40 opacity-75'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-bold flex items-center gap-1.5 text-xs ${
                unlockedStage >= 4 ? 'text-purple-300' : 'text-[#64748b]'
              }`}>
                <Code className="w-3.5 h-3.5" />
                STAGE 4 // GUIDED REPAIR (MICRO-EXAMPLE)
              </span>
              {unlockedStage >= 4 ? (
                <span className="text-[10px] text-purple-400 font-semibold px-2 py-0.5 rounded bg-purple-900/40 border border-purple-700/50">
                  UNLOCKED
                </span>
              ) : (
                <span className="text-[10px] text-[#64748b] flex items-center gap-1">
                  <Lock className="w-3 h-3" /> LOCKED
                </span>
              )}
            </div>

            {unlockedStage >= 4 ? (
              <div className="flex flex-col gap-2 font-sans text-xs">
                <div className="text-purple-200 font-semibold">{assistance.stage4MicroExample.concept}</div>
                <pre className="font-mono bg-[#090d16] text-purple-200 p-2.5 rounded border border-purple-900/50 text-[11px] overflow-x-auto">
                  {assistance.stage4MicroExample.sampleCode}
                </pre>
                <p className="text-slate-300 italic">{assistance.stage4MicroExample.takeaway}</p>
              </div>
            ) : (
              <p className="text-[#64748b] text-[11px] italic font-sans">
                Provides a minimal, working micro-example solving a similar isolated pattern.
              </p>
            )}
          </div>

          {/* STAGE 5: Worked Solution & Transfer Challenge */}
          <div className={`border rounded p-3 flex flex-col gap-2 transition ${
            unlockedStage >= 5
              ? 'border-emerald-800/60 bg-emerald-950/20'
              : 'border-[#334155]/40 bg-[#0f172a]/40 opacity-75'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-bold flex items-center gap-1.5 text-xs ${
                unlockedStage >= 5 ? 'text-emerald-300' : 'text-[#64748b]'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                STAGE 5 // WORKED SOLUTION + TRANSFER CHALLENGE
              </span>
              {unlockedStage >= 5 ? (
                <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-900/40 border border-emerald-700/50">
                  UNLOCKED
                </span>
              ) : (
                <span className="text-[10px] text-[#64748b] flex items-center gap-1">
                  <Lock className="w-3 h-3" /> LOCKED
                </span>
              )}
            </div>

            {unlockedStage >= 5 ? (
              <div className="flex flex-col gap-3 font-sans text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 font-mono text-[11px]">REFERENCE IMPLEMENTATION:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyWorked(assistance.stage5WorkedSolution.referenceCode)}
                      className="px-2 py-1 rounded bg-[#1e293b] hover:bg-emerald-600 hover:text-white transition flex items-center gap-1 text-[10px] text-slate-300"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                    {onApplyReferenceCode && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onApplyReferenceCode(assistance.stage5WorkedSolution.referenceCode);
                          onClose();
                        }}
                        className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition text-[10px]"
                      >
                        Insert into Workspace
                      </button>
                    )}
                  </div>
                </div>

                <pre className="font-mono bg-[#090d16] text-emerald-300 p-2.5 rounded border border-emerald-900/50 text-[11px] overflow-x-auto">
                  {assistance.stage5WorkedSolution.referenceCode}
                </pre>

                <div className="bg-[#111827] p-2.5 rounded border border-emerald-900/40 flex flex-col gap-1">
                  <strong className="text-emerald-400 font-mono text-[11px]">Why this works:</strong>
                  <p className="text-slate-300 leading-relaxed">
                    {assistance.stage5WorkedSolution.whyItWorks}
                  </p>
                </div>

                <div className="bg-[#1e1b4b]/40 p-2.5 rounded border border-purple-800/40 flex flex-col gap-1">
                  <strong className="text-purple-300 font-mono text-[11px]">Independent Transfer Challenge:</strong>
                  <p className="text-purple-200">
                    {assistance.stage5WorkedSolution.transferChallenge.prompt}
                  </p>
                  <span className="text-[10px] text-[#94a3b8] font-mono">
                    Pattern: {assistance.stage5WorkedSolution.transferChallenge.expectedBehavior}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[#64748b] text-[11px] italic font-sans">
                Reveals the authoritative Python solution, deep mechanical explanation of why it works, and an independent transfer challenge to test retention.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-[#0f172a] border-t border-[#334155] flex items-center justify-between">
          <span className="text-[11px] text-[#64748b]">
            Solve independently if possible to reinforce long-term memory.
          </span>
          <div className="flex items-center gap-2">
            {unlockedStage < 5 && (
              <button
                onClick={() => {
                  sound.playClick();
                  onUnlockNextStage();
                }}
                className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-[0_0_8px_rgba(245,158,11,0.3)] cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlock Stage {unlockedStage + 1}</span>
              </button>
            )}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-3 py-1.5 rounded bg-[#1e293b] hover:bg-[#334155] text-slate-200 transition text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
