import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideRepeat, LucideTriangleAlert } from '@lucide/angular';
import { ConceptPerformance } from '../../../core/learning/performance';

export interface ReviewOverview {
  readonly dueTitles: readonly string[];
  readonly scheduled: number;
  /** Next date with reviews, when none are due now. */
  readonly nextDueOn: string | null;
}

@Component({
  selector: 'app-learning-status',
  imports: [DatePipe, RouterLink, LucideRepeat, LucideTriangleAlert],
  template: `
    @let r = reviews();
    <section class="panel" aria-labelledby="learning-heading">
      <h2 id="learning-heading" class="panel__title">Revisões e pontos de atenção</h2>

      <div class="block">
        <h3 class="block__title">
          <svg lucideRepeat size="16" aria-hidden="true"></svg>
          Revisões
        </h3>
        @if (r.dueTitles.length > 0) {
          <p>
            {{ r.dueTitles.length }}
            {{ r.dueTitles.length === 1 ? 'conceito precisa' : 'conceitos precisam' }} de revisão:
            {{ r.dueTitles.join(', ') }}.
          </p>
          <a class="btn btn--primary block__action" routerLink="/review">Revisar agora</a>
        } @else if (r.scheduled > 0) {
          <p class="muted">
            Nada vencido. {{ r.scheduled }}
            {{ r.scheduled === 1 ? 'conceito em revisão' : 'conceitos em revisão' }}
            @if (r.nextDueOn) {
              · próxima em {{ r.nextDueOn + 'T12:00' | date: "d 'de' MMMM" }}
            }
            . <a routerLink="/review">Ver agenda</a>
          </p>
        } @else {
          <p class="muted">
            Nenhum conceito em revisão ainda. Eles entram aqui quando você acerta um exercício pela
            primeira vez.
          </p>
        }
      </div>

      <div class="block">
        <h3 class="block__title">
          <svg lucideTriangleAlert size="16" aria-hidden="true"></svg>
          Erros recorrentes
        </h3>
        @if (struggling().length > 0) {
          <ul class="list">
            @for (item of struggling(); track item.conceptId) {
              <li>
                <strong>{{ item.title }}</strong
                >: {{ item.errors }} erros nas últimas {{ item.attempts }} tentativas
              </li>
            }
          </ul>
        } @else {
          <p class="muted">Nenhum conceito com erros repetidos nas suas tentativas recentes.</p>
        }
      </div>
    </section>
  `,
  styles: `
    .block {
      display: grid;
      gap: var(--space-2);
    }

    .block + .block {
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border);
    }

    .block__title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-md);
    }

    .block__action {
      justify-self: start;
    }

    .muted {
      color: var(--color-text-muted);
    }

    .list {
      margin: 0;
      padding-left: var(--space-5);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningStatus {
  readonly reviews = input.required<ReviewOverview>();
  readonly struggling = input.required<readonly ConceptPerformance[]>();
}
