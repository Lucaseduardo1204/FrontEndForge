import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  input,
  model,
  signal,
} from '@angular/core';
import { LucideArrowDown, LucideArrowUp } from '@lucide/angular';
import { OrderStepsExercise } from '../../../core/models/content.models';

/** Reordering with buttons: works with keyboard, touch and screen readers (no drag required). */
@Component({
  selector: 'app-order-input',
  imports: [LucideArrowDown, LucideArrowUp],
  template: `
    <ol class="order" aria-label="Etapas na ordem atual">
      @for (item of items(); track item.id; let i = $index, last = $last) {
        <li class="order__item">
          <span class="order__position" aria-hidden="true">{{ i + 1 }}</span>
          <span class="order__text">{{ item.text }}</span>
          <span class="order__actions">
            <button
              type="button"
              class="btn btn--ghost btn--icon"
              [attr.aria-label]="'Mover para cima: ' + item.text"
              [disabled]="disabled() || i === 0"
              (click)="move(i, -1, $any($event.currentTarget))"
            >
              <svg lucideArrowUp aria-hidden="true"></svg>
            </button>
            <button
              type="button"
              class="btn btn--ghost btn--icon"
              [attr.aria-label]="'Mover para baixo: ' + item.text"
              [disabled]="disabled() || last"
              (click)="move(i, 1, $any($event.currentTarget))"
            >
              <svg lucideArrowDown aria-hidden="true"></svg>
            </button>
          </span>
        </li>
      }
    </ol>
    <p class="visually-hidden" aria-live="polite">{{ announcement() }}</p>
  `,
  styles: `
    .order {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .order__item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface-2);
    }

    .order__position {
      display: grid;
      flex-shrink: 0;
      place-items: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: var(--radius-full);
      background: var(--color-surface-3);
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .order__text {
      flex: 1;
    }

    .order__actions {
      display: flex;
      flex-shrink: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderInput {
  readonly exercise = input.required<OrderStepsExercise>();
  readonly disabled = input(false);
  readonly order = model.required<readonly string[]>();

  private readonly injector = inject(Injector);

  protected readonly announcement = signal('');
  protected readonly items = computed(() => {
    const byId = new Map(this.exercise().items.map((item) => [item.id, item]));
    return this.order().flatMap((id) => byId.get(id) ?? []);
  });

  protected move(index: number, delta: -1 | 1, button: HTMLButtonElement): void {
    const target = index + delta;
    const next = [...this.order()];
    [next[index], next[target]] = [next[target], next[index]];
    this.order.set(next);
    const moved = this.items()[target];
    this.announcement.set(`“${moved.text}” agora está na posição ${target + 1}.`);
    // At the top or bottom the pressed button becomes disabled; keep focus on the item.
    afterNextRender(
      () => {
        if (!button.disabled) return;
        button.parentElement?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
      },
      { injector: this.injector },
    );
  }
}
