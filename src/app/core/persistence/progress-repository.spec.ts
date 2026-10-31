import { TestBed } from '@angular/core/testing';
import { KeyValueStorage } from './key-value-storage';
import { LocalStorageProgressRepository, PROGRESS_STORAGE_KEY } from './progress-repository';
import { createEmptyProgress, ProgressDataError } from './progress-schema';

class MemoryStorage extends KeyValueStorage {
  readonly data = new Map<string, string>();
  writable = true;

  override read(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  override write(key: string, value: string): boolean {
    if (!this.writable) return false;
    this.data.set(key, value);
    return true;
  }

  override remove(key: string): void {
    this.data.delete(key);
  }
}

describe('LocalStorageProgressRepository', () => {
  let storage: MemoryStorage;
  let repository: LocalStorageProgressRepository;

  beforeEach(() => {
    storage = new MemoryStorage();
    TestBed.configureTestingModule({
      providers: [LocalStorageProgressRepository, { provide: KeyValueStorage, useValue: storage }],
    });
    repository = TestBed.inject(LocalStorageProgressRepository);
  });

  it('returns null when nothing was saved', async () => {
    await expect(repository.load()).resolves.toBeNull();
  });

  it('saves and loads the same progress', async () => {
    const progress = { ...createEmptyProgress(new Date()), studyDays: ['2026-10-29'] };

    await repository.save(progress);

    await expect(repository.load()).resolves.toEqual(progress);
  });

  it('reports corrupted data instead of returning empty progress', async () => {
    storage.data.set(PROGRESS_STORAGE_KEY, '{oops');

    await expect(repository.load()).rejects.toBeInstanceOf(ProgressDataError);
  });

  it('fails loudly when the browser refuses to store data', async () => {
    storage.writable = false;

    await expect(repository.save(createEmptyProgress(new Date()))).rejects.toThrow(
      /Não foi possível salvar/,
    );
  });

  it('clears saved progress', async () => {
    await repository.save(createEmptyProgress(new Date()));
    await repository.clear();

    await expect(repository.load()).resolves.toBeNull();
  });
});
