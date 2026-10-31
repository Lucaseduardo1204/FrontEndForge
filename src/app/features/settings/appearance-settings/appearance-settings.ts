import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Theme, ThemeService } from '../../../core/theme/theme.service';

@Component({
  selector: 'app-appearance-settings',
  template: `
    <section class="panel" aria-labelledby="appearance-heading">
      <h2 id="appearance-heading" class="panel__title">Aparência</h2>
      <fieldset class="themes">
        <legend class="field__label">Tema</legend>
        @for (option of options; track option.value) {
          <label class="choice">
            <input
              type="radio"
              name="theme"
              [value]="option.value"
              [checked]="theme() === option.value"
              (change)="select(option.value)"
            />
            {{ option.label }}
          </label>
        }
      </fieldset>
      <p class="field__hint">A preferência fica salva neste navegador.</p>
    </section>
  `,
  styles: `
    .themes {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3) var(--space-5);
      margin: 0;
      padding: 0;
      border: 0;
    }

    .themes legend {
      width: 100%;
      margin-bottom: var(--space-2);
      padding: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppearanceSettings {
  private readonly themeService = inject(ThemeService);

  protected readonly theme = this.themeService.theme;
  protected readonly options: readonly { value: Theme; label: string }[] = [
    { value: 'dark', label: 'Escuro (padrão)' },
    { value: 'light', label: 'Claro' },
  ];

  protected select(theme: Theme): void {
    this.themeService.set(theme);
  }
}
