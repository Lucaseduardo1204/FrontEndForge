import { computed, inject, Injectable, signal } from '@angular/core';
import { Progress } from '../models/progress.models';
import { ProgressRepository, SignInRequiredError } from '../persistence/progress-repository';
import { createEmptyProgress } from '../persistence/progress-schema';

export type ProgressStatus = 'loading' | 'ready' | 'error';

/** Holds the student's progress in memory and keeps it in sync with the repository. */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly repository = inject(ProgressRepository);

  private readonly state = signal<Progress>(createEmptyProgress(new Date()));
  readonly progress = this.state.asReadonly();

  readonly status = signal<ProgressStatus>('loading');
  /**
   * Set when saved data could not be read. Saving stays blocked while it is set,
   * so the unreadable data is not silently overwritten; the student decides (import or reset).
   */
  readonly loadError = signal<string | null>(null);
  /** The load failed only because nobody is signed in (server mode): not a data problem. */
  readonly signInRequired = signal(false);

  private queue: Promise<unknown> = Promise.resolve();

  readonly hasHistory = computed(() => {
    const p = this.state();
    return p.attempts.length > 0 || Object.keys(p.lessons).length > 0;
  });

  /**
   * Always replaces what is in memory: with what was loaded, or with empty progress when nothing
   * was saved or loading failed. Keeping the previous state would show one account's progress
   * to the next one signed in on the same tab, and the next save would copy it into that account.
   */
  async load(): Promise<void> {
    this.status.set('loading');
    try {
      const saved = await this.repository.load();
      this.state.set(saved ?? createEmptyProgress(new Date()));
      this.loadError.set(null);
      this.signInRequired.set(false);
      this.status.set('ready');
    } catch (error) {
      this.state.set(createEmptyProgress(new Date()));
      this.loadError.set(describe(error));
      this.signInRequired.set(error instanceof SignInRequiredError);
      this.status.set('error');
    }
  }

  /**
   * Applies a pure change (see `progress-updates.ts`) and persists it.
   * Updates run one after another, so two quick changes never overwrite each other.
   * Rejects while saved data is unreadable, instead of silently replacing it.
   */
  update(change: (progress: Progress, now: Date) => Progress): Promise<void> {
    const run = this.queue.then(async () => {
      if (this.signInRequired()) {
        throw new SignInRequiredError();
      }
      if (this.loadError()) {
        throw new Error(
          'Seu progresso salvo não pôde ser lido, então nada novo está sendo salvo. Resolva em Configurações.',
        );
      }
      const current = this.state();
      const next = change(current, new Date());
      if (next === current) return;
      await this.repository.save(next);
      this.state.set(next);
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  exportJson(): string {
    return JSON.stringify(this.state(), null, 2);
  }

  /** Replaces the current progress, e.g. with one validated by `parseProgressJson`. */
  async replaceWith(progress: Progress): Promise<void> {
    await this.repository.save(progress);
    this.state.set(progress);
    this.loadError.set(null);
    this.signInRequired.set(false);
    this.status.set('ready');
  }

  async reset(): Promise<void> {
    await this.repository.clear();
    this.state.set(createEmptyProgress(new Date()));
    this.loadError.set(null);
    this.signInRequired.set(false);
    this.status.set('ready');
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : 'Erro desconhecido ao carregar o progresso.';
}
