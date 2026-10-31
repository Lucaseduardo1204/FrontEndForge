import { TestBed } from '@angular/core/testing';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CONTENT } from '../content';
import { routes } from './app.routes';
import { Progress } from './core/models/progress.models';
import { AppTitleStrategy } from './core/navigation/app-title-strategy';
import { ProgressRepository } from './core/persistence/progress-repository';
import { ProgressService } from './core/progress/progress.service';

/**
 * End-to-end flow with the real content:
 * Dashboard → Lesson → Exercise → Evaluation → Feedback → Saved progress.
 */
describe('main learning flow', () => {
  let stored: Progress | null;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    stored = null;
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: TitleStrategy, useExisting: AppTitleStrategy },
        {
          provide: ProgressRepository,
          useValue: {
            load: async () => stored,
            save: async (p: Progress) => void (stored = p),
            clear: async () => void (stored = null),
          },
        },
      ],
    });
    await TestBed.inject(ProgressService).load();
    harness = await RouterTestingHarness.create();
  });

  /** Lets saves (promises outside Angular's knowledge) finish, then renders. */
  async function settle(): Promise<void> {
    harness.detectChanges();
    await harness.fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    harness.detectChanges();
  }

  async function go(url: string): Promise<void> {
    await harness.navigateByUrl(url);
    await settle();
  }

  const root = () => harness.routeNativeElement as HTMLElement;
  const main = () => root().querySelector('main') as HTMLElement;
  const stepNav = () => root().querySelector('nav[aria-label="Etapas da lição"]') as HTMLElement;

  function button(label: string, scope: HTMLElement = main()): HTMLButtonElement {
    const found = Array.from(scope.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(label),
    );
    if (!found) throw new Error(`Botão “${label}” não encontrado`);
    return found;
  }

  function exercise(title: string): HTMLElement {
    const found = Array.from(main().querySelectorAll<HTMLElement>('article')).find((a) =>
      a.querySelector('h3')?.textContent?.includes(title),
    );
    if (!found) throw new Error(`Exercício “${title}” não encontrado`);
    return found;
  }

  async function answerText(article: HTMLElement, text: string): Promise<void> {
    const input = article.querySelector<HTMLInputElement>('input[type="text"]')!;
    input.value = text;
    input.dispatchEvent(new Event('input'));
    await settle();
    button('Verificar resposta', article).click();
    await settle();
  }

  async function choose(article: HTMLElement, optionText: string): Promise<void> {
    const label = Array.from(article.querySelectorAll('label')).find((l) =>
      l.textContent?.includes(optionText),
    )!;
    label.querySelector('input')!.click();
    await settle();
    button('Verificar resposta', article).click();
    await settle();
  }

  it('takes a new student from the dashboard to a completed lesson', async () => {
    // Dashboard: honest empty state and a recommendation with its reason.
    await go('/');
    expect(main().textContent).toContain('Nenhuma atividade registrada ainda');
    expect(main().textContent).toContain('primeira lição da trilha');
    const start = Array.from(main().querySelectorAll('a')).find((a) =>
      a.textContent?.includes('Começar a lição'),
    )!;
    expect(start.getAttribute('href')).toBe('/lessons/web-browser-01');

    // Lesson opens on the first step and is marked as started.
    await go('/lessons/web-browser-01');
    expect(main().querySelector('h1')?.textContent).toContain('Como o navegador interpreta');
    expect(main().querySelector('h2')?.textContent).toContain('Por que isso importa');
    expect(stored?.lessons['web-browser-01']?.currentStepIndex).toBe(0);

    // Jump to the assessment step through the step navigation.
    button('Avaliação', stepNav()).click();
    await settle();
    expect(stored?.lessons['web-browser-01']?.currentStepIndex).toBe(8);

    // Wrong answer: explained, saved, solution unlocked.
    const liCount = exercise('Quantos itens o script enxerga?');
    expect(liCount.textContent).toContain('A solução é liberada depois da sua primeira tentativa');
    await answerText(liCount, '3');
    expect(liCount.textContent).toContain('Resposta incorreta');
    expect(liCount.textContent).toContain('O terceiro <li> vem depois do script');
    expect(stored?.attempts.at(-1)).toMatchObject({
      activityId: 'web-browser-01-li-count',
      correct: false,
    });
    expect(liCount.textContent).toContain('Mostrar a solução');

    // Retry with the right answer.
    button('Tentar novamente', liCount).click();
    await settle();
    await answerText(liCount, '2');
    expect(liCount.textContent).toContain('Resposta correta');
    expect(stored?.completions['exercise:web-browser-01-li-count']).toBeDefined();
    // The first correct answer earns XP and an achievement, each with its reason.
    expect(liCount.textContent).toContain('+10 XP');
    expect(liCount.textContent).toContain('Conquista desbloqueada: Primeira resposta certa');
    // Getting it right puts its concepts into spaced review, starting tomorrow.
    expect(stored?.reviews['web-dom']?.box).toBe(1);
    expect(stored?.reviews['web-script-loading']?.box).toBe(1);

    // The lesson cannot be completed while assessment exercises are pending.
    button('Revisão', stepNav()).click();
    await settle();
    expect(main().textContent).toContain('Falta pouco para concluir');
    expect(main().textContent).toContain('Por que o CSS bloqueia a renderização?');

    button('Ir para a avaliação').click();
    await settle();
    await choose(exercise('Por que o CSS bloqueia'), 'Para não pintar o conteúdo sem estilo');
    await choose(exercise('Qual mudança exige recalcular'), "elemento.style.width = '320px'");

    button('Revisão', stepNav()).click();
    await settle();
    button('Concluir lição').click();
    await settle();
    expect(main().textContent).toContain('Lição concluída');
    expect(main().textContent).toContain('+50 XP');
    expect(main().textContent).toContain('Conquista desbloqueada: Primeira lição concluída');
    expect(stored?.completions['lesson:web-browser-01']).toBeDefined();

    // Dashboard reflects the saved progress.
    await go('/');
    expect(main().textContent).toContain(
      `Lições concluídas: 1 de ${CONTENT.lessons.length} publicadas`,
    );
    // The next lesson of the trail (its module depends on this one) comes next.
    expect(main().textContent).toContain(CONTENT.lessons[1].title);
    expect(main().textContent).toContain('Quantos itens o script enxerga?');
  });

  it('resumes an unfinished lesson from the dashboard at the saved step', async () => {
    await go('/lessons/web-browser-01');
    button('Próxima:').click();
    await settle();
    button('Próxima:').click();
    await settle();

    await go('/');
    expect(main().textContent).toContain('Você parou na etapa 3 de 10');
    expect(main().textContent).toContain('Continuar estudando');

    await go('/lessons/web-browser-01');
    expect(main().querySelector('h2')?.textContent).toContain('O caminho crítico de renderização');
  });

  it('shows an honest message for unknown lessons', async () => {
    await go('/lessons/nao-existe');

    expect(main().querySelector('h1')?.textContent).toContain('Lição não encontrada');
  });
});
