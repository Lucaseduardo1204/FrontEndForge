# Tarefas do MVP

Legenda: `[x]` feito e verificado · `[ ]` pendente. Ordem segue o `CLAUDE.md`.

## 1. Fundação ✅ (2026-10-29)

- [x] Projeto Angular 22 (standalone, zoneless, SCSS, Vitest), TS estrito
- [x] ESLint (angular-eslint + regras de acessibilidade) e Prettier
- [x] Design tokens (tema escuro padrão + claro persistido), estilos base e primitivas visuais
- [x] Ícones (`@lucide/angular`)
- [x] Shell: sidebar no desktop, gaveta `<dialog>` no celular, cabeçalho, botão para pular ao conteúdo
- [x] Rotas com lazy loading por feature e página 404
- [x] Áreas não implementadas com página "Planejado" (sem link morto)
- [x] Modelos de conteúdo e progresso em `core/models/`
- [x] Persistência: `ProgressRepository` + localStorage, `schemaVersion`, migração e validação
- [x] Configurações: tema, aviso de "não é backup", exportar/importar JSON, apagar com confirmação
- [x] Testes: esquema/migração, repositório, `ProgressService`, tema, rotas e navegação (30 testes)
- [x] Verificado no navegador: desktop, 390px, tema claro e escuro, diálogos, gaveta por teclado

## 2. Fluxo principal ✅ (2026-10-29)

Central de comando → Lição → Exercício → Avaliação → Feedback → Progresso salvo.

- [x] Conteúdo em `src/content/`: fase 0 (parcial), módulo "Do HTML aos pixels", lição completa "Como o navegador interpreta HTML, CSS e JavaScript" (10 etapas) com 7 exercícios
- [x] `ContentService` + funções de catálogo; teste de integridade do conteúdo
- [x] Avaliação de múltipla escolha, prever saída e ordenar etapas (funções puras + testes)
- [x] Lição por etapas com navegação, foco movido para a etapa e etapa atual salva
- [x] Exercício com dicas progressivas, feedback explicando o porquê, nova tentativa e solução liberada após tentativa ou pedido explícito
- [x] `ProgressService.update()` serializado, bloqueado com `loadError`; tentativas, conclusões e dias de estudo
- [x] Conclusão da lição exige acertar a avaliação
- [x] Central de comando real: recomendação com motivo, estado vazio, progresso, atividade recente, seções futuras marcadas "Planejado"
- [x] Teste de integração do fluxo inteiro com o conteúdo real (74 testes no total)

## 3. Currículo e trilha ✅ (2026-10-29)

- [x] As 14 fases em `src/content/phases.ts`, com introdução, tópicos, objetivos, pré-requisitos, projeto e competências
- [x] 14 competências da especificação em `src/content/competencies.ts`
- [x] Estados de fase e módulo (`curriculum-status.ts`), com motivo do bloqueio; recomendação usa a mesma regra
- [x] Academia: mapa das 14 fases com estado, progresso e projeto; busca por tópico sem acento
- [x] Página da fase: introdução, objetivos, pré-requisitos com estado, tópicos, módulos (objetivos, lições com estado, critérios), projeto marcado "Planejado"
- [x] Ligações: Academia na navegação, breadcrumb da lição leva à fase, dashboard leva ao mapa
- [x] Testes: regras de estado, busca, integração da Academia (91 testes no total)

## 4. Laboratório ✅ (2026-10-29)

