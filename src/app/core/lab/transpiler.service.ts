import { inject, Injectable, InjectionToken } from '@angular/core';
import { RunnerWorker } from './code-runner.service';

export type TranspileResult =
  | { readonly ok: true; readonly code: string }
  /** `syntax`: the student's code is invalid. `unavailable`: the transpiler itself failed. */
  | { readonly ok: false; readonly reason: 'syntax' | 'unavailable'; readonly message: string };

export const TRANSPILER_WORKER_FACTORY = new InjectionToken<() => RunnerWorker>(
  'TRANSPILER_WORKER_FACTORY',
  {
    providedIn: 'root',
    factory: () => () =>
      new Worker(new URL('./transpile.worker', import.meta.url), { type: 'module' }),
  },
);

// Generous: the first call also downloads the transpiler (~200 kB). Student code never runs here.
const TRANSPILE_TIMEOUT_MS = 15000;

/**
 * TypeScript → JavaScript with sucrase, in a worker (types are removed, not checked).
 * The worker is created on first use and reused; it never runs student code.
 */
@Injectable({ providedIn: 'root' })
export class TranspilerService {
  private readonly createWorker = inject(TRANSPILER_WORKER_FACTORY);
  private worker: RunnerWorker | null = null;
  private readonly pending = new Map<string, (result: TranspileResult) => void>();

  transpile(source: string): Promise<TranspileResult> {
    const worker = this.ensureWorker();
    if (!worker) {
      return Promise.resolve({
        ok: false,
        reason: 'unavailable',
        message: 'Não foi possível iniciar o transpilador de TypeScript.',
      });
    }
    const id = crypto.randomUUID();
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        this.reset();
        resolve({
          ok: false,
          reason: 'unavailable',
          message: 'O transpilador de TypeScript não respondeu a tempo.',
        });
      }, TRANSPILE_TIMEOUT_MS);
      this.pending.set(id, (result) => {
        clearTimeout(timer);
        resolve(result);
      });
      worker.postMessage({ id, source });
    });
  }

  private ensureWorker(): RunnerWorker | null {
    if (this.worker) return this.worker;
    try {
      this.worker = this.createWorker();
    } catch {
      return null;
    }
    this.worker.onmessage = ({ data }) => {
      if (typeof data?.id !== 'string') return;
      const done = this.pending.get(data.id);
      if (!done) return;
      this.pending.delete(data.id);
      if (data.ok === true && typeof data.code === 'string') done({ ok: true, code: data.code });
      else
        done({
          ok: false,
          reason: 'syntax',
          message: String(data.message ?? 'Erro ao transpilar.'),
        });
    };
    this.worker.onerror = () => this.reset();
    return this.worker;
  }

  private reset(): void {
    this.worker?.terminate();
    this.worker = null;
    for (const done of this.pending.values()) {
      done({ ok: false, reason: 'unavailable', message: 'O transpilador de TypeScript falhou.' });
    }
    this.pending.clear();
  }
}
