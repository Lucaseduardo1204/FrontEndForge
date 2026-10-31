import {
  Exercise,
  MultipleChoiceExercise,
  OrderStepsExercise,
  PredictOutputExercise,
} from '../models/content.models';

/** What the student submitted, per exercise kind. Kept in `Attempt.answer`. */
export type ExerciseAnswer =
  | { readonly kind: 'multiple-choice'; readonly selected: readonly string[] }
  | { readonly kind: 'predict-output'; readonly text: string }
  | { readonly kind: 'order-steps'; readonly order: readonly string[] };

export interface FeedbackItem {
  readonly tone: 'correct' | 'incorrect' | 'info';
  readonly text: string;
}

export interface Evaluation {
  readonly correct: boolean;
  /** 0..1 */
  readonly score: number;
  readonly summary: string;
  /** Explanations of *why* the answer is right or wrong. */
  readonly feedback: readonly FeedbackItem[];
}

export class UnsupportedExerciseError extends Error {}

/**
 * Deterministic grading of objective exercises. Code exercises are graded by the
 * isolated runner (planned) and are rejected here instead of being faked.
 */
export function evaluateExercise(exercise: Exercise, answer: ExerciseAnswer): Evaluation {
  if (exercise.kind === 'code') {
    throw new UnsupportedExerciseError('Exercícios de código são avaliados pelo executor isolado.');
  }
  if (exercise.kind !== answer.kind) {
    throw new Error(`Resposta do tipo "${answer.kind}" para exercício "${exercise.kind}".`);
  }
  switch (answer.kind) {
    case 'multiple-choice':
      return evaluateMultipleChoice(exercise as MultipleChoiceExercise, answer.selected);
    case 'predict-output':
      return evaluatePredictOutput(exercise as PredictOutputExercise, answer.text);
    case 'order-steps':
      return evaluateOrderSteps(exercise as OrderStepsExercise, answer.order);
  }
}

function evaluateMultipleChoice(
  exercise: MultipleChoiceExercise,
  selected: readonly string[],
): Evaluation {
  const expected = new Set(exercise.correctOptionIds);
  const chosen = new Set(selected);
  const hits = [...chosen].filter((id) => expected.has(id)).length;
  const union = new Set([...expected, ...chosen]).size;
  const missed = expected.size - hits;
  const correct = hits === expected.size && chosen.size === expected.size;

  // Only the chosen options are explained, so a wrong answer does not reveal the right one.
  const feedback: FeedbackItem[] = exercise.options
    .filter((option) => chosen.has(option.id))
    .map((option) => ({
      tone: expected.has(option.id) ? 'correct' : 'incorrect',
      text: `“${option.text}” — ${option.explanation}`,
    }));
  if (!correct && missed > 0 && hits > 0) {
    feedback.push({
      tone: 'info',
      text:
        missed === 1
          ? 'Ainda falta marcar 1 opção correta.'
          : `Ainda faltam marcar ${missed} opções corretas.`,
    });
  }

  return {
    correct,
    score: union === 0 ? 0 : hits / union,
    summary: correct
      ? 'Resposta correta.'
      : expected.size > 1
        ? 'Ainda não. Revise cada opção marcada.'
        : 'Resposta incorreta.',
    feedback,
  };
}

/** Trims, collapses whitespace and removes surrounding quotes. Case is significant. */
export function normalizeOutput(text: string): string {
  const collapsed = text.trim().replace(/\s+/g, ' ');
  const quoted = /^(['"`])(.*)\1$/.exec(collapsed);
  return quoted ? quoted[2] : collapsed;
}

function evaluatePredictOutput(exercise: PredictOutputExercise, text: string): Evaluation {
  const given = normalizeOutput(text);
  if (exercise.acceptedAnswers.some((answer) => normalizeOutput(answer) === given)) {
    return {
      correct: true,
      score: 1,
      summary: 'Resposta correta.',
      feedback: [{ tone: 'correct', text: exercise.explanation }],
    };
  }
  const mistake = exercise.commonMistakes.find((m) => normalizeOutput(m.answer) === given);
  return {
    correct: false,
    score: 0,
    summary: given === '' ? 'Digite a saída que você espera.' : 'Resposta incorreta.',
    feedback: [
      { tone: 'incorrect', text: mistake ? mistake.explanation : exercise.wrongAnswerGuidance },
    ],
  };
}

function evaluateOrderSteps(exercise: OrderStepsExercise, order: readonly string[]): Evaluation {
  const expected = exercise.items.map((item) => item.id);
  const inPlace = expected.filter((id, index) => order[index] === id).length;
  const correct = inPlace === expected.length && order.length === expected.length;
  if (correct) {
    return {
      correct,
      score: 1,
      summary: 'Ordem correta.',
      feedback: [{ tone: 'correct', text: exercise.explanation }],
    };
  }

  // Explain the first misplaced position only: enough to reason about, without the full answer.
  const firstWrong = expected.findIndex((id, index) => order[index] !== id);
  const placed = exercise.items.find((item) => item.id === order[firstWrong]);
  const feedback: FeedbackItem[] = [
    { tone: 'info', text: `${inPlace} de ${expected.length} etapas estão na posição correta.` },
  ];
  if (placed) {
    feedback.push({
      tone: 'incorrect',
      text: `A posição ${firstWrong + 1} está errada: “${placed.text}” não vem aí. ${placed.why}`,
    });
  }
  return {
    correct,
    score: inPlace / expected.length,
    summary: 'A ordem ainda não está correta.',
    feedback,
  };
}

/**
 * Deterministic shuffle (same order on every visit) that leaves at most a third of the
 * items in their correct position, so the exercise is never half solved from the start.
 * Seeded by the exercise id so the student sees a stable starting point.
 */
export function initialOrder(exercise: OrderStepsExercise): string[] {
  const ids = exercise.items.map((item) => item.id);
  const maxInPlace = Math.floor(ids.length / 3);
  let seed = [...exercise.id].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };

  let best = [...ids];
  let bestInPlace = ids.length;
  for (let attempt = 0; attempt < 100 && bestInPlace > maxInPlace; attempt++) {
    const shuffled = [...ids];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const inPlace = shuffled.filter((id, index) => id === ids[index]).length;
    if (inPlace < bestInPlace) {
      best = shuffled;
      bestInPlace = inPlace;
    }
  }
  // Fallback for tiny lists: a rotation never keeps every item in place.
  return bestInPlace === ids.length ? [...ids.slice(1), ids[0]] : best;
}
