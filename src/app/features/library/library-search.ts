import {
  ContentBlock,
  Difficulty,
  LibraryEntry,
  LibraryKind,
  LibraryTechnology,
} from '../../core/models/content.models';
import { normalizeForSearch } from '../../shared/search';

export interface LibraryFilters {
  readonly query: string;
  readonly technology: LibraryTechnology | '';
  readonly kind: LibraryKind | '';
  readonly difficulty: Difficulty | '';
}

/** Plain text of the blocks, so search also finds words inside the entry. */
function blocksText(blocks: readonly ContentBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'paragraph':
          return block.text;
        case 'list':
          return block.items.join(' ');
        case 'code':
          return `${block.caption ?? ''} ${block.code}`;
        case 'table':
          return [block.caption, ...block.headers, ...block.rows.flat()].join(' ');
        case 'callout':
          return `${block.title} ${block.text}`;
      }
    })
    .join(' ');
}

/** Filters by the selects, then matches every word of the query (title first in the order). */
export function searchLibrary(
  entries: readonly LibraryEntry[],
  filters: LibraryFilters,
): LibraryEntry[] {
  const words = normalizeForSearch(filters.query).split(/\s+/).filter(Boolean);
  return entries
    .filter((e) => !filters.technology || e.technology === filters.technology)
    .filter((e) => !filters.kind || e.kind === filters.kind)
    .filter((e) => !filters.difficulty || e.difficulty === filters.difficulty)
    .map((entry) => {
      const title = normalizeForSearch(entry.title);
      const all = normalizeForSearch(`${entry.title} ${entry.summary} ${blocksText(entry.body)}`);
      const matches = words.every((w) => all.includes(w));
      const titleHits = words.filter((w) => title.includes(w)).length;
      return { entry, matches, titleHits };
    })
    .filter((r) => r.matches)
    .sort((a, b) => b.titleHits - a.titleHits)
    .map((r) => r.entry);
}
