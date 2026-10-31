/**
 * Contracts for educational content. Content lives in `src/content/` as typed data.
 * IDs are stable: saved progress references them, so they must never change once published.
 */

export type ContentId = string;

export type Difficulty = 'introductory' | 'intermediate' | 'advanced';

/** Rich text building blocks used by lessons, bugs and library entries. */
export type ContentBlock =
  | { readonly type: 'paragraph'; readonly text: string }
  | { readonly type: 'list'; readonly ordered: boolean; readonly items: readonly string[] }
  | {
      readonly type: 'code';
      readonly language: CodeLanguage;
      readonly code: string;
      readonly caption?: string;
    }
  | {
      readonly type: 'table';
      readonly caption: string;
      readonly headers: readonly string[];
      /** Each row has one cell per header. */
      readonly rows: readonly (readonly string[])[];
    }
  | {
      readonly type: 'callout';
      readonly tone: 'info' | 'warning' | 'security';
      readonly title: string;
      readonly text: string;
    };

export type CodeLanguage =
  'html' | 'css' | 'scss' | 'javascript' | 'typescript' | 'json' | 'shell' | 'text';

export interface Competency {
  readonly id: ContentId;
  readonly title: string;
  readonly description: string;
}

/** A unit of knowledge tracked by spaced repetition (e.g. `js-closures`). */
export interface Concept {
  readonly id: ContentId;
  readonly title: string;
  readonly competencyId: ContentId;
}

export interface Phase {
  readonly id: ContentId;
  /** 0 to 13. */
  readonly order: number;
  readonly title: string;
  readonly summary: string;
  readonly introduction: readonly ContentBlock[];
  readonly topics: readonly string[];
  readonly objectives: readonly string[];
  readonly prerequisitePhaseIds: readonly ContentId[];
  /** Modules already published. A phase without modules is shown as planned. */
  readonly moduleIds: readonly ContentId[];
  /** One-sentence description of the phase project, shown on the map. */
  readonly projectBrief: string;
  readonly projectId?: ContentId;
  readonly competencyIds: readonly ContentId[];
}

export interface Module {
  readonly id: ContentId;
  readonly phaseId: ContentId;
  readonly title: string;
  readonly summary: string;
  readonly objectives: readonly string[];
  readonly prerequisiteModuleIds: readonly ContentId[];
  readonly lessonIds: readonly ContentId[];
  readonly exerciseIds: readonly ContentId[];
  readonly assessmentId?: ContentId;
  readonly projectId?: ContentId;
  readonly competencyIds: readonly ContentId[];
  readonly completionCriteria: readonly string[];
}

export type LessonStepKind =
  | 'context'
  | 'intuition'
  | 'explanation'
  | 'guided-code'
  | 'experiment'
  | 'practice'
  | 'debugging'
  | 'real-world'
  | 'assessment'
  | 'review';

export interface LessonStep {
  readonly kind: LessonStepKind;
  readonly title: string;
  readonly blocks: readonly ContentBlock[];
  /** Exercises embedded in this step (practice, debugging, assessment). */
  readonly exerciseIds?: readonly ContentId[];
}

export interface Lesson {
  readonly id: ContentId;
  readonly moduleId: ContentId;
  readonly title: string;
  readonly summary: string;
  readonly estimatedMinutes: number;
  readonly difficulty: Difficulty;
  readonly conceptIds: readonly ContentId[];
  readonly steps: readonly LessonStep[];
}

interface ExerciseBase {
  readonly id: ContentId;
  readonly title: string;
  readonly prompt: readonly ContentBlock[];
  readonly difficulty: Difficulty;
  readonly conceptIds: readonly ContentId[];
  /** Progressive hints, revealed one at a time. */
  readonly hints: readonly string[];
  /** Commented solution, unlocked only after an attempt or an explicit request. */
  readonly solution: readonly ContentBlock[];
}

export interface ChoiceOption {
  readonly id: string;
  readonly text: string;
  /** Why this option is right or wrong. Shown as feedback. */
  readonly explanation: string;
}

export interface MultipleChoiceExercise extends ExerciseBase {
  readonly kind: 'multiple-choice';
  readonly options: readonly ChoiceOption[];
  /** More than one id means the student must select all of them. */
  readonly correctOptionIds: readonly string[];
}

export interface PredictOutputExercise extends ExerciseBase {
  readonly kind: 'predict-output';
  readonly code: string;
  readonly language: CodeLanguage;
  /** Every accepted answer (compared after whitespace normalization). */
  readonly acceptedAnswers: readonly string[];
  /** Why the correct answer is what the code prints. Shown once the answer is right. */
  readonly explanation: string;
  /** Explains predictable wrong answers, so wrong feedback says *why* it is wrong. */
  readonly commonMistakes: readonly { readonly answer: string; readonly explanation: string }[];
  /** Used for wrong answers not covered by `commonMistakes`. Must not give the answer away. */
  readonly wrongAnswerGuidance: string;
}

export interface OrderStepsExercise extends ExerciseBase {
  readonly kind: 'order-steps';
  /**
   * Items in the correct order (the UI shuffles them deterministically).
   * `why` explains the position of the item and is shown when it is misplaced.
   */
  readonly items: readonly { readonly id: string; readonly text: string; readonly why: string }[];
  readonly explanation: string;
}

