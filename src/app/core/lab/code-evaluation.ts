import { Evaluation, FeedbackItem } from '../learning/exercise-evaluation';
import { CodeTest } from '../models/content.models';
import { RunResult } from './lab-protocol';

/**
 * Turns a real run into feedback (lab exercises and project checks). A result only counts
 * as correct when the code actually ran and every test reported success.
 */
export function evaluateCodeRun(
  exercise: { readonly tests: readonly CodeTest[] },
  result: RunResult,
): Evaluation {
  switch (result.status) {
    case 'timeout':
      return failure('Tempo esgotado.', [
        {
          tone: 'incorrect',
          text: `O código não terminou em ${result.timeoutMs / 1000} s e a execução foi interrompida. Procure um laço que nunca termina (por exemplo, um while cuja condição nunca fica falsa) ou uma recursão sem caso de parada.`,
        },
      ]);
    case 'compile-error':
      return failure('O código não pôde ser preparado para execução.', [
        { tone: 'incorrect', text: result.message },
      ]);
    case 'unavailable':
      return failure('Não foi possível executar.', [{ tone: 'info', text: result.message }]);
    case 'completed':
      break;
  }

  const { report } = result;
  const outcomes = new Map(report.tests.map((t) => [t.id, t]));
  const feedback: FeedbackItem[] = [];
  if (report.error) {
    feedback.push({
      tone: 'incorrect',
      text: `Ao executar o seu código, aconteceu ${report.error.name}: ${report.error.message}`,
    });
  }
  let passed = 0;
  for (const test of exercise.tests) {
    const outcome = outcomes.get(test.id);
    if (outcome?.passed) {
      passed++;
      feedback.push({ tone: 'correct', text: test.description });
    } else {
      feedback.push({
        tone: 'incorrect',
        text: `${test.description} — ${outcome ? outcome.message : 'o teste não chegou a rodar.'}`,
      });
    }
  }

  const total = exercise.tests.length;
  const correct = passed === total && total > 0;
  return {
    correct,
    score: total === 0 ? 0 : passed / total,
    summary: correct
      ? `Todos os ${total} testes passaram.`
      : `${passed} de ${total} testes passaram.`,
    feedback,
  };
}

function failure(summary: string, feedback: FeedbackItem[]): Evaluation {
  return { correct: false, score: 0, summary, feedback };
}
