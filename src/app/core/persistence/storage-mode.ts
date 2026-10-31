import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DOCUMENT, inject, Injectable, InjectionToken } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { KeyValueStorage } from './key-value-storage';

export type StorageMode = 'local' | 'server';

export const STORAGE_MODE_KEY = 'frontend-forge.storage-mode';

/**
 * Where progress is kept, decided once at startup (the repository is chosen from it). Local is
 * the default; server is an explicit, persisted preference. Tests can provide it directly.
 */
export const STORAGE_MODE = new InjectionToken<StorageMode>('STORAGE_MODE', {
  providedIn: 'root',
  factory: () => (inject(KeyValueStorage).read(STORAGE_MODE_KEY) === 'server' ? 'server' : 'local'),
});

export const RELOAD_PAGE = new InjectionToken<() => void>('RELOAD_PAGE', {
  providedIn: 'root',
  factory: () => {
    const document = inject(DOCUMENT);
    return () => document.location.reload();
  },
});

@Injectable({ providedIn: 'root' })
export class StorageModeService {
  private readonly storage = inject(KeyValueStorage);
  private readonly http = inject(HttpClient);
  private readonly reload = inject(RELOAD_PAGE);

  /** Fixed for the lifetime of the page: switching reloads, so nothing loaded mixes. */
  readonly mode = inject(STORAGE_MODE);

  /**
   * Whether this installation has the Frontend Forge backend. Its session endpoint answers JSON
   * (200 signed in, 401 signed out); a static host answers its HTML page instead, and a dev
   * server without the backend answers a proxy error.
   */
  async serverAvailable(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get('/api/auth/me', { observe: 'response', responseType: 'text' }),
      );
      return (response.headers.get('Content-Type') ?? '').includes('application/json');
    } catch (error) {
      return error instanceof HttpErrorResponse && error.status === 401;
    }
  }

  /** Persists the choice and reloads; false when the preference could not be saved. */
  choose(mode: StorageMode): boolean {
    if (!this.storage.write(STORAGE_MODE_KEY, mode)) return false;
    this.reload();
    return true;
  }
}
