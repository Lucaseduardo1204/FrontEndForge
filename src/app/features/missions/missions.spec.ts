import { TestBed } from '@angular/core/testing';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CONTENT } from '../../../content';
import { routes } from '../../app.routes';
import { Attempt, Progress } from '../../core/models/progress.models';
import { AppTitleStrategy } from '../../core/navigation/app-title-strategy';
import { ProgressRepository } from '../../core/persistence/progress-repository';
import { createEmptyProgress } from '../../core/persistence/progress-schema';
import { recordAttempt } from '../../core/progress/progress-updates';
import { ProgressService } from '../../core/progress/progress.service';

describe('missions', () => {
  let stored: Progress | null;
  let harness: RouterTestingHarness;

  async function open(url: string, saved: Progress | null = null): Promise<void> {
    stored = saved;
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: TitleStrategy, useExisting: AppTitleStrategy },
        {
          provide: ProgressRepository,
          useValue: {
            load: async () => stored,
            save: async (p: Progress) => void (stored = p),
            clear: async () => undefined,
          },
        },
      ],
    });
    await TestBed.inject(ProgressService).load();
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    harness.detectChanges();
  }

  const main = () => (harness.routeNativeElement as HTMLElement).querySelector('main')!;
  const text = () => main().textContent?.replace(/\s+/g, ' ') ?? '';

  async function settle(): Promise<void> {
    harness.detectChanges();
    await harness.fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    harness.detectChanges();
  }

  it('lists the three missions with their progress', async () => {
    await open('/missions');

    expect(main().querySelectorAll('ul.missions > li').length).toBe(CONTENT.missions.length);
    expect(text()).toContain('Identifique uma falha de segurança');
    expect(text()).toContain('0 de 2 tarefas');
  });

  it('answers the diagnosis inline, links the fix to the lab and hides the debrief', async () => {
    await open('/missions/mission-xss');
    expect(text()).toContain('Exemplo vulnerável, com finalidade didática');
    expect(text()).toContain(
      'A explicação completa aparece quando todas as tarefas estiverem resolvidas',
    );
    expect(main().querySelector('a[href="/lab/mission-xss-escape"]')?.textContent).toContain(
      'Resolver no laboratório',
    );

    Array.from(main().querySelectorAll('label'))
      .find((l) => l.textContent?.includes('A imagem falha ao carregar'))!
      .querySelector('input')!
      .click();
    await settle();
    Array.from(main().querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Verificar resposta'))!
      .click();
    await settle();

    expect(text()).toContain('XSS armazenado');
    expect(text()).toContain('1 de 2 tarefas');
  });

  it('shows the debrief once every task is solved', async () => {
    const now = new Date(2026, 9, 29, 10);
    const solved = ['mission-xss-impact', 'mission-xss-escape'].reduce((p, id, i) => {
      const attempt: Attempt = {
        id: `a${i}`,
        activityType: 'exercise',
        activityId: id,
        submittedAt: now.toISOString(),
        correct: true,
        score: 1,
        answer: null,
        hintsUsed: 0,
        solutionViewed: false,
      };
      return recordAttempt(p, attempt, now);
    }, createEmptyProgress(now));

    await open('/missions/mission-xss', solved);

    expect(text()).toContain('Cumprida');
    expect(text()).toContain('XSS acontece quando dados viram código');
  });

  it('links lab tasks back to their mission', async () => {
    await open('/lab/mission-typing-fix');

    expect(text()).toContain('Voltar à missão “Identifique um problema de tipagem”');
  });
});
