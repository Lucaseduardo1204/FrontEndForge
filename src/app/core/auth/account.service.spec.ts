import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideHttpProgressRepository } from '../persistence/progress-storage.providers';
import { createEmptyProgress } from '../persistence/progress-schema';
import { ProgressService } from '../progress/progress.service';
import { AccountService } from './account.service';

describe('AccountService (server mode)', () => {
  let accounts: AccountService;
  let progress: ProgressService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpProgressRepository(), provideHttpClientTesting()],
    });
    accounts = TestBed.inject(AccountService);
    progress = TestBed.inject(ProgressService);
    http = TestBed.inject(HttpTestingController);
    // provideHttpProgressRepository checks the session at startup (app initializer).
    for (const startup of http.match('/api/auth/me')) {
      startup.flush(null, { status: 401, statusText: 'Unauthorized' });
    }
  });

  afterEach(() => {
    http.verify();
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  it('refresh: 200 means signed in; 401 means signed out, without an error', async () => {
    const signedIn = accounts.refresh();
    http.expectOne('/api/auth/me').flush({ email: 'ana@exemplo.com' });
    await signedIn;
    expect(accounts.account()).toEqual({ email: 'ana@exemplo.com' });

    const signedOut = accounts.refresh();
    http.expectOne('/api/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    await signedOut;
    expect(accounts.account()).toBeNull();
    expect(accounts.connectionError()).toBeNull();
  });

  it('refresh without a server shows a connection error', async () => {
    const r = accounts.refresh();
    http.expectOne('/api/auth/me').error(new ProgressEvent('error'), { status: 0 });
    await r;
    expect(accounts.connectionError()).toContain('Sem conexão');
  });

  it('signing in loads that account progress', async () => {
    const signing = accounts.signIn('ana@exemplo.com', 'senha-bem-longa-123');
    const login = http.expectOne({ method: 'POST', url: '/api/auth/login' });
    expect(login.request.body).toEqual({
      email: 'ana@exemplo.com',
      password: 'senha-bem-longa-123',
    });
    login.flush({ email: 'ana@exemplo.com' });
    await Promise.resolve();
    const progressRequest = http.expectOne({ method: 'GET', url: '/api/progress' });
    progressRequest.flush(JSON.stringify(createEmptyProgress(new Date('2026-10-30T12:00:00Z'))));
    await signing;
    expect(accounts.account()).toEqual({ email: 'ana@exemplo.com' });
    expect(progress.status()).toBe('ready');
  });

  it("shows the server's own message on failure", async () => {
    const signing = accounts.signIn('ana@exemplo.com', 'errada');
    http
      .expectOne('/api/auth/login')
      .flush({ erro: 'E-mail ou senha incorretos.' }, { status: 401, statusText: 'Unauthorized' });
    await expect(signing).rejects.toThrow('E-mail ou senha incorretos.');
    expect(accounts.account()).toBeNull();
  });

  it('signing out reloads progress, which clears the previous account from the screen', async () => {
    accounts.account.set({ email: 'ana@exemplo.com' });
    const out = accounts.signOut();
    http
      .expectOne({ method: 'POST', url: '/api/auth/logout' })
      .flush(null, { status: 204, statusText: 'No Content' });
    await Promise.resolve();
    http.expectOne('/api/progress').flush(null, { status: 401, statusText: 'Unauthorized' });
    await out;
    expect(accounts.account()).toBeNull();
    expect(progress.signInRequired()).toBe(true);
    expect(progress.hasHistory()).toBe(false);
  });

  it('HttpClient sends the XSRF-TOKEN cookie back as X-XSRF-TOKEN on writes, not on reads', async () => {
    document.cookie = 'XSRF-TOKEN=valor-do-servidor; path=/';
    const client = TestBed.inject(HttpClient);

    void firstValueFrom(client.post('/api/auth/login', {}));
    expect(http.expectOne('/api/auth/login').request.headers.get('X-XSRF-TOKEN')).toBe(
      'valor-do-servidor',
    );

    void firstValueFrom(client.get('/api/auth/me'));
    expect(http.expectOne('/api/auth/me').request.headers.has('X-XSRF-TOKEN')).toBe(false);

    void firstValueFrom(client.post('http://outro-site.exemplo/api', {}));
    expect(
      http.expectOne('http://outro-site.exemplo/api').request.headers.has('X-XSRF-TOKEN'),
    ).toBe(false);
  });
});
