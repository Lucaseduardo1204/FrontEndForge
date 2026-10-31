import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { Progress } from '../../core/models/progress.models';
import { AppTitleStrategy } from '../../core/navigation/app-title-strategy';
import { ProgressRepository } from '../../core/persistence/progress-repository';
import { createEmptyProgress } from '../../core/persistence/progress-schema';
import { completeLesson, recordAttempt } from '../../core/progress/progress-updates';
import { ProgressService } from '../../core/progress/progress.service';

registerLocaleData(localePt);

describe('achievements page', () => {
  async function open(saved: Progress | null): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCALE_ID, useValue: 'pt-BR' },
        provideRouter(routes, withComponentInputBinding()),
        { provide: TitleStrategy, useExisting: AppTitleStrategy },
        {
          provide: ProgressRepository,
          useValue: {
            load: async () => saved,
            save: async () => undefined,
            clear: async () => undefined,
          },
        },
      ],
    });
    await TestBed.inject(ProgressService).load();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/achievements');
    harness.detectChanges();
    return (harness.routeNativeElement as HTMLElement).querySelector('main')!;
  }

  const text = (el: HTMLElement) => el.textContent?.replace(/\s+/g, ' ') ?? '';

  it('shows level 1, every criterion and an empty history for a new student', async () => {
    const main = await open(null);

    expect(text(main)).toContain('Nível 1');
    expect(text(main)).toContain('0 XP');
    expect(text(main)).toContain('Conquistas (0 de 12)');
    expect(text(main)).toContain('Leve um conceito até a caixa 5 da revisão espaçada.');
    expect(text(main)).toContain('não certificado de competência');
    expect(text(main)).toContain('Nenhum XP ainda');
  });

  it('derives XP, level, achievements and history from the saved progress', async () => {
    const now = new Date(2026, 9, 29, 10);
    let progress = createEmptyProgress(now);
    progress = recordAttempt(
      progress,
      {
        id: 'a1',
        activityType: 'exercise',
        activityId: 'web-browser-01-li-count',
        submittedAt: now.toISOString(),
        correct: true,
        score: 1,
        answer: null,
        hintsUsed: 0,
        solutionViewed: false,
      },
      now,
    );
    progress = completeLesson(progress, 'web-browser-01', now);

    const main = await open(progress);

    expect(text(main)).toContain('60 XP');
    expect(text(main)).toContain('40 XP para o nível 2');
    expect(text(main)).toContain('Conquistas (2 de 12)');
    expect(text(main)).toContain('Desbloqueada em 29 de outubro de 2026');
    expect(text(main)).toContain(
      '+50 Concluiu a lição “Como o navegador interpreta HTML, CSS e JavaScript”',
    );
    expect(text(main)).toContain(
      '+10 Resolveu “Quantos itens o script enxerga?” pela primeira vez',
    );
  });
});
