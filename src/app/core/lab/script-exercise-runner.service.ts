import { inject, Injectable } from '@angular/core';
import { CodeExercise } from '../models/content.models';
import { CodeRunnerService } from './code-runner.service';
import { RunResult } from './lab-protocol';
import { TranspilerService } from './transpiler.service';

/** Runs JavaScript/TypeScript exercises: transpile (TS only), then run in isolation. */
@Injectable({ providedIn: 'root' })
export class ScriptExerciseRunner {
  private readonly runner = inject(CodeRunnerService);
  private readonly transpiler = inject(TranspilerService);

  async run(exercise: CodeExercise, code: string): Promise<RunResult> {
    let javascript = code;
    if (exercise.language === 'typescript') {
      const transpiled = await this.transpiler.transpile(code);
      if (!transpiled.ok) {
        return transpiled.reason === 'syntax'
          ? { status: 'compile-error', message: `Erro de sintaxe: ${transpiled.message}` }
          : { status: 'unavailable', message: transpiled.message };
      }
      javascript = transpiled.code;
    }
    return this.runner.runJavaScript(javascript, exercise.tests);
  }
}
