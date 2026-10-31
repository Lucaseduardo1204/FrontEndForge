/// <reference lib="webworker" />

// Transpiles the student's TypeScript to JavaScript. This worker only transforms text:
// it never executes the student's code (that happens in the isolated runner).
import { transform } from 'sucrase';

addEventListener('message', ({ data }: MessageEvent) => {
  if (!data || typeof data.id !== 'string' || typeof data.source !== 'string') return;
  try {
    const { code } = transform(data.source, {
      transforms: ['typescript'],
      disableESTransforms: true,
    });
    postMessage({ id: data.id, ok: true, code });
  } catch (error) {
    postMessage({
      id: data.id,
      ok: false,
      message: error instanceof Error ? error.message : 'Erro ao transpilar o TypeScript.',
    });
  }
});