- [x] Execução de JS em Worker de URL `data:` (thread própria, origem opaca), APIs de rede/armazenamento removidas, timeout de 3 s com `terminate()`
- [x] Protocolo validado (`parseRunnerMessage`), `runId` aleatório, limites de tamanho
- [x] TypeScript transpilado com sucrase em worker separado; erro de sintaxe ≠ falha do transpilador
- [x] Prévia de HTML/CSS em iframe `sandbox="allow-scripts"` com CSP por nonce (scripts e rede do estudante bloqueados)
- [x] Editor acessível (Tab indenta; Shift+Tab ou Esc+Tab saem; Ctrl+Enter executa)
- [x] Página do laboratório e do exercício: enunciado, requisitos, exemplos, o que os testes verificam, dicas, solução comentada, console, resultado por teste
- [x] 4 exercícios (2 JS, 1 TS, 1 HTML/CSS) com soluções oficiais testadas contra os próprios testes
- [x] Tentativas salvas com o código; o exercício reabre com o último código
- [x] Exercícios de código nas lições apontam para o laboratório
- [x] Verificado no Chromium real (build de produção): solução, erro, isolamento (`origin=null`), laço infinito, TS, sintaxe, injeção em HTML, 390px sem overflow
- [x] 133 testes

## 5. Revisões e recomendação ✅ (2026-10-29)

- [x] Leitner 1/3/7/14/30 dias; erro na revisão volta para a caixa 1 (funções puras + testes)
- [x] Conceito entra em revisão no primeiro acerto; revisão com uma resposta, sem retentativa
- [x] Página de Revisões: sessão, resultado explicado ("sobe para a caixa 2: próxima revisão em 3 dias"), agenda e regras do sistema
- [x] Erros recorrentes (últimas 5 tentativas por conceito) e aproveitamento recente
- [x] Recomendação v2 com prioridades e motivo; link para a etapa exata da lição (`?step=N`)
- [x] Central de comando: painel "Revisões e pontos de atenção" (substitui itens "Planejado")
- [x] Verificado no Chromium real (build de produção): prioridade, motivo, sessão de revisão, caixa salva, link de reforço, 390px
- [x] 158 testes

## 6. XP e conquistas ✅ (2026-10-29)

- [x] XP, nível, sequência e conquistas derivados do histórico (funções puras + testes)
- [x] Migração real de schema v1 → v2 (remove `xp`/`achievements` não usados), testada em unidade e no navegador
- [x] Regras públicas: XP só na primeira conclusão, metade com solução pedida antes, revisões com XP reduzido, repetição sem XP
- [x] 10 conquistas com critérios verificáveis; nenhuma secreta ou aleatória; nunca retiradas
- [x] Sequência sem punição (vale o dia todo; maior sequência registrada)
- [x] Aviso de recompensa logo após a ação (exercício, laboratório, conclusão de lição), com o motivo
- [x] Página "Conquistas e XP" (nível, sequência, conquistas, tabela de regras, histórico) e painel "Evolução" na central
- [x] Verificado no Chromium real: migração v1→v2, +25 XP e conquistas no laboratório, nenhuma recompensa ao repetir, 390px
- [x] 176 testes

## 7. Projetos ✅ (2026-10-29)

- [x] Projeto guiado de HTML/CSS (fase 1) e projeto introdutório de JS (fase 3): briefing, problema, funcionalidades, arquitetura, restrições, acessibilidade, segurança, casos de teste, etapas, conclusão, rubrica, próximos passos
- [x] Verificação automática real (iframe isolado / worker) com mensagens que dizem o que falta
- [x] Checklist por etapa e autoavaliação por rubrica, salvos (schema v3 + migração)
- [x] Conclusão com critérios explícitos; +100 XP; conquista "Primeiro projeto concluído"
- [x] Recomendação considera projetos; fase na Academia aponta para o projeto
- [x] Soluções de referência só nos testes, provando que os testes são satisfazíveis e pegam erros típicos
- [x] Verificado no Chromium real: HTML quebrado (4 problemas identificados, `onclick` não executou), HTML correto 13/13, migração v2→v3, 390px
- [x] Corrigido: ligaduras de fonte ainda ativas no editor (D-034)
- [x] 195 testes

## 8. Missões ✅ (2026-10-29)

