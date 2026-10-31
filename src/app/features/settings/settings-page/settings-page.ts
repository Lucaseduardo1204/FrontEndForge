import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StorageModeService } from '../../../core/persistence/storage-mode';
import { AccountSettings } from '../account-settings/account-settings';
import { StorageModeSettings } from '../storage-mode-settings/storage-mode-settings';
import { AppearanceSettings } from '../appearance-settings/appearance-settings';
import { ProgressDataSettings } from '../progress-data-settings/progress-data-settings';

@Component({
  selector: 'app-settings-page',
  imports: [AppearanceSettings, StorageModeSettings, AccountSettings, ProgressDataSettings],
  template: `
    <div class="page">
      <header class="page__header">
        <h1>Configurações</h1>
        <p class="page__lead">
          Preferências de interface e controle sobre os seus dados de progresso.
        </p>
      </header>
      <app-appearance-settings />
      <app-storage-mode-settings />
      @if (serverMode) {
        <app-account-settings />
      }
      <app-progress-data-settings />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  /** The account section exists only in server mode (chosen in Settings). */
  protected readonly serverMode = inject(StorageModeService).mode === 'server';
}
