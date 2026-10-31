import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { PredictOutputExercise } from '../../../core/models/content.models';
import { ContentBlocks } from '../../../shared/ui/content-blocks/content-blocks';

let nextId = 0;

@Component({
  selector: 'app-predict-input',
  imports: [ContentBlocks],
  template: `
    <app-content-blocks [blocks]="codeBlock()" />
    <div class="field">
      <label class="field__label" [for]="id">Saída no console</label>
      <input
        class="text-input"
        type="text"
        autocomplete="off"
        spellcheck="false"
        [id]="id"
        [disabled]="disabled()"
        [value]="text()"
        (input)="text.set($any($event.target).value)"
      />
      <p class="field__hint">Espaços extras e aspas em volta são ignorados; maiúsculas contam.</p>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-4);
    }

    // Base style comes from the global .text-input; only the differences live here.
    .text-input {
      max-width: 24rem;
      font-family: var(--font-mono);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredictInput {
  readonly exercise = input.required<PredictOutputExercise>();
  readonly disabled = input(false);
  readonly text = model.required<string>();

  protected readonly id = `predict-${nextId++}`;
  protected readonly codeBlock = computed(() => [
    {
      type: 'code' as const,
      language: this.exercise().language,
      code: this.exercise().code,
      caption: 'Código',
    },
  ]);
}
