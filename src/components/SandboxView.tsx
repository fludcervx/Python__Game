import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { EditorView, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { workerManager } from '../services/pyodideWorkerManager';
import { VariableEntry } from '../types';
import { Play, Square, Copy, Check, Terminal, Table, Sparkles, Code2 } from 'lucide-react';
import { sound } from '../utils/audio';

const industrialDarkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#0a0f1d',
      color: '#e2e8f0',
      fontSize: '13px',
      fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
      height: '100%',
    },
    '.cm-scroller': { overflow: 'auto', lineHeight: '22px' },
    '.cm-content': { caretColor: '#f59e0b', padding: '12px 0' },
    '.cm-cursor': { borderLeftColor: '#f59e0b', borderLeftWidth: '2px' },
    '.cm-gutters': {
      backgroundColor: '#090d18',
      color: '#475569',
      borderRight: '1px solid #1e293b',
      paddingRight: '8px',
    },
    '.cm-activeLine': { backgroundColor: 'rgba(245, 158, 11, 0.08)' },
    '.cm-keyword': { color: '#10b981', fontWeight: 'bold' },
    '.cm-operator': { color: '#f59e0b' },
    '.cm-variableName': { color: '#e2e8f0' },
    '.cm-variableName.cm-definition': { color: '#38bdf8', fontWeight: '600' },
    '.cm-string': { color: '#fbbf24' },
    '.cm-number': { color: '#a78bfa' },
    '.cm-comment': { color: '#64748b', fontStyle: 'italic' },
    '.cm-builtin': { color: '#06b6d4', fontWeight: 'bold' },
  },
  { dark: true }
);

const SANDBOX_PRESETS = [
  {
    title: 'Loop Stepper Demo',
    code: `# Thruster burn test over 5 seconds
# Demonstrates step execution & variable mutation
burn_accumulator = 0
for second in range(5):
    burn_rate = (second * 2) + 5
    burn_accumulator += burn_rate
    print(f"Second {second}: Burned {burn_rate} units. Total: {burn_accumulator}")

print("Burn sequence complete. Final Fuel Burned:", burn_accumulator)
`
  },
  {
    title: 'Orbital Distance Vector',
    code: `# Calculate Euclidean distance between space station coordinates
import math

coords = [
    {"station": "Alpha", "x": 12.0, "y": 9.0},
    {"station": "Beta", "x": 20.0, "y": 15.0},
    {"station": "Gamma", "x": -8.0, "y": 6.0}
]

distances = {}
for station in coords:
    dist = math.sqrt(station["x"]**2 + station["y"]**2)
    distances[station["station"]] = round(dist, 2)

print("Station Distances (AU):", distances)
`
  },
  {
    title: 'Sensor Frequency Cleaner',
    code: `# Data cleaning and list comprehensions
raw_frequencies = [" 1420.405 ", "-999", " 1665.401 ", "ERR", "1667.359"]

valid_signals = []
for freq in raw_frequencies:
    try:
        val = float(freq.strip())
        if val > 0:
            valid_signals.append(val)
    except ValueError:
        pass

print("Valid Signals (MHz):", valid_signals)
print(f"Mean Frequency: {sum(valid_signals) / len(valid_signals):.2f}")
`
  }
];

