import { PHASES } from '../../../content/phases';
import { normalizeForSearch, searchPhases } from './phase-search';

describe('searchPhases', () => {
  it('returns every phase without a query', () => {
    expect(searchPhases(PHASES, '  ')).toHaveLength(14);
  });

  it('ignores accents and case', () => {
    expect(normalizeForSearch('  Validação NATIVA ')).toBe('validacao nativa');
  });

  it('finds phases by topic and reports which topics matched', () => {
    const results = searchPhases(PHASES, 'closures');

    expect(results.map((r) => r.phase.id)).toEqual(['phase-03-javascript']);
    expect(results[0].matchedTopics).toEqual(['Closures']);
  });

  it('finds phases by title', () => {
    expect(searchPhases(PHASES, 'seguranca').map((r) => r.phase.order)).toContain(9);
  });

  it('returns nothing for unknown terms', () => {
    expect(searchPhases(PHASES, 'cobol')).toEqual([]);
  });
});
