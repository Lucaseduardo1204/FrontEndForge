import { provideHttpClient, withXsrfConfiguration } from '@angular/common/http';
import { EnvironmentProviders, inject, provideAppInitializer, Provider } from '@angular/core';
import { AccountService, AUTH_API_URL } from '../auth/account.service';
import { HttpProgressRepository, PROGRESS_API_URL } from './http-progress-repository';
import { LocalStorageProgressRepository, ProgressRepository } from './progress-repository';
import { STORAGE_MODE, StorageModeService } from './storage-mode';

/**
 * Progress storage chosen at startup from the student's preference (Settings): this browser by
 * default, or the backend with an account (D-070, D-071, D-072). CSRF: the server's XSRF-TOKEN
 * cookie goes back as the X-XSRF-TOKEN header on writes. `npm start` proxies /api to 127.0.0.1:8080.
 */
export function provideProgressStorage(
  progressUrl = '/api/progress',
  authUrl = '/api/auth',
): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
    ),
    { provide: PROGRESS_API_URL, useValue: progressUrl },
    { provide: AUTH_API_URL, useValue: authUrl },
    {
      provide: ProgressRepository,
      useFactory: () =>
        inject(StorageModeService).mode === 'server'
          ? new HttpProgressRepository()
          : new LocalStorageProgressRepository(),
    },
    AccountService,
    provideAppInitializer(() => {
      if (inject(StorageModeService).mode === 'server') return inject(AccountService).refresh();
      return undefined;
    }),
  ];
}

/** Server mode regardless of the saved preference (tests and fixed deployments). */
export function provideHttpProgressRepository(
  progressUrl = '/api/progress',
  authUrl = '/api/auth',
): (Provider | EnvironmentProviders)[] {
  return [
    ...provideProgressStorage(progressUrl, authUrl),
    { provide: STORAGE_MODE, useValue: 'server' },
  ];
}
