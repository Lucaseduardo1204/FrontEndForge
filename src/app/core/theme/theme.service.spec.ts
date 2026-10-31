import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KeyValueStorage } from '../persistence/key-value-storage';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

describe('ThemeService', () => {
  let saved: Map<string, string>;
  let service: ThemeService;
  let root: HTMLElement;

  beforeEach(() => {
    saved = new Map();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: KeyValueStorage,
          useValue: {
            read: (key: string) => saved.get(key) ?? null,
            write: (key: string, value: string) => saved.set(key, value) && true,
            remove: (key: string) => saved.delete(key),
          },
        },
      ],
    });
    service = TestBed.inject(ThemeService);
    root = TestBed.inject(DOCUMENT).documentElement;
  });

  it('defaults to the dark theme', () => {
    service.init();

    expect(service.theme()).toBe('dark');
    expect(root.dataset['theme']).toBe('dark');
  });

  it('restores a saved light preference', () => {
    saved.set(THEME_STORAGE_KEY, 'light');

    service.init();

    expect(root.dataset['theme']).toBe('light');
  });

  it('ignores unknown saved values', () => {
    saved.set(THEME_STORAGE_KEY, 'neon');

    service.init();

    expect(service.theme()).toBe('dark');
  });

  it('persists the toggled theme', () => {
    service.init();

    service.toggle();

    expect(service.theme()).toBe('light');
    expect(saved.get(THEME_STORAGE_KEY)).toBe('light');
  });
});
