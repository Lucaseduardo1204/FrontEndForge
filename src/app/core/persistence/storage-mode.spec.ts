import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpProgressRepository } from './http-progress-repository';
import { KeyValueStorage } from './key-value-storage';
import { LocalStorageProgressRepository, ProgressRepository } from './progress-repository';
import { provideProgressStorage } from './progress-storage.providers';
import { RELOAD_PAGE, STORAGE_MODE_KEY, StorageModeService } from './storage-mode';

describe('StorageModeService and the repository it selects', () => {
  let saved: Record<string, string>;
  let reloads: number;

  function setup() {
    TestBed.configureTestingModule({
      providers: [
        ...provideProgressStorage(),
        provideHttpClientTesting(),
        {
          provide: KeyValueStorage,
          useValue: {
            read: (k: string) => saved[k] ?? null,
            write: (k: string, v: string) => ((saved[k] = v), true),
            remove: (k: string) => delete saved[k],
          },
        },
        { provide: RELOAD_PAGE, useValue: () => reloads++ },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    for (const startup of http.match('/api/auth/me')) {
      startup.flush(null, { status: 401, statusText: 'Unauthorized' });
    }
    return { modes: TestBed.inject(StorageModeService), http };
  }

  beforeEach(() => {
    saved = {};
    reloads = 0;
  });

  it('local by default, with the localStorage repository', () => {
    const { modes } = setup();
    expect(modes.mode).toBe('local');
    expect(TestBed.inject(ProgressRepository)).toBeInstanceOf(LocalStorageProgressRepository);
  });

  it('server when that is the saved preference, with the HTTP repository', () => {
    saved[STORAGE_MODE_KEY] = 'server';
    const { modes } = setup();
    expect(modes.mode).toBe('server');
    expect(TestBed.inject(ProgressRepository)).toBeInstanceOf(HttpProgressRepository);
  });

  it('an unknown saved value falls back to local', () => {
    saved[STORAGE_MODE_KEY] = 'nuvem';
    expect(setup().modes.mode).toBe('local');
  });

  it('choosing saves the preference and reloads the page', () => {
    const { modes } = setup();
    expect(modes.choose('server')).toBe(true);
    expect(saved[STORAGE_MODE_KEY]).toBe('server');
    expect(reloads).toBe(1);
  });

  describe('detecting the backend', () => {
    async function probe(answer: (http: HttpTestingController) => void): Promise<boolean> {
      const { modes, http } = setup();
      const result = modes.serverAvailable();
      answer(http);
      return result;
    }

    it('JSON from the session endpoint (200 or 401) means the backend is here', async () => {
      expect(
        await probe((h) =>
          h
            .expectOne('/api/auth/me')
            .flush('{"email":"a@b.c"}', { headers: { 'Content-Type': 'application/json' } }),
        ),
      ).toBe(true);
      TestBed.resetTestingModule();
      expect(
        await probe((h) =>
          h.expectOne('/api/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' }),
        ),
      ).toBe(true);
    });

    it('an HTML page (static host), a proxy error or no connection means it is not', async () => {
      expect(
        await probe((h) =>
          h
            .expectOne('/api/auth/me')
            .flush('<!doctype html>', { headers: { 'Content-Type': 'text/html' } }),
        ),
      ).toBe(false);
      TestBed.resetTestingModule();
      expect(
        await probe((h) =>
          h.expectOne('/api/auth/me').flush('', { status: 502, statusText: 'Bad Gateway' }),
        ),
      ).toBe(false);
      TestBed.resetTestingModule();
      expect(
        await probe((h) =>
          h.expectOne('/api/auth/me').error(new ProgressEvent('error'), { status: 0 }),
        ),
      ).toBe(false);
    });
  });
});
