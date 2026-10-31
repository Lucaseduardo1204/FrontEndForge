import {
  Achievement,
  BugEntry,
  Competency,
  Concept,
  Exercise,
  Lesson,
  LibraryEntry,
  Mission,
  Module,
  Phase,
  Project,
} from '../app/core/models/content.models';
import { ACHIEVEMENTS } from './achievements';
import { BUGS } from './bugs';
import { COMPETENCIES } from './competencies';
import { CONCEPTS } from './concepts';
import { BUG_EXERCISES } from './exercises/bugs.exercises';
import { LAB_EXERCISES } from './exercises/lab.exercises';
import { MISSION_EXERCISES } from './exercises/missions.exercises';
import { HTML_SEMANTIC_RESPONSIVE_01_EXERCISES } from './exercises/html-semantic-responsive-01.exercises';
import { JS_DOM_INTERACTIVE_01_EXERCISES } from './exercises/js-dom-interactive-01.exercises';
import { CSS_CASCADE_01_EXERCISES } from './exercises/css-cascade-01.exercises';
import { JS_ASYNC_01_EXERCISES } from './exercises/js-async-01.exercises';
import { TS_NARROWING_01_EXERCISES } from './exercises/ts-narrowing-01.exercises';
import { ANGULAR_ROUTER_01_EXERCISES } from './exercises/angular-router-01.exercises';
import { ANGULAR_SERVICES_01_EXERCISES } from './exercises/angular-services-01.exercises';
import { JS_CLOSURES_01_EXERCISES } from './exercises/js-closures-01.exercises';
import { ANGULAR_FORMS_01_EXERCISES } from './exercises/angular-forms-01.exercises';
import { ANGULAR_HTTP_01_EXERCISES } from './exercises/angular-http-01.exercises';
import { TESTING_ANGULAR_01_EXERCISES } from './exercises/testing-angular-01.exercises';
import { TESTING_UNIT_01_EXERCISES } from './exercises/testing-unit-01.exercises';
import { SECURITY_DATA_01_EXERCISES } from './exercises/security-data-01.exercises';
import { SECURITY_SESSION_01_EXERCISES } from './exercises/security-session-01.exercises';
import { SECURITY_XSS_01_EXERCISES } from './exercises/security-xss-01.exercises';
import { A11Y_PRACTICE_01_EXERCISES } from './exercises/a11y-practice-01.exercises';
import { PERF_LOADING_01_EXERCISES } from './exercises/perf-loading-01.exercises';
import { ARCH_BOUNDARIES_01_EXERCISES } from './exercises/arch-boundaries-01.exercises';
import { TOOLING_GIT_01_EXERCISES } from './exercises/tooling-git-01.exercises';
import { CAPSTONE_PLAN_01_EXERCISES } from './exercises/capstone-plan-01.exercises';
import { ANGULAR_RXJS_01_EXERCISES } from './exercises/angular-rxjs-01.exercises';
import { CSS_LAYOUT_01_EXERCISES } from './exercises/css-layout-01.exercises';
import { TS_GENERICS_01_EXERCISES } from './exercises/ts-generics-01.exercises';
import { WEB_HTTP_01_EXERCISES } from './exercises/web-http-01.exercises';
import { HTML_FORMS_01_EXERCISES } from './exercises/html-forms-01.exercises';
import { JS_FUNCTIONAL_01_EXERCISES } from './exercises/js-functional-01.exercises';
import { TOOLING_CI_01_EXERCISES } from './exercises/tooling-ci-01.exercises';
import { ARCH_STATE_01_EXERCISES } from './exercises/arch-state-01.exercises';
import { JS_TYPES_01_EXERCISES } from './exercises/js-types-01.exercises';
import { ANGULAR_SIGNALS_01_EXERCISES } from './exercises/angular-signals-01.exercises';
import { CSS_RESPONSIVE_01_EXERCISES } from './exercises/css-responsive-01.exercises';
import { JS_ERRORS_01_EXERCISES } from './exercises/js-errors-01.exercises';
import { TS_CONST_SATISFIES_01_EXERCISES } from './exercises/ts-const-satisfies-01.exercises';
import { PERF_RUNTIME_01_EXERCISES } from './exercises/perf-runtime-01.exercises';
import { TESTING_ASYNC_01_EXERCISES } from './exercises/testing-async-01.exercises';
import { HTML_TABLES_MEDIA_01_EXERCISES } from './exercises/html-tables-media-01.exercises';
import { WEB_URL_01_EXERCISES } from './exercises/web-url-01.exercises';
import { ARCH_DEPS_01_EXERCISES } from './exercises/arch-deps-01.exercises';
import { TOOLING_LINT_01_EXERCISES } from './exercises/tooling-lint-01.exercises';
import { JS_COLLECTIONS_01_EXERCISES } from './exercises/js-collections-01.exercises';
import { ANGULAR_TEMPLATES_01_EXERCISES } from './exercises/angular-templates-01.exercises';
import { ANGULAR_COMPONENTS_01_EXERCISES } from './exercises/angular-components-01.exercises';
import { WEB_BROWSER_01_EXERCISES } from './exercises/web-browser-01.exercises';
import { ANGULAR_COMPONENTS_01 } from './lessons/angular-components-01';
import { HTML_SEMANTIC_RESPONSIVE_01 } from './lessons/html-semantic-responsive-01';
import { JS_DOM_INTERACTIVE_01 } from './lessons/js-dom-interactive-01';
import { ANGULAR_FORMS_01 } from './lessons/angular-forms-01';
import { ANGULAR_HTTP_01 } from './lessons/angular-http-01';
import { ANGULAR_ROUTER_01 } from './lessons/angular-router-01';
import { ANGULAR_SERVICES_01 } from './lessons/angular-services-01';
import { CAPSTONE_PLAN_01 } from './lessons/capstone-plan-01';
import { ANGULAR_RXJS_01 } from './lessons/angular-rxjs-01';
import { CSS_CASCADE_01 } from './lessons/css-cascade-01';
import { ANGULAR_TEMPLATES_01 } from './lessons/angular-templates-01';
import { JS_COLLECTIONS_01 } from './lessons/js-collections-01';
import { TOOLING_LINT_01 } from './lessons/tooling-lint-01';
import { ARCH_DEPS_01 } from './lessons/arch-deps-01';
import { WEB_URL_01 } from './lessons/web-url-01';
import { HTML_TABLES_MEDIA_01 } from './lessons/html-tables-media-01';
import { TESTING_ASYNC_01 } from './lessons/testing-async-01';
import { PERF_RUNTIME_01 } from './lessons/perf-runtime-01';
import { TS_CONST_SATISFIES_01 } from './lessons/ts-const-satisfies-01';
import { JS_ERRORS_01 } from './lessons/js-errors-01';
import { CSS_RESPONSIVE_01 } from './lessons/css-responsive-01';
import { ANGULAR_SIGNALS_01 } from './lessons/angular-signals-01';
import { JS_TYPES_01 } from './lessons/js-types-01';
import { ARCH_STATE_01 } from './lessons/arch-state-01';
import { TOOLING_CI_01 } from './lessons/tooling-ci-01';
import { JS_FUNCTIONAL_01 } from './lessons/js-functional-01';
import { HTML_FORMS_01 } from './lessons/html-forms-01';
import { CSS_LAYOUT_01 } from './lessons/css-layout-01';
import { TS_GENERICS_01 } from './lessons/ts-generics-01';
import { JS_CLOSURES_01 } from './lessons/js-closures-01';
import { JS_ASYNC_01 } from './lessons/js-async-01';
import { TS_NARROWING_01 } from './lessons/ts-narrowing-01';
import { A11Y_PRACTICE_01 } from './lessons/a11y-practice-01';
import { ARCH_BOUNDARIES_01 } from './lessons/arch-boundaries-01';
import { PERF_LOADING_01 } from './lessons/perf-loading-01';
import { SECURITY_DATA_01 } from './lessons/security-data-01';
import { SECURITY_SESSION_01 } from './lessons/security-session-01';
import { SECURITY_XSS_01 } from './lessons/security-xss-01';
import { TESTING_ANGULAR_01 } from './lessons/testing-angular-01';
import { TESTING_UNIT_01 } from './lessons/testing-unit-01';
import { TOOLING_GIT_01 } from './lessons/tooling-git-01';
import { WEB_BROWSER_01 } from './lessons/web-browser-01';
import { WEB_HTTP_01 } from './lessons/web-http-01';
import { LIBRARY } from './library';
import { MISSIONS } from './missions';
import { MODULES } from './modules';
import { PHASES } from './phases';
import { PROJECT_CAPSTONE_ADMIN } from './projects/project-capstone-admin';
import { PROJECT_HTML_PROFILE } from './projects/project-html-profile';
import { PROJECT_JS_TASKS } from './projects/project-js-tasks';

