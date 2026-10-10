export type MissionCategory = 'Build' | 'Repair' | 'Optimize' | 'Investigate' | 'Create';

export type MissionDifficulty = 'Foundational' | 'Intermediate' | 'Advanced';

export type VerificationMode = 'function' | 'stdout' | 'variables';

export interface TestCase {
  name: string;
  input: any[];
  expectedOutput: any;
  description?: string;
  isHidden?: boolean;
}

export interface TestResult {
  name: string;
  input: any[];
  expectedOutput: any;
  actualOutput?: any;
  passed: boolean;
  error?: string;
  executionTimeMs?: number;
}

export interface StageAssistance {
  stage1Nudge: string;
  stage2Rule: {
    title: string;
    explanation: string;
    documentationSnippet?: string;
  };
  stage3Diagnosis: {
    probableCause: string;
    astClues: string;
    lineHints?: number[];
  };
  stage4MicroExample: {
    concept: string;
    sampleCode: string;
    takeaway: string;
  };
  stage5WorkedSolution: {
    referenceCode: string;
    whyItWorks: string;
    transferChallenge: {
      prompt: string;
      expectedBehavior: string;
    };
  };
}

export interface InvestigateQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Mission {
  id: string;
  prerequisiteId?: string;
  blockId: number;
  blockTitle: string;
  nodeCode: string;
  title: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  conceptBrief: string;
  briefing: string;
  narrativeContext: string;
  targetFilename: string;
  starterCode: string;
  referenceSolution: string;
  verificationMode: VerificationMode;
  functionName?: string;
  expectedStdoutContains?: string[];
  expectedVariables?: Record<string, any>;
  learningObjectives: string[];
  prerequisites: string[];
  testCases: TestCase[];
  stageAssistance: StageAssistance;
  investigateQuestions?: InvestigateQuestion[];
}

export interface VariableEntry {
  name: string;
  type: string;
  value: string;
  mutable: boolean;
  size?: number | string;
  changed?: boolean;
}

export interface FrameEntry {
  name: string;
  depth: number;
  line: number;
  arguments: Record<string, string>;
  locals: Record<string, string>;
}

export interface ASTInfo {
  syntaxValid: boolean;
  detectedFunctions: string[];
  detectedLoops: string[];
  detectedTypeCasts: string[];
  detectedComparisons: string[];
  detectedImports: string[];
  astSummary: string;
}

export interface DiagnosticReport {
  passed: boolean;
  stageReached: number;
  category: 'SUCCESS' | 'SYNTAX_ERROR' | 'RUNTIME_EXCEPTION' | 'TYPE_ERROR' | 'LOGIC_ERROR' | 'MISSING_FUNCTION' | 'INCORRECT_RETURN_TYPE' | 'INVESTIGATION_PENDING';
  title: string;
  message: string;
  suggestion?: string;
  errorLine?: number;
  stdout: string;
  stderr: string;
  testResults: TestResult[];
  variables: VariableEntry[];
  callFrames: FrameEntry[];
  astInfo?: ASTInfo;
}

export interface StepVariableState {
  type: string;
  value: string;
  changed: boolean;
}

export interface StepEvent {
  stepNumber: number;
  line: number;
  event: 'line' | 'call' | 'return' | 'exception';
  funcName: string;
  variables: Record<string, StepVariableState>;
  stdout: string;
  loopInfo?: {
    variableName: string;
    currentValue: string;
    iteration: number;
  };
}

export interface TraceResult {
  success: boolean;
  steps: StepEvent[];
  totalSteps: number;
  capped: boolean;
  stdout: string;
  stderr?: string;
  error?: string;
}

export interface UserProgress {
  solvedMissions: string[];
  progressionMode: 'structured' | 'free';
  unlockedStages: Record<string, number>; // missionId -> highest assistance stage unlocked (1-5)
  codeSubmissions: Record<string, string>; // missionId -> user's current or last code
  investigateSolved: Record<string, boolean>; // missionId -> whether prediction answered
  soundEnabled: boolean;
  fontScale: 'sm' | 'md' | 'lg';
}
