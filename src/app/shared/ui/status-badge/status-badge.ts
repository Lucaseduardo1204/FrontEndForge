import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  LucideCircle,
  LucideCircleCheck,
  LucideCircleDot,
  LucideConstruction,
  LucideLock,
} from '@lucide/angular';
import { PhaseStatus } from '../../../core/learning/curriculum-status';

const LABELS: Readonly<Record<PhaseStatus, string>> = {
  completed: 'Concluído',
  'in-progress': 'Em andamento',
  available: 'Disponível',
  locked: 'Bloqueado',
  planned: 'Planejado',
};

/** Status shown with icon + text (never color alone). */
@Component({
  selector: 'app-status-badge',
  imports: [LucideCircle, LucideCircleCheck, LucideCircleDot, LucideConstruction, LucideLock],
  template: `
    <span class="badge" [class]="'status status--' + status()">
      @switch (status()) {
        @case ('completed') {
          <svg lucideCircleCheck size="14" aria-hidden="true"></svg>
        }
        @case ('in-progress') {
          <svg lucideCircleDot size="14" aria-hidden="true"></svg>
        }
        @case ('locked') {
          <svg lucideLock size="14" aria-hidden="true"></svg>
        }
        @case ('planned') {
          <svg lucideConstruction size="14" aria-hidden="true"></svg>
        }
        @default {
          <svg lucideCircle size="14" aria-hidden="true"></svg>
        }
      }
      {{ label() }}
    </span>
  `,
  styles: `
    .status--completed {
      border-color: color-mix(in srgb, var(--color-success) 50%, transparent);
      background: var(--color-success-soft);
      color: var(--color-success);
    }

    .status--in-progress {
      border-color: color-mix(in srgb, var(--color-accent) 60%, transparent);
      background: var(--color-accent-soft);
      color: var(--color-accent-text);
    }

    .status--available {
      color: var(--color-text);
    }

    .status--locked {
      color: var(--color-text-subtle);
    }

    .status--planned {
      border-style: dashed;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  readonly status = input.required<PhaseStatus>();
  protected readonly label = computed(() => LABELS[this.status()]);
}
