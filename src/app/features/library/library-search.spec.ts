import { LIBRARY } from '../../../content/library';
import { LibraryFilters, searchLibrary } from './library-search';

const none: LibraryFilters = { query: '', technology: '', kind: '', difficulty: '' };
const ids = (query: string, extra: Partial<LibraryFilters> = {}) =>
  searchLibrary(LIBRARY, { ...none, ...extra, query }).map((e) => e.id);

describe('searchLibrary', () => {
  it('returns everything without filters', () => {
    expect(ids('')).toHaveLength(LIBRARY.length);
  });

  it('ignores case and accents and finds words inside the body', () => {
    expect(ids('ZONA MORTA')).toEqual(
      expect.arrayContaining(['lib-let-const-var', 'lib-glossary-hoisting']),
    );
    expect(ids('microtarefa')).toContain('lib-event-loop');
  });

  it('requires every word and ranks title matches first', () => {
    const results = ids('signals rxjs');

    expect(results[0]).toBe('lib-signals-vs-rxjs');
    expect(results.every((id) => id.includes('signals'))).toBe(true);
  });

  it('combines text with technology, kind and difficulty filters', () => {
    expect(ids('', { technology: 'tools' })).toEqual([
      'lib-devtools-shortcuts',
      'lib-vscode-shortcuts',
    ]);
    expect(ids('', { kind: 'comparison', technology: 'angular' })).toEqual(['lib-signals-vs-rxjs']);
    expect(ids('innerHTML', { difficulty: 'advanced' })).toEqual([]);
  });
});
