import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideShieldCheck } from '@lucide/angular';
import { ContentService } from '../../../core/content/content.service';
import { CodeExercise } from '../../../core/models/content.models';
import { exerciseStatus } from '../../../core/progress/progress-updates';
import { ProgressService } from '../../../core/progress/progress.service';
import { DIFFICULTY_LABELS } from '../../../shared/labels';
import { LANGUAGE_LABELS } from '../lab-exercise-page/lab-exercise-page';

@Component({
  selector: 'app-lab-page',
  imports: [RouterLink, LucideShieldCheck],
  template: `
    <div class="page">
      <header class="page__header">
        <h1>Laboratório de código</h1>
        <p class="page__lead">
          Exercícios práticos com editor, testes automáticos e prévia. Os testes verificam o
          comportamento do seu código, então soluções diferentes da referência também passam.
        </p>
      </header>

      <p class="notice notice--info">
        <svg lucideShieldCheck aria-hidden="true"></svg>
        <span>
          Seu código roda isolado da plataforma: JavaScript e TypeScript em um worker separado, sem
          acesso aos seus dados nem à rede, interrompido após alguns segundos; HTML e CSS em uma
          prévia isolada, com scripts e rede bloqueados.
        </span>
      </p>

      <ul class="exercises">
        @for (item of items(); track item.exercise.id) {
          <li class="panel exercise">
            <div class="exercise__head">
              <h2 class="exercise__title">
                <a [routerLink]="['/lab', item.exercise.id]">{{ item.exercise.title }}</a>
              </h2>
              @if (item.solved) {
                <span class="badge badge--success">Resolvido</span>
              } @else if (item.attempts > 0) {
                <span class="badge">
                  {{ item.attempts }} {{ item.attempts === 1 ? 'tentativa' : 'tentativas' }}
                </span>
              } @else {
                <span class="badge">Não iniciado</span>
              }
            </div>
            @if (item.mission; as mission) {
              <p class="exercise__mission">
                Tarefa da missão
                <a [routerLink]="['/missions', mission.id]">{{ mission.title }}</a>
              </p>
            }
            <p class="exercise__meta">
              {{ languageLabels[item.exercise.language] }} ·
              {{ difficultyLabels[item.exercise.difficulty] }} ·
              {{ item.exercise.tests.length }} testes
            </p>
          </li>
        }
      </ul>
    </div>
  `,
  styles: `
    .exercises {
      display: grid;
      gap: var(--space-3);
      margin: 0;
      padding: 0;
      list-style: none;

      @media (min-width: 48rem) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .exercise {
      gap: var(--space-2);
    }

    .exercise__head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
    }

    .exercise__title {
      font-size: var(--font-size-lg);

      a {
        color: var(--color-text);
      }
    }

    .exercise__mission {
      font-size: var(--font-size-sm);
    }

    .exercise__meta {
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabPage {
  private readonly catalog = inject(ContentService).catalog;
  private readonly progressService = inject(ProgressService);

  protected readonly languageLabels = LANGUAGE_LABELS;
  protected readonly difficultyLabels = DIFFICULTY_LABELS;

  protected readonly items = computed(() => {
    const progress = this.progressService.progress();
    return this.catalog.exercises
      .filter((e): e is CodeExercise => e.kind === 'code')
      .map((exercise) => ({
        exercise,
        mission: this.catalog.missions.find((m) => m.exerciseIds.includes(exercise.id)),
        ...exerciseStatus(progress, exercise.id),
      }));
  });
}
