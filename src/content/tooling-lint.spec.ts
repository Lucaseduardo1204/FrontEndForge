import ts from 'typescript';
import { LINT_FINDINGS, PRETTIER_AFTER, PRETTIER_BEFORE } from './lessons/tooling-lint-01';

/**
 * The findings table of lesson "tooling-lint-01" was measured with this repository's ESLint
 * (D-067). These checks keep it true: every rule cited exists in the installed plugins, and the
 * configuration that produced it is still in place.
 */
const lerArquivo = (caminho: string): string => ts.sys.readFile(caminho) ?? '';

function arquivoDaRegra(regra: string): string {
  if (regra.startsWith('@angular-eslint/template/')) {
    return `node_modules/@angular-eslint/eslint-plugin-template/dist/rules/${regra.split('/')[2]}.js`;
  }
  if (regra.startsWith('@angular-eslint/')) {
    return `node_modules/@angular-eslint/eslint-plugin/dist/rules/${regra.split('/')[1]}.js`;
  }
  if (regra.startsWith('@typescript-eslint/')) {
    return `node_modules/@typescript-eslint/eslint-plugin/dist/rules/${regra.split('/')[1]}.js`;
  }
  return `node_modules/eslint/lib/rules/${regra}.js`;
}

describe('tooling-lint-01: the measured lint findings stay true', () => {
  it('every rule in the table exists in the installed plugins', () => {
    const ausentes = LINT_FINDINGS.map(([, regra]) => regra).filter(
      (regra) => !ts.sys.fileExists(arquivoDaRegra(regra)),
    );
    expect(ausentes).toEqual([]);
  });

  it('the configuration that produced the table is still in place', () => {
    const config = lerArquivo('eslint.config.js');
    for (const trecho of [
      'eslint.configs.recommended',
      'tseslint.configs.recommended',
      'angular.configs.tsRecommended',
      'angular.configs.templateRecommended',
      'angular.configs.templateAccessibility',
      "eqeqeq: 'error'",
      "'@angular-eslint/prefer-signals': 'error'",
      "'@angular-eslint/template/button-has-type': 'error'",
      "prefix: 'app'",
    ]) {
      expect(config).toContain(trecho);
    }
  });

  it('the Prettier example uses this repository settings (single quotes, width 100)', () => {
    const prettier = JSON.parse(lerArquivo('.prettierrc'));
    expect(prettier.singleQuote).toBe(true);
    expect(PRETTIER_BEFORE).toContain('"dois"');
    expect(PRETTIER_AFTER).toContain("'dois'");
  });
});