- [x] 3 missões: layout que quebra no celular (HTML/CSS), problema de tipagem (TS, compilação × runtime), falha de segurança (XSS armazenado, com risco e correção)
- [x] Cada missão: contexto, objetivo, requisitos, restrições, critérios de aceitação, dicas, tarefas (diagnóstico → correção), explicação final após concluir
- [x] Estado derivado das tarefas; +30 XP; conquista "Primeira missão cumprida"; recomendação considera missões
- [x] Laboratório: tarefa de missão identificada, com link de volta
- [x] Soluções oficiais validadas: TS e XSS em teste unitário; layout no Chromium real (flex e grid passam, `@media` recusado)
- [x] 207 testes

## 9. Bestiário de bugs ✅ (2026-10-29)

- [x] 6 entradas: closure com `var`, propriedade de `undefined`, `sort` que altera o original, `forEach` com `async`, signal mutado (Angular), `div` como botão (acessibilidade)
- [x] Diagnóstico antes da causa; revelação explícita opcional; filtro por tecnologia (`aria-pressed`)
- [x] Diagnósticos entram em revisão e erros recorrentes; conquista de depuração inclui o bestiário
- [x] Afirmações técnicas verificadas executando o código (Node/V8 e teste Angular real)
- [x] Corrigido: link de "praticar" para exercícios de missão/bestiário (D-038)
- [x] Verificado no Chromium real: filtro, causa oculta antes do diagnóstico, erro comum explicado, 390px
- [x] 217 testes

## 10. Biblioteca técnica ✅ (2026-10-29)

- [x] 18 entradas: conceitos, comparações (tabelas), glossário, atalhos (DevTools, VS Code), padrões e boas práticas
- [x] Busca (título, resumo e corpo; sem acento) e filtros por tecnologia, tipo e nível
- [x] Referências oficiais verificadas (27/27 HTTP 200); links internos para praticar
- [x] Bloco de tabela acessível e responsivo
- [x] Verificado no Chromium real (lista, entrada, tabela rolando no celular sem overflow)
- [x] 225 testes

## 11. Perfil de competências ✅ (2026-10-29)

- [x] Nível por evidências (4 níveis cumulativos, critérios públicos com cumprido/pendente); não sobe só por concluir conteúdo; esquecer rebaixa
- [x] Evidências, pontos de melhoria e próximas atividades por competência
- [x] Competências sem atividades publicadas tratadas com honestidade
- [x] Gráfico de atividade semanal acessível (paleta validada, leitura por teclado, tabela)
- [x] Central de comando: painel "Em breve" removido (tudo implementado); link para competências
- [x] Verificado no Chromium real: níveis, gráfico nos dois temas e no celular, foco por Tab
- [x] 238 testes

## 12. Modo foco ✅ (2026-10-29)

- [x] Escolha do tempo (15/30/45/60/sem limite), objetivo opcional (validado), temporizador opcional
- [x] Plano sugerido: revisão → conteúdo novo → prática → resumo; cada bloco com motivo; omissões explicadas; pular/concluir/reabrir livremente
- [x] Layout reduzido (sem barra lateral); atividades embutidas na sessão
- [x] Pausas (escondem a atividade; não contam tempo); tempo decorrido, sem contagem regressiva
- [x] Resumo por aprendizagem demonstrada + registro do que foi aprendido + próxima recomendação
- [x] Schema v4 (`sessions`) com migração
- [x] Suíte estável sob carga (timeout 20 s, D-044)
- [x] Verificado no Chromium real (configuração, sessão, pausa, resumo, 390px)
- [x] 251 testes

## 13. Módulo de Angular ✅ (2026-10-29)

- [x] Módulo "Componentes e signals na prática" (fase 6), pré-requisito "Do HTML aos pixels"
- [x] Lição `angular-components-01` em 10 etapas: input(), output(), signal, computed, update imutável, @for com track e @empty, OnPush
- [x] 6 exercícios (escolha, ordenação, previsão de saída) com feedback por opção
- [x] Exemplos compilados e executados no Angular do projeto + teste de deriva lição ↔ código testado
- [x] Afirmações dos exercícios verificadas por testes (track, effect, computed, input somente leitura)
- [x] Verificado no Chromium real (fase, lição, código, avaliação, 390px)
- [x] 261 testes

