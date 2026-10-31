import { normalizeForSearch } from '../../shared/search';
import { Phase } from '../../core/models/content.models';

export { normalizeForSearch };

export interface PhaseMatch {
  readonly phase: Phase;
  /** Topics that matched the query (empty when the title or summary matched, or no query). */
  readonly matchedTopics: readonly string[];
}

export function searchPhases(phases: readonly Phase[], query: string): PhaseMatch[] {
  const q = normalizeForSearch(query);
  if (!q) return phases.map((phase) => ({ phase, matchedTopics: [] }));

  return phases.flatMap((phase) => {
    const matchedTopics = phase.topics.filter((t) => normalizeForSearch(t).includes(q));
    const inText = [phase.title, phase.summary].some((t) => normalizeForSearch(t).includes(q));
    return inText || matchedTopics.length > 0 ? [{ phase, matchedTopics }] : [];
  });
}
