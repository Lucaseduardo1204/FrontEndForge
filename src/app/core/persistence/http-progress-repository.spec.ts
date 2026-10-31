import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import ts from 'typescript';
import { ProgressRepository } from './progress-repository';
import { createEmptyProgress, CURRENT_SCHEMA_VERSION, ProgressDataError } from './progress-schema';
import { HttpProgressRepository, ProgressConflictError } from './http-progress-repository';
import { provideHttpProgressRepository } from './progress-storage.providers';

describe('HttpProgressRepository', () => {
  let repository: ProgressRepository;
  let http: HttpTestingController;
  const progress = createEmptyProgress(new Date('2026-10-30T12:00:00Z'));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpProgressRepository('/api/progress'), provideHttpClientTesting()],
    });
    repository = TestBed.inject(ProgressRepository);
    http = TestBed.inject(HttpTestingController);
    // provideHttpProgressRepository checks the session at startup (app initializer).
    for (const startup of http.match('/api/auth/me')) {
      startup.flush(null, { status: 401, statusText: 'Unauthorized' });
    }
  });

  afterEach(() => http.verify());

  it('is the HTTP implementation behind the same contract', () => {
    expect(repository).toBeInstanceOf(HttpProgressRepository);
  });

  it('204 means nothing saved yet', async () => {
    const loading = repository.load();
    http
      .expectOne({ method: 'GET', url: '/api/progress' })
      .flush(null, { status: 204, statusText: 'No Content' });
    expect(await loading).toBeNull();
  });

  it('validates the document received with the same rules as local storage', async () => {
    const loading = repository.load();
    http.expectOne('/api/progress').flush(JSON.stringify(progress), { headers: { ETag: '"v3"' } });
    expect(await loading).toEqual(progress);

    const bad = repository.load();
    http.expectOne('/api/progress').flush('{"schemaVersion":99}');
    await expect(bad).rejects.toBeInstanceOf(ProgressDataError);
  });

  it('sends the ETag it read as If-Match, and keeps the new one', async () => {
    const loading = repository.load();
    http.expectOne('/api/progress').flush(JSON.stringify(progress), { headers: { ETag: '"v3"' } });
    await loading;

    const first = repository.save(progress);
    const put = http.expectOne({ method: 'PUT', url: '/api/progress' });
    expect(put.request.headers.get('If-Match')).toBe('"v3"');
    expect(put.request.headers.get('Content-Type')).toBe('application/json');
    expect(JSON.parse(put.request.body as string)).toEqual(progress);
    put.flush(null, { status: 204, statusText: 'No Content', headers: { ETag: '"v4"' } });
    await first;

    const second = repository.save(progress);
    const next = http.expectOne({ method: 'PUT', url: '/api/progress' });
    expect(next.request.headers.get('If-Match')).toBe('"v4"');
    next.flush(null, { status: 204, statusText: 'No Content', headers: { ETag: '"v5"' } });
    await second;
  });

  it('first save without a previous read sends no If-Match', async () => {
    const saving = repository.save(progress);
    const put = http.expectOne({ method: 'PUT', url: '/api/progress' });
    expect(put.request.headers.has('If-Match')).toBe(false);
    put.flush(null, { status: 204, statusText: 'No Content' });
    await saving;
  });

  it('412 becomes a conflict error that tells the student what to do', async () => {
    const saving = repository.save(progress);
    http.expectOne('/api/progress').flush(null, { status: 412, statusText: 'Precondition Failed' });
    await expect(saving).rejects.toBeInstanceOf(ProgressConflictError);
    await expect(saving).rejects.toThrow('Recarregue a página');
    const erro = await saving.catch((e: Error) => e);
    expect((erro as Error).cause).toBeTruthy(); // the original HttpErrorResponse is kept
  });

  it('no connection and server refusals become readable errors', async () => {
    const offline = repository.load();
    http.expectOne('/api/progress').error(new ProgressEvent('error'), { status: 0 });
    await expect(offline).rejects.toThrow('Sem conexão com o servidor de progresso');

    const refused = repository.save(progress);
    http
      .expectOne('/api/progress')
      .flush({ erro: 'x' }, { status: 422, statusText: 'Unprocessable Content' });
    await expect(refused).rejects.toThrow('HTTP 422');
  });

  it('clear deletes on the server', async () => {
    const clearing = repository.clear();
    http
      .expectOne({ method: 'DELETE', url: '/api/progress' })
      .flush(null, { status: 204, statusText: 'No Content' });
    await clearing;
  });

  it('the backend accepts exactly the schema versions this frontend writes', () => {
    const java = ts.sys.readFile(
      'backend/src/main/java/dev/frontendforge/backend/progress/ProgressValidator.java',
    );
    expect(java).toContain(`CURRENT_SCHEMA_VERSION = ${CURRENT_SCHEMA_VERSION};`);
  });
});
