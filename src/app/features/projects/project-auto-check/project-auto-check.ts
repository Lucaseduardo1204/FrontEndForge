import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { LucidePlay } from '@lucide/angular';
import { CodeRunnerService } from '../../../core/lab/code-runner.service';
import { evaluateCodeRun } from '../../../core/lab/code-evaluation';
import { RunResult } from '../../../core/lab/lab-protocol';
import { Evaluation } from '../../../core/learning/exercise-evaluation';
import { Project } from '../../../core/models/content.models';
import { recordProjectCheck } from '../../../core/progress/project-updates';
import { ProgressService } from '../../../core/progress/progress.service';
import { CodeEditor } from '../../../shared/code/code-editor/code-editor';
import { HtmlPreview } from '../../../shared/code/html-preview/html-preview';
import { RunOutput } from '../../../shared/code/run-output/run-output';
import { ExerciseFeedback } from '../../../shared/exercise/exercise-feedback';
import { ContentBlocks } from '../../../shared/ui/content-blocks/content-blocks';

/** Runs the project's automatic checks on the pasted code, in the isolated runners. */
@Component({
  selector: 'app-project-auto-check',
  imports: [CodeEditor, ContentBlocks, ExerciseFeedback, HtmlPreview, RunOutput, LucidePlay],
  template: `
    @let check = project().autoCheck;
    <app-content-blocks [blocks]="check.instructions" />
    <app-code-editor
      [editorId]="project().id + '-code'"
      [label]="check.language === 'html' ? 'Seu index.html completo' : 'Suas funções (tarefas.js)'"
      [rows]="18"
      [(code)]="code"
      (runRequested)="run()"
    />
    <div class="btn-row">
      <button
        type="button"
        class="btn btn--primary"
        [disabled]="running()"
        [attr.aria-busy]="running()"
        (click)="run()"
      >
        <svg lucidePlay aria-hidden="true"></svg>
        {{ running() ? 'Verificando…' : 'Executar verificação automática' }}
      </button>
    </div>
    @if (check.language === 'html') {
      <app-html-preview />
    }
    <div aria-live="polite" class="results">
      @if (evaluation(); as result) {
        <app-exercise-feedback [evaluation]="result" />
      }
      @if (check.language === 'javascript' && result(); as run) {
        <app-run-output [result]="run" />
      }
    </div>
    <div role="alert">
      @if (saveError(); as error) {
        <p class="notice notice--danger">{{ error }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-4);
    }

    .results {
      display: grid;
      gap: var(--space-3);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectAutoCheck {
  private readonly runner = inject(CodeRunnerService);
  private readonly progressService = inject(ProgressService);

  readonly project = input.required<Project>();

  private readonly lastCode = computed(() => {
    const id = this.project().id;
    const last = [...this.progressService.progress().attempts]
      .reverse()
      .find((a) => a.activityType === 'project' && a.activityId === id);
    const code = (last?.answer as { code?: unknown } | undefined)?.code;
    return typeof code === 'string' ? code : null;
  });

  /** Starts from the code of the last check, or from the starter code. */
  protected readonly code = linkedSignal(
    () => this.lastCode() ?? this.project().autoCheck.starterCode,
  );
  protected readonly running = signal(false);
  protected readonly result = signal<RunResult | null>(null);
  protected readonly evaluation = signal<Evaluation | null>(null);
  protected readonly saveError = signal<string | null>(null);

  private readonly preview = viewChild(HtmlPreview);

  protected async run(): Promise<void> {
    if (this.running()) return;
    const project = this.project();
    const { autoCheck } = project;
    const code = this.code();
    this.running.set(true);
    this.saveError.set(null);

    const result =
      autoCheck.language === 'html'
        ? await (this.preview()?.render(code, autoCheck.tests) ??
            Promise.resolve<RunResult>({ status: 'unavailable', message: 'Prévia indisponível.' }))
        : await this.runner.runJavaScript(code, autoCheck.tests);
    const evaluation = evaluateCodeRun(autoCheck, result);
    this.result.set(result);
    this.evaluation.set(evaluation);

    // Environment failures are not the student's check; anything that ran is recorded.
    if (result.status !== 'unavailable') {
      try {
        await this.progressService.update((progress, now) =>
          recordProjectCheck(
            progress,
            {
              id: crypto.randomUUID(),
              activityType: 'project',
              activityId: project.id,
              submittedAt: now.toISOString(),
              correct: evaluation.correct,
              score: evaluation.score,
              answer: { code },
              hintsUsed: 0,
              solutionViewed: false,
            },
            now,
          ),
        );
      } catch (error) {
        this.saveError.set(
          `A verificação rodou, mas não foi salva. ${error instanceof Error ? error.message : ''}`,
        );
      }
    }
    this.running.set(false);
  }
}
