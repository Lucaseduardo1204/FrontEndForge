import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideFolderKanban } from '@lucide/angular';
import { PhaseState } from '../../../core/learning/curriculum-status';
import { Phase } from '../../../core/models/content.models';
import { StatusBadge } from '../../../shared/ui/status-badge/status-badge';

@Component({
  selector: 'app-phase-map-item',
  imports: [RouterLink, StatusBadge, LucideFolderKanban],
  template: `
    @let p = phase();
    @let s = state();
    <article class="item" [class]="'item--' + s.status" [attr.aria-labelledby]="p.id + '-title'">
      <span class="item__marker" aria-hidden="true">{{ p.order }}</span>
      <div class="item__body">
        <header class="item__header">
          <h2 class="item__title" [id]="p.id + '-title'">
            <a [routerLink]="['/academy/phases', p.id]">
              <span class="visually-hidden">Fase {{ p.order }}: </span>{{ p.title }}
            </a>
          </h2>
          <app-status-badge [status]="s.status" />
        </header>
        <p class="item__summary">{{ p.summary }}</p>
        <p class="item__meta">
          @if (s.status === 'planned') {
            Conteúdo desta fase ainda não publicado · {{ p.topics.length }} tópicos previstos
          } @else {
            {{ s.lessonsCompleted }} de {{ s.lessonsTotal }}
            {{ s.lessonsTotal === 1 ? 'lição concluída' : 'lições concluídas' }} ·
            {{ p.moduleIds.length }} {{ p.moduleIds.length === 1 ? 'módulo' : 'módulos' }}
          }
        </p>
        @if (s.blockers.length > 0) {
          <p class="item__blockers">Requer: {{ s.blockers.join(', ') }}</p>
        }
        @if (matchedTopics().length > 0) {
          <p class="item__matches">Tópicos encontrados: {{ matchedTopics().join(', ') }}</p>
        }
        <p class="item__project">
          <svg lucideFolderKanban size="16" aria-hidden="true"></svg>
          <span><span class="visually-hidden">Projeto: </span>{{ p.projectBrief }}</span>
        </p>
      </div>
    </article>
  `,
  styleUrl: './phase-map-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhaseMapItem {
  readonly phase = input.required<Phase>();
  readonly state = input.required<PhaseState>();
  readonly matchedTopics = input<readonly string[]>([]);
}
