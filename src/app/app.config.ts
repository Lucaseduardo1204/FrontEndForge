import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { routes } from './app.routes';
import { AppTitleStrategy } from './core/navigation/app-title-strategy';
import { provideProgressStorage } from './core/persistence/progress-storage.providers';
import { ProgressService } from './core/progress/progress.service';
import { ThemeService } from './core/theme/theme.service';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    { provide: TitleStrategy, useExisting: AppTitleStrategy },
    ...provideProgressStorage(),
    provideAppInitializer(() => {
      inject(ThemeService).init();
      return inject(ProgressService).load();
    }),
  ],
};
