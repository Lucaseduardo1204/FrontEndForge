import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideEye, LucideLightbulb } from '@lucide/angular';
import { ContentBlock } from '../../core/models/content.models';
import { ContentBlocks } from '../ui/content-blocks/content-blocks';

/** Progressive hints and the commented solution (unlocked after an attempt or on request). */
@Component({
  selector: 'app-hints-solution',
  imports: [ContentBlocks, LucideEye, LucideLightbulb],
  templateUrl: './hints-solution.html',
  styleUrl: './hints-solution.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HintsSolution {
  /** Used to build unique element ids. */
  readonly exerciseId = input.required<string>();
  readonly hints = input.required<readonly string[]>();
  readonly hintsShown = input.required<number>();
  readonly solution = input.required<readonly ContentBlock[]>();
  /** True after the first saved attempt. */
  readonly unlocked = input.required<boolean>();
  readonly requested = input.required<boolean>();
  /** Heading level of "Solução comentada", following the headings of the host page. */
  readonly headingLevel = input<2 | 4>(4);

  readonly hintRequested = output();
  readonly solutionRequested = output();
}
