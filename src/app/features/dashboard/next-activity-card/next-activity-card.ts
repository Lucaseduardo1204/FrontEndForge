import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideInfo } from '@lucide/angular';
import { NextActivity } from '../../../core/learning/next-activity';
import { nextActivityView } from './next-activity-view';

@Component({
  selector: 'app-next-activity-card',
  imports: [RouterLink, LucideArrowRight, LucideInfo],
  template: `
    @let v = view();
    <section class="panel next" aria-labelledby="next-heading">
      <p class="eyebrow" id="next-heading">Próxima atividade recomendada · {{ v.label }}</p>
      <p class="next__title">{{ v.title }}</p>
      @if (v.summary) {
        <p class="next__summary">{{ v.summary }}</p>
      }
      <p class="next__reason">
        <svg lucideInfo size="16" aria-hidden="true"></svg>
        <span><span class="visually-hidden">Por que esta atividade: </span>{{ v.reason }}</span>
      </p>
      @if (v.action; as action) {
        <div class="btn-row">
          <a
            class="btn btn--primary"
            [routerLink]="action.commands"
            [queryParams]="action.queryParams"
          >
            {{ action.text }}
            <svg lucideArrowRight aria-hidden="true"></svg>
          </a>
        </div>
      }
    </section>
  `,
  styles: `
    .next {
      gap: var(--space-3);
      border-color: var(--color-border-strong);
    }

    .next__title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      line-height: var(--line-height-tight);
    }

    .next__summary {
      max-width: var(--reading-max-width);
      color: var(--color-text-muted);
    }

    .next__reason {
      display: flex;
      gap: var(--space-2);
      align-items: flex-start;
      max-width: var(--reading-max-width);
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);

      svg {
        margin-top: 0.2rem;
        color: var(--color-info);
      }
    }

    .btn-row {
      margin-top: var(--space-2);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextActivityCard {
  readonly activity = input.required<NextActivity>();
  protected readonly view = computed(() => nextActivityView(this.activity()));
}