## 14. Qualidade final ✅ (2026-10-29)

Auditoria automatizada no build de produção, em Chromium headless (scripts fora do repositório):

- [x] Rastreador a partir de `/` seguindo todo link interno, mais as 10 etapas de cada lição: **93 páginas**, 0 links mortos, um `h1` por página, 0 erros no console
- [x] Sem rolagem horizontal em 320, 390, 768 e 1400 px em todas as páginas. **Correção (§15):** nesta rodada a medição em larguras de celular estava errada e escondeu 10 casos reais; refeita e corrigida depois (D-050)
- [x] axe-core 4.10 (WCAG 2.2 A/AA + boas práticas) em todas as páginas no tema escuro e contraste no tema claro: 0 violações (após as correções abaixo)
- [x] 14 estados interativos auditados com axe: resposta errada, dica, solução aberta, acerto com recompensa, execução no laboratório, páginas com histórico, diálogo de confirmação (modal de verdade), menu móvel, sessão de foco, pausa e resumo: 0 violações
- [x] Foco visível: cada elemento focável foi focado e conferido (campos de busca desenham o anel no contêiner, com `:focus-within`)
- [x] Correções de a11y: avisos (`callout`) viraram `role="note"` em vez de `<aside>` solto; "Solução comentada" deixou de ser uma região repetida e segue o nível de título da página; barra lateral com nome; tabelas sem cabeçalho vazio (com regra no teste de integridade)
- [x] Segurança: nenhum `innerHTML`, `eval`, `new Function`, `bypassSecurityTrust*` ou `allow-same-origin` no app; `localStorage` só no adaptador; nenhuma chamada de rede; `npm audit` sem vulnerabilidades
- [x] Importação de progresso valida cada campo de cada registro (antes só o primeiro nível): 12 arquivos malformados que eram aceitos agora são recusados com o local do erro; dados reais gerados pelo app continuam aceitos (D-047)
- [x] Prévia de HTML distingue "não iniciou" de "tempo esgotado" (antes culpava um laço inexistente no código do estudante) e não registra tentativa nesse caso (D-046)
- [x] CSP medida com o laboratório: política recomendada documentada no README (D-046)
- [x] README completo: áreas, comandos, estrutura, conteúdo, segurança, publicação, dados e acessibilidade
- [x] 275 testes, lint e build

## 15. Conteúdo mínimo do MVP ✅ (2026-10-29)

- [x] Lição `html-semantic-responsive-01` "Interface semântica e responsiva" (fase 1, módulo "Estrutura semântica e layout responsivo"): regiões, títulos, rótulos, alt, viewport, mobile first, grade fluida com `minmax(min(16rem, 100%), 1fr)`
- [x] Lição `js-dom-interactive-01` "JavaScript: de interface estática a interativa" (fase 3, módulo "Da página estática à interativa"): eventos, `preventDefault`, estado → render, delegação, `textContent` vs `innerHTML` (exemplo vulnerável com risco e correção)
- [x] 12 exercícios novos, incluindo 2 de código no laboratório (HTML semântico na prévia isolada; funções de estado no worker), com solução de referência passando e código inicial falhando, no jsdom e nos executores reais
- [x] Código das lições executado nos testes (`dom-examples.spec.ts`): o script da lista roda no jsdom, e o mesmo texto vira elemento com `innerHTML` e fica texto com `textContent`
- [x] Afirmações que dependem de layout, árvore de acessibilidade, teclado ou navegação medidas no Chromium (D-049). A medição corrigiu 2 afirmações erradas nos exercícios antes da publicação
- [x] Medição de rolagem lateral corrigida: 10 casos reais encontrados e resolvidos (D-050). Rastreador: 117 páginas, 0 violações do axe, 0 links mortos, 0 rolagem lateral de 320 a 1400 px
- [x] Testes que contavam itens do catálogo passaram a derivar do catálogo
- [x] 291 testes, lint e build

