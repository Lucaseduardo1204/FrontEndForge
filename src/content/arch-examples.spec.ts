import { Component, ErrorHandler, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import ts from 'typescript';
import { Progress } from '../app/core/models/progress.models';
import { ProgressRepository } from '../app/core/persistence/progress-repository';
import { createEmptyProgress } from '../app/core/persistence/progress-schema';
import { startLesson } from '../app/core/progress/progress-updates';
import { ProgressService } from '../app/core/progress/progress.service';
import { APP_CONFIG_TS, REPOSITORY_TS } from './lessons/arch-boundaries-01';
import { BUDGETS_JSON, CI_WORKFLOW_YAML } from './lessons/tooling-ci-01';

/** Reads a project file through the TypeScript compiler host (no @types/node needed). */
const lerArquivo = (caminho: string): string => ts.sys.readFile(caminho) ?? '';

/**
 * The architecture lesson uses this platform as its case study: the snippets must match the
 * real source files, and the claims (swappable repository, global error handler) must hold.
 */

describe('architecture lesson: the case study is the real code', () => {
  it('the repository contract shown is the one in core/persistence', () => {
    const source = lerArquivo('src/app/core/persistence/progress-repository.ts');

    expect(source).toContain(REPOSITORY_TS);
  });

  it('the providers choose the implementation exactly as shown', () => {
    const source = lerArquivo('src/app/core/persistence/progress-storage.providers.ts');
    const lines = APP_CONFIG_TS.split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('//'));

    expect(lines.filter((l) => !source.includes(l))).toEqual([]);
    expect(lerArquivo('src/app/app.config.ts')).toContain('...provideProgressStorage(),');
  });

  it('swapping the repository needs no change in the service that pages use', async () => {
    let saved: Progress | null = createEmptyProgress(new Date('2026-10-30T10:00:00Z'));
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ProgressRepository,
          useValue: {
            load: async () => saved,
            save: async (p: Progress) => void (saved = p),
            clear: async () => undefined,
          },
        },
      ],
    });
    const service = TestBed.inject(ProgressService);

    await service.load();
    await service.update((p, now) => startLesson(p, 'web-browser-01', now));

    expect(saved!.lessons['web-browser-01']).toBeDefined();
  });
});

describe('architecture lesson: global error handler', () => {
  @Injectable()
  class RegistroGlobalDeErros implements ErrorHandler {
    readonly erros: unknown[] = [];
    handleError(erro: unknown): void {
      this.erros.push(erro);
    }
  }

  @Component({
    selector: 'app-salvar',
    template: '<button type="button" (click)="salvar()">Salvar</button>',
  })
  class Salvar {
    salvar(): void {
      throw new Error('falhou ao salvar');
    }
  }

  it('an unexpected error thrown in a click reaches the custom ErrorHandler', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: ErrorHandler, useClass: RegistroGlobalDeErros }],
      // The app does not rethrow; tests do by default. Turn it off to see the app behaviour.
      rethrowApplicationErrors: false,
    });
    const fixture = TestBed.createComponent(Salvar);
    await fixture.whenStable();

    fixture.nativeElement.querySelector('button').click();

    const handler = TestBed.inject(ErrorHandler) as RegistroGlobalDeErros;
    expect(handler.erros.map(String)).toEqual(['Error: falhou ao salvar']);
  });
});

describe('git lesson: versions quoted in the text come from the lab solution', () => {
  it('1.4.2 with the lesson commits gives 2.0.0; without the breaking change 1.5.0; only fix and docs 1.4.3', async () => {
    const { TOOLING_GIT_01_EXERCISES } = await import('./exercises/tooling-git-01.exercises');
    const { TOOLING_GIT_01, COMMITS_TEXT, CONFLICT_TEXT } =
      await import('./lessons/tooling-git-01');
    const exercise = TOOLING_GIT_01_EXERCISES.find((e) => e.id === 'lab-js-semver')!;
    const code = exercise.solution.find((b) => b.type === 'code');
    const proximaVersao = new Function(
      `${code?.type === 'code' ? code.code : ''}\nreturn proximaVersao;`,
    )() as (atual: string, mensagens: string[]) => string;
    const messages = [
      'feat(carrinho): aplica cupom de desconto',
      'fix(busca): ignora espaços nas pontas do termo',
      'docs: explica como rodar os testes',
      'refactor(carrinho)!: troca o formato dos itens\n\nBREAKING CHANGE: itens agora usam preco em centavos',
    ];
    for (const m of messages) expect(COMMITS_TEXT, m).toContain(m.split('\n')[0]);

    expect(proximaVersao('1.4.2', messages)).toBe('2.0.0');
    expect(proximaVersao('1.4.2', messages.slice(0, 3))).toBe('1.5.0');
    expect(proximaVersao('1.4.2', messages.slice(1, 3))).toBe('1.4.3');
    const text = TOOLING_GIT_01.steps
      .flatMap((s) => s.blocks)
      .map((b) => (b.type === 'paragraph' ? b.text : ''))
      .join(' ');
    expect(text).toContain('levam a 2.0.0');
    expect(text).toContain('seriam 1.5.0');
    expect(text).toContain('1.4.3');
    // Markers in the format git produced in the measured merge.
    expect(CONFLICT_TEXT.split('\n').map((l) => l.slice(0, 7))).toEqual(
      expect.arrayContaining(['<<<<<<<', '=======', '>>>>>>>']),
    );
  });
});

describe('CI lesson: the pipeline and build facts match this project', () => {
  it('every npm command in the workflow exists in package.json', () => {
    const scripts = JSON.parse(lerArquivo('package.json')).scripts as Record<string, string>;
    const commands = [...CI_WORKFLOW_YAML.matchAll(/run: npm (?:run )?([\w:-]+)/g)].map(
      (m) => m[1],
    );

    expect(commands).toEqual(['ci', 'lint', 'test', 'build']);
    for (const name of commands.filter((c) => c !== 'ci')) expect(scripts[name]).toBeTruthy();
    expect(scripts['test']).toContain('--watch=false'); // the pipeline must not hang in watch mode
  });

  it('the budgets and output hashing shown are the production configuration', () => {
    const angular = JSON.parse(lerArquivo('angular.json'));
    const build = angular.projects['frontend-forge'].architect.build;
    const shown = JSON.parse(`{${BUDGETS_JSON}}`).production;

    expect(build.defaultConfiguration).toBe('production');
    expect(build.configurations.production.budgets).toEqual(shown.budgets);
    expect(build.configurations.production.outputHashing).toBe(shown.outputHashing);
  });
});
