import { inject, Injectable } from '@angular/core';
import { Progress } from '../models/progress.models';
import { KeyValueStorage } from './key-value-storage';
import { parseProgressJson } from './progress-schema';

/**
 * Persistence boundary for student progress. Features depend on this abstraction only,
 * so the local implementation could be replaced by the HTTP one (backend/) without changes.
 */
export abstract class ProgressRepository {
  /** Resolves to `null` when nothing was saved yet. Rejects with `ProgressDataError` on bad data. */
  abstract load(): Promise<Progress | null>;
  abstract save(progress: Progress): Promise<void>;
  abstract clear(): Promise<void>;
}

/** The repository needs a signed-in account (server mode) before it can load or save. */
export class SignInRequiredError extends Error {
  constructor(options?: ErrorOptions) {
    super('Entre na sua conta para carregar e salvar o progresso.', options);
    this.name = 'SignInRequiredError';
  }
}

export const PROGRESS_STORAGE_KEY = 'frontend-forge.progress';

@Injectable()
export class LocalStorageProgressRepository extends ProgressRepository {
  private readonly storage = inject(KeyValueStorage);

  async load(): Promise<Progress | null> {
    const raw = this.storage.read(PROGRESS_STORAGE_KEY);
    return raw === null ? null : parseProgressJson(raw);
  }

  async save(progress: Progress): Promise<void> {
    if (!this.storage.write(PROGRESS_STORAGE_KEY, JSON.stringify(progress))) {
      throw new Error(
        'Não foi possível salvar o progresso. O armazenamento do navegador pode estar cheio ou bloqueado.',
      );
    }
  }

  async clear(): Promise<void> {
    this.storage.remove(PROGRESS_STORAGE_KEY);
  }
}
