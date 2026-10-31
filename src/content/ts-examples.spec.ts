import ts from 'typescript';
import { transform } from 'sucrase';
import { AS_TS, COMPILE_OPTIONS_TS, TRUTHINESS_TS } from './exercises/ts-narrowing-01.exercises';
import { NO_NARROWING_TS, REQUEST_STATE_TS, TYPE_GUARD_TS } from './lessons/ts-narrowing-01';
import { ROUTES_TS, STATUS_TS, TYPE_ERROR_ROWS } from './lessons/ts-const-satisfies-01';

/**
 * Type-checks the examples of lesson "ts-narrowing-01" with the TypeScript compiler of this
 * project (strict), and runs the ones whose runtime behaviour the lesson describes.
 */
function diagnostics(source: string): { code: number; message: string; line: string }[] {
  const fileName = 'example.ts';
  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    target: ts.ScriptTarget.ES2022,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
    types: [],
  };
  const host = ts.createCompilerHost(options);
  const original = host.getSourceFile.bind(host);
  host.getSourceFile = (name, version, ...rest) =>
    name === fileName
      ? ts.createSourceFile(name, source, version)
      : original(name, version, ...rest);
  const program = ts.createProgram([fileName], options, host);
  return ts.getPreEmitDiagnostics(program).map((d) => ({
    code: d.code,
    message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
    line:
      d.file && d.start !== undefined
        ? source.split('\n')[d.file.getLineAndCharacterOfPosition(d.start).line].trim()
        : '',
  }));
}

/** Runs TS (types stripped) and returns what it logged, or the error it threw. */
function run(source: string): { logs: string[]; error?: Error } {
  const logs: string[] = [];
  const js = transform(source, { transforms: ['typescript'] }).code;
  try {
    new Function('console', js)({ log: (...a: unknown[]) => logs.push(a.join(' ')) });
    return { logs };
  } catch (error) {
    return { logs, error: error as Error };
  }
}

const withState = (body: string) =>
  `${REQUEST_STATE_TS}\nfunction usar(estado: EstadoPedido) {\n${body}\n}`;

describe('TypeScript examples of the lesson (real compiler, strict)', () => {
  it('the request-state example compiles with no errors', () => {
    expect(diagnostics(REQUEST_STATE_TS)).toEqual([]);
  });

  it('accessing produtos without narrowing does not compile (property missing on the union)', () => {
    const errors = diagnostics(`${REQUEST_STATE_TS}\n${NO_NARROWING_TS}`);

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(2339);
    expect(errors[0].message).toContain("'produtos'");
  });

  it('a forgotten new status breaks compilation at the never line (exercise ts-01-exhaustive)', () => {
    const withNewStatus = REQUEST_STATE_TS.replace(
      "| { status: 'erro'; mensagem: string };",
      "| { status: 'erro'; mensagem: string }\n  | { status: 'vazio' };",
    );
    expect(withNewStatus).not.toBe(REQUEST_STATE_TS);

    const errors = diagnostics(withNewStatus);

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(2322);
    expect(errors[0].line).toContain('const impossivel: never = estado;');
  });

  it('the type guard compiles, and at runtime rejects a price that came as text', () => {
    const source = `${REQUEST_STATE_TS}\n${TYPE_GUARD_TS}`;

    expect(diagnostics(source)).toEqual([]);
    expect(run(source).logs).toEqual(['Resposta inválida da API']);
  });

  it('ts-01-compile: only the line without narrowing is rejected', () => {
    expect(diagnostics(withState(COMPILE_OPTIONS_TS.discriminant))).toEqual([]);
    expect(diagnostics(withState(COMPILE_OPTIONS_TS.inOperator))).toEqual([]);
    expect(diagnostics(withState(COMPILE_OPTIONS_TS.common))).toEqual([]);
    expect(diagnostics(withState(COMPILE_OPTIONS_TS.noNarrowing)).map((e) => e.code)).toEqual([
      2339,
    ]);
  });

  it('ts-01-as: "as Produto" compiles and fails only at runtime with the claimed TypeError', () => {
    const source = `${REQUEST_STATE_TS}\n${AS_TS}`;

    expect(diagnostics(source)).toEqual([]);
    const { error } = run(source);
    expect(error).toBeInstanceOf(TypeError);
    expect(error!.message).toBe('produto.preco.toFixed is not a function');
  });

  it('ts-01-truthiness: stock 0 prints "Sem informação", and the code compiles', () => {
    expect(diagnostics(TRUTHINESS_TS)).toEqual([]);
    expect(run(TRUTHINESS_TS).logs).toEqual(['Sem informação']);
  });
});

