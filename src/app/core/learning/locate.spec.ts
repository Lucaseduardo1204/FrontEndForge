import { CONTENT } from '../../../content';
import { locate } from './next-activity';

const exercise = (id: string) => CONTENT.exercises.find((e) => e.id === id)!;

describe('locate', () => {
  it('finds lesson exercises in their step', () => {
    expect(locate(CONTENT, exercise('web-browser-01-li-count'))).toEqual({
      type: 'lesson',
      lessonId: 'web-browser-01',
      stepIndex: 8,
    });
  });

  it('sends objective mission tasks to the mission page, not to the lab', () => {
    expect(locate(CONTENT, exercise('mission-xss-impact'))).toEqual({
      type: 'mission',
      missionId: 'mission-xss',
    });
  });

  it('sends code tasks (mission or not) to the lab', () => {
    expect(locate(CONTENT, exercise('mission-xss-escape'))).toEqual({ type: 'lab' });
    expect(locate(CONTENT, exercise('lab-js-sum-even'))).toEqual({ type: 'lab' });
  });

  it('sends bug diagnoses to their bestiary entry', () => {
    expect(locate(CONTENT, exercise('bug-async-foreach-diagnosis'))).toEqual({
      type: 'bug',
      bugId: 'bug-async-foreach',
    });
  });
});