/** Code exercise evaluated by behavioural tests in the isolated runner. */
export interface CodeExercise extends ExerciseBase {
  readonly kind: 'code';
  readonly language: 'html' | 'css' | 'javascript' | 'typescript';
  readonly requirements: readonly string[];
  readonly examples: readonly { readonly input: string; readonly output: string }[];
  readonly starterCode: string;
  readonly tests: readonly CodeTest[];
}

export interface CodeTest {
  readonly id: string;
  readonly description: string;
  /** Test body executed inside the sandbox against the student's code. */
  readonly source: string;
}

export type Exercise =
  MultipleChoiceExercise | PredictOutputExercise | OrderStepsExercise | CodeExercise;

export type ExerciseKind = Exercise['kind'];

/** Final assessment of a module ("boss battle" at the end of a phase). */
export interface Assessment {
  readonly id: ContentId;
  readonly moduleId: ContentId;
  readonly title: string;
  readonly description: string;
  readonly exerciseIds: readonly ContentId[];
  /** Fraction (0..1) of correct exercises required to pass. */
  readonly passingScore: number;
}

export interface Mission {
  readonly id: ContentId;
  readonly title: string;
  readonly context: readonly ContentBlock[];
  readonly objective: string;
  readonly functionalRequirements: readonly string[];
  readonly technicalConstraints: readonly string[];
  readonly acceptanceCriteria: readonly string[];
  readonly difficulty: Difficulty;
  readonly hints: readonly string[];
  readonly exerciseIds: readonly ContentId[];
  readonly debrief: readonly ContentBlock[];
  readonly conceptIds: readonly ContentId[];
}

export interface ChecklistItem {
  /** Stable: saved progress references it. */
  readonly id: string;
  readonly text: string;
}

export interface ProjectStep {
  readonly id: string;
  readonly title: string;
  /** Guides the student without handing over the finished code. */
  readonly guidance: readonly ContentBlock[];
  readonly checklist: readonly ChecklistItem[];
}

/**
 * Part of a project the platform verifies for real, by running tests on code the student
 * pastes (same isolated runners as the Lab). Everything else is self-assessed.
 */
export interface ProjectAutoCheck {
  readonly language: 'html' | 'javascript';
  readonly instructions: readonly ContentBlock[];
  readonly starterCode: string;
  readonly tests: readonly CodeTest[];
}

export interface RubricCriterion {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly levels: readonly { readonly score: number; readonly description: string }[];
}

export interface Project {
  readonly id: ContentId;
  readonly phaseId: ContentId;
  readonly title: string;
  readonly briefing: readonly ContentBlock[];
  readonly problem: string;
  readonly requiredFeatures: readonly string[];
  readonly optionalFeatures: readonly string[];
  readonly suggestedArchitecture: readonly ContentBlock[];
  readonly constraints: readonly string[];
  readonly accessibilityRequirements: readonly string[];
  readonly securityRequirements: readonly string[];
  readonly testCases: readonly string[];
  readonly steps: readonly ProjectStep[];
  readonly autoCheck: ProjectAutoCheck;
  readonly completionCriteria: readonly string[];
  /** Self-assessment rubric: the student picks a level per criterion. */
  readonly rubric: readonly RubricCriterion[];
  readonly nextSteps: readonly string[];
  readonly competencyIds: readonly ContentId[];
}

export interface BugEntry {
  readonly id: ContentId;
  readonly title: string;
  readonly technology: 'html' | 'css' | 'javascript' | 'typescript' | 'angular';
  readonly difficulty: Difficulty;
  readonly symptom: string;
  readonly problematicCode: { readonly language: CodeLanguage; readonly code: string };
  readonly reproduction: readonly string[];
  readonly investigation: readonly string[];
  /** The student must commit to a diagnosis before the cause is revealed. */
  readonly diagnosisExerciseId?: ContentId;
  readonly rootCause: readonly ContentBlock[];
  readonly fix: readonly ContentBlock[];
  readonly prevention: readonly string[];
  readonly conceptIds: readonly ContentId[];
}

export interface Achievement {
  readonly id: ContentId;
  readonly title: string;
  readonly description: string;
  /** Plain-language rule shown to the student, so nothing is a mystery. */
  readonly criteria: string;
}

export type LibraryKind =
  'concept' | 'comparison' | 'glossary' | 'shortcuts' | 'pattern' | 'practice';

export type LibraryTechnology =
  | 'web'
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'angular'
  | 'security'
  | 'accessibility'
  | 'tools';

export interface Reference {
  readonly title: string;
  /** Verified to resolve (HTTP 200) when added. */
  readonly url: string;
  readonly language: 'pt-BR' | 'en';
}

/** Places inside the platform where the topic is practiced. */
export type RelatedLink =
  | { readonly type: 'lesson'; readonly id: ContentId }
  | { readonly type: 'lab'; readonly id: ContentId }
  | { readonly type: 'mission'; readonly id: ContentId }
  | { readonly type: 'bug'; readonly id: ContentId }
  | { readonly type: 'project'; readonly id: ContentId };

/** Quick-reference entry of the technical library. */
export interface LibraryEntry {
  readonly id: ContentId;
  readonly title: string;
  readonly kind: LibraryKind;
  readonly technology: LibraryTechnology;
  readonly difficulty: Difficulty;
  readonly summary: string;
  readonly body: readonly ContentBlock[];
  readonly references: readonly Reference[];
  readonly related: readonly RelatedLink[];
}
