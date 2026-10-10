import React, { useMemo, useCallback } from 'react';
import CodeMirror, { Extension } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { EditorView, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { FileCode, Copy, Check, Play, Square, FastForward } from 'lucide-react';
import { sound } from '../utils/audio';

// Custom Industrial Dark Workstation Theme for CodeMirror 6
const industrialDarkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#0a0f1d',
      color: '#e2e8f0',
      fontSize: '13px',
      fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
      height: '100%',
    },
    '.cm-scroller': {
      overflow: 'auto',
      lineHeight: '22px',
    },
    '.cm-content': {
      caretColor: '#f59e0b',
      padding: '12px 0',
    },
    '.cm-cursor': {
      borderLeftColor: '#f59e0b',
      borderLeftWidth: '2px',
    },
    '.cm-gutters': {
      backgroundColor: '#090d18',
      color: '#475569',
      borderRight: '1px solid #1e293b',
      paddingRight: '8px',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#1e293b/60',
      color: '#f59e0b',
      fontWeight: 'bold',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(245, 158, 11, 0.08)',
    },
    '.cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(245, 158, 11, 0.25) !important',
    },
    // Syntax Token Colors
    '.cm-keyword': { color: '#10b981', fontWeight: 'bold' }, // Phosphor green keywords
    '.cm-operator': { color: '#f59e0b' },
    '.cm-variableName': { color: '#e2e8f0' },
    '.cm-variableName.cm-definition': { color: '#38bdf8', fontWeight: '600' }, // Cyan function definitions
    '.cm-string': { color: '#fbbf24' }, // Warm amber strings
    '.cm-number': { color: '#a78bfa' }, // Purple numbers
    '.cm-comment': { color: '#64748b', fontStyle: 'italic' },
    '.cm-propertyName': { color: '#38bdf8' },
    '.cm-builtin': { color: '#06b6d4', fontWeight: 'bold' },
  },
  { dark: true }
);

interface CodeMirrorEditorProps {
  code: string;
  onChange: (value: string) => void;
  targetFilename: string;
  activeStepLine?: number;
  errorLine?: number;
  onExecute: () => void;
  onStepTrace: () => void;
  onStop: () => void;
  isRunning: boolean;
  isStepping: boolean;
}

export const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  code,
  onChange,
  targetFilename,
  activeStepLine,
  errorLine,
  onExecute,
  onStepTrace,
  onStop,
  isRunning,
  isStepping,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Line highlighting extension for active execution line and error line
  const lineHighlightExtension = useMemo<Extension>(() => [], []);

  // Keymap handlers
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        sound.playRun();
        onExecute();
      }
    },
    [onExecute]
  );

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      className="flex flex-col h-full bg-[#0a0f1d] border border-[#334155] rounded overflow-hidden select-none font-mono"
    >
      {/* Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-[#0f172a] border-b border-[#334155] text-xs gap-2">
        <div className="flex items-center gap-2">
          <FileCode className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono font-medium text-amber-300 tracking-wide text-xs">
            {targetFilename}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#1e293b] text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
            PYTHON 3.11 (WASM)
          </span>
        </div>

        {/* Stepper & Execution Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#1e293b] hover:bg-[#334155] text-[#94a3b8] hover:text-slate-100 transition text-[11px]"
            title="Copy script"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Stop / Terminate Worker Action */}
          {isRunning && (
            <button
              onClick={() => {
                sound.playAlert();
                onStop();
              }}
              title="Terminate worker immediately (halts infinite loops)"
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] uppercase transition cursor-pointer shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>STOP</span>
            </button>
          )}

          {/* Visual Step Trace Action */}
          <button
            onClick={() => {
              sound.playStep();
              onStepTrace();
            }}
            disabled={isRunning}
            title="Record execution trace and launch step debugger"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1e293b] hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/40 font-bold text-[11px] uppercase transition cursor-pointer disabled:opacity-50"
          >
            <FastForward className="w-3 h-3" />
            <span className="hidden sm:inline">STEP DEBUGGER</span>
          </button>

          {/* Standard Run Action */}
          <button
            onClick={() => {
              sound.playRun();
              onExecute();
            }}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] uppercase tracking-wider transition cursor-pointer shadow-[0_0_8px_rgba(245,158,11,0.3)] disabled:bg-[#475569] disabled:text-[#94a3b8]"
          >
            <Play className={`w-3 h-3 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'RUNNING...' : 'EXECUTE'}</span>
            <kbd className="hidden md:inline text-[9px] px-1 py-0.2 bg-amber-600/30 text-amber-950 rounded">
              ^↵
            </kbd>
          </button>
        </div>
      </div>

      {/* Active Step Line Indicator Banner */}
      {isStepping && activeStepLine !== undefined && (
        <div className="bg-cyan-950/70 border-b border-cyan-800/80 px-3 py-1 text-[11px] text-cyan-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>STEP DEBUGGER ACTIVE: Pointer at <strong>Line {activeStepLine}</strong></span>
          </span>
          <span className="text-[10px] text-[#94a3b8] italic">
            Replaying recorded states (does not alter live runtime)
          </span>
        </div>
      )}

      {/* CodeMirror 6 Workspace */}
      <div className="flex-1 relative overflow-hidden select-text">
        <CodeMirror
          value={code}
          height="100%"
          theme={industrialDarkTheme}
          extensions={[python(), lineNumbers(), highlightActiveLine(), lineHighlightExtension]}
          onChange={(val) => onChange(val)}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            tabSize: 4,
          }}
          className="h-full w-full"
        />
      </div>
    </div>
  );
};