export const SandboxView: React.FC = () => {
  const [code, setCode] = useState(SANDBOX_PRESETS[0].code);
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [variables, setVariables] = useState<VariableEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExecute = async () => {
    sound.playRun();
    setIsRunning(true);
    setStdout('');
    setStderr('');
    try {
      const res = await workerManager.runFreeform(code);
      setStdout(res.stdout);
      setStderr(res.stderr);
      setVariables(res.variables);
      if (res.stderr) {
        sound.playAlert();
      } else {
        sound.playSuccess();
      }
    } catch (e: any) {
      setStderr(String(e.message || e));
      sound.playAlert();
    } finally {
      setIsRunning(false);
    }
  };

  const handleStop = () => {
    sound.playAlert();
    workerManager.stopExecution();
    setIsRunning(false);
    setStderr('Execution stopped by user.');
  };

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden select-none font-mono text-xs">
      {/* Top Banner & Preset Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] p-3 rounded border border-[#334155]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-['Orbitron'] font-bold text-amber-300 text-sm">
            PYTHON EXPERIMENTATION SANDBOX
          </span>
          <span className="text-[#64748b] hidden sm:inline">• CodeMirror 6 & Pyodide Worker</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#94a3b8] text-[11px]">PRESET SCRIPTS:</span>
          {SANDBOX_PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                sound.playClick();
                setCode(p.code);
              }}
              className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-amber-500/20 hover:text-amber-300 text-[#cbd5e1] border border-[#334155] text-[11px] transition"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Left: Code Editor with CodeMirror 6 */}
        <div className="flex flex-col h-full bg-[#0a0f1d] border border-[#334155] rounded overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#0f172a] border-b border-[#334155]">
            <span className="text-amber-300 font-bold flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" /> sandbox_workspace.py
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2 py-0.5 rounded hover:bg-[#1e293b] text-[#94a3b8] hover:text-slate-200 transition text-[11px] flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {isRunning && (
                <button
                  onClick={handleStop}
                  className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold uppercase transition flex items-center gap-1 text-[11px]"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>STOP</span>
                </button>
              )}

              <button
                onClick={handleExecute}
                disabled={isRunning}
                className="px-3 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold uppercase transition flex items-center gap-1 cursor-pointer disabled:bg-[#475569] text-[11px]"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isRunning ? 'Running...' : 'Execute'}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <CodeMirror
              value={code}
              height="100%"
              theme={industrialDarkTheme}
              extensions={[python(), lineNumbers(), highlightActiveLine()]}
              onChange={(val) => setCode(val)}
              className="h-full w-full"
            />
          </div>
        </div>

        {/* Right: Output & Variables */}
        <div className="flex flex-col h-full bg-[#0a0e1a] border border-[#334155] rounded overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#0f172a] border-b border-[#334155]">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" /> OUTPUT & STATE INSPECTOR
            </span>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto p-3 gap-3">
            {/* STDOUT */}
            <div className="flex-1 flex flex-col gap-1 min-h-[120px]">
              <span className="text-[10px] text-[#64748b] font-bold">TERMINAL STDOUT:</span>
              <pre className="flex-1 p-3 rounded bg-black/50 border border-[#1e293b] text-emerald-400 font-mono text-[12px] whitespace-pre-wrap overflow-auto">
                {stdout || (isRunning ? '>> Executing in dedicated Pyodide worker...' : '>> Click EXECUTE to run script in Pyodide WASM.')}
              </pre>
            </div>

            {/* STDERR */}
            {stderr && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-red-400 font-bold">TRACEBACK / ERROR:</span>
                <pre className="p-3 rounded bg-red-950/30 border border-red-900/60 text-red-300 font-mono text-[11px] whitespace-pre-wrap overflow-auto max-h-40">
                  {stderr}
                </pre>
              </div>
            )}

            {/* Variable State Table */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-[#64748b] font-bold">ACTIVE SCOPE VARIABLES ({variables.length}):</span>
              {variables.length > 0 ? (
                <div className="border border-[#334155] rounded overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#1e293b] text-[#94a3b8] uppercase text-[10px]">
                      <tr>
                        <th className="p-1.5">Var</th>
                        <th className="p-1.5">Type</th>
                        <th className="p-1.5">Value</th>
                        <th className="p-1.5 text-right">Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]/40 bg-[#0c1222]">
                      {variables.map((v, i) => (
                        <tr key={i}>
                          <td className="p-1.5 font-bold text-amber-300">{v.name}</td>
                          <td className="p-1.5 text-cyan-300">{v.type}</td>
                          <td className="p-1.5 font-mono text-slate-200 truncate max-w-xs">{v.value}</td>
                          <td className="p-1.5 text-right text-[#94a3b8]">{v.size ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-[#64748b] text-[11px] italic p-2 bg-[#0c1222] rounded border border-[#1e293b]">
                  No local variables created yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
