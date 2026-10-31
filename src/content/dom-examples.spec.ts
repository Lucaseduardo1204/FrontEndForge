import { EAGER_LISTENERS_JS, TARGET_HTML } from './exercises/js-dom-interactive-01.exercises';
import { SEMANTIC_PAGE_HTML } from './lessons/html-semantic-responsive-01';
import {
  SHOPPING_DOM_JS,
  SHOPPING_HTML,
  SHOPPING_STATE_JS,
  VULNERABLE_RENDER_JS,
} from './lessons/js-dom-interactive-01';

/**
 * Executes the DOM examples of lessons "js-dom-interactive-01" and
 * "html-semantic-responsive-01" (jsdom). Claims that need layout or a real accessibility tree
 * are checked in a real browser instead (D-049).
 */

describe('shopping list of the DOM lesson (runs the code shown in the lesson)', () => {
  let form: HTMLFormElement;
  let field: HTMLInputElement;
  let list: HTMLUListElement;
  let summary: HTMLElement;

  beforeEach(() => {
    // innerHTML never runs the <script> tag; the lesson script is executed below.
    document.body.innerHTML = SHOPPING_HTML;
    new Function(`${SHOPPING_STATE_JS}\n${SHOPPING_DOM_JS}`)();
    form = document.querySelector('#form-item')!;
    field = document.querySelector('#novo-item')!;
    list = document.querySelector('#lista')!;
    summary = document.querySelector('#resumo')!;
  });

  function add(text: string): Event {
    field.value = text;
    const event = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    return event;
  }

  it('starts from the state: empty list and its summary', () => {
    expect(list.children.length).toBe(0);
    expect(summary.textContent).toBe('Nenhum item');
  });

  it('adds through the form, cancelling the native submit, and re-renders from the state', () => {
    const event = add('  Leite ');

    expect(event.defaultPrevented).toBe(true);
    expect(list.querySelectorAll('li').length).toBe(1);
    expect(list.textContent).toContain('Leite');
    expect(summary.textContent).toBe('1 item');
    expect(field.value).toBe('');
    expect(document.activeElement).toBe(field);
  });

  it('ignores blank items', () => {
    add('   ');

    expect(list.children.length).toBe(0);
  });

  it('shows typed HTML as text (textContent), creating no element', () => {
    add('<img src=x onerror="alert(1)">');

    expect(list.querySelector('img')).toBeNull();
    expect(list.querySelector('li')!.textContent).toContain('<img src=x onerror="alert(1)">');
  });

  it('removes through delegation, also for buttons created after the listener', () => {
    add('Pão');
    add('Café');
    const button = Array.from(list.querySelectorAll('button')).find((b) =>
      b.getAttribute('aria-label')?.includes('Pão'),
    )!;

    button.click();

    expect(list.textContent).not.toContain('Pão');
    expect(list.textContent).toContain('Café');
    expect(summary.textContent).toBe('1 item');
    expect(document.activeElement).toBe(field);
  });

  it('the vulnerable render (innerHTML) turns the same text into an element with a handler', () => {
    const ul = document.createElement('ul');
    new Function('lista', 'itens', VULNERABLE_RENDER_JS)(ul, [
      { id: 1, texto: '<img src=x onerror="alert(1)">' },
    ]);

    expect(ul.querySelector('img')?.getAttribute('onerror')).toBe('alert(1)');
  });
});

describe('claims of the DOM exercises', () => {
  it('dom-01-target: target is the inner span, currentTarget the list; closest finds the button', () => {
    document.body.innerHTML = TARGET_HTML;
    const list = document.querySelector('#lista')!;
    let seen: { target: Element; current: EventTarget | null } | undefined;
    list.addEventListener('click', (e) => {
      seen = { target: e.target as Element, current: e.currentTarget };
    });

    document.querySelector('.icone')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(seen!.target.className).toBe('icone');
    expect(seen!.current).toBe(list);
    expect((seen!.target as HTMLElement).dataset['id']).toBeUndefined();
    expect(seen!.target.closest<HTMLElement>('button[data-id]')!.dataset['id']).toBe('3');
  });

  it('dom-01-delegation: listeners registered on an empty list never reach later buttons', () => {
    document.body.innerHTML = '<ul id="lista"></ul>';
    const removed: string[] = [];

    expect(() =>
      new Function('remover', EAGER_LISTENERS_JS)((id: string) => removed.push(id)),
    ).not.toThrow(); // querySelectorAll returns an empty list, not null
    const button = document.createElement('button');
    button.dataset['id'] = '1';
    document.querySelector('#lista')!.append(button);
    button.click();

    expect(removed).toEqual([]);
  });
});

describe('example page of the semantic lesson follows its own rules', () => {
  const doc = new DOMParser().parseFromString(SEMANTIC_PAGE_HTML, 'text/html');

  it('declares language and viewport', () => {
    expect(doc.documentElement.lang).toBe('pt-BR');
    expect(doc.querySelector('meta[name="viewport"]')?.getAttribute('content')).toBe(
      'width=device-width, initial-scale=1',
    );
  });

  it('has page-level header (with a named nav), one main with the only h1, and a footer', () => {
    expect(doc.querySelector('body > header nav[aria-label]')).not.toBeNull();
    expect(doc.querySelectorAll('main').length).toBe(1);
    expect(doc.querySelectorAll('h1').length).toBe(1);
    expect(doc.querySelector('main h1')).not.toBeNull();
    expect(doc.querySelector('body > footer')).not.toBeNull();
  });

  it('does not skip heading levels', () => {
    const levels = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) =>
      Number(h.tagName[1]),
    );
    levels.forEach((level, i) => {
      if (i > 0) expect(level - levels[i - 1]).toBeLessThanOrEqual(1);
    });
  });

  it('labels every field and describes every image', () => {
    const fields = Array.from(doc.querySelectorAll('input'));
    expect(fields.length).toBeGreaterThan(0);
    for (const field of fields) expect(field.labels?.length, field.id).toBeGreaterThan(0);
    for (const img of Array.from(doc.querySelectorAll('img'))) {
      expect(img.getAttribute('alt')?.trim()).toBeTruthy();
    }
    expect(doc.querySelector('form[role="search"] button')?.getAttribute('type')).toBe('submit');
  });
});
