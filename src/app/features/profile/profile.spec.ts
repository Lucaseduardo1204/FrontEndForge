import { TestBed } from '@angular/core/testing';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CONTENT } from '../../../content';
import { CONTENT_CATALOG } from '../../core/content/content.service';
import { routes } from '../../app.routes';
import { Attempt, Progress } from '../../core/models/progress.models';
import { AppTitleStrategy } from '../../core/navigation/app-title-strategy';
import { ProgressRepository } from '../../core/persistence/progress-repository';
import { createEmptyProgress } from '../../core/persistence/progress-schema';
import { recordAttempt } from '../../core/progress/progress-updates';
import { ProgressService } from '../../core/progress/progress.service';

/**
 * Every competency of the real catalog has exercises now, so the "no activities yet" state is
 * tested with a catalog that has one extra competency without content.
 */
const competencyWithoutExercises = 'sem-conteudo-ainda';
const catalogWithEmptyCompetency = {
  ...CONTENT,
  competencies: [
    ...CONTENT.competencies,
    {
      id: competencyWithoutExercises,
      title: 'Competência sem conteúdo',
      description: 'Ainda sem lições publicadas.',
    },
  ],
};

describe('competency profile', () => {
  let harness: RouterTestingHarness;

  async function open(url: string, saved: Progress | null): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: CONTENT_CATALOG, useValue: catalogWithEmptyCompetency },
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
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    harness.detectChanges();
    return (harness.routeNativeElement as HTMLElement).querySelector('main')!;
  }

  const text = (el: HTMLElement) => el.textContent?.replace(/\s+/g, ' ') ?? '';
  const now = new Date();
  const solved = (...ids: string[]) =>
    ids.reduce((p, id, i) => {
      const attempt: Attempt = {
        id: `a${i}`,
        activityType: 'exercise',
        activityId: id,
        submittedAt: new Date(now.getTime() - (ids.length - i) * 1000).toISOString(),
        correct: true,
        score: 1,
        answer: null,
        hintsUsed: 0,
        solutionViewed: false,
      };
      return recordAttempt(p, attempt, now);
    }, createEmptyProgress(now));

  it('shows a new student with no evidence and explains the levels', async () => {
    const main = await open('/profile', null);

    expect(text(main)).toContain('não um certificado');
    expect(text(main)).toContain('Sem evidências');
    expect(text(main)).toContain('Nenhuma resposta registrada nas últimas 6 semanas');
    expect(text(main)).toContain('Áreas sem atividades publicadas ainda');
    expect(text(main)).toContain('Performance');
  });

  it('reflects evidence: level, chart and its data table', async () => {
    const main = await open(
      '/profile',
      solved(
        'web-browser-01-display-none',
        'web-browser-01-li-count',
        'web-browser-01-blocking-css',
      ),
    );

    expect(text(main)).toContain('Nível 2 de 4: Praticando');
    expect(main.querySelectorAll('svg.chart g.column').length).toBe(6);
    expect(main.querySelector('.data table tbody')?.textContent).toContain('3');
  });

  it('details a competency with criteria and next activities', async () => {
    const main = await open('/profile/web-fundamentals', solved('web-browser-01-display-none'));

    expect(text(main)).toContain('Fundamentos da web');
    expect(text(main)).toContain('Cumprido: Acertou ao menos 1 exercício');
    expect(text(main)).toContain('Pendente: Um conceito chegou à caixa 3');
    expect(main.querySelector('section[aria-labelledby="next-heading"] a')).not.toBeNull();
  });

  it('is honest about competencies without activities', async () => {
    const main = await open(`/profile/${competencyWithoutExercises}`, null);

    expect(text(main)).toContain('Ainda não há exercícios publicados para esta competência');
  });
});
