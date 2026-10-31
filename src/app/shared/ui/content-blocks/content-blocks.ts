import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideInfo, LucideShieldAlert, LucideTriangleAlert } from '@lucide/angular';
import { ContentBlock } from '../../../core/models/content.models';

/**
 * Renders structured content. Text is always interpolated (escaped), never bound as HTML,
 * so content such as `<script>` shows up as text.
 */
@Component({
  selector: 'app-content-blocks',
  imports: [LucideInfo, LucideShieldAlert, LucideTriangleAlert],
  templateUrl: './content-blocks.html',
  styleUrl: './content-blocks.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentBlocks {
  readonly blocks = input.required<readonly ContentBlock[]>();

  protected toneClass(tone: 'info' | 'warning' | 'security'): string {
    return tone === 'security' ? 'danger' : tone;
  }
}
