import { inject, Injectable, InjectionToken } from '@angular/core';
import { CONTENT } from '../../../content';
import { ContentId, Exercise, Lesson } from '../models/content.models';
import {
  ContentCatalog,
  findExercise,
  lessonContext,
  LessonContext,
  orderedLessons,
} from './catalog';

/** The educational content. Replaceable in tests with a small fixture. */
export const CONTENT_CATALOG = new InjectionToken<ContentCatalog>('CONTENT_CATALOG', {
  providedIn: 'root',
  factory: () => CONTENT,
});

@Injectable({ providedIn: 'root' })
export class ContentService {
  readonly catalog = inject(CONTENT_CATALOG);
  readonly lessons: readonly Lesson[] = orderedLessons(this.catalog);

  lesson(id: ContentId): Lesson | undefined {
    return this.catalog.lessons.find((l) => l.id === id);
  }

  exercise(id: ContentId): Exercise | undefined {
    return findExercise(this.catalog, id);
  }

  context(lesson: Lesson): LessonContext | undefined {
    return lessonContext(this.catalog, lesson);
  }
}
