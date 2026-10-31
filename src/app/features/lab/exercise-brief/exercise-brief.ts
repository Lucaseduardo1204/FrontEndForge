import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CodeExercise } from '../../../core/models/content.models';
import { ContentBlocks } from '../../../shared/ui/content-blocks/content-blocks';

@Component({
  selector: 'app-exercise-brief',
  imports: [ContentBlocks],
  template: `
    @let ex = exercise();
    <app-content-blocks [blocks]="ex.prompt" />

    <section aria-labelledby="requirements-heading">
      <h2 id="requirements-heading" class="brief__title">Requisitos</h2>
      <ul class="brief__list">
        @for (requirement of ex.requirements; track requirement) {
          <li>{{ requirement }}</li>
        }
      </ul>
    </section>

    @if (ex.examples.length > 0) {
      <section aria-labelledby="examples-heading">
        <h2 id="examples-heading" class="brief__title">Exemplos</h2>
        <table class="examples">
          <thead>
            <tr>
              <th scope="col">Chamada</th>
              <th scope="col">Resultado esperado</th>
            </tr>
          </thead>
          <tbody>
            @for (example of ex.examples; track example.input) {
              <tr>
                <td>
                  <code>{{ example.input }}</code>
                </td>
                <td>
                  <code>{{ example.output }}</code>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    }

    <section aria-labelledby="tests-heading">
      <h2 id="tests-heading" class="brief__title">O que os testes verificam</h2>
      <ul class="brief__list">
        @for (test of ex.tests; track test.id) {
          <li>{{ test.description }}</li>
        }
      </ul>
    </section>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-5);
    }

    .brief__title {
      margin-bottom: var(--space-2);
      font-size: var(--font-size-md);
    }

    .brief__list {
      display: grid;
      gap: var(--space-1);
      margin: 0;
      padding-left: var(--space-5);
    }

    .examples {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--font-size-sm);

      th,
      td {
        padding: var(--space-2) var(--space-3);
        border-bottom: 1px solid var(--color-border);
        text-align: left;
        vertical-align: top;
      }

      th {
        color: var(--color-text-muted);
        font-weight: var(--font-weight-medium);
      }

      code {
        word-break: break-word;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseBrief {
  readonly exercise = input.required<CodeExercise>();
}
