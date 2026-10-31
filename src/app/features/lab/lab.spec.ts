import { TestBed } from '@angular/core/testing';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { CONTENT } from '../../../content';
import { RUNNER_WORKER_FACTORY, RunnerWorker } from '../../core/lab/code-runner.service';
import { WORKER_RUNNER_SOURCE } from '../../core/lab/runner-source';
import { Progress } from '../../core/models/progress.models';
import { AppTitleStrategy } from '../../core/navigation/app-title-strategy';
import { ProgressRepository } from '../../core/persistence/progress-repository';
import { ProgressService } from '../../core/progress/progress.service';

/** jsdom has no Worker: this one executes the real runner source in a fake worker scope. */
function inProcessRunner(): RunnerWorker {
  const worker: RunnerWorker = {
    onmessage: null,
    onerror: null,
    postMessage(message) {
      const scope = {
        onmessage: null as null | ((e: { data: unknown }) => Promise<void>),
        postMessage: (data: unknown) => worker.onmessage?.({ data } as MessageEvent),
      };
      new Function('self', WORKER_RUNNER_SOURCE)(scope);
      void scope.onmessage!({ data: message });
    },
    terminate: () => undefined,
  };
  return worker;
}

describe('lab', () => {
  let stored: Progress | null;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    stored = null;
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: TitleStrategy, useExisting: AppTitleStrategy },
        { provide: RUNNER_WORKER_FACTORY, useValue: inProcessRunner },
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
  });

  const main = () => (harness.routeNativeElement as HTMLElement).querySelector('main')!;

  async function settle(): Promise<void> {
    harness.detectChanges();
    await harness.fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 20));
    harness.detectChanges();
  }

  async function runCode(code: string): Promise<void> {
    const area = main().querySelector('textarea')!;
    area.value = code;
    area.dispatchEvent(new Event('input'));
    await settle();
    Array.from(main().querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Executar testes'))!
      .click();
    await settle();
  }

  it('lists the code exercises with language and test count', async () => {
    await harness.navigateByUrl('/lab');
    harness.detectChanges();

    const items = main().querySelectorAll('ul.exercises > li');
    expect(items.length).toBe(CONTENT.exercises.filter((e) => e.kind === 'code').length);
    expect(main().textContent).toContain('Tarefa da missão');
    expect(main().textContent).toContain('JavaScript · Introdutório · 5 testes');
    expect(main().textContent).toContain('sem acesso aos seus dados nem à rede');
  });

  it('runs the code, explains failing tests and saves the attempt with the code', async () => {
    await harness.navigateByUrl('/lab/lab-js-sum-even');
    await settle();
    expect(main().textContent).toContain('Nada foi executado ainda');

    await runCode('function somarPares(n) { return 0; }');
    expect(main().textContent).toContain('3 de 5 testes passaram');
    expect(main().textContent).toContain('Esperado 6, recebido 0.');
    expect(stored?.attempts.at(-1)).toMatchObject({
      activityId: 'lab-js-sum-even',
      correct: false,
      answer: { kind: 'code', code: 'function somarPares(n) { return 0; }' },
    });
    expect(main().textContent).toContain('Mostrar a solução');

    await runCode(
      'function somarPares(n) { return n.filter((x) => x % 2 === 0).reduce((a, b) => a + b, 0); }\nconsole.log("pronto")',
    );
    expect(main().textContent).toContain('Todos os 5 testes passaram');
    expect(main().textContent).toContain('pronto');
    expect(stored?.completions['exercise:lab-js-sum-even']).toBeDefined();
  });

  it('reopens with the code of the last attempt', async () => {
    await harness.navigateByUrl('/lab/lab-js-sum-even');
    await settle();
    await runCode('// minha tentativa');

    await harness.navigateByUrl('/lab');
    await harness.navigateByUrl('/lab/lab-js-sum-even');
    await settle();

    expect(main().querySelector('textarea')!.value).toBe('// minha tentativa');
  });

  it('handles unknown exercises and non-code exercises', async () => {
    await harness.navigateByUrl('/lab/web-browser-01-display-none');
    harness.detectChanges();

    expect(main().querySelector('h1')?.textContent).toContain('Exercício não encontrado');
  });
});
