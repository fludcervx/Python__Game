/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MISSIONS } from './data/missions';
import { Mission, DiagnosticReport, TraceResult, UserProgress } from './types';
import { workerManager } from './services/pyodideWorkerManager';
import { sound } from './utils/audio';

import { Navbar } from './components/Navbar';
import { BriefingPanel } from './components/BriefingPanel';
import { CodeMirrorEditor } from './components/CodeMirrorEditor';
import { VisualStepper } from './components/VisualStepper';
import { DiagnosticsDock } from './components/DiagnosticsDock';
import { AssistanceLadder } from './components/AssistanceLadder';
import { SandboxView } from './components/SandboxView';
import { CodexLibraryView } from './components/CodexLibraryView';
import { MissionLogsView } from './components/MissionLogsView';

const STORAGE_KEY = 'sys_codex_progress_v2_5';

export default function App() {
  const [missions] = useState<Mission[]>(MISSIONS);
  const [currentMissionId, setCurrentMissionId] = useState<string>(() => {
    return localStorage.getItem('sys_codex_last_node') || MISSIONS[0].id;
  });

  const currentMission = missions.find(m => m.id === currentMissionId) || missions[0];

  // User progress state with localStorage sync
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          solvedMissions: parsed.solvedMissions || [],
          progressionMode: parsed.progressionMode || 'structured',
          unlockedStages: parsed.unlockedStages || {},
          codeSubmissions: parsed.codeSubmissions || {},
          investigateSolved: parsed.investigateSolved || {},
          soundEnabled: parsed.soundEnabled ?? true,
          fontScale: parsed.fontScale || 'md'
        };
      }
    } catch {}
    return {
      solvedMissions: [],
      progressionMode: 'structured',
      unlockedStages: {},
      codeSubmissions: {},
      investigateSolved: {},
      soundEnabled: true,
      fontScale: 'md'
    };
  });

  // Current code in editor
  const [code, setCode] = useState<string>(() => {
    return progress.codeSubmissions[currentMission.id] || currentMission.starterCode;
  });

  // Telemetry execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [engineStatus, setEngineStatus] = useState<string>(workerManager.status);

  // Visual Stepper state
  const [traceResult, setTraceResult] = useState<TraceResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isStepping, setIsStepping] = useState<boolean>(false);

  // View state
  const [activeTab, setActiveTab] = useState<'operations' | 'sandbox' | 'codex' | 'logs'>('operations');
  const [isLadderOpen, setIsLadderOpen] = useState<boolean>(false);

  // Sync worker status
  useEffect(() => {
    return workerManager.onStatusChange((status) => {
      setEngineStatus(status);
    });
  }, []);

  // Update sound engine
  useEffect(() => {
    sound.enabled = progress.soundEnabled;
  }, [progress.soundEnabled]);

  // Persist progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      localStorage.setItem('sys_codex_last_node', currentMissionId);
    } catch {}
  }, [progress, currentMissionId]);

  // Switch mission
  const handleSelectMission = useCallback((missionId: string) => {
    const nextMission = missions.find(m => m.id === missionId);
    if (!nextMission) return;

    // Save current code before switching
    setProgress(prev => ({
      ...prev,
      codeSubmissions: {
        ...prev.codeSubmissions,
        [currentMissionId]: code
      }
    }));

    setCurrentMissionId(missionId);
    const existingCode = progress.codeSubmissions[missionId] || nextMission.starterCode;
    setCode(existingCode);
    setReport(null);
    setIsStepping(false);
    setTraceResult(null);
  }, [missions, currentMissionId, code, progress.codeSubmissions]);

  // Code editor updates
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setProgress(prev => ({
      ...prev,
      codeSubmissions: {
        ...prev.codeSubmissions,
        [currentMissionId]: newCode
      }
    }));
  };

  // Reset code to starter template
  const handleResetCode = () => {
    setCode(currentMission.starterCode);
    setReport(null);
    setIsStepping(false);
    setTraceResult(null);
    setProgress(prev => ({
      ...prev,
      codeSubmissions: {
        ...prev.codeSubmissions,
        [currentMissionId]: currentMission.starterCode
      }
    }));
  };

  // Stop / Terminate Worker
  const handleStopExecution = () => {
    workerManager.stopExecution();
    setIsRunning(false);
    sound.playAlert();
    setReport({
      passed: false,
      stageReached: 1,
      category: 'RUNTIME_EXCEPTION',
      title: 'Execution Terminated by User',
      message: 'The dedicated execution worker was forcefully terminated and rebooted. Any running loop was cancelled.',
      stdout: '',
      stderr: 'Process halted by user stop command.',
      testResults: [],
      variables: [],
      callFrames: []
    });
  };

  // Run behavioral test suite and diagnostic engine
  const handleRunDiagnostics = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsStepping(false);

    try {
      const diagReport = await workerManager.evaluateMission(currentMission, code);
      setReport(diagReport);

      if (diagReport.passed) {
        sound.playSuccess();
        setProgress(prev => ({
          ...prev,
          solvedMissions: Array.from(new Set([...prev.solvedMissions, currentMission.id]))
        }));
      } else {
        sound.playAlert();
      }
    } catch (err: any) {
      sound.playAlert();
      setReport({
        passed: false,
        stageReached: 2,
        category: 'RUNTIME_EXCEPTION',
        title: 'Diagnostic Engine Exception',
        message: String(err?.message || err),
        stdout: '',
        stderr: String(err?.message || err),
        testResults: [],
        variables: [],
        callFrames: []
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Record execution trace via sys.settrace and launch visual debugger
  const handleStepTrace = async () => {
    if (isRunning) return;
    setIsRunning(true);
    try {
      const trace = await workerManager.recordStepTrace(code);
      setTraceResult(trace);
      setCurrentStepIndex(0);
      setIsStepping(true);
      if (trace.error) {
        sound.playAlert();
      } else {
        sound.playStep();
      }
    } catch (err: any) {
      sound.playAlert();
    } finally {
      setIsRunning(false);
    }
  };

  // Progression mode toggle (Structured vs Free)
  const handleToggleProgressionMode = () => {
    setProgress(prev => ({
      ...prev,
      progressionMode: prev.progressionMode === 'structured' ? 'free' : 'structured'
    }));
  };

  // 5-Stage Ladder operations
  const currentUnlockedStage = progress.unlockedStages[currentMission.id] || 1;

  const handleUnlockNextStage = () => {
    const nextStage = Math.min(5, currentUnlockedStage + 1);
    setProgress(prev => ({
      ...prev,
      unlockedStages: {
        ...prev.unlockedStages,
        [currentMission.id]: nextStage
      }
    }));
  };

  const handleApplyReferenceCode = (refCode: string) => {
    handleCodeChange(refCode);
  };

  const handleToggleSound = () => {
    setProgress(prev => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }));
  };

  const handleSolveInvestigate = () => {
    setProgress(prev => ({
      ...prev,
      investigateSolved: {
        ...prev.investigateSolved,
        [currentMission.id]: true
      }
    }));
  };

  // Check if mission is locked in structured mode
  const isCurrentMissionLocked =
    progress.progressionMode === 'structured' &&
    Boolean(currentMission.prerequisiteId) &&
    !progress.solvedMissions.includes(currentMission.prerequisiteId!);

  const prereqMission = currentMission.prerequisiteId
    ? missions.find(m => m.id === currentMission.prerequisiteId)
    : undefined;

  const activeStepLine = isStepping && traceResult?.steps[currentStepIndex]
    ? traceResult.steps[currentStepIndex].line
    : undefined;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070b14] text-[#e2e8f0] font-mono overflow-hidden relative">
      {/* Subtle CRT scanline overlay */}
      <div className="crt-overlay absolute inset-0 z-10 pointer-events-none opacity-25" />

      {/* Industrial Telemetry Top Header */}
      <Navbar
        currentMission={currentMission}
        missions={missions}
        onSelectMission={handleSelectMission}
        onResetCode={handleResetCode}
        engineStatus={engineStatus}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={progress.soundEnabled}
        onToggleSound={handleToggleSound}
        solvedCount={progress.solvedMissions.length}
        progressionMode={progress.progressionMode}
        onToggleProgressionMode={handleToggleProgressionMode}
        solvedMissions={progress.solvedMissions}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex overflow-hidden relative z-0">
        {/* VIEW 1: OPERATIONS WORKSTATION */}
        {activeTab === 'operations' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 min-h-0 overflow-hidden">
            {/* Left Console: Mission Briefing, Concept & Test Vectors (5 cols on lg) */}
            <div className="lg:col-span-5 h-full overflow-hidden flex flex-col min-h-0">
              <BriefingPanel
                mission={currentMission}
                diagnosticReport={report}
                onOpenLadder={() => setIsLadderOpen(true)}
                investigateSolved={Boolean(progress.investigateSolved[currentMission.id])}
                onSolveInvestigate={handleSolveInvestigate}
                isLocked={isCurrentMissionLocked}
                prerequisiteMissionTitle={prereqMission?.title}
                onJumpToPrerequisite={() => prereqMission && handleSelectMission(prereqMission.id)}
              />
            </div>

            {/* Right Console: Code Canvas & Diagnostics Dock (7 cols on lg) */}
            <div className="lg:col-span-7 h-full flex flex-col gap-3 min-h-0 overflow-hidden">
              {/* Code Canvas with CodeMirror 6 */}
              <div className="flex-[1.1] min-h-0 overflow-hidden flex flex-col">
                <CodeMirrorEditor
                  code={code}
                  onChange={handleCodeChange}
                  targetFilename={currentMission.targetFilename}
                  activeStepLine={activeStepLine}
                  errorLine={report?.errorLine}
                  onExecute={handleRunDiagnostics}
                  onStepTrace={handleStepTrace}
                  onStop={handleStopExecution}
                  isRunning={isRunning}
                  isStepping={isStepping}
                />

                {/* Visual Stepper Drawer (when Step Trace active) */}
                {isStepping && (
                  <VisualStepper
                    traceResult={traceResult}
                    currentStepIndex={currentStepIndex}
                    onSetStepIndex={(idx) => setCurrentStepIndex(idx)}
                    onClose={() => setIsStepping(false)}
                  />
                )}
              </div>

              {/* Diagnostics Dock (Bottom) */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <DiagnosticsDock
                  report={report}
                  isRunning={isRunning}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: FREEFORM PYTHON SANDBOX */}
        {activeTab === 'sandbox' && <SandboxView />}

        {/* VIEW 3: SYSTEM CODEX DOCUMENTATION */}
        {activeTab === 'codex' && <CodexLibraryView />}

        {/* VIEW 4: MISSION LOGS & CURRICULUM ROADMAP */}
        {activeTab === 'logs' && (
          <MissionLogsView
            missions={missions}
            userProgress={progress}
            onSelectMission={(mId) => {
              handleSelectMission(mId);
              setActiveTab('operations');
            }}
            onClose={() => setActiveTab('operations')}
          />
        )}
      </main>

      {/* 5-Stage Adaptive Assistance Ladder Modal */}
      <AssistanceLadder
        isOpen={isLadderOpen}
        onClose={() => setIsLadderOpen(false)}
        assistance={currentMission.stageAssistance}
        unlockedStage={currentUnlockedStage}
        onUnlockNextStage={handleUnlockNextStage}
        onApplyReferenceCode={handleApplyReferenceCode}
      />
    </div>
  );
}
