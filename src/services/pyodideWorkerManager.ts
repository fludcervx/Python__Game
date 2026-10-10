import { DiagnosticReport, Mission, TraceResult, VariableEntry } from '../types';

type WorkerStatus = 'LOADING' | 'READY' | 'RUNNING' | 'ERROR' | 'TERMINATED';

class PyodideWorkerManager {
  private worker: Worker | null = null;
  private messageIdCounter = 0;
  private pendingRequests = new Map<number, { resolve: (val: any) => void; reject: (err: any) => void; timer: any }>();
  private statusListeners: ((status: WorkerStatus) => void)[] = [];
  public status: WorkerStatus = 'LOADING';

  constructor() {
    this.spawnWorker();
  }

  public onStatusChange(listener: (status: WorkerStatus) => void): () => void {
    this.statusListeners.push(listener);
    listener(this.status);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  private setStatus(status: WorkerStatus) {
    this.status = status;
    this.statusListeners.forEach(l => l(status));
  }

  private spawnWorker() {
    try {
      this.setStatus('LOADING');
      // Create dedicated Web Worker using Vite module worker syntax
      this.worker = new Worker(new URL('../workers/pyodideWorker.ts', import.meta.url), {
        type: 'module'
      });

      this.worker.onmessage = (event: MessageEvent) => {
        const { id, success, payload, error } = event.data;
        const pending = this.pendingRequests.get(id);
        if (pending) {
          clearTimeout(pending.timer);
          this.pendingRequests.delete(id);
          if (this.status === 'RUNNING') {
            this.setStatus('READY');
          }
          if (success) {
            pending.resolve(payload);
          } else {
            pending.reject(new Error(error || 'Worker execution failed'));
          }
        }
      };

      this.worker.onerror = (err) => {
        console.error('Pyodide Worker Error:', err);
        this.setStatus('ERROR');
        // Reject all pending
        this.pendingRequests.forEach(({ reject, timer }) => {
          clearTimeout(timer);
          reject(new Error('Web Worker error encountered'));
        });
        this.pendingRequests.clear();
      };

      // Ping test
      this.sendRequest('PING', {}, 15000)
        .then(() => {
          this.setStatus('READY');
        })
        .catch(() => {
          this.setStatus('ERROR');
        });
    } catch (e) {
      console.error('Failed to spawn Pyodide worker:', e);
      this.setStatus('ERROR');
    }
  }

  private sendRequest(type: string, payload: any, timeoutMs = 12000): Promise<any> {
    if (!this.worker) {
      this.spawnWorker();
    }

    return new Promise((resolve, reject) => {
      const id = ++this.messageIdCounter;
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          this.stopExecution();
          reject(new Error(`Execution timed out (${timeoutMs / 1000}s limit). Infinite loop or heavy calculation stopped.`));
        }
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timer });
      if (this.status === 'READY') {
        this.setStatus('RUNNING');
      }
      this.worker!.postMessage({ id, type, payload });
    });
  }

  /**
   * Stop active execution immediately by killing and restarting the worker
   */
  public stopExecution() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.forEach(({ reject, timer }) => {
      clearTimeout(timer);
      reject(new Error('Execution terminated by user stop command.'));
    });
    this.pendingRequests.clear();
    this.setStatus('TERMINATED');

    // Immediately reboot fresh worker
    setTimeout(() => {
      this.spawnWorker();
    }, 200);
  }

  /**
   * Evaluate user mission submission
   */
  public async evaluateMission(mission: Mission, userCode: string): Promise<DiagnosticReport> {
    if (this.status === 'ERROR') {
      return {
        passed: false,
        stageReached: 1,
        category: 'RUNTIME_EXCEPTION',
        title: 'Pyodide WebAssembly Engine Offline',
        message: 'The WebAssembly Python runtime could not be initialized. Please check network connectivity or reload.',
        stdout: '',
        stderr: 'Pyodide initialization failure.',
        testResults: [],
        variables: [],
        callFrames: []
      };
    }

    try {
      const report: DiagnosticReport = await this.sendRequest('EVALUATE_MISSION', { mission, userCode }, 12000);
      
      // Enrich with pedagogical suggestions
      if (!report.passed) {
        if (report.category === 'SYNTAX_ERROR') {
          report.suggestion = mission.stageAssistance.stage3Diagnosis.probableCause || 'Review syntax on the indicated line.';
        } else if (report.category === 'RUNTIME_EXCEPTION') {
          report.suggestion = mission.stageAssistance.stage2Rule.explanation;
        } else {
          report.suggestion = mission.stageAssistance.stage1Nudge;
        }
      } else {
        report.suggestion = mission.stageAssistance.stage5WorkedSolution.whyItWorks;
      }
      return report;
    } catch (err: any) {
      return {
        passed: false,
        stageReached: 2,
        category: 'RUNTIME_EXCEPTION',
        title: 'Execution Watchdog Stopped Process',
        message: String(err?.message || err),
        suggestion: 'Check for potential infinite loops (e.g. while loops without advance) or excessive memory usage.',
        stdout: '',
        stderr: String(err?.message || err),
        testResults: [],
        variables: [],
        callFrames: []
      };
    }
  }

  /**
   * Record step-by-step execution trace via sys.settrace()
   */
  public async recordStepTrace(code: string): Promise<TraceResult> {
    try {
      const result: TraceResult = await this.sendRequest('STEP_TRACE', { code }, 8000);
      return result;
    } catch (err: any) {
      return {
        success: false,
        steps: [],
        totalSteps: 0,
        capped: false,
        stdout: '',
        stderr: String(err?.message || err),
        error: String(err?.message || err)
      };
    }
  }

  /**
   * Run freeform code in sandbox
   */
  public async runFreeform(code: string): Promise<{ stdout: string; stderr: string; variables: VariableEntry[] }> {
    try {
      return await this.sendRequest('RUN_FREEFORM', { code }, 10000);
    } catch (err: any) {
      return {
        stdout: '',
        stderr: String(err?.message || err),
        variables: []
      };
    }
  }
}

export const workerManager = new PyodideWorkerManager();