## 16. Trilha: fases 2, 4 e 5 ✅ (2026-10-29)

- [x] `css-cascade-01` "Cascata, especificidade e herança" (fase 2): critérios de desempate, especificidade em três colunas, `:where`, herança, guerra de `!important`; exercício de código sem `!important`
- [x] `js-async-01` "Assincronismo na prática" (fase 4): event loop, `async/await` com `try/catch/finally`, `fetch` e 404, `Promise.all`, corrida em buscas; exercício de código com estados de carregamento e erro
- [x] `ts-narrowing-01` "Tipos, uniões e narrowing" (fase 5): uniões discriminadas, `never`, `unknown` contra `any`, `as` contra type guard; exercício de código com type guard
- [x] Exemplos verificados pelo compilador TypeScript, por temporizadores reais, pelo jsdom e pelo Chromium (D-051)
- [x] Agora 7 das 14 fases têm conteúdo; o caminho até o Angular (fases 0 a 6) está completo
- [x] Auditoria: 153 páginas, 0 violações do axe, 0 rolagem lateral, 0 links mortos
- [x] 314 testes, lint e build

## 17. Trilha: segunda rodada ✅ (2026-10-29)

- [x] `js-closures-01` "Escopo e closures" (fase 3): escopo de bloco e de função, zona morta temporal, fábricas com estado privado, valor copiado por desestruturação; exercício de código (cofre privado e `umaVez`)
- [x] `angular-services-01` "Services, injeção de dependências e estado compartilhado" (fase 6): `providedIn: 'root'` contra `providers` no componente, `asReadonly()`, NG0203, service falso em testes
- [x] `angular-router-01` "Rotas: parâmetros, lazy loading e guards" (fase 7): parâmetro como `input()`, reaproveitamento do componente, guard com redirecionamento (e por que não é segurança), ordem das rotas, `aria-current`
- [x] Exemplos executados com o Angular e o Router do projeto, com testes de deriva (D-052)
- [x] Formulários e HTTP adiados: Signal Forms e `httpResource` são estáveis no Angular 22 e precisam ser estudados antes de virar conteúdo
- [x] Auditoria: 187 páginas, 0 violações do axe, 0 rolagem lateral, 0 links mortos
- [x] 337 testes, lint e build

## 18. Fase 7: formulários e HTTP ✅ (2026-10-30)

- [x] `angular-forms-01` "Formulários com Signal Forms": modelo em signal, validações (inclusive entre campos), erros após o toque, erros acessíveis, `submit`, `novalidate`
- [x] `angular-http-01` "Dados do servidor: httpResource e HttpClient": leitura com estados, `idle` sem URL, cancelamento, `value()` em erro, envio com HttpClient, 409 no campo, interceptor, segredos fora do frontend
- [x] APIs estudadas nos tipos e executadas antes de virar conteúdo (D-053)
- [x] Exercício corrigido: `form()` precisa de contexto de injeção

## 19. Fase 10: testes ✅ (2026-10-30)

- [x] `testing-unit-01` "Testes unitários: comportamento, casos de borda e dublês": pirâmide, preparar/agir/verificar, comportamento contra implementação, casos de borda e propriedades, `vi.fn`, tempo como parâmetro, teste que passa sem verificar, cobertura
- [x] Exercício de código em que o estudante escreve os testes, avaliados contra cinco mutantes
- [x] `testing-angular-01` "Testando aplicações Angular": TestBed pelo DOM (rótulo, papel, texto), `HttpTestingController` com `verify`, `whenStable` depois do `flush`, services falsos, ponta a ponta, acessibilidade automatizada e seus limites, integração contínua
- [x] Testes das lições executados como escritos; afirmações provadas (mutantes, zero `expect`) (D-054)
- [x] Feedback do exercício diz qual bug escapou (`expect.fail` no runner)
- [x] Auditoria: 210 páginas (completa) + 22 da fase 10, sem violações; 375 testes, lint e build

