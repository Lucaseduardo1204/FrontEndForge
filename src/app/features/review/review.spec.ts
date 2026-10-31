import { TestBed } from '@angular/core/testing';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { scheduleConcepts } from '../../core/learning/spaced-repetition';
import { Progress } from '../../core/models/progress.models';
import { AppTitleStrategy } from '../../core/navigation/app-title-strategy';
import { ProgressRepository } from '../../core/persistence/progress-repository';
import { createEmptyProgress } from '../../core/persistence/progress-schema';
import { ProgressService } from '../../core/progress/progress.service';

describe('review session', () => {
  let stored: Progress | null;
  let harness: RouterTestingHarness;

  async function open(saved: Progress | null): Promise<HTMLElement> {
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
    await harness.navigateByUrl('/review');
    harness.detectChanges();
    return (harness.routeNativeElement as HTMLElement).querySelector('main')!;
  }

  async function settle(): Promise<void> {
    harness.detectChanges();
    await harness.fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    harness.detectChanges();
  }

  async function choose(main: HTMLElement, optionText: string): Promise<void> {
    Array.from(main.querySelectorAll('label'))
      .find((l) => l.textContent?.includes(optionText))!
      .querySelector('input')!
      .click();
    await settle();
    Array.from(main.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Verificar resposta'))!
      .click();
    await settle();
  }

  const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000);
  const dueDom = () => scheduleConcepts(createEmptyProgress(twoDaysAgo), ['web-dom'], twoDaysAgo);

  it('explains how reviews start when nothing is scheduled', async () => {
    const main = await open(null);

    expect(main.textContent).toContain('Nenhum conceito em revisão ainda');
    expect(main.textContent).toContain('Errou na revisão: o conceito volta para a caixa 1.');
  });

  it('reviews a due concept: right answer moves it up a box, without a retry', async () => {
    const main = await open(dueDom());

    expect(main.textContent?.replace(/\s+/g, ' ')).toContain(
      'Revisão 1 de 1 · caixa 1 · atrasada há 1 dia',
    );
    expect(main.querySelector('h2')?.textContent).toContain('DOM');

    await choose(main, 'Continua no DOM, mas fica fora da render tree');

    expect(main.textContent).toContain('“DOM” sobe para a caixa 2: próxima revisão em 3 dias');
    expect(main.textContent).not.toContain('Responder de novo');
    expect(stored?.reviews['web-dom'].box).toBe(2);
    expect(stored?.attempts.at(-1)).toMatchObject({
      activityType: 'review',
      activityId: 'web-dom',
      correct: true,
      answer: { exerciseId: 'web-browser-01-display-none' },
    });

    Array.from(main.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Concluir sessão'))!
      .click();
    await settle();
    expect(main.textContent).toContain('Você lembrou de 1 de 1 conceito');
    expect(main.textContent).toContain('Agenda');
  });

  it('sends a forgotten concept back to box 1', async () => {
    const main = await open(dueDom());

    await choose(main, 'É removido do DOM');

    expect(main.textContent).toContain('volta para a caixa 1 e será revisado amanhã');
    expect(stored?.reviews['web-dom'].box).toBe(1);
  });
});
