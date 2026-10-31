import { inject, Injectable, InjectionToken } from '@angular/core';
import { parseRunnerMessage, RunRequest, RunResult } from './lab-protocol';
import { WORKER_RUNNER_SOURCE } from './runner-source';

/** Minimal surface of a Worker, so tests can provide a fake. */
export interface RunnerWorker {
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage(message: unknown): void;
  terminate(): void;
}

/**
 * Creates the isolated worker. A `data:` URL worker gets an opaque origin: it cannot read
 * the application's storage, IndexedDB or cookies, and runs on its own thread.
 */
export const RUNNER_WORKER_FACTORY = new InjectionToken<() => RunnerWorker>(
  'RUNNER_WORKER_FACTORY',
  {
    providedIn: 'root',
    factory: () => () =>
      new Worker(`data:text/javascript;charset=utf-8,${encodeURIComponent(WORKER_RUNNER_SOURCE)}`),
  },
);

export const DEFAULT_TIMEOUT_MS = 3000;

@Injectable({ providedIn: 'root' })
export class CodeRunnerService {
  private readonly createWorker = inject(RUNNER_WORKER_FACTORY);

  /**
   * Runs JavaScript in a fresh worker that is always destroyed afterwards.
   * If it does not answer in time (e.g. an infinite loop), it is terminated.
   */
  runJavaScript(
    code: string,
    tests: RunRequest['tests'],
    timeoutMs = DEFAULT_TIMEOUT_MS,
  ): Promise<RunResult> {
    let worker: RunnerWorker;
    try {
      worker = this.createWorker();
    } catch {
      return Promise.resolve({
        status: 'unavailable',
        message: 'Este navegador não permitiu criar o ambiente isolado de execução.',
      });
    }

    const runId = crypto.randomUUID();
    const started = performance.now();

    return new Promise<RunResult>((resolve) => {
      let settled = false;
      const finish = (result: RunResult) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        worker.onmessage = null;
        worker.onerror = null;
        worker.terminate();
        resolve(result);
      };
      const timer = setTimeout(() => finish({ status: 'timeout', timeoutMs }), timeoutMs);

      worker.onmessage = (event) => {
        const report = parseRunnerMessage(event.data, runId);
        // Anything that is not the expected, well-formed result is ignored.
        if (report) {
          finish({
            status: 'completed',
            report,
            durationMs: Math.round(performance.now() - started),
          });
        }
      };
      worker.onerror = () =>
        finish({
          status: 'unavailable',
          message: 'O ambiente isolado de execução falhou ao iniciar.',
        });

      const request: RunRequest = { type: 'run', runId, code, tests };
      worker.postMessage(request);
    });
  }
}