## 20. Fase 9: segurança ✅ (2026-10-30)

- [x] `security-xss-01` "XSS, sanitização do Angular e Content Security Policy" + exercício `urlSegura`
- [x] `security-session-01` "Sessões, cookies, CSRF e CORS" + exercício `revisarCookie`
- [x] `security-data-01` "Segredos, dados sensíveis e dependências" + exercício `mascararDadosSensiveis`
- [x] Comportamentos do Angular, do HttpClient, do navegador (HttpOnly, CORS, preflight) e do build medidos antes de virar conteúdo (D-055)
- [x] 393 testes, lint e build

## 21. Fase 11: performance e acessibilidade ✅ (2026-10-30)

- [x] `perf-loading-01` "Performance: Core Web Vitals, bundle e carregamento sob demanda" + exercício `debounce`
- [x] `a11y-practice-01` "Acessibilidade na prática: teclado, foco, anúncios e contraste" + exercício `razaoDeContraste`
- [x] Números medidos neste projeto (bundle, contraste dos tokens) e comportamento verificado com o Angular e no Chromium (D-056)
- [x] 403 testes, lint e build

## 22. Fase 8: arquitetura ✅ (2026-10-30)

- [x] `arch-boundaries-01` "Arquitetura: responsabilidades, fronteiras e quando não abstrair" + exercício `resumoDoPedido`
- [x] Estudo de caso com o código real da plataforma, ligado por teste de deriva aos arquivos do repositório (D-057)
- [x] Auditoria das fases 9 e 11: 57 páginas sem violações; 409 testes, lint e build

## 23. Fase 12: Git e fluxo de equipe ✅ (2026-10-30)

- [x] `tooling-git-01` "Git e fluxo de equipe: commits, pull requests, conflitos e versões" + exercício `proximaVersao`
- [x] Comportamento do git medido em repositórios descartáveis (D-058)
- [x] Fase 8 auditada: 12 páginas sem violações; 412 testes, lint e build

## 24. Fase 13: capstone ✅ (2026-10-30)

- [x] `capstone-plan-01` "Planejando o projeto final: escopo, fronteira de confiança e entregas"
- [x] Projeto guiado `project-capstone-admin` "Painel administrativo de gestão": oito etapas, checklist, rubrica, verificação automática da consulta da tabela (D-059)
- [x] Trilha: as 14 fases (0 a 13) com conteúdo, 22 lições, 3 projetos guiados
- [x] 416 testes, lint e build

## 25. Aprofundamento das fases 2, 5 e 7 ✅ (2026-10-30)

- [x] `css-layout-01` "Layout com Flexbox e Grid" + exercício de layout medido na prévia
- [x] `ts-generics-01` "Generics e utility types" + exercício `agruparPor`; tabela de erros verificada pelo compilador
- [x] `angular-rxjs-01` "RxJS no Angular: Observables, operadores e a ponte com signals"
- [x] Medições no Chromium, no compilador e com RxJS/Angular reais (D-060)
- [x] Trilha: 25 lições, 3 projetos guiados; 432 testes, lint

## 26. Aprofundamento das fases 0, 1 e 4 ✅ (2026-10-30)

- [x] `web-http-01` "HTTP: métodos, status, cabeçalhos e cache" + exercício `proximaAcao(status)`
- [x] `html-forms-01` "Formulários HTML" + exercício de cadastro nativo (estrutura e atributos testados)
- [x] `js-functional-01` "Funções de ordem superior, composição e imutabilidade" + exercício `pipe` e `memoizar`
- [x] Cache e validação medidos no Chromium; exemplos JS executados nos testes (D-061)
- [x] Trilha: 28 lições, 3 projetos guiados; 442 testes, lint

## 27. Aprofundamento das fases 8 e 12 ✅ (2026-10-30)

