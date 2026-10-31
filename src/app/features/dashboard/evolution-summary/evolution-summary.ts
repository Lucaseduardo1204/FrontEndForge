import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StreakInfo } from '../../../core/gamification/streak';
import { LevelInfo } from '../../../core/gamification/xp';

@Component({
  selector: 'app-evolution-summary',
  imports: [RouterLink],
  template: `
    @let l = level();
    <section class="panel" aria-labelledby="evolution-heading">
      <h2 id="evolution-heading" class="panel__title">Evolução</h2>
      <dl class="stats">
        <div class="stats__item">
          <dt>Nível</dt>
          <dd>
            {{ l.level }} <span>{{ l.xp }} XP</span>
          </dd>
        </div>
        <div class="stats__item">
          <dt>Sequência</dt>
          <dd>
            {{ streak().current }} <span>{{ streak().current === 1 ? 'dia' : 'dias' }}</span>
          </dd>
        </div>
        <div class="stats__item">
          <dt>Conquistas</dt>
          <dd>
            {{ unlocked() }} <span>de {{ total() }}</span>
          </dd>
        </div>
      </dl>
      <p class="note">
        Indicadores de dedicação, não de competência.
        <a routerLink="/achievements">Ver conquistas e regras do XP</a> ·
        <a routerLink="/profile">Ver competências</a>
      </p>
    </section>
  `,
  styles: `
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
      gap: var(--space-3);
      margin: 0;
    }

    .stats__item {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      background: var(--color-surface-2);

      dt {
        color: var(--color-text-muted);
        font-size: var(--font-size-sm);
      }

      dd {
        margin: var(--space-1) 0 0;
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);

        span {
          color: var(--color-text-subtle);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-regular);
        }
      }
    }

    .note {
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvolutionSummary {
  readonly level = input.required<LevelInfo>();
  readonly streak = input.required<StreakInfo>();
  readonly unlocked = input.required<number>();
  readonly total = input.required<number>();
}
