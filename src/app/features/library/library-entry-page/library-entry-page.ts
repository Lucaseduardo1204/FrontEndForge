import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideExternalLink } from '@lucide/angular';
import { ContentService } from '../../../core/content/content.service';
import { RelatedLink } from '../../../core/models/content.models';
import { DIFFICULTY_LABELS } from '../../../shared/labels';
import { ContentBlocks } from '../../../shared/ui/content-blocks/content-blocks';
import { KIND_LABELS, RELATED_LABELS, RELATED_ROUTES, TECHNOLOGY_LABELS } from '../library-labels';

@Component({
  selector: 'app-library-entry-page',
  imports: [RouterLink, ContentBlocks, LucideArrowLeft, LucideExternalLink],
  templateUrl: './library-entry-page.html',
  styleUrl: './library-entry-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryEntryPage {
  private readonly catalog = inject(ContentService).catalog;

  /** Route parameter `:entryId`. */
  readonly entryId = input.required<string>();

  protected readonly kindLabels = KIND_LABELS;
  protected readonly technologyLabels = TECHNOLOGY_LABELS;
  protected readonly difficultyLabels = DIFFICULTY_LABELS;
  protected readonly relatedLabels = RELATED_LABELS;

  protected readonly entry = computed(() =>
    this.catalog.library.find((e) => e.id === this.entryId()),
  );

  /** Internal links with the title of the target, resolved from the catalog. */
  protected readonly related = computed(() =>
    (this.entry()?.related ?? []).map((link) => ({
      link,
      commands: [RELATED_ROUTES[link.type], link.id],
      title: this.titleOf(link),
    })),
  );

  private titleOf(link: RelatedLink): string {
    const sources: Record<RelatedLink['type'], readonly { id: string; title: string }[]> = {
      lesson: this.catalog.lessons,
      lab: this.catalog.exercises,
      mission: this.catalog.missions,
      bug: this.catalog.bugs,
      project: this.catalog.projects,
    };
    return sources[link.type].find((item) => item.id === link.id)?.title ?? link.id;
  }
}