- [x] `arch-state-01` "Estado: onde cada dado mora" + exercício de filtros na URL (ida e volta, validação)
- [x] `tooling-ci-01` "CI/CD, configuração por ambiente e deploy" + exercício de validação da configuração pública
- [x] Componente com estado na URL executado com RouterTestingHarness; `undefined` do input medido (D-062)
- [x] Workflow e orçamentos conferidos contra `package.json` e `angular.json`
- [x] Bestiário: `bug-route-input-undefined` e `bug-number-cep`, com afirmações testadas (8 entradas)
- [x] Todas as fases de 0 a 12 com pelo menos duas lições; a 13 é o capstone. Trilha: 30 lições, 3 projetos guiados

## 28. Missões das lições novas ✅ (2026-10-30)

- [x] `mission-double-charge`: retentativa só para idempotentes e falhas passageiras, com espera crescente
- [x] `mission-checkout-form`: checkout corrigido só com HTML
- [x] `mission-dashboard-state`: painel com fonte única de verdade e cópias na leitura
- [x] As três correções verificadas nos executores reais (código inicial falha, solução passa)
- [x] Guarda: testes de exercícios só usam matchers que o executor real tem (D-063)
- [x] 6 missões, 8 entradas no Bestiário, 30 lições, 3 projetos guiados; 462 testes

## 29. Aprofundamento das fases 2, 3 e 6 ✅ (2026-10-30)

- [x] `js-types-01` "Tipos, coerção e números em JavaScript" + laboratório de dinheiro em centavos
- [x] `angular-signals-01` "Signals a fundo" + laboratório de signal e computed do zero
- [x] `css-responsive-01` "Responsividade moderna" + laboratório de container queries medido no navegador
- [x] Afirmações medidas no Node, no TestBed e no Chromium (D-064)
- [x] Trilha: 33 lições, 6 missões, 8 entradas no Bestiário, 3 projetos guiados; 480 testes

## 30. Aprofundamento das fases 4, 5 e 11 ✅ (2026-10-30)

- [x] `js-errors-01`, `ts-const-satisfies-01`, `perf-runtime-01` com exercícios e afirmações medidas (D-065)
- [x] 502 testes, lint
- [x] Laboratórios verificados nos executores reais; 36 páginas auditadas sem problemas

## 31. Aprofundamento das fases 0, 1 e 10 ✅ (2026-10-30)

- [x] `testing-async-01` "Testando código assíncrono e tempo" + laboratório de relógio falso
- [x] `html-tables-media-01` "Tabelas de dados e mídia acessível" + laboratório de relatório acessível
- [x] `web-url-01` "URLs e origens" + laboratório de classificação de links
- [x] Medido no Vitest, no Chromium e no Node (D-066); laboratórios verificados nos executores reais; 36 páginas auditadas sem problemas
- [x] Trilha: 39 lições; 518 testes

## 32. Aprofundamento das fases 8 e 12 ✅ (2026-10-30)

- [x] `arch-deps-01` "Dependências entre módulos" + laboratório de detector de ciclos e regras de camada
- [x] `tooling-lint-01` "Qualidade automatizada" + laboratório de resumo do relatório do ESLint
- [x] Teste de arquitetura deste repositório (`arch-deps.spec.ts`): sem ciclos, direção das camadas, só o modo foco importa outras features
- [x] Regras `eqeqeq`, `prefer-signals` e `button-has-type` ligadas (0 violações antes de ligar) (D-067)
- [x] Todas as fases de 0 a 12 com pelo menos três lições. Trilha: 41 lições; 529 testes

## 33. Bestiário e missão das lições recentes ✅ (2026-10-30)

- [x] Bestiário: `bug-track-index-state`, `bug-float-money`, `bug-container-no-type`, `bug-late-assertion` (12 entradas)
- [x] Missão `mission-order-import`: importação de pedidos com centavos exatos, status válidos e relatório de erros (7 missões)
- [x] Verificado no executor real e auditado (D-068); 532 testes

