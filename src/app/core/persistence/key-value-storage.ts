import { Injectable } from '@angular/core';

/**
 * The only place in the app that touches `localStorage`.
 * Every call is guarded: storage can be unavailable (private mode, blocked site data, quota).
 */
@Injectable({ providedIn: 'root' })
export class KeyValueStorage {
  read(key: string): string | null {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  /** Returns `false` when the value could not be written. */
  write(key: string, value: string): boolean {
    try {
      globalThis.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  remove(key: string): void {
    try {
      globalThis.localStorage.removeItem(key);
    } catch {
      // Nothing to remove if storage is unavailable.
    }
  }
}
