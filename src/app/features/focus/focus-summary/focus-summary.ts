import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAward, LucideCircleCheck } from '@lucide/angular';
import { ContentService } from '../../../core/content/content.service';
import { nextActivity } from '../../../core/learning/next-activity';
import { sessionSummary } from '../../../core/learning/session-plan';
import { setSessionNotes } from '../../../core/progress/session-updates';
import { ProgressService } from '../../../core/progress/progress.service';
import { NextActivityCard } from '../../dashboard/next-activity-card/next-activity-card';

export const NOTES_MAX_LENGTH = 1000;

@Component({
  selector: 'app-focus-summary',
  imports: [ReactiveFormsModule, RouterLink, NextActivityCard, LucideAward, LucideCircleCheck],
  templateUrl: './focus-summary.html',
  styleUrl: './focus-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FocusSummary {
  private readonly catalog = inject(ContentService).catalog;
  private readonly progressService = inject(ProgressService);

  /** Route parameter `:sessionId`. */
  readonly sessionId = input.required<string>();

  protected readonly maxLength = NOTES_MAX_LENGTH;
  protected readonly session = computed(() =>
    this.progressService.progress().sessions.find((s) => s.id === this.sessionId()),
  );
  protected readonly summary = computed(() => {
    const session = this.session();
    return (
      session && sessionSummary(this.catalog, this.progressService.progress(), session, new Date())
    );
  });
  protected readonly demonstrated = computed(() => {
    const s = this.summary();
    return !!s && s.correctAnswers + s.wrongAnswers + s.lessonsCompleted.length > 0;
  });
  protected readonly next = computed(() =>
    nextActivity(this.catalog, this.progressService.progress()),
  );

  protected readonly notes = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(NOTES_MAX_LENGTH)],
  });
  protected readonly saved = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    // Load the saved notes once the session is known.
    effect(() => {
      const notes = this.session()?.notes;
      if (notes !== undefined && !this.notes.dirty) this.notes.setValue(notes);
    });
  }

  protected async saveNotes(): Promise<void> {
    if (this.notes.invalid) return;
    try {
      await this.progressService.update((p, now) =>
        setSessionNotes(p, this.sessionId(), this.notes.value, now),
      );
      this.notes.markAsPristine();
      this.saved.set(true);
      this.error.set(null);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Não foi possível salvar.');
    }
  }
}
