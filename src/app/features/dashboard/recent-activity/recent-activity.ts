import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCircleCheck, LucideCircleX } from '@lucide/angular';

export interface RecentItem {
  readonly id: string;
  readonly title: string;
  readonly correct: boolean;
  readonly submittedAt: string;
  readonly lessonId?: string;
}

@Component({
  selector: 'app-recent-activity',
  imports: [DatePipe, RouterLink, LucideCircleCheck, LucideCircleX],
  template: `
    <section class="panel" aria-labelledby="recent-heading">
      <h2 id="recent-heading" class="panel__title">Atividade recente</h2>
      <ul class="recent">
        @for (item of items(); track item.id) {
          <li class="recent__item">
            @if (item.correct) {
              <svg lucideCircleCheck class="recent__ok" aria-hidden="true"></svg>
            } @else {
              <svg lucideCircleX class="recent__fail" aria-hidden="true"></svg>
            }
            <span class="recent__text">
              @if (item.lessonId) {
                <a [routerLink]="['/lessons', item.lessonId]">{{ item.title }}</a>
              } @else {
                {{ item.title }}
              }
              <span class="recent__meta">
                {{ item.correct ? 'Resposta certa' : 'Resposta errada' }} ·
                <time [attr.datetime]="item.submittedAt">{{
                  item.submittedAt | date: 'short'
                }}</time>
              </span>
            </span>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .recent {
      display: grid;
      gap: var(--space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .recent__item {
      display: flex;
      gap: var(--space-3);
      align-items: flex-start;

      svg {
        width: 1.1rem;
        height: 1.1rem;
        margin-top: 0.2rem;
      }
    }

    .recent__ok {
      color: var(--color-success);
    }

    .recent__fail {
      color: var(--color-danger);
    }

    .recent__text {
      display: grid;
    }

    .recent__meta {
      color: var(--color-text-subtle);
      font-size: var(--font-size-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentActivity {
  readonly items = input.required<readonly RecentItem[]>();
}
