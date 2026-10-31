import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LevelInfo } from '../../../core/gamification/xp';

/** Level, total XP and the progress to the next level. */
@Component({
  selector: 'app-level-progress',
  template: `
    @let l = level();
    <section class="panel" aria-labelledby="level-heading">
      <h2 id="level-heading" class="panel__title">Nível {{ l.level }}</h2>
      <p class="total">{{ l.xp }} XP</p>
      <div class="field">
        <label class="field__label" for="level-bar">
          {{ remaining() }} XP para o nível {{ l.level + 1 }}
        </label>
        <progress
          id="level-bar"
          class="bar"
          [max]="l.nextLevelAt - l.levelStart"
          [value]="l.xp - l.levelStart"
        ></progress>
      </div>
    </section>
  `,
  styles: `
    .total {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      line-height: 1;
    }

    .bar {
      width: 100%;
      height: 0.5rem;
      border: 0;
      border-radius: var(--radius-full);
      background: var(--color-surface-3);
      overflow: hidden;
      appearance: none;

      &::-webkit-progress-bar {
        background: var(--color-surface-3);
      }

      &::-webkit-progress-value {
        background: var(--color-accent);
        border-radius: var(--radius-full);
      }

      &::-moz-progress-bar {
        background: var(--color-accent);
        border-radius: var(--radius-full);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LevelProgress {
  readonly level = input.required<LevelInfo>();
  protected readonly remaining = computed(() => this.level().nextLevelAt - this.level().xp);
}
