import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAward } from '@lucide/angular';
import { Reward } from '../../../core/gamification/gamification.service';

/** Shows what an action earned and why. Informative, no animation or pressure. */
@Component({
  selector: 'app-reward-notice',
  imports: [LucideAward],
  template: `
    @let r = reward();
    <div class="reward">
      @for (entry of r.xp; track entry.id) {
        <p>
          <strong>+{{ entry.amount }} XP</strong> · {{ entry.reason }}
        </p>
      }
      @for (achievement of r.achievements; track achievement.id) {
        <p class="reward__achievement">
          <svg lucideAward size="18" aria-hidden="true"></svg>
          <span>
            <strong>Conquista desbloqueada: {{ achievement.title }}.</strong>
            {{ achievement.criteria }}
          </span>
        </p>
      }
    </div>
  `,
  styles: `
    .reward {
      display: grid;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      border: 1px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
      border-radius: var(--radius-md);
      background: var(--color-accent-soft);
      font-size: var(--font-size-sm);
    }

    .reward__achievement {
      display: flex;
      gap: var(--space-2);
      align-items: flex-start;

      svg {
        margin-top: 0.1rem;
        color: var(--color-accent-text);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardNotice {
  readonly reward = input.required<Reward>();
}
