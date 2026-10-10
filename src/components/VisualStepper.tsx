import React, { useState, useEffect } from 'react';
import { TraceResult, StepEvent } from '../types';
import { Play, Pause, SkipBack, ChevronLeft, ChevronRight, RotateCcw, X, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { sound } from '../utils/audio';

interface VisualStepperProps {
  traceResult: TraceResult | null;
  currentStepIndex: number;
  onSetStepIndex: (idx: number) => void;
  onClose: () => void;
}

export const VisualStepper: React.FC<VisualStepperProps> = ({
  traceResult,
  currentStepIndex,
  onSetStepIndex,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<number>(800); // ms per step

  const steps = traceResult?.steps || [];
  const totalSteps = steps.length;
  const currentStep: StepEvent | undefined = steps[currentStepIndex];

  // Auto-play loop
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && totalSteps > 0) {
      timer = setInterval(() => {
        if (currentStepIndex >= totalSteps - 1) {
          setIsPlaying(false);
        } else {
          sound.playStep();
          onSetStepIndex(currentStepIndex + 1);
        }
      }, playSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps, playSpeed, currentStepIndex, onSetStepIndex]);

  const handleStepNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      sound.playStep();
      onSetStepIndex(currentStepIndex + 1);
    }
  };

  const handleStepPrev = () => {
    if (currentStepIndex > 0) {
      sound.playStep();
      onSetStepIndex(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setIsPlaying(false);
    onSetStepIndex(0);
  };

  if (!traceResult) return null;

  return (
    <div className="bg-[#0c1222] border-t border-[#334155] p-3 flex flex-col gap-3 font-mono text-xs select-none">
      {/* Top Stepper Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] p-2 rounded border border-[#1e293b]">
        {/* Playback Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            title="Reset to start of execution"
            className="p-1.5 rounded bg-[#1e293b] hover:bg-[#334155] text-slate-300 transition"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleStepPrev}
            disabled={currentStepIndex <= 0}
            title="Step Back [Replay prior snapshot]"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1e293b] hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-bold transition disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setIsPlaying(!isPlaying);
            }}
            title={isPlaying ? 'Pause auto-play' : 'Auto-play trace'}
            className="flex items-center gap-1 px-3 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={handleStepNext}
            disabled={currentStepIndex >= totalSteps - 1}
            title="Step Next [Advance to next line]"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1e293b] hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-bold transition disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Indicator & Speed */}
        <div className="flex items-center gap-3">
          <div className="text-[11px] text-[#94a3b8]">
            STEP: <strong className="text-amber-400 font-bold">{totalSteps > 0 ? currentStepIndex + 1 : 0}</strong> / {totalSteps}
            {currentStep && (
              <span className="ml-2 text-cyan-300 font-semibold">
                (Line {currentStep.line} · {currentStep.event.toUpperCase()})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] text-[#64748b]">
            <span>SPEED:</span>
            <select
              value={playSpeed}
              onChange={(e) => setPlaySpeed(Number(e.target.value))}
              className="bg-[#1e293b] border border-[#334155] rounded px-1.5 py-0.5 text-slate-200 outline-none text-[10px]"
            >
              <option value={1200}>0.5x Slow</option>
              <option value={800}>1.0x Normal</option>
              <option value={400}>2.0x Fast</option>
            </select>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            title="Exit Step Debugger"
            className="p-1 rounded bg-[#1e293b] hover:bg-red-500 hover:text-white text-[#94a3b8] transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Disclaimers & Loop Iteration Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#64748b] px-1">
        <span className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-cyan-400" />
          Stepping backward replays recorded snapshots; it does not reverse live Python state.
        </span>

        {currentStep?.loopInfo && (
          <div className="bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded text-amber-300 font-bold flex items-center gap-1 text-[11px]">
            <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
            <span>
              LOOP ITERATION #{currentStep.loopInfo.iteration}: variable <code>{currentStep.loopInfo.variableName} = {currentStep.loopInfo.currentValue}</code>
            </span>
          </div>
        )}

        {traceResult.capped && (
          <span className="text-amber-400 font-semibold">
            (Trace capped at 300 events for safety)
          </span>
        )}
      </div>

      {/* Snapshot Inspector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[90px]">
        {/* Variable Mutations Table */}
        <div className="bg-[#090d18] border border-[#1e293b] rounded p-2 flex flex-col gap-1 overflow-y-auto max-h-36">
          <div className="flex items-center justify-between text-[10px] text-[#64748b] border-b border-[#1e293b] pb-1">
            <span className="font-bold uppercase">SNAPSHOT VARIABLES (AT LINE {currentStep?.line || '-'})</span>
            <span className="text-amber-400 text-[9px]">Glow = Mutated This Step</span>
          </div>

          {currentStep?.variables && Object.keys(currentStep.variables).length > 0 ? (
            <div className="grid grid-cols-1 gap-1 text-[11px]">
              {Object.entries(currentStep.variables).map(([name, state]) => (
                <div
                  key={name}
                  className={`flex items-center justify-between px-2 py-1 rounded transition ${
                    state.changed
                      ? 'bg-amber-950/40 border border-amber-500/70 text-amber-200'
                      : 'bg-[#0f172a]/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-300">{name}</span>
                    <span className="text-[10px] text-[#64748b]">({state.type})</span>
                  </div>
                  <span className={`font-mono ${state.changed ? 'text-amber-300 font-bold' : 'text-slate-200'}`}>
                    {state.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[#64748b] italic py-2 text-[11px]">
              No local variables initialized at this step.
            </div>
          )}
        </div>

        {/* Console STDOUT at this step */}
        <div className="bg-[#090d18] border border-[#1e293b] rounded p-2 flex flex-col gap-1 overflow-y-auto max-h-36">
          <div className="text-[10px] text-[#64748b] border-b border-[#1e293b] pb-1 font-bold uppercase">
            TERMINAL EMISSION AT THIS STEP
          </div>
          <pre className="text-emerald-400 font-mono text-[11px] whitespace-pre-wrap overflow-auto flex-1">
            {currentStep?.stdout || '(No terminal output emitted yet)'}
          </pre>
        </div>
      </div>
    </div>
  );
};