describe('generics lesson (real compiler, strict)', () => {
  it('the base example compiles with no errors', async () => {
    const { GENERICS_BASE_TS } = await import('./lessons/ts-generics-01');

    expect(diagnostics(GENERICS_BASE_TS)).toEqual([]);
  });

  it('each line of the error table fails with exactly the code the lesson shows', async () => {
    const { GENERICS_BASE_TS, GENERICS_ERRORS } = await import('./lessons/ts-generics-01');

    for (const { snippet, code } of GENERICS_ERRORS) {
      const errors = diagnostics(`${GENERICS_BASE_TS}\n${snippet}`);
      expect(
        errors.map((e) => e.code),
        snippet,
      ).toEqual([code]);
    }
  });

  it('generics-01-infer: porId(clientes, 1) is inferred as Cliente | undefined', async () => {
    const { GENERICS_BASE_TS } = await import('./lessons/ts-generics-01');
    const { TS_GENERICS_01_EXERCISES } = await import('./exercises/ts-generics-01.exercises');
    const source = `${GENERICS_BASE_TS}\nconst resultado = porId(clientes, 1);`;

    const type = typeOfVariable(source, 'resultado');
    const exercise = TS_GENERICS_01_EXERCISES.find((e) => e.id === 'generics-01-infer')!;

    expect(exercise.kind === 'predict-output' && exercise.acceptedAnswers).toContain(type);
  });

  it('generics-01-record: a new status makes the Record of labels fail with TS2741', async () => {
    const { GENERICS_BASE_TS } = await import('./lessons/ts-generics-01');
    const withNewStatus = GENERICS_BASE_TS.replace(
      "status: 'ativo' | 'inativo';",
      "status: 'ativo' | 'inativo' | 'bloqueado';",
    );
    expect(withNewStatus).not.toBe(GENERICS_BASE_TS);

    expect(diagnostics(withNewStatus).map((e) => e.code)).toEqual([2741]);
  });
});

/** The type of a top-level variable, as the editor shows it on hover. */
function typeOfVariable(source: string, name: string): string {
  const fileName = 'example.ts';
  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    target: ts.ScriptTarget.ES2022,
    lib: ['lib.es2022.d.ts'],
    types: [],
  };
  const host = ts.createCompilerHost(options);
  const original = host.getSourceFile.bind(host);
  host.getSourceFile = (n, v, ...rest) =>
    n === fileName ? ts.createSourceFile(n, source, v) : original(n, v, ...rest);
  const program = ts.createProgram([fileName], options, host);
  const checker = program.getTypeChecker();
  let result = '';
  const visit = (node: ts.Node): void => {
    if (ts.isVariableDeclaration(node) && node.name.getText() === name) {
      result = checker.typeToString(checker.getTypeAtLocation(node.name));
    }
    ts.forEachChild(node, visit);
  };
  visit(program.getSourceFile(fileName)!);
  return result;
}

describe('ts-const-satisfies-01: types derived from data', () => {
  const base = `${STATUS_TS}\n${ROUTES_TS}\n`;

  it('the lesson code compiles in strict mode', () => {
    expect(diagnostics(base)).toEqual([]);
  });

  it('Status and NomeRota are the unions the comments claim', () => {
    const status = diagnostics(`${base}const x: Status = 'outro';`);
    expect(status.map((d) => d.code)).toEqual([2322]);
    expect(status[0].message).toContain('"pendente" | "pago" | "cancelado"');

    const rota = diagnostics(`${base}const y: NomeRota = 'outra';`);
    expect(rota[0].message).toContain('"inicio" | "perfil"');
  });

  it('as const keeps the literals; annotation erases the keys; satisfies alone keeps template literals', () => {
    expect(typeOfVariable(base, 'ROTAS')).toBe(
      '{ readonly inicio: "/"; readonly perfil: "/perfil"; }',
    );
    expect(typeOfVariable(base, 'rotasAnotadas')).toBe('Record<string, string>');
    expect(typeOfVariable(base, 'ROTULOS')).toBe(
      '{ pendente: string; pago: string; cancelado: string; }',
    );
    const semConst =
      "const r = { inicio: '/', perfil: '/perfil' } satisfies Record<string, `/${string}`>;";
    expect(typeOfVariable(semConst, 'r')).toBe('{ inicio: "/"; perfil: "/perfil"; }');
    expect(typeOfVariable("const t = ['P', 'M', 'G'];", 't')).toBe('string[]');
    expect(typeOfVariable("const t = ['P', 'M', 'G'] as const;", 't')).toBe(
      'readonly ["P", "M", "G"]',
    );
    const evento = "type E = `on${Capitalize<'click' | 'focus'>}`; const e: E = 'onBlur';";
    expect(diagnostics(evento)[0].message).toContain('"onClick" | "onFocus"');
  });

  it('every row of the error table gives the code shown', () => {
    for (const [codigo, esperado] of TYPE_ERROR_ROWS) {
      const codes = diagnostics(`${base}${codigo}`).map((d) => `TS${d.code}`);
      expect(codes).toEqual(esperado === '—' ? [] : [esperado]);
    }
  });

  it('ehStatus validates values at runtime with the same list', () => {
    const { logs, error } = run(
      `${STATUS_TS}\nconsole.log([ 'pago', 'PAGO', 1, null, 'cancelado' ].map(ehStatus).join(','));`,
    );
    expect(error).toBeUndefined();
    expect(logs).toEqual(['true,false,false,false,true']);
  });
});
