import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RunResult } from '../../../core/lab/lab-protocol';

/** Console output of a real run. Shows nothing invented: no run, no output. */
@Component({
  selector: 'app-run-output',
  template: `
    @let r = result();
    <section class="output" aria-labelledby="output-heading">
      <h3 id="output-heading" class="output__title">Console</h3>
      @switch (r.status) {
        @case ('completed') {
          @if (r.report.logs.length === 0 && !r.report.error) {
            <p class="output__empty">Nada foi impresso no console.</p>
          } @else {
            <ol class="output__lines">
              @for (line of r.report.logs; track $index) {
                <li [class]="'output__line output__line--' + line.level">
                  <span class="visually-hidden">{{ line.level }}:</span>{{ line.text }}
                </li>
              }
              @if (r.report.error; as error) {
                <li class="output__line output__line--error">
                  Erro não tratado: {{ error.name }}: {{ error.message }}
                </li>
              }
            </ol>
          }
          <p class="output__meta">Executado em {{ r.durationMs }} ms, em ambiente isolado.</p>
        }
        @case ('timeout') {
          <p class="output__line output__line--error">
            Tempo esgotado: a execução foi interrompida após {{ r.timeoutMs / 1000 }} s.
          </p>
        }
        @default {
          <p class="output__line output__line--error">{{ r.message }}</p>
        }
      }
    </section>
  `,
  styles: `
    .output {
      display: grid;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-bg);
      font-family: var(--font-mono);
      font-size: var(--font-size-sm);
    }

    .output__title {
      font-family: var(--font-sans);
      font-size: var(--font-size-xs);
      color: var(--color-text-subtle);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .output__lines {
      display: grid;
      gap: var(--space-1);
      max-height: 16rem;
      margin: 0;
      padding: 0;
      overflow: auto;
      list-style: none;
    }

    .output__line {
      white-space: pre-wrap;
      word-break: break-word;
    }

    .output__line--warn {
      color: var(--color-accent-text);
    }

    .output__line--error {
      color: var(--color-danger);
    }

    .output__empty,
    .output__meta {
      color: var(--color-text-subtle);
      font-family: var(--font-sans);
      font-size: var(--font-size-xs);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunOutput {
  readonly result = input.required<RunResult>();
}
