import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LucideFocus, LucideX } from '@lucide/angular';

/** Reduced interface: no sidebar, just a way out. */
@Component({
  selector: 'app-focus-layout',
  imports: [RouterOutlet, RouterLink, LucideFocus, LucideX],
  template: `
    <button type="button" class="skip-link btn btn--primary" (click)="skipToContent()">
      Pular para o conteúdo
    </button>
    <header class="bar">
      <span class="bar__title">
        <svg lucideFocus size="18" aria-hidden="true"></svg>
        Modo foco
      </span>
      <a class="btn btn--ghost" routerLink="/">
        <svg lucideX aria-hidden="true"></svg>
        Sair do modo foco
      </a>
    </header>
    <main #main id="main-content" class="content" tabindex="-1">
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100dvh;
    }

    .skip-link {
      position: fixed;
      top: var(--space-2);
      left: var(--space-2);
      z-index: 100;
      transform: translateY(-200%);

      &:focus-visible {
        transform: none;
      }
    }

    .bar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      height: var(--header-height);
      padding: 0 var(--space-4);
      border-bottom: 1px solid var(--color-border);
      background: color-mix(in srgb, var(--color-bg) 92%, transparent);
    }

    .bar__title {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);

      svg {
        color: var(--color-accent-text);
      }
    }

    .content:focus {
      outline: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FocusLayout {
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  protected skipToContent(): void {
    this.main().nativeElement.focus();
  }
}
