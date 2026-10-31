import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface UpcomingReview {
  readonly conceptId: string;
  readonly title: string;
  readonly box: number;
  readonly dueOn: string;
  readonly inDays: number;
}

/** Upcoming reviews plus the rules of the system, so nothing is a black box. */
@Component({
  selector: 'app-review-schedule',
  imports: [DatePipe],
  template: `
    <div class="schedule">
      <section class="panel" aria-labelledby="agenda-heading">
        <h2 id="agenda-heading" class="panel__title">Agenda</h2>
        @if (upcoming().length > 0) {
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Conceito</th>
                <th scope="col">Caixa</th>
                <th scope="col">Próxima revisão</th>
              </tr>
            </thead>
            <tbody>
              @for (item of upcoming(); track item.conceptId) {
                <tr>
                  <td>{{ item.title }}</td>
                  <td>{{ item.box }}</td>
                  <td>
                    <time [attr.datetime]="item.dueOn">{{
                      item.dueOn + 'T12:00' | date: 'd MMM'
                    }}</time>
                    <span class="muted">
                      ({{ item.inDays === 1 ? 'amanhã' : 'em ' + item.inDays + ' dias' }})
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <p class="muted">Nenhuma revisão futura agendada.</p>
        }
      </section>

      <section class="panel" aria-labelledby="rules-heading">
        <h2 id="rules-heading" class="panel__title">Como funciona</h2>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Caixa</th>
              <th scope="col">Revisar depois de</th>
            </tr>
          </thead>
          <tbody>
            @for (interval of intervals(); track interval.box) {
              <tr>
                <td>{{ interval.box }}</td>
                <td>{{ interval.days }} {{ interval.days === 1 ? 'dia' : 'dias' }}</td>
              </tr>
            }
          </tbody>
        </table>
        <ul class="rules">
          <li>Acertar um exercício pela primeira vez coloca o conceito na caixa 1.</li>
          <li>Acertou na revisão: o conceito sobe uma caixa (até a 5).</li>
          <li>Errou na revisão: o conceito volta para a caixa 1.</li>
        </ul>
      </section>
    </div>
  `,
  styles: `
    .schedule {
      display: grid;
      gap: var(--space-5);

      @media (min-width: 56rem) {
        grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
        align-items: start;
      }
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--font-size-sm);

      th,
      td {
        padding: var(--space-2) var(--space-3);
        border-bottom: 1px solid var(--color-border);
        text-align: left;
      }

      th {
        color: var(--color-text-muted);
        font-weight: var(--font-weight-medium);
      }
    }

    .muted {
      color: var(--color-text-muted);
    }

    .rules {
      display: grid;
      gap: var(--space-1);
      margin: 0;
      padding-left: var(--space-5);
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewSchedule {
  readonly upcoming = input.required<readonly UpcomingReview[]>();
  readonly intervals = input.required<readonly { box: string; days: number }[]>();
}
