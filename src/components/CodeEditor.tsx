import React, { useRef, useEffect, useState } from 'react';
import { Copy, Check, FileCode, Code2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  targetFilename: string;
  errorLine?: number;
  onExecute: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  targetFilename,
  errorLine,
  onExecute
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const lines = code.split('\n');

  // Handle Tab indentation (4 spaces) and Ctrl+Enter hotkey
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onExecute();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      sound.playClick();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '    ';

      if (!e.shiftKey) {
        const newCode = code.substring(0, start) + spaces + code.substring(end);
        onChange(newCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);
      } else {
        // Unindent
        const lineStart = code.lastIndexOf('\n', start - 1) + 1;
        if (code.substring(lineStart, lineStart + 4) === '    ') {
          const newCode = code.substring(0, lineStart) + code.substring(lineStart + 4);
          onChange(newCode);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - 4);
          }, 0);
        }
      }
    }
  };

  const handleCursorMove = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const textBefore = code.substring(0, pos);
    const lineNum = textBefore.split('\n').length;
    const lastNewline = textBefore.lastIndexOf('\n');
    const colNum = lastNewline === -1 ? pos + 1 : pos - lastNewline;
    setCursorPos({ line: lineNum, col: colNum });
  };

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] border border-[#334155] rounded overflow-hidden select-none">
      {/* File Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0f172a] border-b border-[#334155] text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <FileCode className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono font-medium text-amber-300 tracking-wide">
            {targetFilename}
          </span>
          <span className="text-[#64748b] text-[10px] hidden sm:inline">• UTF-8</span>
        </div>

        <div className="flex items-center gap-3 text-[#64748b]">
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          </div>

          <div className="h-3 w-px bg-[#334155]" />

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#1e293b] hover:text-slate-200 transition text-[11px]"
            title="Copy Python Code"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <span className="px-1.5 py-0.5 rounded bg-[#1e293b] text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
            PYTHON 3.11
          </span>
        </div>
      </div>

      {/* Editor Main Canvas with Line Numbers */}
      <div className="flex flex-1 relative overflow-hidden select-text font-mono text-[13px] leading-relaxed">
        {/* Line Numbers Gutter */}
        <div className="w-12 py-3 bg-[#0c1222] border-r border-[#1e293b] text-right pr-3 select-none text-[#475569] font-mono text-xs overflow-hidden flex flex-col">
          {lines.map((_, i) => {
            const lineNum = i + 1;
            const isError = errorLine === lineNum;
            return (
              <div
                key={i}
                className={`h-[22px] transition ${
                  isError
                    ? 'text-red-400 font-bold bg-red-500/20 -mr-3 pr-3 border-r-2 border-red-500'
                    : cursorPos.line === lineNum
                    ? 'text-amber-300/80 font-semibold'
                    : ''
                }`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Textarea Code Input */}
        <div className="flex-1 relative h-full">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyUp={handleCursorMove}
            onClick={handleCursorMove}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="w-full h-full py-3 px-4 bg-transparent text-[#e2e8f0] font-mono text-[13px] leading-[22px] outline-none resize-none border-none whitespace-pre overflow-auto font-normal tab-4 caret-amber-400 focus:ring-0 selection:bg-amber-500/30"
            style={{ tabSize: 4 }}
          />

          {/* Quick tip overlay at bottom right */}
          <div className="absolute bottom-2 right-4 pointer-events-none opacity-40 hover:opacity-100 transition text-[10px] text-[#94a3b8] font-mono bg-[#0f172a]/80 px-2 py-0.5 rounded border border-[#334155]">
            Press <kbd className="text-amber-400 font-bold">Ctrl+Enter</kbd> to execute
          </div>
        </div>
      </div>
    </div>
  );
};
