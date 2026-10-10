import React, { useState } from 'react';
import { DiagnosticReport } from '../types';
import { Terminal, Table, Layers, GitBranch, CheckCircle2, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface DiagnosticsDockProps {
  report: DiagnosticReport | null;
  isRunning: boolean;
}

export const DiagnosticsDock: React.FC<DiagnosticsDockProps> = ({ report, isRunning }) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'inspector' | 'frames' | 'ast'>('terminal');

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] border border-[#334155] rounded overflow-hidden text-xs font-mono select-none">
      {/* Dock Header Tabs */}
      <div className="flex items-center justify-between px-2 bg-[#0f172a] border-b border-[#334155]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('terminal');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 font-medium transition ${
              activeTab === 'terminal'
                ? 'border-amber-400 text-amber-300 bg-[#1e293b]/50'
                : 'border-transparent text-[#94a3b8] hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>STDOUT & TRACEBACK</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('inspector');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 font-medium transition ${
              activeTab === 'inspector'
                ? 'border-amber-400 text-amber-300 bg-[#1e293b]/50'
                : 'border-transparent text-[#94a3b8] hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>VARIABLE STATE ({report?.variables.length || 0})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('frames');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 font-medium transition ${
              activeTab === 'frames'
                ? 'border-amber-400 text-amber-300 bg-[#1e293b]/50'
                : 'border-transparent text-[#94a3b8] hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>FRAME STACK ({report?.callFrames.length || 0})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('ast');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 font-medium transition ${
              activeTab === 'ast'
                ? 'border-amber-400 text-amber-300 bg-[#1e293b]/50'
                : 'border-transparent text-[#94a3b8] hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>AST TELEMETRY</span>
          </button>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 pr-2">
          {isRunning ? (
            <span className="text-amber-400 text-[11px] animate-pulse">EXECUTING...</span>
          ) : report?.passed ? (
            <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> NOMINAL (0 ERRORS)
            </span>
          ) : report ? (
            <span className="text-red-400 flex items-center gap-1 text-[11px] font-semibold">
              <XCircle className="w-3.5 h-3.5" /> FAULT: {report.category}
            </span>
          ) : (
            <span className="text-[#64748b] text-[11px]">STANDBY</span>
          )}
        </div>
      </div>

      {/* Dock Body Content */}
      <div className="flex-1 overflow-y-auto p-3 select-text bg-[#090d16]">
        {/* TAB 1: TERMINAL / STDOUT */}
        {activeTab === 'terminal' && (
          <div className="flex flex-col gap-2 font-mono text-[12px] leading-relaxed">
            {/* Status Summary Banner */}
            {report && (
              <div
                className={`p-2.5 rounded border flex flex-col gap-1 ${
                  report.passed
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-800 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  {report.passed ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>[{report.title}]</span>
                </div>
                <div className="text-slate-300 text-[11px]">{report.message}</div>
                {report.suggestion && (
                  <div className="text-[11px] text-amber-400/90 italic pt-1 border-t border-white/10">
                    💡 Diagnostic Recommendation: {report.suggestion}
                  </div>
                )}
              </div>
            )}

            {/* Real STDOUT */}
            {report?.stdout && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#64748b] font-bold">STDOUT FEED:</span>
                <pre className="text-emerald-300/90 whitespace-pre-wrap bg-black/40 p-2 rounded border border-[#1e293b]">
                  {report.stdout}
                </pre>
              </div>
            )}

            {/* Stderr / Traceback */}
            {report?.stderr && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-red-400 font-bold">TRACEBACK DUMP:</span>
                <pre className="text-red-300 whitespace-pre-wrap bg-red-950/20 p-2 rounded border border-red-900/50">
                  {report.stderr}
                </pre>
              </div>
            )}

            {!report && (
              <div className="text-[#64748b] italic py-4">
                &gt;&gt; Ready for test execution. Click EXECUTE or press Ctrl+Enter to evaluate broken_code.py.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VARIABLE STATE INSPECTOR */}
        {activeTab === 'inspector' && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-[#64748b] uppercase font-bold">
              LOCAL SCOPE MEMORY INSPECTOR
            </span>
            {report?.variables && report.variables.length > 0 ? (
              <div className="border border-[#334155] rounded overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#1e293b] text-[#94a3b8] uppercase text-[10px]">
                    <tr>
                      <th className="p-2 font-medium">Identifier</th>
                      <th className="p-2 font-medium">Type</th>
                      <th className="p-2 font-medium">Current Value</th>
                      <th className="p-2 font-medium text-center">Mutable</th>
                      <th className="p-2 font-medium text-right">Len/Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]/50 bg-[#0c1222]">
                    {report.variables.map((v, i) => (
                      <tr key={i} className="hover:bg-[#1e293b]/30">
                        <td className="p-2 font-bold text-amber-300">{v.name}</td>
                        <td className="p-2 text-cyan-300">{v.type}</td>
                        <td className="p-2 font-mono text-slate-200 truncate max-w-xs">{v.value}</td>
                        <td className="p-2 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                              v.mutable
                                ? 'bg-amber-900/40 text-amber-300 border border-amber-700/50'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {v.mutable ? 'MUTABLE' : 'IMMUTABLE'}
                          </span>
                        </td>
                        <td className="p-2 text-right text-[#94a3b8]">{v.size ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-[#64748b] italic py-4">
                &gt;&gt; No variable frame states registered. Run diagnostics to inspect active execution scope.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FRAME STACK MONITOR */}
        {activeTab === 'frames' && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-[#64748b] uppercase font-bold">
              CALL FRAME STACK & SCOPE ALLOCATION
            </span>
            {report?.callFrames && report.callFrames.length > 0 ? (
              <div className="flex flex-col gap-2">
                {report.callFrames.map((frame, i) => (
                  <div key={i} className="border border-[#334155] rounded bg-[#0f172a] p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Frame #{frame.depth}: {frame.name}()
                      </span>
                      <span className="text-[#64748b] text-[10px]">Active Line: {frame.line}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#1e293b]">
                      <div>
                        <span className="text-[#64748b] text-[10px] block">BOUND ARGUMENTS:</span>
                        <pre className="text-amber-300 bg-[#090d16] p-1.5 rounded mt-0.5 overflow-x-auto">
                          {JSON.stringify(frame.arguments, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-[#64748b] text-[10px] block">LOCALS SNAPSHOT:</span>
                        <pre className="text-emerald-300 bg-[#090d16] p-1.5 rounded mt-0.5 overflow-x-auto">
                          {JSON.stringify(frame.locals, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[#64748b] italic py-4">
                &gt;&gt; Frame stack empty. Execute code to monitor frame invocation.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AST TELEMETRY */}
        {activeTab === 'ast' && (
          <div className="flex flex-col gap-3">
            <span className="text-[10px] text-[#64748b] uppercase font-bold">
              ABSTRACT SYNTAX TREE (AST) STRUCTURAL METRICS
            </span>
            {report?.astInfo ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded bg-[#0f172a] border border-[#334155] flex flex-col gap-1">
                  <span className="text-[10px] text-[#64748b]">PARSED FUNCTIONS</span>
                  <span className="text-amber-300 font-bold">
                    {report.astInfo.detectedFunctions.length > 0
                      ? report.astInfo.detectedFunctions.join(', ')
                      : 'None'}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-[#0f172a] border border-[#334155] flex flex-col gap-1">
                  <span className="text-[10px] text-[#64748b]">LOOP CONSTRUCTS</span>
                  <span className="text-cyan-300 font-bold">
                    {report.astInfo.detectedLoops.length > 0
                      ? report.astInfo.detectedLoops.join(', ')
                      : 'None'}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-[#0f172a] border border-[#334155] flex flex-col gap-1">
                  <span className="text-[10px] text-[#64748b]">TYPE CAST CALLS</span>
                  <span className="text-emerald-300 font-bold">
                    {report.astInfo.detectedTypeCasts.length > 0
                      ? report.astInfo.detectedTypeCasts.join(', ')
                      : 'None'}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-[#0f172a] border border-[#334155] flex flex-col gap-1">
                  <span className="text-[10px] text-[#64748b]">COMPARISONS</span>
                  <span className="text-purple-300 font-bold">
                    {report.astInfo.detectedComparisons.length > 0
                      ? report.astInfo.detectedComparisons.join(', ')
                      : 'None'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-[#64748b] italic py-4">
                &gt;&gt; AST telemetry available upon compilation run.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
