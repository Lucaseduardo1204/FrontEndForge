/**
 * Messages exchanged with the isolated runners (worker and preview iframe).
 * Everything that comes back is untrusted: it is validated and size-limited here
 * before reaching the UI.
 */

export interface LogEntry {
  readonly level: 'log' | 'info' | 'warn' | 'error';
  readonly text: string;
}

export interface TestOutcome {
  readonly id: string;
  readonly passed: boolean;
  readonly message: string;
}

export interface RunError {
  readonly name: string;
  readonly message: string;
}

export interface RunReport {
  readonly logs: readonly LogEntry[];
  /** Error thrown by the student's code on the plain run (not by a test). */
  readonly error: RunError | null;
  readonly tests: readonly TestOutcome[];
}

export type RunResult =
  | { readonly status: 'completed'; readonly report: RunReport; readonly durationMs: number }
  | { readonly status: 'timeout'; readonly timeoutMs: number }
  | { readonly status: 'compile-error'; readonly message: string }
  | { readonly status: 'unavailable'; readonly message: string };

export interface RunRequest {
  readonly type: 'run';
  readonly runId: string;
  readonly code: string;
  readonly tests: readonly { readonly id: string; readonly source: string }[];
}

export const LIMITS = { logs: 200, text: 2000, tests: 50 } as const;

const LEVELS = new Set(['log', 'info', 'warn', 'error']);

/** The iframe runner announces it started, so "never started" is not mistaken for a timeout. */
export function isReadyMessage(data: unknown, runId: string): boolean {
  return isRecord(data) && data['type'] === 'ready' && data['runId'] === runId;
}

/** Returns the report only for a well-formed `result` message of the expected run. */
export function parseRunnerMessage(data: unknown, runId: string): RunReport | null {
  if (!isRecord(data) || data['type'] !== 'result' || data['runId'] !== runId) return null;
  const { logs, error, tests } = data;
  if (!Array.isArray(logs) || !Array.isArray(tests)) return null;

  const parsedLogs: LogEntry[] = [];
  for (const entry of logs.slice(0, LIMITS.logs)) {
    if (!isRecord(entry) || !LEVELS.has(entry['level'] as string)) return null;
    if (typeof entry['text'] !== 'string') return null;
    parsedLogs.push({ level: entry['level'] as LogEntry['level'], text: clip(entry['text']) });
  }

  const parsedTests: TestOutcome[] = [];
  for (const test of tests.slice(0, LIMITS.tests)) {
    if (!isRecord(test) || typeof test['id'] !== 'string' || typeof test['passed'] !== 'boolean') {
      return null;
    }
    if (typeof test['message'] !== 'string') return null;
    parsedTests.push({ id: test['id'], passed: test['passed'], message: clip(test['message']) });
  }

  let parsedError: RunError | null = null;
  if (error !== null) {
    if (!isRecord(error) || typeof error['name'] !== 'string') return null;
    if (typeof error['message'] !== 'string') return null;
    parsedError = { name: clip(error['name']), message: clip(error['message']) };
  }

  return { logs: parsedLogs, error: parsedError, tests: parsedTests };
}

function clip(text: string): string {
  return text.length > LIMITS.text ? `${text.slice(0, LIMITS.text)}… (cortado)` : text;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
