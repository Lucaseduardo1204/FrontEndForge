import { TestBed } from '@angular/core/testing';
import { Progress } from '../models/progress.models';
import { ProgressRepository, SignInRequiredError } from '../persistence/progress-repository';
import { createEmptyProgress, ProgressDataError } from '../persistence/progress-schema';
import { ProgressService } from './progress.service';

class FakeRepository extends ProgressRepository {
  stored: Progress | null = null;
  loadFailure: Error | null = null;

  async load(): Promise<Progress | null> {
    if (this.loadFailure) throw this.loadFailure;
    return this.stored;
  }

  async save(progress: Progress): Promise<void> {
    this.stored = progress;
  }

  async clear(): Promise<void> {
    this.stored = null;
  }
}

describe('ProgressService', () => {
  let repository: FakeRepository;
  let service: ProgressService;

  const withHistory: Progress = {
    ...createEmptyProgress(new Date('2026-10-01T00:00:00.000Z')),
    lessons: { 'web-browser-01': { startedAt: '2026-10-01T00:00:00.000Z', currentStepIndex: 2 } },
  };

  beforeEach(() => {
    repository = new FakeRepository();
    TestBed.configureTestingModule({
      providers: [{ provide: ProgressRepository, useValue: repository }],
    });
    service = TestBed.inject(ProgressService);
  });

  it('starts empty and ready when nothing was saved', async () => {
    await service.load();

    expect(service.status()).toBe('ready');
    expect(service.hasHistory()).toBe(false);
  });

  it('loads saved progress', async () => {
    repository.stored = withHistory;

    await service.load();

    expect(service.progress()).toEqual(withHistory);
    expect(service.hasHistory()).toBe(true);
  });

  it('exposes a load error and keeps the stored data untouched', async () => {
    repository.stored = withHistory;
    repository.loadFailure = new ProgressDataError('Dados corrompidos.');

    await service.load();

    expect(service.status()).toBe('error');
    expect(service.loadError()).toBe('Dados corrompidos.');
    expect(repository.stored).toBe(withHistory);
  });

  it('replaces progress and clears a previous load error', async () => {
    repository.loadFailure = new ProgressDataError('Dados corrompidos.');
    await service.load();

    await service.replaceWith(withHistory);

    expect(service.loadError()).toBeNull();
    expect(service.progress()).toEqual(withHistory);
    expect(repository.stored).toEqual(withHistory);
  });

  it('persists updates and applies them in order', async () => {
    await service.load();
    const addDay = (day: string) => (p: Progress) => ({ ...p, studyDays: [...p.studyDays, day] });

    await Promise.all([service.update(addDay('2026-10-28')), service.update(addDay('2026-10-29'))]);

    expect(service.progress().studyDays).toEqual(['2026-10-28', '2026-10-29']);
    expect(repository.stored?.studyDays).toEqual(['2026-10-28', '2026-10-29']);
  });

  it('refuses to update while saved data is unreadable', async () => {
    repository.stored = withHistory;
    repository.loadFailure = new ProgressDataError('Dados corrompidos.');
    await service.load();

    await expect(service.update((p) => ({ ...p, studyDays: ['2026-10-29'] }))).rejects.toThrow(
      /não pôde ser lido/,
    );
    expect(repository.stored).toBe(withHistory);
  });

  it('keeps the in-memory state unchanged when saving fails', async () => {
    await service.load();
    repository.save = async () => {
      throw new Error('cota cheia');
    };

    await expect(service.update((p) => ({ ...p, studyDays: ['x'] }))).rejects.toThrow('cota cheia');
    expect(service.progress().studyDays).toEqual([]);
  });

  it('exports JSON that contains the current progress', async () => {
    repository.stored = withHistory;
    await service.load();

    expect(JSON.parse(service.exportJson())).toEqual(withHistory);
  });

  it('resets to empty progress', async () => {
    repository.stored = withHistory;
    await service.load();

    await service.reset();

    expect(repository.stored).toBeNull();
    expect(service.hasHistory()).toBe(false);
  });

  it('a later load with nothing saved replaces what was in memory (no data from another account)', async () => {
    repository.stored = withHistory;
    await service.load();
    expect(service.hasHistory()).toBe(true);

    repository.stored = null; // e.g. another account signed in, with no progress yet
    await service.load();
    expect(service.hasHistory()).toBe(false);

    await service.update((p) => ({ ...p })); // the next save writes what is in memory
    // TypeScript still narrows `stored` to null here; update() changed it.
    const saved = repository.stored as Progress | null;
    expect(saved?.attempts).toEqual([]);
    expect(saved?.lessons).toEqual({}); // nothing from the previous account was copied
  });

  it('a failed load also clears what was in memory', async () => {
    repository.stored = withHistory;
    await service.load();
    repository.loadFailure = new SignInRequiredError();
    await service.load();
    expect(service.hasHistory()).toBe(false);
  });

  it('tells "sign in" apart from unreadable data, and refuses to save until signed in', async () => {
    repository.loadFailure = new SignInRequiredError();
    await service.load();
    expect(service.signInRequired()).toBe(true);
    expect(service.loadError()).toContain('Entre na sua conta');
    await expect(service.update((p) => ({ ...p }))).rejects.toBeInstanceOf(SignInRequiredError);

    repository.loadFailure = new ProgressDataError('dados ruins');
    await service.load();
    expect(service.signInRequired()).toBe(false);

    repository.loadFailure = null;
    await service.load();
    expect(service.signInRequired()).toBe(false);
    expect(service.loadError()).toBeNull();
  });
});
