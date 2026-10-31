import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { activeSession } from '../../../core/progress/session-updates';
import { ProgressService } from '../../../core/progress/progress.service';
import { FocusSessionView } from '../focus-session/focus-session';
import { FocusSetup } from '../focus-setup/focus-setup';

/** Shows the active session, or the form to start one. */
@Component({
  selector: 'app-focus-page',
  imports: [FocusSetup, FocusSessionView],
  template: `
    @if (session(); as current) {
      <app-focus-session [session]="current" />
    } @else {
      <app-focus-setup />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FocusPage {
  private readonly progressService = inject(ProgressService);
  protected readonly session = computed(() => activeSession(this.progressService.progress()));
}
