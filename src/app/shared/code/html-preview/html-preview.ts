import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { isReadyMessage, parseRunnerMessage, RunResult } from '../../../core/lab/lab-protocol';
import { buildPreviewDocument, createNonce } from '../../../core/lab/preview-document';

const PREVIEW_TIMEOUT_MS = 4000;

/**
 * Visual preview of HTML/CSS and runner of its DOM tests, inside an iframe with
 * `sandbox="allow-scripts"` only (never `allow-same-origin`): the document has an opaque
 * origin and cannot reach the application, its storage or its DOM.
 */
@Component({
  selector: 'app-html-preview',
  template: `
    <iframe
      #frame
      class="preview"
      title="Prévia do seu HTML"
      sandbox="allow-scripts"
      referrerpolicy="no-referrer"
    ></iframe>
  `,
  styles: `
    .preview {
      display: block;
      width: 100%;
      min-height: 18rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: #fff;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlPreview {
  private readonly frame = viewChild.required<ElementRef<HTMLIFrameElement>>('frame');
  private cancelCurrent: (() => void) | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancelCurrent?.());
  }

  /** Renders the HTML and resolves with the DOM test results reported by the iframe. */
  render(html: string, tests: readonly { id: string; source: string }[]): Promise<RunResult> {
    this.cancelCurrent?.();
    const runId = crypto.randomUUID();
    const started = performance.now();
    let runnerStarted = false;

    return new Promise<RunResult>((resolve) => {
      const finish = (result: RunResult) => {
        window.removeEventListener('message', onMessage);
        clearTimeout(timer);
        this.cancelCurrent = null;
        resolve(result);
      };
      const onMessage = (event: MessageEvent) => {
        // Only messages from this iframe (opaque origin "null") with the expected run id count.
        if (event.source !== this.frame().nativeElement.contentWindow) return;
        if (event.origin !== 'null') return;
        if (isReadyMessage(event.data, runId)) {
          runnerStarted = true;
          return;
        }
        const report = parseRunnerMessage(event.data, runId);
        if (report) {
          finish({
            status: 'completed',
            report,
            durationMs: Math.round(performance.now() - started),
          });
        }
      };
      // The student's scripts never run in the preview, so a runner that never said "ready"
      // is an environment failure (e.g. scripts blocked by the host), not the student's fault.
      const timer = setTimeout(
        () =>
          finish(
            runnerStarted
              ? { status: 'timeout', timeoutMs: PREVIEW_TIMEOUT_MS }
              : {
                  status: 'unavailable',
                  message:
                    'A prévia isolada não conseguiu iniciar, então nada foi avaliado e nenhuma tentativa foi registrada. Recarregue a página; se continuar, o navegador ou o servidor pode estar bloqueando scripts na prévia.',
                },
          ),
        PREVIEW_TIMEOUT_MS,
      );
      this.cancelCurrent = () =>
        finish({
          status: 'unavailable',
          message: 'A prévia foi substituída por uma nova execução.',
        });

      window.addEventListener('message', onMessage);
      // Assigned directly (not bound): Angular would sanitize srcdoc and strip the runner.
      // The document only ever lives in this sandboxed, opaque-origin iframe.
      this.frame().nativeElement.srcdoc = buildPreviewDocument({
        html,
        nonce: createNonce(),
        runId,
        tests,
      });
    });
  }
}
