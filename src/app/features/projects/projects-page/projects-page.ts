import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../core/content/content.service';
import { projectStatus } from '../../../core/progress/project-updates';
import { ProgressService } from '../../../core/progress/progress.service';

@Component({
  selector: 'app-projects-page',
  imports: [RouterLink],
  template: `
    <div class="page">
      <header class="page__header">
        <h1>Projetos</h1>
        <p class="page__lead">
          Projetos guiados por etapas, feitos no seu computador. Nenhum código pronto é entregue: a
          plataforma orienta, verifica automaticamente o que pode e registra a sua autoavaliação.
        </p>
      </header>
      <ul class="projects">
        @for (item of items(); track item.project.id) {
          <li class="panel project">
            <p class="eyebrow">Fase {{ item.phaseOrder }}</p>
            <h2 class="project__title">
              <a [routerLink]="['/projects', item.project.id]">{{ item.project.title }}</a>
            </h2>
            <p class="muted">{{ item.project.problem }}</p>
            <p class="project__status">
              @if (item.status.completedAt) {
                <span class="badge badge--success">Concluído</span>
              } @else if (item.status.started) {
                <span class="badge">Em andamento</span>
                checklist {{ item.status.checkedCount }} de {{ item.status.checklistTotal }}
              } @else {
                <span class="badge">Não iniciado</span>
              }
            </p>
          </li>
        }
      </ul>
      <p class="muted">
        Os projetos das demais fases aparecem na Academia e serão publicados com o conteúdo de cada
        fase.
      </p>
    </div>
  `,
  styles: `
    .projects {
      display: grid;
      gap: var(--space-4);
      margin: 0;
      padding: 0;
      list-style: none;

      @media (min-width: 56rem) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .project {
      gap: var(--space-2);
    }

    .project__title {
      font-size: var(--font-size-lg);

      a {
        color: var(--color-text);
      }
    }

    .project__status {
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
export class ProjectsPage {
  private readonly catalog = inject(ContentService).catalog;
  private readonly progressService = inject(ProgressService);

  protected readonly items = computed(() =>
    this.catalog.projects.map((project) => ({
      project,
      phaseOrder: this.catalog.phases.find((p) => p.id === project.phaseId)?.order ?? '?',
      status: projectStatus(project, this.progressService.progress()),
    })),
  );
}