## 34. Aprofundamento das fases 3 e 6 ✅ (2026-10-30)

- [x] `js-collections-01` "Objetos, Map e Set" + laboratório de contatos sem duplicados
- [x] `angular-templates-01` "Templates: bindings, pipes, @let e eventos" + laboratório de tempo relativo com Intl
- [x] Medido no Node e no TestBed (D-069); laboratórios nos executores reais; 24 páginas auditadas sem problemas
- [x] Trilha: 43 lições; 548 testes

## 35. Backend local de progresso ✅ (2026-10-30)

- [x] `backend/` Spring Boot 4.1.2 + Java 21: `GET/PUT/DELETE /api/progress`, validação na fronteira, ETag/If-Match (412), só em 127.0.0.1
- [x] `HttpProgressRepository` atrás do `ProgressRepository`, opt-in com `provideHttpProgressRepository()`; proxy `/api` no `npm start`
- [x] 13 testes de backend, 9 do repositório HTTP; servidor real e proxy verificados (D-070)

## 36. Contas no backend ✅ (2026-10-30)

- [x] Cadastro, login, logout e sessão em cookie HttpOnly; CSRF para SPA; senhas com bcrypt; limite de tentativas
- [x] Progresso por conta; seção Conta em Configurações (só no modo servidor); avisos de "entre na sua conta"
- [x] Corrigido: mistura de progresso entre contas na mesma aba; CSRF chegando como 401 no servidor real; cookie XSRF ausente no primeiro GET
- [x] Classes de formulário no design system global (contraste no tema claro)
- [x] 23 testes de backend, 571 no frontend; fluxo completo no Chromium; axe sem violações (D-071)
- [ ] Planejado: HTTPS, cookie Secure e limite de tentativas compartilhado, antes de qualquer publicação
- [ ] Planejado: banco PostgreSQL e deploy

## 37. Escolher onde salvar o progresso ✅ (2026-10-31)

- [x] Seção "Onde salvar o progresso" em Configurações: navegador (padrão) ou servidor, com confirmação e recarga
- [x] Opção de servidor desabilitada, com o motivo, quando a instalação não tem o backend
- [x] `ConfirmDialog` com saída `cancelled` (botão e Escape)
- [x] Estudo de caso da lição de arquitetura atualizado ao código real
- [x] 580 testes; fluxo completo no Chromium sem editar código; axe sem violações (D-072)

## 38. Tudo num comando só ✅ (2026-10-31)

- [x] `npm run app`: build do frontend, jar do backend com o build dentro e servidor em 127.0.0.1:8080
- [x] Reescrita de SPA (links diretos e recarregamento) e `/api` sempre separado
- [x] Cache por nome de arquivo (hash: um ano, immutable; resto: no-cache), também em HEAD
- [x] 29 testes de backend, 580 no frontend; fluxo completo no Chromium no endereço único; axe sem violações (D-073)

## Limitações conhecidas

- Quem usa o tema claro vê um instante do tema escuro antes da aplicação iniciar (o tema é aplicado no bootstrap). Aceitável por ora, porque o escuro é o padrão.
- TypeScript no laboratório: tipos removidos, não verificados (D-023).
- Missão de layout aceita só layout intrínseco (sem `@media`), porque a prévia não muda a própria viewport (D-036).
- Laboratório ainda sem exercícios de JavaScript com DOM (D-022) e sem limite de memória por execução (D-021).
- O laboratório não executa Angular (D-045).
- Uma CSP que restrinja scripts quebra o laboratório; a solução é servir os executores em outra origem (D-046).
- Auditoria automatizada não substitui teste com leitor de tela real: a navegação com NVDA/VoiceOver não foi feita.
- `prefers-reduced-motion` é respeitado por uma regra global em `_base.scss`; não foi medido no navegador.
- Inline code: textos das lições citam APIs (ex.: document.querySelector) sem formatação de código. Melhoria: suportar `crases` em parágrafos.
