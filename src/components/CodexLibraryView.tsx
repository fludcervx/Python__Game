import React, { useState } from 'react';
import { CODEX_DOCS, DocEntry } from '../data/codexDocs';
import { BookOpen, Search, Code, AlertCircle, Copy, Check, Terminal } from 'lucide-react';
import { sound } from '../utils/audio';

export const CodexLibraryView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<DocEntry>(CODEX_DOCS[0]);
  const [copied, setCopied] = useState(false);

  const filteredDocs = CODEX_DOCS.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase()) ||
    d.summary.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (text: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden select-none font-mono text-xs">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] p-3 rounded border border-[#334155]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="font-['Orbitron'] font-bold text-amber-300 text-sm">
            SYSTEM CODEX // REFERENCE MANUAL
          </span>
          <span className="text-[#64748b] hidden sm:inline">• Offline Python Architectural Handbook</span>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search syntax, errors, operators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1e293b] border border-[#334155] rounded pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-[#64748b] outline-none focus:border-amber-400 transition"
          />
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
        {/* Left: Table of Contents */}
        <div className="flex flex-col bg-[#0c1222] border border-[#334155] rounded overflow-y-auto p-2 gap-1.5">
          <span className="text-[10px] text-[#64748b] uppercase font-bold px-2 py-1">
            CODEX SECTIONS ({filteredDocs.length})
          </span>
          {filteredDocs.map((doc) => {
            const isSelected = selectedEntry.id === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedEntry(doc);
                }}
                className={`text-left p-2.5 rounded border transition flex flex-col gap-0.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500/80 text-amber-300'
                    : 'bg-[#1e293b]/40 border-transparent text-slate-300 hover:bg-[#1e293b] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-[#64748b]">
                  <span>{doc.category}</span>
                </div>
                <div className="font-bold text-xs">{doc.title}</div>
                <p className="text-[11px] text-[#94a3b8] font-sans line-clamp-1">{doc.summary}</p>
              </button>
            );
          })}
        </div>

        {/* Right: Detailed Doc Entry */}
        <div className="md:col-span-2 flex flex-col bg-[#0a0f1d] border border-[#334155] rounded overflow-y-auto p-4 gap-4 select-text">
          <div className="flex items-center justify-between border-b border-[#334155] pb-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                {selectedEntry.category}
              </span>
              <h2 className="text-lg font-bold text-slate-100 font-['Rajdhani']">
                {selectedEntry.title}
              </h2>
              <p className="text-[#94a3b8] font-sans text-xs">{selectedEntry.summary}</p>
            </div>
            <button
              onClick={() => handleCopy(selectedEntry.example)}
              className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-amber-500/20 text-[#cbd5e1] hover:text-amber-300 border border-[#334155] text-[11px] transition flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Example'}</span>
            </button>
          </div>

          {/* Syntax Formulation */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-[#64748b] uppercase font-bold flex items-center gap-1">
              <Code className="w-3 h-3 text-cyan-400" /> CANONICAL SYNTAX FORMULA
            </span>
            <pre className="bg-[#0f172a] text-cyan-300 p-3 rounded border border-cyan-900/40 text-[11px] overflow-x-auto">
              {selectedEntry.syntax}
            </pre>
          </div>

          {/* Deep Architectural Explanation */}
          <div className="flex flex-col gap-1.5 font-sans">
            <span className="text-[10px] font-mono text-[#64748b] uppercase font-bold">
              MECHANICS & EXECUTION BEHAVIOR
            </span>
            <p className="text-slate-200 text-xs leading-relaxed bg-[#111827]/60 p-3 rounded border border-[#1e293b]">
              {selectedEntry.explanation}
            </p>
          </div>

          {/* Practical Concrete Example */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-[#64748b] uppercase font-bold flex items-center gap-1">
              <Terminal className="w-3 h-3 text-emerald-400" /> PRACTICAL WORKSTATION EXAMPLE
            </span>
            <pre className="bg-[#0c1222] text-emerald-300 p-3 rounded border border-emerald-900/40 text-[11px] overflow-x-auto">
              {selectedEntry.example}
            </pre>
          </div>

          {/* Common Pitfalls & Traps */}
          <div className="flex flex-col gap-1.5 font-sans bg-amber-950/20 border border-amber-900/40 p-3 rounded">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> COMMON PITFALLS & FAILURE POINTS
            </span>
            <ul className="flex flex-col gap-1.5 text-xs text-slate-300 mt-1">
              {selectedEntry.commonPitfalls.map((pitfall, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span>{pitfall}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
