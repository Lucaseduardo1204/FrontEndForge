import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, LucideArrowRight],
  template: `
    <section class="page" aria-labelledby="not-found-heading">
      <header class="page__header">
        <p class="eyebrow">Erro 404</p>
        <h1 id="not-found-heading">Página não encontrada</h1>
        <p class="page__lead">
          O endereço não corresponde a nenhuma área da plataforma. Ele pode ter sido digitado errado
          ou a página pode ter mudado de lugar.
        </p>
      </header>
      <div class="btn-row">
        <a class="btn btn--primary" routerLink="/">
          Ir para a central de comando
          <svg lucideArrowRight aria-hidden="true"></svg>
        </a>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
