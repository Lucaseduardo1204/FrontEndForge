import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { StorageMode, StorageModeService } from '../../../core/persistence/storage-mode';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';

type Availability = 'checking' | 'available' | 'unavailable';

@Component({
  selector: 'app-storage-mode-settings',
  imports: [ConfirmDialog],
  templateUrl: './storage-mode-settings.html',
  styles: `
    .modes {
      display: grid;
      gap: var(--space-3);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorageModeSettings implements OnInit {
  private readonly modes = inject(StorageModeService);
  private readonly dialog = viewChild.required<ConfirmDialog>('switchDialog');

  protected readonly current = this.modes.mode;
  /** The option picked while the confirmation is open; the radios follow it. */
  protected readonly pending = signal<StorageMode | null>(null);
  protected readonly selected = computed(() => this.pending() ?? this.current);
  protected readonly availability = signal<Availability>(
    this.current === 'server' ? 'available' : 'checking',
  );
  protected readonly failure = signal<string | null>(null);

  protected readonly dialogMessage = computed(() =>
    this.pending() === 'server'
      ? 'A página vai recarregar e o progresso passará a ser salvo na sua conta, no servidor. O progresso deste navegador não é levado junto: para levá-lo, exporte-o antes e importe depois de entrar.'
      : 'A página vai recarregar e o progresso passará a ser salvo só neste navegador. O progresso da sua conta continua no servidor, mas não aparece aqui: para trazê-lo, exporte-o antes e importe depois.',
  );

  async ngOnInit(): Promise<void> {
    if (this.current === 'server') return;
    this.availability.set((await this.modes.serverAvailable()) ? 'available' : 'unavailable');
  }

  protected pick(mode: StorageMode): void {
    this.failure.set(null);
    if (mode === this.current) return;
    this.pending.set(mode);
    this.dialog().open();
  }

  protected confirmSwitch(): void {
    const mode = this.pending();
    if (mode && !this.modes.choose(mode)) {
      this.pending.set(null);
      this.failure.set('Não foi possível salvar a preferência neste navegador.');
    }
  }

  protected cancelSwitch(): void {
    this.pending.set(null);
  }
}
