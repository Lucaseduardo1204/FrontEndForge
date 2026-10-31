import { iframeRunnerSource } from './runner-source';

/**
 * Builds the `srcdoc` of the HTML/CSS preview. The iframe that receives it must use
 * `sandbox="allow-scripts"` and never `allow-same-origin`.
 *
 * Content Security Policy of the preview:
 * - `default-src 'none'`: no network at all (no external images, fonts, fetch).
 * - `style-src 'unsafe-inline'`: the student's <style> and style="" work.
 * - `script-src 'nonce-…' 'unsafe-eval'`: only our runner runs (it needs eval to run the
 *   tests); the student's <script> tags and inline handlers (onclick="…") are blocked.
 */
export function buildPreviewDocument(options: {
  readonly html: string;
  readonly nonce: string;
  readonly runId: string;
  readonly tests: readonly { id: string; source: string }[];
}): string {
  const { html, nonce, runId, tests } = options;
  if (!/^[A-Za-z0-9+/=_-]{16,}$/.test(nonce)) throw new Error('Nonce inválido.');
  const csp = [
    "default-src 'none'",
    "style-src 'unsafe-inline'",
    'img-src data:',
    'font-src data:',
    `script-src 'nonce-${nonce}' 'unsafe-eval'`,
  ].join('; ');

  // The runner is in <head>, before the student's markup, so unclosed tags or comments
  // in the student's HTML cannot swallow it.
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{margin:16px;font-family:system-ui,sans-serif;color:#111;background:#fff}</style>
<script nonce="${nonce}">${iframeRunnerSource(runId, tests, html)}</script>
</head>
<body>
${html}
</body>
</html>`;
}

/** Random nonce for the preview CSP. */
export function createNonce(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}
