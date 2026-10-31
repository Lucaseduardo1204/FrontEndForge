import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../core/content/content.service';
import { missionStatus } from '../../../core/progress/mission-status';
import { ProgressService } from '../../../core/progress/progress.service';
import { DIFFICULTY_LABELS } from '../../../shared/labels';

@Component({
  selector: 'app-missions-page',
  imports: [RouterLink],
  template: `
    <div class="page">
      <header class="page__header">
        <h1>Missões</h1>
        <p class="page__lead">
          Problemas técnicos realistas, com contexto, requisitos e critérios de aceitação. Primeiro
          você diagnostica, depois corrige, e a explicação completa vem no fim.
        </p>
      </header>
      <ul class="missions">
        @for (item of items(); track item.mission.id) {
          <li class="panel mission">
            <p class="eyebrow">{{ difficultyLabels[item.mission.difficulty] }}</p>
            <h2 class="mission__title">
              <a [routerLink]="['/missions', item.mission.id]">{{ item.mission.title }}</a>
            </h2>
            <p class="muted">{{ item.mission.objective }}</p>
            <p class="mission__status">
              @if (item.status.completedAt) {
                <span class="badge badge--success">Cumprida</span>
              } @else if (item.status.started) {
                <span class="badge">Em andamento</span>
              } @else {
                <span class="badge">Não iniciada</span>
              }
              {{ item.status.solved }} de {{ item.status.total }} tarefas
            </p>
          </li>
        }
      </ul>
    </div>
  `,
  styles: `
    .missions {
      display: grid;
      gap: var(--space-4);
      margin: 0;
      padding: 0;
      list-style: none;

      @media (min-width: 56rem) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .mission {
      gap: var(--space-2);
    }

    .mission__title {
      font-size: var(--font-size-lg);

      a {
        color: var(--color-text);
      }
    }

    .mission__status {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }

    .muted {
      color: var(--color-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MissionsPage {
  private readonly catalog = inject(ContentService).catalog;
  private readonly progressService = inject(ProgressService);

  protected readonly difficultyLabels = DIFFICULTY_LABELS;
  protected readonly items = computed(() =>
    this.catalog.missions.map((mission) => ({
      mission,
      status: missionStatus(mission, this.progressService.progress()),
    })),
  );
}
