import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CompetencyLevel, LEVEL_LABELS } from '../../../core/learning/competency';

/** Four segments, filled up to the level, plus the level name (never color alone). */
@Component({
  selector: 'app-level-meter',
  template: `
    <span class="meter" aria-hidden="true">
      @for (segment of segments; track segment) {
        <span class="meter__segment" [class.meter__segment--on]="segment <= level()"></span>
      }
    </span>
    <span class="meter__label">
      <span class="visually-hidden">Nível {{ level() }} de 4: </span>{{ labels[level()] }}
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }

    .meter {
      display: inline-flex;
      gap: 2px;
    }

    .meter__segment {
      width: 1.25rem;
      height: 0.5rem;
      border-radius: 2px;
      background: var(--color-surface-3);
    }

    .meter__segment--on {
      background: var(--color-accent);
    }

    .meter__label {
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LevelMeter {
  readonly level = input.required<CompetencyLevel>();
  protected readonly segments = [1, 2, 3, 4] as const;
  protected readonly labels = LEVEL_LABELS;
}
