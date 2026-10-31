import { ChangeDetectionStrategy, Component, input, model, output, signal } from '@angular/core';

const INDENT = '  ';

/**
 * Plain textarea editor. Tab indents, but the keyboard is never trapped:
 * Shift+Tab always leaves, and Esc makes the next Tab leave too.
 */
@Component({
  selector: 'app-code-editor',
  template: `
    <div class="editor">
      <label class="editor__label" [for]="editorId()">{{ label() }}</label>
      <textarea
        class="editor__area"
        [id]="editorId()"
        [value]="code()"
        [attr.aria-describedby]="editorId() + '-help'"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        wrap="off"
        [rows]="rows()"
        (input)="onInput($any($event.target).value)"
        (keydown)="onKeydown($event)"
        (blur)="tabLeaves.set(false)"
      ></textarea>
      <p class="editor__help" [id]="editorId() + '-help'">
        @if (tabLeaves()) {
          Modo de saída: Tab agora move o foco para fora do editor.
        } @else {
          Tab insere {{ indentSize }} espaços. Para sair com o teclado, use Shift+Tab ou Esc e
          depois Tab. Ctrl+Enter executa.
        }
      </p>
    </div>
  `,
  styles: `
    .editor {
      display: grid;
      gap: var(--space-2);
    }

    .editor__label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .editor__area {
      width: 100%;
      min-height: 16rem;
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-md);
      background: var(--color-surface-2);
      color: var(--color-text);
      font-family: var(--font-mono);
      font-size: var(--font-size-sm);
      line-height: 1.6;
      tab-size: 2;
      resize: vertical;
      white-space: pre;
      overflow: auto;
    }

    .editor__help {
      color: var(--color-text-subtle);
      font-size: var(--font-size-xs);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeEditor {
  readonly editorId = input.required<string>();
  readonly label = input('Seu código');
  readonly rows = input(16);
  readonly code = model.required<string>();
  readonly runRequested = output();

  protected readonly tabLeaves = signal(false);
  protected readonly indentSize = INDENT.length;

  protected onInput(value: string): void {
    this.tabLeaves.set(false);
    this.code.set(value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const area = event.target as HTMLTextAreaElement;
    if (event.key === 'Escape') {
      this.tabLeaves.set(true);
      return;
    }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.runRequested.emit();
      return;
    }
    if (event.key !== 'Tab' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    if (this.tabLeaves()) return; // let the browser move focus
    event.preventDefault();
    area.setRangeText(INDENT, area.selectionStart, area.selectionEnd, 'end');
    this.code.set(area.value);
  }
}
