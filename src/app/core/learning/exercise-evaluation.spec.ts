import {
  CodeExercise,
  MultipleChoiceExercise,
  OrderStepsExercise,
  PredictOutputExercise,
} from '../models/content.models';
import {
  evaluateExercise,
  initialOrder,
  normalizeOutput,
  UnsupportedExerciseError,
} from './exercise-evaluation';

const base = {
  difficulty: 'introductory',
  conceptIds: [],
  prompt: [],
  hints: ['h'],
  solution: [],
} as const;

const singleChoice: MultipleChoiceExercise = {
  ...base,
  id: 'mc-single',
  kind: 'multiple-choice',
  title: 'Single',
  options: [
    { id: 'a', text: 'A', explanation: 'A está certa porque X.' },
    { id: 'b', text: 'B', explanation: 'B está errada porque Y.' },
  ],
  correctOptionIds: ['a'],
};

const multiChoice: MultipleChoiceExercise = {
  ...singleChoice,
  id: 'mc-multi',
  options: [...singleChoice.options, { id: 'c', text: 'C', explanation: 'C está certa porque Z.' }],
  correctOptionIds: ['a', 'c'],
};

const predict: PredictOutputExercise = {
  ...base,
  id: 'predict',
  kind: 'predict-output',
  title: 'Predict',
  code: 'console.log(null)',
  language: 'javascript',
  acceptedAnswers: ['null'],
  explanation: 'Porque querySelector não encontrou nada.',
  commonMistakes: [{ answer: 'undefined', explanation: 'querySelector nunca retorna undefined.' }],
  wrongAnswerGuidance: 'Pense no que já foi lido.',
};

const order: OrderStepsExercise = {
  ...base,
  id: 'order',
  kind: 'order-steps',
  title: 'Order',
  items: [
    { id: 'one', text: 'Um', why: 'Um vem primeiro.' },
    { id: 'two', text: 'Dois', why: 'Dois depende de um.' },
    { id: 'three', text: 'Três', why: 'Três depende de dois.' },
  ],
  explanation: 'Cada etapa depende da anterior.',
};

describe('evaluateExercise', () => {
  describe('multiple choice', () => {
    it('accepts the correct option and explains why', () => {
      const result = evaluateExercise(singleChoice, { kind: 'multiple-choice', selected: ['a'] });

      expect(result.correct).toBe(true);
      expect(result.score).toBe(1);
      expect(result.feedback).toEqual([{ tone: 'correct', text: '“A” — A está certa porque X.' }]);
    });

    it('explains a wrong choice without revealing the right one', () => {
      const result = evaluateExercise(singleChoice, { kind: 'multiple-choice', selected: ['b'] });

      expect(result.correct).toBe(false);
      expect(result.score).toBe(0);
      expect(result.feedback.map((f) => f.text).join(' ')).toContain('B está errada porque Y.');
      expect(result.feedback.map((f) => f.text).join(' ')).not.toContain('A está certa');
    });

    it('requires all correct options when there are several', () => {
      const partial = evaluateExercise(multiChoice, { kind: 'multiple-choice', selected: ['a'] });
      const full = evaluateExercise(multiChoice, { kind: 'multiple-choice', selected: ['c', 'a'] });

      expect(partial.correct).toBe(false);
      expect(partial.score).toBe(0.5);
      expect(partial.feedback.at(-1)?.text).toBe('Ainda falta marcar 1 opção correta.');
      expect(full.correct).toBe(true);
    });

    it('rejects selecting every option', () => {
      const result = evaluateExercise(multiChoice, {
        kind: 'multiple-choice',
        selected: ['a', 'b', 'c'],
      });

      expect(result.correct).toBe(false);
      expect(result.score).toBeCloseTo(2 / 3);
    });
  });

  describe('predict output', () => {
    it.each(['null', '  null ', '"null"', "'null'"])('accepts %j', (text) => {
      expect(evaluateExercise(predict, { kind: 'predict-output', text }).correct).toBe(true);
    });

    it('explains the correct answer', () => {
      const result = evaluateExercise(predict, { kind: 'predict-output', text: 'null' });

      expect(result.feedback[0].text).toBe(predict.explanation);
    });

    it('explains a known mistake specifically', () => {
      const result = evaluateExercise(predict, { kind: 'predict-output', text: 'undefined' });

      expect(result.correct).toBe(false);
      expect(result.feedback[0].text).toBe('querySelector nunca retorna undefined.');
    });

    it('guides unknown mistakes without giving the answer', () => {
      const result = evaluateExercise(predict, { kind: 'predict-output', text: 'NULL' });

      expect(result.correct).toBe(false);
      expect(result.feedback[0].text).toBe(predict.wrongAnswerGuidance);
    });
  });

  describe('order steps', () => {
    it('accepts the right order', () => {
      const result = evaluateExercise(order, {
        kind: 'order-steps',
        order: ['one', 'two', 'three'],
      });

      expect(result.correct).toBe(true);
      expect(result.feedback[0].text).toBe(order.explanation);
    });

    it('reports how many are in place and explains the first misplaced step', () => {
      const result = evaluateExercise(order, {
        kind: 'order-steps',
        order: ['one', 'three', 'two'],
      });

      expect(result.correct).toBe(false);
      expect(result.score).toBeCloseTo(1 / 3);
      expect(result.feedback[0].text).toBe('1 de 3 etapas estão na posição correta.');
      expect(result.feedback[1].text).toContain('posição 2');
      expect(result.feedback[1].text).toContain('Três depende de dois.');
    });
  });

  it('refuses to grade code exercises instead of faking a result', () => {
    const code = { ...base, id: 'code', kind: 'code' } as unknown as CodeExercise;

    expect(() => evaluateExercise(code, { kind: 'predict-output', text: '' })).toThrow(
      UnsupportedExerciseError,
    );
  });

  it('rejects an answer of the wrong kind', () => {
    expect(() => evaluateExercise(predict, { kind: 'order-steps', order: [] })).toThrow();
  });
});

describe('normalizeOutput', () => {
  it('collapses whitespace but keeps case', () => {
    expect(normalizeOutput('  Hello \n  World ')).toBe('Hello World');
    expect(normalizeOutput('True')).not.toBe('true');
  });
});

describe('initialOrder', () => {
  it('is deterministic and never already solved', () => {
    const first = initialOrder(order);

    expect(initialOrder(order)).toEqual(first);
    expect(first).not.toEqual(['one', 'two', 'three']);
    expect([...first].sort()).toEqual(['one', 'three', 'two']);
  });

  it('leaves at most a third of the items in place', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({ id, text: id, why: '' }));
    for (const id of ['pipeline', 'web-browser-01-pipeline-order', 'x', 'outro-exercicio']) {
      const shuffled = initialOrder({ ...order, id, items });
      const inPlace = shuffled.filter((item, index) => item === items[index].id).length;
      expect(inPlace, id).toBeLessThanOrEqual(2);
    }
  });
});
