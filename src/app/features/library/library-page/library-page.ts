import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideSearch } from '@lucide/angular';
import { ContentService } from '../../../core/content/content.service';
import { Difficulty, LibraryKind, LibraryTechnology } from '../../../core/models/content.models';
import { DIFFICULTY_LABELS } from '../../../shared/labels';
import { KIND_LABELS, TECHNOLOGY_LABELS } from '../library-labels';
import { searchLibrary } from '../library-search';

@Component({
  selector: 'app-library-page',
  imports: [RouterLink, LucideSearch],
  templateUrl: './library-page.html',
  styleUrl: './library-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryPage {
  private readonly entries = inject(ContentService).catalog.library;

  protected readonly kindLabels = KIND_LABELS;
  protected readonly technologyLabels = TECHNOLOGY_LABELS;
  protected readonly difficultyLabels = DIFFICULTY_LABELS;

  // Only values that exist in the content become options.
  protected readonly technologies = [...new Set(this.entries.map((e) => e.technology))];
  protected readonly kinds = [...new Set(this.entries.map((e) => e.kind))];
  protected readonly difficulties = [...new Set(this.entries.map((e) => e.difficulty))];

  protected readonly query = signal('');
  protected readonly technology = signal<LibraryTechnology | ''>('');
  protected readonly kind = signal<LibraryKind | ''>('');
  protected readonly difficulty = signal<Difficulty | ''>('');

  protected readonly results = computed(() =>
    searchLibrary(this.entries, {
      query: this.query(),
      technology: this.technology(),
      kind: this.kind(),
      difficulty: this.difficulty(),
    }),
  );
  protected readonly filtered = computed(
    () => !!(this.query().trim() || this.technology() || this.kind() || this.difficulty()),
  );

  protected clear(): void {
    this.query.set('');
    this.technology.set('');
    this.kind.set('');
    this.difficulty.set('');
  }
}
