import { TestBed } from '@angular/core/testing';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CONTENT } from '../../../content';
import { routes } from '../../app.routes';
import { RUNNER_WORKER_FACTORY, RunnerWorker } from '../../core/lab/code-runner.service';
import { WORKER_RUNNER_SOURCE } from '../../core/lab/runner-source';
import { Progress } from '../../core/models/progress.models';
import { AppTitleStrategy } from '../../core/navigation/app-title-strategy';
import { ProgressRepository } from '../../core/persistence/progress-repository';
import { ProgressService } from '../../core/progress/progress.service';

/** jsdom has no Worker: executes the real runner source in a fake worker scope. */
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

const TASKS_SOLUTION = `
let n = 0;
function adicionarTarefa(t, titulo) {
  if (!titulo.trim()) throw new Error('vazio');
  return [...t, { id: ++n, titulo: titulo.trim(), concluida: false }];
}
function alternarConcluida(t, id) { return t.map((x) => (x.id === id ? { ...x, concluida: !x.concluida } : x)); }
function removerTarefa(t, id) { return t.filter((x) => x.id !== id); }
function filtrarTarefas(t, f) { return f === 'pendentes' ? t.filter((x) => !x.concluida) : f === 'concluidas' ? t.filter((x) => x.concluida) : t; }
function contarPendentes(t) { return t.filter((x) => !x.concluida).length; }
`;

describe('projects', () => {
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
  const text = () => main().textContent?.replace(/\s+/g, ' ') ?? '';

  async function settle(): Promise<void> {
    harness.detectChanges();
    await harness.fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 20));
    harness.detectChanges();
  }

  const button = (label: string) =>
    Array.from(main().querySelectorAll('button')).find((b) => b.textContent?.includes(label))!;

  it('lists every project with its phase', async () => {
    await harness.navigateByUrl('/projects');
    harness.detectChanges();

    expect(main().querySelectorAll('ul.projects > li').length).toBe(CONTENT.projects.length);
    expect(text()).toContain('Painel administrativo de gestão');
    expect(text()).toContain('Página de apresentação profissional acessível');
    expect(text()).toContain('Aplicação de gerenciamento de tarefas');
  });

  it('goes from checklist and automatic check to a completed project', async () => {
    await harness.navigateByUrl('/projects/project-js-tasks');
    await settle();
    expect(text()).toContain('Execute a verificação automática do seu código.');
    expect(button('Concluir projeto').disabled).toBe(true);

    // Automatic check with the real runner: starter fails, solution passes.
    const area = main().querySelector('textarea')!;
    area.value = TASKS_SOLUTION;
    area.dispatchEvent(new Event('input'));
    await settle();
    button('Executar verificação automática').click();
    await settle();
    expect(text()).toContain('Todos os 8 testes passaram');
    expect(stored?.attempts.at(-1)).toMatchObject({ activityType: 'project', correct: true });

    // Checklist and self-assessment.
    for (const box of Array.from(main().querySelectorAll<HTMLInputElement>('.checklist input'))) {
      box.click();
      await settle();
    }
    for (const fieldset of Array.from(main().querySelectorAll('fieldset.criterion'))) {
      fieldset.querySelector<HTMLInputElement>('input[type=radio]')!.click();
      await settle();
    }
    expect(text()).not.toContain('Falta:');

    button('Concluir projeto').click();
    await settle();
    expect(text()).toContain('Projeto concluído');
    expect(text()).toContain('+100 XP');
    expect(text()).toContain('Conquista desbloqueada: Primeiro projeto concluído');
    expect(stored?.completions['project:project-js-tasks']).toBeDefined();
  });

  it('handles unknown projects', async () => {
    await harness.navigateByUrl('/projects/nao-existe');
    harness.detectChanges();

    expect(main().querySelector('h1')?.textContent).toContain('Projeto não encontrado');
  });
});