export interface ContentCatalog {
  readonly phases: readonly Phase[];
  readonly modules: readonly Module[];
  readonly lessons: readonly Lesson[];
  readonly exercises: readonly Exercise[];
  readonly concepts: readonly Concept[];
  readonly competencies: readonly Competency[];
  readonly achievements: readonly Achievement[];
  readonly projects: readonly Project[];
  readonly missions: readonly Mission[];
  readonly bugs: readonly BugEntry[];
  readonly library: readonly LibraryEntry[];
}

/** All educational content. Integrity (ids, references) is checked by `content-integrity.spec.ts`. */
export const CONTENT: ContentCatalog = {
  phases: PHASES,
  modules: MODULES,
  lessons: [
    WEB_BROWSER_01,
    WEB_HTTP_01,
    WEB_URL_01,
    HTML_SEMANTIC_RESPONSIVE_01,
    HTML_FORMS_01,
    HTML_TABLES_MEDIA_01,
    CSS_CASCADE_01,
    CSS_LAYOUT_01,
    CSS_RESPONSIVE_01,
    JS_DOM_INTERACTIVE_01,
    JS_CLOSURES_01,
    JS_TYPES_01,
    JS_COLLECTIONS_01,
    JS_ASYNC_01,
    JS_FUNCTIONAL_01,
    JS_ERRORS_01,
    TS_NARROWING_01,
    TS_GENERICS_01,
    TS_CONST_SATISFIES_01,
    ANGULAR_COMPONENTS_01,
    ANGULAR_SIGNALS_01,
    ANGULAR_TEMPLATES_01,
    ANGULAR_SERVICES_01,
    ANGULAR_ROUTER_01,
    ANGULAR_FORMS_01,
    ANGULAR_HTTP_01,
    ANGULAR_RXJS_01,
    ARCH_BOUNDARIES_01,
    ARCH_STATE_01,
    ARCH_DEPS_01,
    SECURITY_XSS_01,
    SECURITY_SESSION_01,
    SECURITY_DATA_01,
    TESTING_UNIT_01,
    TESTING_ANGULAR_01,
    TESTING_ASYNC_01,
    PERF_LOADING_01,
    PERF_RUNTIME_01,
    A11Y_PRACTICE_01,
    TOOLING_GIT_01,
    TOOLING_CI_01,
    TOOLING_LINT_01,
    CAPSTONE_PLAN_01,
  ],
  exercises: [
    ...WEB_BROWSER_01_EXERCISES,
    ...HTML_SEMANTIC_RESPONSIVE_01_EXERCISES,
    ...JS_DOM_INTERACTIVE_01_EXERCISES,
    ...CSS_CASCADE_01_EXERCISES,
    ...JS_ASYNC_01_EXERCISES,
    ...TS_NARROWING_01_EXERCISES,
    ...JS_CLOSURES_01_EXERCISES,
    ...ANGULAR_SERVICES_01_EXERCISES,
    ...ANGULAR_ROUTER_01_EXERCISES,
    ...ANGULAR_FORMS_01_EXERCISES,
    ...ANGULAR_HTTP_01_EXERCISES,
    ...TESTING_UNIT_01_EXERCISES,
    ...TESTING_ANGULAR_01_EXERCISES,
    ...SECURITY_XSS_01_EXERCISES,
    ...SECURITY_SESSION_01_EXERCISES,
    ...SECURITY_DATA_01_EXERCISES,
    ...PERF_LOADING_01_EXERCISES,
    ...A11Y_PRACTICE_01_EXERCISES,
    ...ARCH_BOUNDARIES_01_EXERCISES,
    ...TOOLING_GIT_01_EXERCISES,
    ...CAPSTONE_PLAN_01_EXERCISES,
    ...CSS_LAYOUT_01_EXERCISES,
    ...TS_GENERICS_01_EXERCISES,
    ...ANGULAR_RXJS_01_EXERCISES,
    ...WEB_HTTP_01_EXERCISES,
    ...HTML_FORMS_01_EXERCISES,
    ...JS_FUNCTIONAL_01_EXERCISES,
    ...TOOLING_CI_01_EXERCISES,
    ...ARCH_STATE_01_EXERCISES,
    ...JS_TYPES_01_EXERCISES,
    ...ANGULAR_SIGNALS_01_EXERCISES,
    ...CSS_RESPONSIVE_01_EXERCISES,
    ...JS_ERRORS_01_EXERCISES,
    ...TS_CONST_SATISFIES_01_EXERCISES,
    ...PERF_RUNTIME_01_EXERCISES,
    ...TESTING_ASYNC_01_EXERCISES,
    ...HTML_TABLES_MEDIA_01_EXERCISES,
    ...WEB_URL_01_EXERCISES,
    ...ARCH_DEPS_01_EXERCISES,
    ...TOOLING_LINT_01_EXERCISES,
    ...JS_COLLECTIONS_01_EXERCISES,
    ...ANGULAR_TEMPLATES_01_EXERCISES,
    ...ANGULAR_COMPONENTS_01_EXERCISES,
    ...LAB_EXERCISES,
    ...MISSION_EXERCISES,
    ...BUG_EXERCISES,
  ],
  concepts: CONCEPTS,
  competencies: COMPETENCIES,
  achievements: ACHIEVEMENTS,
  projects: [PROJECT_HTML_PROFILE, PROJECT_JS_TASKS, PROJECT_CAPSTONE_ADMIN],
  missions: MISSIONS,
  bugs: BUGS,
  library: LIBRARY,
};
