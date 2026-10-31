import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideShieldAlert } from '@lucide/angular';
import { Project } from '../../../core/models/content.models';
import { ContentBlocks } from '../../../shared/ui/content-blocks/content-blocks';

/** Briefing, requirements, constraints and test cases of a project. */
@Component({
  selector: 'app-project-brief',
  imports: [ContentBlocks, LucideShieldAlert],
  template: `
    @let p = project();
    <section class="section" aria-labelledby="briefing-heading">
      <h2 id="briefing-heading" class="section__title">Briefing</h2>
      <app-content-blocks [blocks]="p.briefing" />
      <p class="problem"><strong>Problema:</strong> {{ p.problem }}</p>
    </section>

    <div class="grid">
      <section class="panel" aria-labelledby="required-heading">
        <h2 id="required-heading" class="panel__title">Funcionalidades obrigatórias</h2>
        <ul class="list">
          @for (item of p.requiredFeatures; track item) {
            <li>{{ item }}</li>
          }
        </ul>
        <h3 class="sub">Opcionais</h3>
        <ul class="list muted">
          @for (item of p.optionalFeatures; track item) {
            <li>{{ item }}</li>
          }
        </ul>
      </section>

      <section class="panel" aria-labelledby="architecture-heading">
        <h2 id="architecture-heading" class="panel__title">Arquitetura sugerida</h2>
        <app-content-blocks [blocks]="p.suggestedArchitecture" />
        <h3 class="sub">Restrições</h3>
        <ul class="list">
          @for (item of p.constraints; track item) {
            <li>{{ item }}</li>
          }
        </ul>
      </section>

      <section class="panel" aria-labelledby="a11y-heading">
        <h2 id="a11y-heading" class="panel__title">Requisitos de acessibilidade</h2>
        <ul class="list">
          @for (item of p.accessibilityRequirements; track item) {
            <li>{{ item }}</li>
          }
        </ul>
      </section>

      <section class="panel security" aria-labelledby="security-heading">
        <h2 id="security-heading" class="panel__title title-row">
          <svg lucideShieldAlert size="20" aria-hidden="true"></svg>
          Requisitos de segurança
        </h2>
        <ul class="list">
          @for (item of p.securityRequirements; track item) {
            <li>{{ item }}</li>
          }
        </ul>
      </section>
    </div>

    <section class="panel" aria-labelledby="cases-heading">
      <h2 id="cases-heading" class="panel__title">Casos de teste manuais</h2>
      <p class="muted">Faça estes testes na sua aplicação, no seu navegador.</p>
      <ol class="list">
        @for (item of p.testCases; track item) {
          <li>{{ item }}</li>
        }
      </ol>
    </section>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-5);
    }

    .section {
      display: grid;
      gap: var(--space-4);
    }

    .section__title {
      font-size: var(--font-size-xl);
    }

    .problem {
      max-width: var(--reading-max-width);
      padding: var(--space-3) var(--space-4);
      border-left: 3px solid var(--color-accent);
      background: var(--color-surface-1);
    }

    .grid {
      display: grid;
      gap: var(--space-5);

      @media (min-width: 56rem) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: start;
      }
    }

    .list {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding-left: var(--space-5);
    }

    .sub {
      margin-top: var(--space-2);
      font-size: var(--font-size-md);
    }

    .muted {
      color: var(--color-text-muted);
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .security .title-row svg {
      color: var(--color-danger);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectBrief {
  readonly project = input.required<Project>();
}
