import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucidePlay } from '@lucide/angular';
import { ContentService } from '../../../core/content/content.service';
import { planSession } from '../../../core/learning/session-plan';
import { startSession } from '../../../core/progress/session-updates';
import { ProgressService } from '../../../core/progress/progress.service';

export const OBJECTIVE_MAX_LENGTH = 140;

/** "No limit" is 0 in the form and null in the session. */
const TIME_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 0, label: 'Sem limite' },
] as const;

@Component({
  selector: 'app-focus-setup',
  imports: [ReactiveFormsModule, LucidePlay],
  templateUrl: './focus-setup.html',
  styleUrl: './focus-setup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FocusSetup {
  private readonly catalog = inject(ContentService).catalog;
  private readonly progressService = inject(ProgressService);

  protected readonly timeOptions = TIME_OPTIONS;
  protected readonly maxLength = OBJECTIVE_MAX_LENGTH;
  protected readonly form = new FormGroup({
    minutes: new FormControl<number>(30, { nonNullable: true }),
    objective: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(OBJECTIVE_MAX_LENGTH)],
    }),
    timer: new FormControl(false, { nonNullable: true }),
  });

  private readonly minutes = toSignal(this.form.controls.minutes.valueChanges, {
    initialValue: this.form.controls.minutes.value,
  });
  /** Live preview: the plan follows the chosen time. */
  protected readonly plan = computed(() =>
    planSession(this.catalog, this.progressService.progress(), this.minutes() || null, new Date()),
  );
  protected readonly totalMinutes = computed(() =>
    this.plan().blocks.reduce((sum, b) => sum + b.estimatedMinutes, 0),
  );
  protected readonly suggestion = computed(() => {
    const first = this.plan().blocks.find((b) => b.kind !== 'summary');
    return first ? `Ex.: avançar em “${first.title}”` : 'Ex.: revisar o que já estudei';
  });

  protected readonly submitted = signal(false);
  protected readonly starting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected async start(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid || this.starting()) return;
    const { minutes, objective, timer } = this.form.getRawValue();
    this.starting.set(true);
    try {
      await this.progressService.update((progress, now) =>
        startSession(
          progress,
          {
            id: crypto.randomUUID(),
            plannedMinutes: minutes || null,
            objective,
            timerEnabled: timer,
            blocks: planSession(this.catalog, progress, minutes || null, now).blocks,
          },
          now,
        ),
      );
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Não foi possível iniciar a sessão.');
    } finally {
      this.starting.set(false);
    }
  }
}
