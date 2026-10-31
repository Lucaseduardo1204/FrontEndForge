import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  LucideCircleAlert,
  LucideCircleCheck,
  LucideDownload,
  LucideTrash,
  LucideTriangleAlert,
} from '@lucide/angular';
import { StorageModeService } from '../../../core/persistence/storage-mode';
import { Progress } from '../../../core/models/progress.models';
import { parseProgressJson } from '../../../core/persistence/progress-schema';
import { ProgressService } from '../../../core/progress/progress.service';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

@Component({
  selector: 'app-progress-data-settings',
  imports: [
    ConfirmDialog,
    LucideCircleAlert,
    LucideCircleCheck,
    LucideDownload,
    LucideTrash,
    LucideTriangleAlert,
  ],
  templateUrl: './progress-data-settings.html',
  styleUrl: './progress-data-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressDataSettings {
  private readonly progressService = inject(ProgressService);
  /** Server mode (chosen in Settings): progress lives in the account, not here. */
  protected readonly serverMode = inject(StorageModeService).mode === 'server';
  protected readonly signInRequired = this.progressService.signInRequired;
  private readonly document = inject(DOCUMENT);

  protected readonly loadError = this.progressService.loadError;
  protected readonly busy = signal(false);
  protected readonly success = signal<string | null>(null);
  protected readonly failure = signal<string | null>(null);
  protected readonly importError = signal<string | null>(null);

  private readonly pendingImport = signal<Progress | null>(null);
  private readonly importDialog = viewChild.required<ConfirmDialog>('importDialog');
  private readonly resetDialog = viewChild.required<ConfirmDialog>('resetDialog');

  protected exportProgress(): void {
    this.clearFeedback();
    const fileName = `frontend-forge-progresso-${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([this.progressService.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = this.document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    this.success.set(`Arquivo “${fileName}” gerado. Guarde-o em um lugar seguro.`);
  }

  protected async onFileSelected(event: Event): Promise<void> {
    this.clearFeedback();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // allows selecting the same file again
    if (!file) return;

    if (file.size > MAX_IMPORT_BYTES) {
      this.importError.set(
        'O arquivo é grande demais para ser um progresso exportado (limite de 5 MB).',
      );
      return;
    }
    try {
      this.pendingImport.set(parseProgressJson(await file.text()));
      this.importDialog().open();
    } catch (error) {
      this.importError.set(`Não foi possível importar: ${messageOf(error)}`);
    }
  }

  protected async confirmImport(): Promise<void> {
    const progress = this.pendingImport();
    if (!progress) return;
    await this.run(async () => {
      await this.progressService.replaceWith(progress);
      this.pendingImport.set(null);
      this.success.set('Progresso importado com sucesso.');
    });
  }

  protected requestReset(): void {
    this.clearFeedback();
    this.resetDialog().open();
  }

  protected async confirmReset(): Promise<void> {
    await this.run(async () => {
      await this.progressService.reset();
      this.success.set('Progresso apagado. Você está começando do zero.');
    });
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    try {
      await action();
    } catch (error) {
      this.failure.set(messageOf(error));
    } finally {
      this.busy.set(false);
    }
  }

  private clearFeedback(): void {
    this.success.set(null);
    this.failure.set(null);
    this.importError.set(null);
  }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Erro inesperado.';
}
