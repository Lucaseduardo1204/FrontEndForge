import { DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { KeyValueStorage } from '../persistence/key-value-storage';

export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'frontend-forge.theme';

/** Dark is the default; light is an explicit, persisted preference. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(KeyValueStorage);
  private readonly document = inject(DOCUMENT);

  private readonly current = signal<Theme>('dark');
  readonly theme = this.current.asReadonly();

  init(): void {
    this.apply(this.storage.read(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.storage.write(THEME_STORAGE_KEY, theme);
    this.apply(theme);
  }

  toggle(): void {
    this.set(this.current() === 'dark' ? 'light' : 'dark');
  }

  private apply(theme: Theme): void {
    this.current.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
    this.document.documentElement.style.colorScheme = theme;
  }
}
