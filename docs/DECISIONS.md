# Decisões de arquitetura

Registro das decisões relevantes: o quê, por quê e alternativas descartadas. Mais recentes no fim.

---

## D-001 · Angular 22 (estável) com CLI padrão

- **Decisão:** Angular 22.2 (versão estável verificada com `npm view @angular/core version` em 2026-10-29), TypeScript 6.0, Node 24.
- **Por quê:** é a versão atual; standalone, signals, controle de fluxo nativo e zoneless são o padrão da CLI.
- **Configuração:** `ng new --style=scss --routing --ssr=false --zoneless`, nomes de arquivo no guia de estilo 2025 (`shell.ts`, não `shell.component.ts`).
- **Descartado:** SSR. O app é uma ferramenta de estudo com estado local, sem necessidade de SEO por página nem de servidor no MVP.

## D-002 · TypeScript e templates estritos

- `strict: true` explícito no `tsconfig.json` (no TS 6 já é padrão, mas fica documentado), além de `strictTemplates`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature` etc.

## D-003 · Testes com Vitest (padrão da CLI)

- **Decisão:** Vitest com jsdom, executado pelo builder `@angular/build:unit-test` (`ng test`).
- **Por quê:** é o runner que a CLI do Angular 22 gera por padrão. Rápido, com a mesma API do Jest e sem navegador real para testes unitários.
- **Descartado:** Karma (legado, ainda opcional na CLI) e Jest (exigiria configuração extra fora do builder oficial).
- `npm test` roda uma vez (`--watch=false`); `npm run test:watch` fica em modo observação.

## D-004 · Lint e formatação

- angular-eslint 22 (`ng add angular-eslint`) com as regras recomendadas de TS, template e **acessibilidade de template**.
- Prettier (já incluído pela CLI) para formatação; `npm run format`.

## D-005 · Ícones: `@lucide/angular`

- **Decisão:** uma única biblioteca, `@lucide/angular` 1.64 (ISC).
- **Por quê:** pacote oficial do Lucide, standalone e baseado em signals, compatível com zoneless e com Angular ≥ 17. Cada ícone é um componente importável, então só os ícones usados entram no bundle.
- **Descartado:** `lucide-angular` (pacote antigo, declara suporte só até Angular 21); `@ng-icons` (camada extra sobre várias bibliotecas, desnecessária com uma só); SVGs copiados à mão (manutenção pior).

## D-006 · Fontes do sistema

- Pilhas de fontes do sistema (`Inter` se instalada, senão `system-ui`; mono com `JetBrains Mono`/`Cascadia Code` se instaladas).
- **Por quê:** nada de serviço externo para o funcionamento básico, sem requisição a terceiros e funciona offline.

## D-007 · Design tokens em custom properties, tema escuro padrão

- Tokens em `src/styles/_tokens.scss` (cores, espaçamento, raio, tipografia, sombras, duração). Tema claro via `[data-theme='light']` no `<html>`.
- Uma cor de destaque ("forge amber", `#f5a524`), usada em ação primária, item atual e foco. Para texto sobre fundo claro usamos uma variante escura (`--color-accent-text`) para manter o contraste AA.
- Primitivas visuais (`.btn`, `.badge`, `.panel`, `.notice`, `.field`) ficam em `src/styles/_components.scss`, e não em componentes Angular: são só estilo, sem comportamento.
- `prefers-reduced-motion` zera as durações.

## D-008 · Persistência atrás de `ProgressRepository`

- `ProgressRepository` é uma classe abstrata usada como token de DI, com API **assíncrona** (`load`, `save`, `clear`), para que uma implementação HTTP (futuro Spring Boot) entre sem mudar as features.
- A implementação do MVP é `LocalStorageProgressRepository`. O único ponto que toca o `localStorage` é `KeyValueStorage`, que trata storage indisponível (modo privado, cota).
- Os dados têm `schemaVersion`. `migrateProgress()` é uma função pura que aplica as migrações em sequência (`MIGRATIONS[n]` leva de n para n+1) e valida a estrutura. Dados de versão **mais nova** são rejeitados, nunca "adivinhados".
- **Dados ilegíveis não são sobrescritos.** Se o carregamento falha, `ProgressService` entra em estado de erro e a tela de configurações explica o problema. O estudante decide: importar um arquivo ou apagar.
- Exportar e importar em JSON. A importação é validada por `parseProgressJson()` e sempre pede confirmação, porque substitui o progresso atual.
- **Descartado:** IndexedDB. Mais complexo, e o volume de dados (tentativas, revisões) cabe com folga no `localStorage`. Fica fácil trocar por trás da mesma interface.

## D-009 · Rotas: shell + lazy loading por feature

- Um componente `Shell` (sidebar, header, `<main>`) envolve todas as rotas. Cada feature tem `features/<nome>/<nome>.routes.ts` com `export default` e é carregada com `loadChildren`.
- URLs em inglês (`/academy`, `/lab`...), coerentes com a regra "código em inglês". O texto visível fica em português.
- `withComponentInputBinding()` liga parâmetros e `data` de rota a `input()`s.
- Título da página: `AppTitleStrategy` define o `document.title` ("Página · Frontend Forge") e expõe um signal para o cabeçalho.

## D-010 · Áreas não implementadas usam `PlannedPage`

- Toda área ainda não construída tem uma rota real que mostra a página "Planejado", com o que a área vai oferecer e o aviso explícito de que nada ali é simulado. A sidebar também marca esses itens como "Planejado".
- Um teste percorre todos os links da navegação e garante que nenhum cai na página 404 (sem link morto).

## D-011 · Navegação móvel com `<dialog>` nativo

- Abaixo de 1024px a sidebar vira uma gaveta em `<dialog>` modal nativo. Isso dá, sem código extra: conteúdo de fundo inerte, Esc para fechar, foco preso no diálogo e devolvido ao botão de menu ao fechar. O foco inicial vai para "Fechar menu" (`autofocus`).
- O mesmo componente `<dialog>` é usado em `ConfirmDialog` (ações destrutivas), com "Cancelar" como foco inicial.
- O "pular para o conteúdo" é um botão que foca o `<main>`. Um link `#main-content` não serve, porque com `<base href="/">` ele navegaria para a raiz.

## D-012 · Conteúdo como dados TS, com teste de integridade

- O conteúdo fica em `src/content/` como objetos TypeScript tipados pelos contratos de `core/models/` (o compilador valida a forma). `src/content/index.ts` expõe o catálogo `CONTENT`.
- `content-integrity.spec.ts` garante: ids únicos e em kebab-case, referências válidas entre fases/módulos/lições/exercícios/conceitos, cada exercício usado uma vez, toda lição com avaliação, respostas consistentes (opção correta existe, erro comum não é resposta aceita).
- O catálogo entra por um `InjectionToken` (`CONTENT_CATALOG`), para que os testes usem catálogos pequenos. O conteúdo só é importado por features lazy, então fica fora do bundle inicial.
- **Descartado:** JSON + validação em runtime. Exigiria um validador (dependência ou código extra) e perderia a checagem em tempo de compilação.

## D-013 · Avaliação de exercícios objetivos

- `core/learning/exercise-evaluation.ts` tem funções puras e determinísticas:
  - **Múltipla escolha:** certo se o conjunto marcado é igual ao correto. A nota é a interseção dividida pela união. O feedback explica **só as opções marcadas**, para não entregar a resposta.
  - **Prever a saída:** compara depois de normalizar (espaços, aspas em volta), diferenciando maiúsculas. Erros previsíveis (`commonMistakes`) recebem uma explicação específica; os demais recebem uma orientação que não revela a resposta.
  - **Ordenar etapas:** diz quantas etapas estão no lugar e explica a primeira posição errada (`why` da etapa). A ordem inicial é embaralhada de forma determinística (semente = id) e nunca começa resolvida.
  - **Código:** recusado com erro explícito até existir o executor isolado. Nada de resultado simulado.
- A solução comentada é liberada após a primeira tentativa salva ou por pedido explícito. A tentativa registra se houve pedido de solução e quantas dicas foram usadas.

## D-014 · Conclusão de lição

- Uma lição é concluída quando **todos os exercícios das etapas de avaliação** têm ao menos uma tentativa correta e o estudante confirma em "Concluir lição". Só navegar pelas etapas não conclui nada.
- A etapa atual é salva a cada mudança e a lição reabre onde parou.

## D-015 · Recomendação v1 (determinística)

- `core/learning/next-activity.ts`: (1) lição iniciada e não concluída, a mais cedo no currículo; (2) primeira lição não concluída cujos módulos pré-requisito estão completos. Toda recomendação carrega o **motivo** mostrado na tela.
- Revisão espaçada, erros recorrentes e desempenho recente entram na etapa do motor de aprendizagem.

## D-016 · Escrita de progresso serializada

- `ProgressService.update(change)` recebe uma função pura (`core/progress/progress-updates.ts`) e enfileira as escritas, então duas ações rápidas não se sobrescrevem. O estado em memória só muda depois que o repositório salvou. Se o salvamento falha, a UI mostra o erro e o estado continua o anterior.
- Enquanto existir `loadError`, `update` rejeita: o progresso ilegível nunca é sobrescrito sem decisão do estudante.

## D-017 · Locale pt-BR

- `LOCALE_ID = 'pt-BR'` com `registerLocaleData(localePt)`, para datas como "29 de outubro de 2026".

## D-018 · Estados do currículo (disponível, em andamento, concluído, bloqueado, planejado)

- `core/learning/curriculum-status.ts` (funções puras com testes) define:
  - **Módulo concluído:** todas as lições concluídas. **Em andamento:** alguma lição iniciada.
  - **Bloqueado:** algum módulo pré-requisito incompleto ou alguma fase pré-requisito não satisfeita. O estado traz os nomes do que falta (`blockers`), mostrados na tela.
  - **Fase satisfeita:** todos os módulos **publicados** concluídos. Uma fase sem conteúdo publicado não bloqueia as seguintes; sem isso, o currículo inteiro ficaria travado até tudo ser escrito.
  - **Fase planejada:** sem módulos publicados. Mostra introdução, tópicos e projeto, sem fingir que há lições.
- `nextActivity` usa a mesma regra de bloqueio (uma fonte só).
- O bloqueio é orientação de ordem de estudo: lições de módulo bloqueado aparecem sem link no mapa, mas a URL direta continua abrindo. Não há nada a proteger, é conteúdo público.

## D-019 · Fases com `projectBrief`

- O `Phase` ganhou `projectBrief` (uma frase) para o mapa mostrar o projeto de cada fase antes de a área de Projetos existir. `projectId` continua opcional e será preenchido quando o projeto guiado for publicado.

## D-020 · Busca na Academia

- Busca simples por título, resumo e tópicos, sem diferenciar maiúsculas nem acentos (`normalize('NFD')`). Campo único com `signal`, sem Reactive Forms: não é um formulário com submissão nem validação.

## D-021 · Execução isolada de JavaScript/TypeScript: Worker de URL `data:`

- Cada execução cria um **Dedicated Worker a partir de uma URL `data:`** com o código do runner (`core/lab/runner-source.ts`). Ele é destruído ao final, sempre.
- **Por quê:**
  - **Thread própria:** `terminate()` interrompe até um `while (true) {}`. O timeout é de 3 s e a UI mostra "Tempo esgotado".
  - **Origem opaca:** um worker de URL `data:` não compartilha a origem da aplicação, então não lê `localStorage`, IndexedDB, cookies nem caches do app. Verificado no Chromium real: `self.origin === "null"`.
  - **Defesa em profundidade:** o runner remove `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `importScripts`, `indexedDB`, `caches` e o próprio `postMessage` antes de rodar o código do estudante, para que ele não forje o resultado.
- A comunicação é só por `postMessage`. A resposta é validada por `parseRunnerMessage` (forma, `runId` aleatório da execução, limite de 200 logs e 2.000 caracteres por texto); qualquer outra mensagem é ignorada.
- Os testes rodam cada um num escopo novo, junto com o código do estudante, e verificam o **comportamento** (`expect(...).toBe/toEqual/...`).
- `new Function`/`AsyncFunction` existem apenas dentro do worker e do iframe isolado, nunca no contexto da aplicação.
- **Descartado:**
  - Worker same-origin: teria acesso a IndexedDB e `fetch` com cookies do app.
  - Iframe sandbox para JS: um laço infinito pode travar a aba se o iframe ficar no mesmo processo.
  - Executor remoto: dependeria de serviço externo.
- **Limites:** não há limite de memória por worker (o navegador não oferece). Um laço que aloca muito pode pesar até o timeout.

## D-022 · Prévia de HTML/CSS: iframe `sandbox="allow-scripts"` + CSP com nonce

- O documento é montado por `buildPreviewDocument`, atribuído em `iframe.srcdoc` pelo código: o binding do Angular sanitizaria o `srcdoc` e removeria o runner.
- **Nunca** `allow-same-origin`. O documento tem origem opaca, e a aplicação não acessa o `contentDocument` dele, nem ele a aplicação (verificado).
- CSP do documento: `default-src 'none'` (sem rede), `style-src 'unsafe-inline'`, `img-src data:`, `script-src 'nonce-…' 'unsafe-eval'`. Só o runner (nonce aleatório por execução) executa. `<script>` e handlers como `onerror` do estudante são bloqueados (verificado: nenhum `alert`, título do app intacto).
- O runner fica no `<head>`, antes do HTML do estudante, para que tags ou comentários não fechados não o "engulam". O pai só aceita mensagens com `event.source` igual ao iframe, `origin === "null"` e o `runId` esperado.
- Exercícios de JavaScript com DOM ficam para depois. Exigem permitir scripts do estudante na prévia, e o risco de travamento descrito em D-021 precisa de solução antes.

## D-023 · Transpilação de TypeScript com `sucrase` em worker

- **Dependência nova:** `sucrase` 3.35 (MIT). Remove tipos de TS rapidamente e entra só no chunk do worker de transpilação (~200 kB, carregado no primeiro exercício de TS).
- **Descartado:** o compilador `typescript` (vários MB no navegador) e `esbuild-wasm` (WASM + download maior).
- **Limite assumido:** os tipos são removidos, não verificados. Os exercícios de TS avaliam comportamento, e a UI explica isso ao estudante. Verificação de tipos no navegador fica para avaliação futura.
- O worker de transpilação é same-origin (módulo do build), mas só transforma texto e **nunca** executa o código do estudante.
- Erros de sintaxe contam como tentativa do estudante. Falha ou timeout do transpilador (`unavailable`) **não** contam: não é erro de quem estuda.

## D-024 · Verificação em navegador real via CDP

- Além dos testes em jsdom, o Laboratório é verificado no Chromium headless pelo DevTools Protocol, com um script Node sem dependências (`WebSocket` nativo do Node). O script roda solução certa, errada, sonda de isolamento, laço infinito, TS, erro de sintaxe, HTML com tentativas de injeção e ausência de overflow em 390px.
- Os scripts ficam fora do repositório. Promover para testes e2e versionados (ex.: Playwright) é uma melhoria futura com dependência justificada.

## D-025 · Fonte de código sem ligaduras

- `font-variant-ligatures: none` em código. Ligaduras exibem `=>` como `⇒` e `===` como `≡`, o que confunde quem precisa digitar os caracteres reais.

## D-026 · Revisão espaçada (Leitner)

- `core/learning/spaced-repetition.ts` (funções puras, testadas):
  - Caixas 1 a 5 com intervalos de **1, 3, 7, 14 e 30 dias**.
  - Acertou a revisão: sobe uma caixa (até a 5). Errou: volta para a caixa 1, com revisão no dia seguinte.
  - Datas em **dia local** (`YYYY-MM-DD`): "vence hoje" segue o calendário do estudante, não o UTC.
- **Quando um conceito entra em revisão:** no primeiro acerto de um exercício que o cobre. Só entram conceitos que têm **exercício objetivo** para revisar; conceitos só de laboratório ficam de fora por enquanto, porque a revisão precisa de uma pergunta rápida.
- **Tentativa de revisão:** `activityType: 'review'`, `activityId` = conceito, e `answer.exerciseId` registra a pergunta usada. Na revisão vale só a primeira resposta (sem "tentar de novo"), senão daria para subir de caixa repetindo.
- A pergunta usada para revisar um conceito alterna entre os exercícios objetivos dele, com base no número de revisões já feitas.
- A sessão de revisão fixa a fila ao abrir a página, para que ela não mude enquanto o estudante responde.
- O schema do progresso não mudou: `reviews` e `ReviewCard` já existiam desde a v1.

## D-027 · Erros recorrentes e desempenho recente

- `core/learning/performance.ts`: por conceito, consideram-se as **últimas 5 tentativas** (exercícios e revisões). Há "erro recorrente" com **≥ 2 erros que somem ≥ metade** dessas tentativas. Acertos posteriores tiram o conceito da lista naturalmente.
- Aproveitamento recente = acertos nas últimas 10 tentativas.

## D-028 · Recomendação v2

- Ordem de prioridade (`core/learning/next-activity.ts`), sempre com o motivo mostrado na tela:
  1. Revisão vencida (a mais atrasada primeiro).
  2. Erro recorrente: o exercício mais fácil do conceito, priorizando os não resolvidos, com link direto para a etapa da lição (`?step=N`) ou para o laboratório.
  3. Lição em andamento.
  4. Próxima lição disponível (pré-requisitos).
  5. Exercício do laboratório não resolvido, do mais fácil ao mais difícil. Com aproveitamento recente abaixo de 50%, a mensagem diz isso e recomenda reler as soluções antes de um exercício mais difícil.
- **Por que revisão antes de conteúdo novo:** a revisão vencida perde efeito quanto mais atrasa, e leva poucos minutos.

## D-029 · XP, nível, sequência e conquistas derivados do histórico (schema v2)

- **Decisão:** nada disso é armazenado. Tudo é calculado de forma pura a partir de `attempts` (só cresce), `completions`, `reviews` e `studyDays` (`core/gamification/`).
- **Por quê:**
  - "XP só na primeira conclusão" vira consequência da regra de cálculo, não de um contador que pode dessincronizar.
  - Uma conquista desbloqueada nunca some, porque o histórico só cresce.
  - Perder a sequência não tira nada: o XP não depende da sequência e a maior sequência continua registrada.
  - O progresso importado de outro navegador recalcula tudo corretamente.
- **Migração v1 → v2:** remove `xp` e `achievements` do `Progress`. Nenhuma versão escreveu nesses campos, então nada se perde. Foi testado com dados v1 reais no navegador: carrega sem erro e é salvo como v2 na próxima ação.
- **Custo assumido:** mudar uma regra de XP recalcula o histórico inteiro. Isso é aceitável enquanto as regras são públicas e explicadas na tela.
- **Descartado:** um registro de XP gravado a cada evento. Exige idempotência manual, pode divergir do histórico e complica a importação.

## D-030 · Regras de XP e níveis

- Exercício resolvido pela primeira vez: objetivo 10/20/30 e laboratório 25/40/60 (introdutório/intermediário/avançado). Se a solução foi **pedida antes de tentar**, vale metade.
  - Abrir a solução depois de errar não pode ser detectado com confiança, então não afeta nada.
- Lição concluída: 50. Revisão: 5 se acertar, 2 se errar (revisar também é treino). Repetir algo já resolvido: 0.
- Nível _n_ exige 50·(n−1)·n XP (0, 100, 300, 600, 1000…). A tela diz explicitamente que nível é indicador de dedicação, **não** certificado de competência.

## D-031 · Conquistas com critérios verificáveis

- Todas as conquistas e critérios são públicos (`src/content/achievements.ts`), com uma regra pura por conquista (`achievement-rules.ts`); um teste garante que cada conquista tem regra. Não há conquistas secretas, sorteio nem recompensa aleatória.
- Só entram critérios que o histórico consegue **provar**. "Sem consultar a solução" virou "De primeira": passar na primeira execução sem ter pedido a solução, porque depois do primeiro erro a solução fica liberada e não sabemos se foi aberta.
- Conquistas que dependem de áreas ainda não construídas (projeto concluído, API consumida etc.) entram junto com essas áreas.

## D-032 · Sequência sem punição

- A sequência conta dias consecutivos com atividade e continua viva durante todo o dia de hoje, sem "zerar à meia-noite". Interromper a sequência não tira XP nem conquistas, e a maior sequência fica registrada. Não há contagem regressiva, alerta ou notificação de pressão.

## D-033 · Projetos: verificação automática real + autoavaliação declarada

- O projeto é construído na máquina do estudante, então a plataforma não "vê" tudo. A avaliação foi dividida explicitamente:
  - **Verificação automática (real):** o estudante cola o código e ele roda nos mesmos ambientes isolados do Laboratório (D-021, D-022).
    - HTML/CSS: estrutura, `lang`, landmarks, hierarquia de títulos, rótulos, `alt`, `rel="noopener"`, ausência de handlers inline e `@media`.
    - JS: a lógica pura da lista de tarefas, incluindo imutabilidade e ids únicos após remoção.
  - **Autoavaliação (rotulada como tal):** checklist por etapa e rubrica transparente, com um nível por critério. Contraste real, navegação por teclado, qualidade visual e a parte de DOM do projeto JS não podem ser verificados automaticamente, e a interface diz isso.
- **Conclusão:** última verificação passando + checklist completo + rubrica preenchida. A rubrica não vale XP nem bloqueia por nível baixo: ela serve para o estudante ver onde melhorar.
- **Nenhum código pronto:** as etapas orientam sem entregar a solução. As soluções de referência ficam só nos testes (`src/content/project-solutions.spec.ts`), fora do conteúdo publicado. Elas provam que os testes podem ser satisfeitos e que erros típicos são pegos.
- Os testes de projeto informam **o que falta** (`Esperado [], recebido ["https://example.com"]`), em vez de só "true/false".
- Os testes de HTML recebem também o **texto original** (`source`), para verificar o que o documento-invólucro da prévia esconderia (`<html lang>`, doctype, handlers inline).
- **Schema v3:** novo `progress.projects` (checklist marcado, autoavaliação, data de conclusão), com migração v2 → v3 testada em unidade e no navegador.
- **XP e conquista:** projeto concluído vale 100 XP; nova conquista "Primeiro projeto concluído".
- **Recomendação:** projeto em andamento (depois das lições) mostra o que falta; projeto não iniciado aparece depois do laboratório.

## D-034 · Correção da D-025 (ligaduras)

- A regra que desligava ligaduras em `textarea` era anulada pelo `font: inherit` dos controles de formulário, declarado depois no mesmo arquivo: o shorthand reinicia `font-variant-ligatures`. A regra agora fica no fim de `_base.scss`, e o estilo computado foi conferido no navegador (`none`).

## D-035 · Missões derivadas das tarefas

- Uma missão é um cenário (contexto, objetivo, requisitos funcionais, restrições técnicas, critérios de aceitação, dicas e explicação final) composto de **tarefas que são exercícios** já existentes. O padrão é diagnosticar (questão objetiva) e depois corrigir (código no ambiente isolado).
- **Estado derivado, sem schema novo:** a missão está cumprida quando todas as tarefas têm acerto. A data de conclusão é a da última tarefa resolvida (`core/progress/mission-status.ts`). A explicação final só aparece então ("explicação posterior"), mas cada tarefa continua explicando o porquê e liberando a própria solução após a primeira tentativa.
- Tarefas objetivas são respondidas na página da missão. Tarefas de código abrem no Laboratório, que mostra o link "Voltar à missão" e marca o exercício como tarefa da missão na lista.
- Um exercício não pode estar em duas lições ou missões (teste de integridade), porque o progresso salvo é por exercício.
- **XP:** 30 de bônus por missão cumprida, além do XP das tarefas. **Conquista:** "Primeira missão cumprida".
- **Recomendação:** missão em andamento depois de projeto em andamento; missão nova depois dos exercícios avulsos do laboratório. Tarefas de missão não são recomendadas como exercício avulso.

## D-036 · Missão de layout: intrínseco e medido pelo contêiner

- A prévia não consegue mudar a própria viewport, então uma solução com `@media` dependeria do tamanho da janela do estudante. Os testes medem o layout definindo a largura do `body` (360px e 1000px), e a missão pede layout **intrínseco** (`flex-wrap`/`flex-basis`, `grid` com `auto-fit`/`minmax`), declarado como restrição técnica e verificado por um teste.
- Esses testes dependem de layout real, que o jsdom não tem. Por isso ficam fora da verificação de soluções em jsdom e foram verificados no Chromium real: o código inicial falha, as duas soluções oficiais (flex e grid) passam e a solução com `@media` é recusada com explicação.

## D-037 · Bestiário: diagnosticar antes de revelar

- Cada entrada tem sintoma, código problemático, como reproduzir, como investigar, um **desafio de diagnóstico** (exercício objetivo), causa real, correção e prevenção.
- A causa, a correção e a prevenção ficam ocultas até a primeira tentativa de diagnóstico, certa ou errada (salva no progresso), ou até um pedido explícito ("Ver a causa sem diagnosticar"). O pedido vale só para a visita e não é registrado como tentativa. É a mesma regra das soluções comentadas.
- Os diagnósticos são exercícios objetivos: entram na revisão espaçada e nos erros recorrentes como qualquer exercício. A conquista "Primeiro bug diagnosticado" passou a contar também o bestiário.
- **Afirmações técnicas verificadas por execução**, não por memória:
  - os trechos JavaScript foram executados no Node (V8): saída `3 3 3`, mensagem exata do `TypeError`, `sort` alterando o original, `forEach` + `async` imprimindo 0 e depois 30;
  - o comportamento do signal mutado é provado por um teste Angular de verdade (`src/content/bug-claims.spec.ts`), com a mesma versão e configuração zoneless do app.
  - A execução revelou uma variação real que entrou no conteúdo: `total += await …` dentro de `forEach` resulta em 10, não 30 (condição de corrida).

## D-038 · Localização de exercícios para "praticar"

- Correção de um bug latente: a recomendação de reforço só conhecia lição e laboratório. Uma questão objetiva de missão seria enviada para `/lab/<id>`, que não exibe exercícios objetivos. Agora `locate` distingue lição (com etapa), missão, bestiário e laboratório (apenas código), com testes.

## D-039 · Biblioteca técnica

- Entradas tipadas (`LibraryEntry`, em `src/content/library.ts`) de seis tipos: conceito, comparação, glossário, atalhos, padrão e boa prática. Cada entrada tem tecnologia, nível, resumo, corpo em blocos, referências oficiais e links internos para onde praticar (lição, laboratório, missão, bestiário, projeto).
- Novo bloco de conteúdo `table` (com `caption`, `th scope="col"` e `th scope="row"`), usado em comparações e atalhos. No celular, a tabela rola dentro da própria caixa (focável pelo teclado) e não gera rolagem na página. Diagramas são blocos de texto pré-formatado, legíveis por qualquer leitor.
- Busca sem distinção de maiúsculas e acentos, em título, resumo **e corpo**, exigindo todas as palavras e priorizando acertos no título. Filtros por tecnologia, tipo e nível em `<select>` nativos com rótulo. Lógica pura e testada (`library-search.ts`). A normalização foi extraída para `shared/search.ts` e é reaproveitada pela Academia.

## D-040 · Referências verificadas

- Toda URL de referência foi verificada com uma requisição real (HTTP 200 no endereço final) antes de entrar no conteúdo, e conferida de novo depois de escrita: 27 de 27. Endereços inexistentes em pt-BR (comuns no MDN após a reorganização de 2025) usam a versão em inglês, marcada na tela como "em inglês".
- Um teste de integridade exige referências HTTPS de domínios oficiais (MDN, angular.dev, typescriptlang.org, W3C, Chrome DevTools, VS Code, OWASP, RxJS) e links internos existentes. A disponibilidade online não é testada no `npm test`, para que a suíte não dependa de rede: a verificação é repetida ao editar o conteúdo.
- Exemplos de código com saída citada (ordem do event loop) foram executados para confirmar o resultado.
- Links externos abrem em nova aba com `rel="noopener noreferrer"` e aviso para leitores de tela.

## D-041 · Competências: nível por evidências, com critérios públicos

- `core/learning/competency.ts` (função pura, testada) estima o nível de cada competência a partir dos conceitos de cada exercício:
  - **1 · Iniciando:** acertou ao menos 1 exercício.
  - **2 · Praticando:** resolveu `min(3, disponíveis)` exercícios e ao menos 1 de forma **independente** (primeiro acerto sem dicas e sem pedir a solução).
  - **3 · Consolidando:** um conceito na caixa ≥ 3 da revisão espaçada e ≥ 70% de acerto nas últimas 10 tentativas da competência.
  - **4 · Aplicando:** competência usada em projeto ou missão concluídos.
  - Os níveis são cumulativos. Todos os critérios aparecem na tela com cumprido/pendente.
- **Concluir conteúdo, sozinho, não sobe de nível.** Muitos exercícios param no nível 2, e esquecer um conceito numa revisão rebaixa o nível, porque a caixa considerada é a atual. Nenhum nível se chama "avançado", e a tela diz que é estimativa, não certificado.
- Competências sem exercícios publicados aparecem separadas, como "sem como estimar", e não como nível 0 enganoso.
- Cada competência mostra evidências (resolvidos, independentes, avaliações, acerto recente, maior caixa, última atividade, onde foi aplicada), pontos de melhoria (erros recorrentes, revisões vencidas) e até 3 próximas atividades com link direto.

## D-042 · Gráfico de atividade semanal

- Barras empilhadas de respostas certas e erradas nas últimas 6 semanas (semana começando na segunda, em horário local), seguindo o procedimento da skill de visualização de dados:
  - **Cores:** não usam verde/vermelho, que é o problema clássico de daltonismo e também as cores reservadas a status. Usam as posições 1–2 (azul e laranja) de uma paleta categórica validada pelo script da skill **nas nossas superfícies, nos dois temas** (separação CVD ΔE ≥ 24, contraste ≥ 3:1). Viraram tokens `--chart-series-*`.
  - **Marcas e legenda:** separação de 2px entre segmentos, só o topo arredondado, eixo e grade discretos, legenda e apenas o total como rótulo direto.
  - **Interação e acessibilidade:** leitura dos números ao passar o mouse **e ao focar com Tab** (verificado com tecla real no Chromium) e tabela de dados equivalente.
- Ao olhar a renderização, apareceu um problema que os testes não pegariam: o `viewBox` fixo escalava o texto (enorme no desktop, ilegível no celular). Agora o `viewBox` acompanha a largura real (ResizeObserver, 1 unidade = 1px) e o texto fica em 11px.

## D-043 · Modo foco

- **Layout reduzido:** `/focus` fica fora do shell (sem barra lateral), com uma barra mínima e "Sair do modo foco". As atividades rodam **dentro da sessão**, reaproveitando os componentes existentes: lição, revisão, exercício objetivo e exercício do laboratório. É a única feature que importa componentes de outras, porque ela orquestra as demais.
- **Plano sugerido, nunca imposto** (`core/learning/session-plan.ts`, função pura): revisão rápida (conceitos vencidos, ~2 min cada, até 10) → conteúdo novo (lição em andamento ou próxima; "avance até onde der" quando não cabe inteira) → prática (erro recorrente ou exercício pendente fora das lições) → resumo. Cada bloco diz por que está no plano; o que não coube aparece com o motivo. Qualquer bloco pode ser concluído, pulado ou reaberto, em qualquer ordem. A seleção de lição e de prática foi extraída da recomendação (`lessonToStudy`, `practiceExercise`), para não duplicar regra.
- **Tempo disponível** escolhido pelo estudante (15/30/45/60 min ou sem limite) num formulário reativo tipado, com validação do objetivo associada ao campo.
- **Temporizador sem pressão:** desligado por padrão; mostra tempo **decorrido** (não regressivo) e pode ser pausado. Ao passar do planejado, um aviso calmo sugere o resumo sem obrigar nada. A pausa esconde a atividade, e o tempo pausado não conta.
- **Resumo por aprendizagem demonstrada**, derivado do histórico na janela da sessão: exercícios resolvidos pela primeira vez, acertos/erros, conceitos revisados com acerto, lições concluídas, XP e conquistas. O tempo aparece como informação secundária. Sem prática registrada, a tela diz isso com honestidade. O estudante registra o que aprendeu (texto salvo na sessão), e a próxima recomendação aparece em seguida.
- **Schema v4:** `progress.sessions` (com migração v3 → v4). Só uma sessão ativa por vez; a sessão sobrevive a navegação e recarga.

## D-044 · Timeout dos testes

- Sob carga, testes de integração (que renderizam páginas inteiras) estouravam o timeout padrão de 5 s, com falhas sem relação com o código. `vitest.config.ts` (via `runnerConfig` do builder) sobe o limite para 20 s. Verificado rodando a suíte inteira com a CPU saturada artificialmente (load average 9,4): 251/251.
- Com o modo foco pronto, nenhuma área está mais "Planejada"; o componente `PlannedPage` (sem uso) foi removido.

## D-045 · Módulo de Angular: exemplos executados, não só exibidos

- Módulo "Componentes e signals na prática" (fase 6) com a lição `angular-components-01` (10 etapas) e 6 exercícios objetivos. Depende do módulo "Do HTML aos pixels", porque o template é DOM.
- **Todo código Angular da lição é compilado e executado pelos testes** (`src/content/angular-examples.spec.ts`) com a mesma versão do Angular do projeto: os componentes `TarefaItem` e `ListaTarefas` são renderizados, clicados e conferidos. Um teste de deriva garante que o código exibido na lição contém as mesmas APIs que o código testado. Se uma API mudar numa atualização do Angular, o teste falha antes de o conteúdo ficar desatualizado (regra 7).
- **Afirmações dos exercícios viram testes**: `computed` recalcula após `update`; mutar um item não atualiza `computed`; `input()` não tem `set`; `track` por referência recria o elemento de um item recriado e `track` por id o mantém; escrever em signal dentro de `effect` é permitido, mas o valor fica desatualizado até o effect rodar. O código dos exercícios é exportado e conferido pelo mesmo spec.
- **Descartado**: executar Angular no laboratório. Exigiria compilar templates no navegador do estudante (compilador JIT dentro do sandbox, várias centenas de kB). Os exercícios desta lição são objetivos e a experimentação é feita localmente com a Angular CLI, como a lição explica. Executar Angular no laboratório fica para depois do MVP.
- Testes que presumiam uma única lição publicada passaram a concluir todas as lições do catálogo.

## D-046 · CSP e o laboratório

- **Medido** no build de produção servido com cabeçalhos: uma CSP que restringe scripts (`script-src 'self'`, `worker-src 'self'`) mantém o app funcionando, mas quebra os dois executores, porque a prévia (`srcdoc`) e o worker (`data:`) herdam a política da página e o executor precisa avaliar código. Também bloqueia o script inline do build que troca o `media` do CSS (o `<link>` de reserva cobre).
- **Decisão:** não embutir CSP no MVP. Recomendar, no README, cabeçalhos que não restringem scripts e foram testados com o laboratório funcionando: `object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`, mais `X-Content-Type-Options: nosniff` e `Referrer-Policy: no-referrer`. `base-uri` precisa ser `'self'`: com `'none'`, o `<base href="/">` é bloqueado e toda rota profunda carrega em branco (também medido).
- **Descartado por ora:** CSP estrita com hashes do executor e `'unsafe-eval'` (frágil: o hash muda a cada mudança no executor, e `'unsafe-eval'` vale para o app inteiro). O caminho certo é servir os executores em uma origem separada (como fazem CodePen e similares) e então aplicar CSP estrita no app.
- **Correção encontrada pela medição:** a prévia de HTML não distinguia "o executor não iniciou" de "tempo esgotado" e mostrava "procure um laço que nunca termina", embora os scripts do estudante nunca rodem na prévia. Agora o executor envia `ready` ao iniciar; sem `ready`, o resultado é `unavailable` (sem registrar tentativa, como no worker).

## D-047 · Validação profunda do progresso importado

- O arquivo de progresso circula entre pessoas e navegadores, então é dado não confiável. Antes só o primeiro nível era verificado: uma sessão com `blocks: []`, uma tentativa com data inválida ou uma caixa de Leitner 9 eram aceitas, salvas e quebravam as páginas que as leem em toda visita.
- Agora cada campo de cada registro é conferido contra o modelo (`progress-schema.ts`), e a mensagem aponta o local (`attempts[3].submittedAt`, até 5 locais). O teste garante que um progresso real, produzido pelas funções de atualização do próprio app, continua aceito.
- Descartado: biblioteca de validação (zod etc.). São ~150 linhas sem dependência nova, e o modelo é pequeno.

## D-048 · Correções de acessibilidade da auditoria

- Avisos do conteúdo (`callout`) eram `<aside>` dentro do conteúdo, criando regiões complementares soltas e sem nome. Viraram `role="note"`.
- "Solução comentada" era uma `<section>` nomeada: uma página com três exercícios tinha três regiões com o mesmo nome. Virou um bloco comum, com título no nível da página (`h2` no laboratório, `h4` dentro de exercícios).
- A barra lateral continua `<aside>`, agora com nome ("Barra lateral"). Trocá-la por `div` deixou a marca fora de qualquer região (o axe apontou na segunda rodada).
- Cabeçalho de tabela vazio é proibido pelo teste de integridade do conteúdo.

## D-049 · Lições de HTML semântico/responsivo e de JavaScript com DOM

- Duas lições completas (10 etapas cada), fechando o conteúdo mínimo do MVP. Cada uma em um módulo próprio: "Estrutura semântica e layout responsivo" (fase 1, depende de "Do HTML aos pixels") e "Da página estática à interativa" (fase 3, depende do módulo semântico).
- **O laboratório não executa scripts do estudante com DOM** (D-022). Por isso o exercício de código da lição de JavaScript cobre as **funções de estado** (puras, executadas no worker), e a parte de DOM é praticada localmente e avaliada por exercícios objetivos. A lição explica isso ao estudante. Separar estado e interface é, de qualquer forma, o que a lição ensina.
- **Verificação em três camadas:**
  - Testes (jsdom, `dom-examples.spec.ts`): o script da lista de compras exibido na lição é executado (envio com `preventDefault`, remoção por delegação, foco, item vazio); o mesmo texto malicioso vira `<img>` com `onerror` usando `innerHTML` e fica texto com `textContent`; `event.target` é o `<span>` interno; ouvintes registrados com a lista vazia nunca alcançam botões novos; a página de exemplo segue as próprias regras (regiões, um `h1`, títulos sem pular nível, rótulos, `alt`). O código de estado da lição passa nos testes do exercício do laboratório.
  - Chromium real (fora do repositório): colunas da grade de exemplo (1/2/3/4 em 320/700/1100/1400 px) e cabeçalho em linha a partir de 48rem; sem `min()`, 240px vaza e com `min()` não; media queries do exercício (1 coluna até 639px, 2 de 640 a 1023, 3 a partir de 1024); papéis na árvore de acessibilidade (`header` da página = banner, `section` sem nome = genérico, `article` não é região, placeholder vira nome do campo como último recurso); `div[tabindex]` não responde a Enter/Espaço e `div[role=button]` fica fora do Tab; `innerHTML` executa o `onerror`; sem `preventDefault` a página recarrega.
  - Executores reais: solução de referência passa e código inicial falha nos dois exercícios de código.
- **Erros que a medição corrigiu antes da publicação:** (1) sem `preventDefault`, o endereço fica `?item=` e não `?item=Leite`, porque o ouvinte limpa o campo antes de o navegador montar o envio; (2) `width: 90vw` com padding e a margem da página também vaza em 320px, ao contrário do que a opção dizia.

## D-050 · Medição de rolagem lateral e `overflow-wrap: anywhere`

- **Erro de medição:** as auditorias anteriores compararam `scrollWidth` com `innerWidth`. Na emulação de celular do Chromium, `innerWidth` cresce para caber o conteúdo largo, então a comparação nunca acusava nada abaixo de 800px. O relatório "0 rolagem lateral de 320 a 1400 px" da qualidade final estava errado para celular. A medição agora compara com a largura emulada.
- **Causas reais** (encontradas escondendo elementos um a um até a rolagem sumir; a primeira hipótese, blocos de código, foi testada e descartada):
  - Opções de exercício com trechos de código sem espaço (`event.target.closest('button[data-id]').dataset.id`). Com `overflow-wrap: normal`, uma "palavra" assim define a largura mínima de toda a coluna. Correção global: `overflow-wrap: anywhere` no `body`, que, ao contrário de `break-word`, também reduz a largura mínima. Tabelas voltam a `normal`, porque já rolam dentro do contêiner.
  - O `<input type="file">` de Configurações, com largura intrínseca grande. Com `width: 100%` ele deixa de impor largura mínima.
- Resultado: 117 páginas sem rolagem lateral em 320, 390, 768 e 1400 px, com a medição corrigida.

## D-051 · Lições de CSS (cascata), JavaScript assíncrono e TypeScript

- Três lições que preenchem as fases vazias no caminho até o Angular: `css-cascade-01` (fase 2), `js-async-01` (fase 4) e `ts-narrowing-01` (fase 5), cada uma no seu módulo, com 6 exercícios (um de código cada; o de TypeScript também reaproveita `lab-ts-order-status`).
- **Efeito nos pré-requisitos:** a fase 6 (Angular) depende das fases 2 e 5. Com conteúdo publicado nelas, o módulo de Angular passa a aparecer bloqueado até essas lições serem concluídas, com o motivo na tela (regra de D-018 em `curriculum-status.ts`, inalterada). O bloqueio orienta a ordem; a lição continua acessível pelo endereço.
- **O compilador TypeScript nos testes** (`ts-examples.spec.ts`): os exemplos da lição passam por `ts.createProgram` em modo strict. O que a lição diz que compila tem 0 diagnósticos; o que diz que falha gera o código de erro esperado (2339 sem narrowing, 2322 no `never` quando um status é esquecido), na linha esperada. Como os mesmos testes exigem erros, um compilador que não verificasse nada falharia.
- **Assincronismo com temporizadores reais** (`css-async-examples.spec.ts`): ordem do event loop, estados de carregamento e erro, corrida da busca (a resposta lenta de "ca" vence sem a correção e é descartada com ela) e `finally`. Sequência contra paralelo é medida pelo momento em que cada chamada **começa**, não pelo tempo total, para não depender da carga da máquina.
- **Fora dos testes:** cores calculadas no Chromium real (inclusive `:where(#menu) a` e o `<button>` que só herda a fonte com `font: inherit`); `fetch` real no Node contra um servidor que devolve 404 (resolve com `ok: false`), contra uma porta fechada (rejeita) e abortado (rejeita com `AbortError`); os três exercícios de código nos executores reais.
- O id `css-cascade` foi usado primeiro para o conceito e para o módulo; o teste de integridade recusou (ids são únicos no catálogo) e o módulo virou `css-cascade-specificity` antes de qualquer progresso depender dele.
- A lição de CSS mencionava a dica de especificidade do DevTools; como não dá para medir em modo headless, o texto diz "nas versões recentes do Chrome e do Edge" e pede que o estudante confira a própria conta.

## D-052 · Segunda rodada da trilha: closures, services e Router

- **Aprofundar antes de avançar:** a fase 7 depende de conceitos que a fase 6 não ensinava. Entraram `js-closures-01` (fase 3, segundo módulo), `angular-services-01` (fase 6, segundo módulo) e `angular-router-01` (primeira lição da fase 7).
- **Fase 7 começa pelo Router, não por formulários ou HTTP.** No Angular 22.2.4 instalado, Signal Forms (`form()` de `@angular/forms/signals`) e `httpResource` estão marcados `@publicApi 22.0`, ou seja, estáveis. Uma lição de formulários ou HTTP que ensinasse só Reactive Forms e HttpClient nasceria desatualizada (regra 7). Essas lições ficam para quando as APIs novas tiverem sido estudadas nos tipos e testadas no projeto. O app em si continua com Reactive Forms tipados, como o CLAUDE.md pede.
- **Verificação:**
  - `closures-examples.spec.ts`: os exemplos rodam e imprimem o que a lição diz (2 11, tchau, 3,3,3 0,1,2, escuro claro, ReferenceError na zona morta).
  - `angular-services.spec.ts`: service e componentes da lição compilados e executados; o resumo distante mostra "R$ 25,00" após os cliques; `providers` no componente isola a instância; `inject()` fora de contexto lança NG0203; `asReadonly()` não tem `set`; o service é substituível por um falso; teste de deriva.
  - `angular-router.spec.ts`: `:id` chega como `input()`; trocar só o parâmetro reaproveita a mesma instância e a versão com `input()` acompanha, enquanto a versão com `snapshot` continua no produto antigo; o guard redireciona para `/login` e libera a área lazy com sessão; `**` primeiro engole tudo; `ariaCurrentWhenActive` marca a página atual; teste de deriva.
  - Chromium: o rótulo de `[[Scopes]]` no DevTools para a variável da closure foi medido pelo protocolo. Com parâmetro com valor padrão (como em `criarContador`), o V8 rotula o escopo como **Block**, não Closure; a instrução do experimento, que dizia "Closure", foi corrigida.
- `angular-routing` seria id de conceito e de módulo ao mesmo tempo (o erro da rodada anterior); o módulo virou `angular-routes-navigation` antes de rodar os testes.
- O teste da Academia que usava a fase 7 como exemplo de "fase planejada" passou a escolher a primeira fase sem módulos do catálogo.

## D-053 · Formulários e HTTP na fase 7: estudar a API antes de ensinar

- **Escolha das APIs:** no Angular 22.2.4, Signal Forms (`@angular/forms/signals`) e `httpResource` são `@publicApi 22.0`. As lições ensinam essas APIs como caminho atual e citam Reactive Forms e HttpClient com Observables como comuns em projetos existentes. O app continua com Reactive Forms tipados, como o CLAUDE.md pede.
- **Método:** antes de escrever, as APIs foram lidas nos `.d.ts` instalados e executadas em testes provisórios (apagados depois). A recomendação de não usar `httpResource` em mutações, o cancelamento da requisição pendente e o `value()` que lança em erro foram conferidos no guia oficial (angular.dev/guide/http/http-resource).
- **O que a medição revelou e virou conteúdo:**
  - Erros de validação existem desde o início; a lição ensina mostrar só depois de `touched()`.
  - `[formField]` coloca `required` no input, mas **não** `aria-invalid`, não liga a mensagem e não põe classes: a lição ensina `[attr.aria-invalid]` e `[attr.aria-describedby]`.
  - `email` e `minLength` não acusam campo vazio; `required` acusa `''` e `null`.
  - Sem `novalidate`, a validação nativa do navegador bloqueia o evento `submit` (medido no Chromium: 0 eventos sem, 1 com).
  - `httpResource` com URL `undefined` fica `idle` sem requisição; trocar de URL descarta o valor anterior (`loading`), enquanto `reload()` passa por `reloading`; falha de rede chega com status 0.
- **Erro meu corrigido pela verificação:** `form()` precisa de contexto de injeção (lança NG0203 fora dele). O exercício `forms-01-errors` mostrava `form()` solto num script, código que falharia se copiado; virou um componente, e a lição passou a dizer isso, ligando ao `inject()` da lição de services. Um teste prova o NG0203.
- **Verificação:** `angular-forms.spec.ts` (11 testes) e `angular-http.spec.ts` (10 testes) executam os componentes das lições com o Angular do projeto; `HttpTestingController` substitui o servidor (GET com parâmetros, cabeçalho do interceptor, vazio, cancelamento, 500 com "Tentar de novo", status 0, POST, 409 no campo de e-mail, erro geral no formulário). Testes de deriva ligam o código exibido ao testado.

## D-054 · Fase 10: testes, com o estudante escrevendo testes avaliados por mutantes

- **Ferramentas ensinadas:** Vitest via `ng test` (padrão do Angular CLI atual e o que este projeto usa), TestBed, `HttpTestingController`, `RouterTestingHarness`; Playwright citado para ponta a ponta (gratuito, código aberto; o CLI não instala um por padrão) e axe para acessibilidade automatizada; GitHub Actions como exemplo de integração contínua. A spec pede ferramentas compatíveis com a versão atual e a justificativa: está na própria lição.
- **Exercício de escrever testes (`lab-js-write-tests`):** o estudante escreve `testar(dividirConta, expect)`. A avaliação roda esses testes contra a função correta (devem passar) e contra cinco mutantes (devem falhar): resto ignorado, resto no fim, validação removida, frações e arredondamento. É avaliação real de comportamento (mutation testing em miniatura), executada no worker isolado; qualquer conjunto de testes que pegue os cinco bugs passa.
- **Fatos medidos antes de ensinar:** `vi` é global neste setup; `ng test --coverage` exige `@vitest/coverage-v8` (mensagem "MISSING DEPENDENCY"), então a lição manda instalar na primeira vez e o pacote **não** foi adicionado ao projeto (sem uso no app); um teste sem nenhum `expect` executado passa, e `expect.hasAssertions()` o faz falhar; `label.control` funciona no jsdom.
- **Os testes mostrados nas lições são executados** (`testing-examples.spec.ts`): os quatro testes de `dividirConta`, o espião e a data fixa; os dois testes de `BuscaProdutos`, como escritos; `verify()` falhando com requisição aberta. A afirmação de que os testes da lição "protegem" é provada rodando-os contra os cinco mutantes (todos falham), e a de que o teste da depuração "passa à toa" é provada contando zero chamadas de `expect`.
- **Erros meus corrigidos antes de publicar:** o primeiro exemplo de "teste que passa à toa" usava `dividirConta(0, 0)`, que lança erro, ou seja, o teste falharia; virou um `expect` dentro de um ouvinte de clique nunca disparado. A lição dizia que a plataforma "tem uma auditoria" do build no Chromium; os scripts de auditoria ficam fora do repositório, e o texto passou a dizer isso.
- **Feedback dos mutantes:** a primeira versão mostrava "Esperado true, recebido false" quando um mutante escapava, sem explicar nada. O runner ganhou `expect.fail(mensagem)` (falha de verificação com a mensagem como escrita, sem o prefixo "O código lançou um erro", que culparia o código do estudante), e o feedback passou a ser "Seus testes passaram com uma versão que ignora os centavos que sobram. Acrescente uma verificação que pegue esse bug." Verificado no worker real.
- **Auditoria:** completa até a fase 7 (210 páginas) e direcionada às 22 páginas da fase 10, com 0 violações do axe, 0 rolagem lateral, 0 links mortos e 0 erros no console.

## D-055 · Fase 9: segurança, com cada afirmação medida

- Três lições, cada uma com exercício de código real no worker: `security-xss-01` (XSS, sanitização do Angular, CSP; exercício `urlSegura` com lista de esquemas permitidos), `security-session-01` (autenticação × autorização, cookies, CSRF, CORS; exercício `revisarCookie`), `security-data-01` (segredos, dados sensíveis, dependências; exercício `mascararDadosSensiveis`). Todo exemplo vulnerável aparece com o risco e a correção.
- **Medido com o Angular do projeto** (`security-examples.spec.ts`): interpolação mostra o ataque como texto; `[innerHTML]` produz exatamente `<img src="x"><b>negrito</b>` (remove `onerror` e `<script>`) com aviso no console; `[href]` com `javascript:` vira `unsafe:javascript:...`; `bypassSecurityTrustHtml` deixa tudo passar. O HttpClient envia `X-XSRF-TOKEN` em POST, PUT, PATCH e DELETE para URLs **relativas**; não em GET e **não em URL absoluta, mesmo do próprio site** (detalhe que eu teria ensinado errado sem medir; virou exercício).
- **Medido num Chromium real com duas origens locais:** cookie `HttpOnly` não aparece em `document.cookie`, mas fica no navegador; um POST simples (formulário) de outra origem **chega ao servidor e é processado** sem CORS, e só a leitura da resposta falha; um POST com JSON **para no preflight** (o servidor só vê OPTIONS). A lição ensina essa diferença e que CORS não é autorização nem defesa contra CSRF.
- **Medido no build:** a string `'frontend-forge.progress'` do código aparece literalmente em `main-*.js`; produção não gera `.map` (source maps só em `development`); `index.html` e estilos não carregam recursos externos (a afirmação "nada sai do navegador" se mantém).
- **Parser de URL:** `new URL('java\tscript:alert(1)').protocol` é `javascript:` (o navegador remove tabulações), por isso o exercício de URL tem esse caso e a lista de permitidos usa `new URL`, não comparação de texto.
- **Correções antes de publicar:** o exemplo de log mascarado na lição mostrava `cartao: { numero: '[removido]' }`, mas a regra do exercício remove o campo `cartao` inteiro; corrigido, e um teste liga o exemplo à solução. A afirmação "o npm não revisa pacotes" foi suavizada para "estar no npm não significa que alguém revisou o código" (há varreduras automáticas).

## D-056 · Fase 11: performance e acessibilidade com números deste projeto

- Duas lições, cada uma com exercício de código no worker: `perf-loading-01` (Core Web Vitals, bundle, rotas lazy, `@defer`, `NgOptimizedImage`, orçamentos; exercício `debounce` com temporizadores reais e margens folgadas) e `a11y-practice-01` (teclado, foco em diálogos e mudanças de conteúdo, regiões vivas, contraste, reflow; exercício `razaoDeContraste` com a fórmula da WCAG).
- **Números reais em vez de hipotéticos:** bundle inicial 479 kB (≈92 kB transferidos), `main` 314 kB (43 kB), mais de 60 chunks sob demanda, orçamento de 500 kB/1 MB (medidos no build de produção). Contraste dos tokens do tema escuro: 15,15:1, 7,94:1 e 5,91:1; um teste garante que os valores citados na lição saem da fórmula da solução do exercício.
- **Medido com o Angular do projeto** (`perf-a11y-examples.spec.ts`): `@defer` mostra o placeholder e depois o conteúdo (modo `Manual` com `render(DeferBlockState.Complete)`; `DeferBlockBehavior` e `DeferBlockState` vêm de `@angular/core/testing`); `NgOptimizedImage` sem `width`/`height` lança NG02954; `priority` produz `loading="eager"` e `fetchpriority="high"`, as demais ficam `loading="lazy"`; o template do diálogo da lição compila como escrito.
- **Medido num Chromium real:** `<dialog>` com `showModal()` fica modal, o foco abre no botão com `autofocus`, o Tab não alcança a página atrás, Esc fecha e o handler devolve o foco a quem abriu.
- **Casos reais desta plataforma viraram conteúdo:** as violações do axe corrigidas em D-048 e o erro de medição de rolagem lateral de D-050 (trechos de código sem espaço impedindo a coluna de encolher a 320 px).
- **Correções antes de publicar:** o template do diálogo usava `#botaoAbrir` sem declará-lo (não compilaria; o spec agora compila o template da lição); o exemplo ruim de modal usava `*ngIf`, padrão antigo que o projeto não mistura (virou `@if`, e o erro do exemplo ficou só no uso de `div`).
- **Infraestrutura:** uma auditoria em segundo plano ficou parada mais de 8 horas (a máquina provavelmente suspendeu, e o `timeout` não a encerrou); foi encerrada à mão e refeita.
- Dois testes de competências usavam "performance" como exemplo de competência sem atividades; passaram a escolher do catálogo a primeira sem exercícios.

## D-057 · Fase 8: arquitetura com a própria plataforma como estudo de caso

- Lição `arch-boundaries-01` com exercício de código (`resumoDoPedido`, uma regra extraída de um componente para função pura). O estudo de caso é o código real: a fronteira `ProgressRepository`, a linha do `app.config.ts` que escolhe a implementação, o repositório em memória dos testes, as funções puras de `core/learning` e `core/gamification`, a ausência deliberada de facades e stores, e o registro de decisões deste arquivo.
- **Teste de deriva contra o código real** (`arch-examples.spec.ts`): o contrato exibido na lição precisa estar contido em `progress-repository.ts`, e a linha do provider precisa estar em `app.config.ts`. Os arquivos são lidos com `ts.sys.readFile` (o compilador TypeScript já usado pela suíte), sem adicionar `@types/node`. Se o código da plataforma mudar, a lição acusa.
- **Medido:** um `ErrorHandler` próprio recebe o erro lançado num clique, e ele não volta a quem disparou o evento (`rethrowApplicationErrors: false` nos testes, para observar o comportamento da aplicação, que não relança); trocar o repositório nos testes não exige mudar o `ProgressService`.
- **Correção antes de publicar:** a lição dizia que as regras de XP estavam em `core/learning` e que "nenhuma sabe de Angular"; o XP fica em `core/gamification`, que tem um service fino com Angular. O texto passou a dizer exatamente isso.
- `arch-boundaries` seria id de conceito e de módulo; o módulo virou `arch-responsibilities` antes dos testes.

## D-058 · Fase 12: Git e fluxo de equipe, medido com git de verdade

- Lição `tooling-git-01` com exercício de código `proximaVersao` (SemVer a partir de Conventional Commits; inclui o caso `1.9.9` → `1.10.0`, que pega quem compara versões como texto).
- **Medido com git 2.53 em repositórios descartáveis no scratchpad** (nunca no repositório do projeto): o formato dos marcadores de conflito; `revert` acrescenta um commit (2 → 3) e desfaz a mudança; `commit --amend` troca o hash; com outra pessoa tendo enviado um commit, `push --force-with-lease` é recusado ("stale info") e `push --force` apaga o commit dela do remoto. A primeira tentativa de medir o `--force-with-lease` foi inválida (repositório bare criado com a branch padrão `master`); refeita com `-b main`.
- Um teste liga as versões citadas no texto da lição (2.0.0, 1.5.0, 1.4.3) à solução do exercício.
- **Testes do estado "competência sem atividades":** com a fase 12, toda competência do catálogo real passou a ter exercícios, e a busca por uma competência vazia quebrava os specs no carregamento. Os testes passaram a usar um catálogo com uma competência extra sem conteúdo (via `CONTENT_CATALOG`), em vez de depender de lacunas no catálogo real.

## D-059 · Fase 13: capstone como lição de planejamento + projeto guiado

- **Formato:** a fase 13 recebeu uma lição curta (`capstone-plan-01`: escopo, histórias com critérios verificáveis, matriz de permissões com o servidor como fonte de verdade, modelo de ameaças, fatias verticais com o mais arriscado primeiro, definição de pronto) e o projeto guiado `project-capstone-admin` (painel administrativo em oito etapas, com checklist, rubrica de cinco critérios e próximos passos, incluindo Spring Boot). Sem módulo, a fase continuaria marcada como "Conteúdo em produção" mesmo com o projeto publicado.
- **Verificação real dentro do possível:** a plataforma não executa Angular nem servidores, então a verificação automática do projeto cobre a lógica da tabela administrativa (`consultarTabela`: busca sem diferenciar maiúsculas no nome e no e-mail, filtro por status, paginação com página ajustada ao intervalo, sem alterar os registros). A solução de referência vive só no spec e passa nos 7 testes; dois erros típicos são pegos pelo teste certo (página não ajustada; `sort` no array recebido). O resto (Angular, backend de demonstração, testes, publicação) é avaliado por checklist e rubrica, e o projeto diz isso explicitamente.
- **Fronteira de confiança no centro:** os requisitos de segurança e os casos de teste exigem provar o 403 chamando a API direto, como pede a spec ("não confie em verificações feitas exclusivamente no frontend").
- **Testes que dependiam de lacunas no catálogo:** com todas as 14 fases e competências com conteúdo, os testes do estado "Planejado" da Academia passaram a usar um catálogo com a fase 13 sem módulos (via `CONTENT_CATALOG`), e o teste da lista de projetos passou a contar a partir do catálogo.
- **Auditoria:** a auditoria completa anterior foi encerrada por estar desatualizada (começou antes da fase 13 e um extrator de ids errado deixava uma lição de fora); a lista de lições passou a vir do id declarado em `: Lesson = {`.

## D-060 · Aprofundamento: Flexbox e Grid, generics, RxJS

- Três lições nas fases que tinham uma só: `css-layout-01` (fase 2), `ts-generics-01` (fase 5) e `angular-rxjs-01` (fase 7, a quarta da fase).
- **CSS, medido no Chromium:** `auto-fill` manteve cinco colunas de 160px (três vazias) e `auto-fit` colapsou as vazias, deixando os dois itens com 400px; `margin-left: auto` encostou o botão na borda. O vazamento do item flex **não reproduziu** com uma URL cheia de hífens (o navegador quebra neles); com um texto realmente sem pontos de quebra, a linha de 300px foi a 592px, e `min-width: 0` com `overflow-wrap: anywhere` a fez caber. A lição explica essa diferença. O exercício de código mede layout real (posições com `getBoundingClientRect`), por isso entra na lista de exercícios verificados no navegador e não no jsdom.
- **TypeScript, medido pelo compilador:** a tabela de erros da lição é executada linha a linha. A medição corrigiu uma afirmação minha: `porId(['a'], 1)` não gera TS2345, e sim TS2322 em cada elemento (o TypeScript checa os itens contra a restrição). O tipo inferido do exercício (`Cliente | undefined`) é lido do verificador (`checker.typeToString`).
- **RxJS, executado com RxJS 7.8.2 e o Angular do projeto:** Observable frio roda uma vez por assinatura; `HttpClient` não envia nada sem assinatura; digitação rápida gera uma requisição; `switchMap` cancela a anterior; `distinctUntilChanged` evita repetir o termo; com `catchError` dentro do `switchMap` a busca sobrevive a um 500, e fora dele a busca morre (nenhuma requisição depois); `toSignal` cancela a assinatura ao destruir o componente; `interval` assinado à mão continua depois do destroy, e com `takeUntilDestroyed` para. As APIs ensinadas são estáveis no Angular 22 (`toSignal`, `toObservable`, `takeUntilDestroyed`, `rxResource`); `pendingUntilEvent` (developer preview) ficou de fora.
- **Infraestrutura de verificação:** para não apagar o perfil do navegador de uma auditoria em andamento, verificações paralelas passaram a usar um perfil separado.

## D-061 · Aprofundamento: HTTP, formulários nativos e JS funcional

- Três lições nas fases 0, 1 e 4, que tinham uma só: `web-http-01` (métodos, status, cabeçalhos e cache), `html-forms-01` (tipos de campo, autocomplete, validação nativa, fieldset) e `js-functional-01` (funções de ordem superior, pipe, imutabilidade, memoização).
- **Cache HTTP, medido num Chromium com um servidor local que conta as requisições:** com `ETag` e `no-cache`, a segunda chamada chegou ao servidor, que respondeu 304, e o `fetch` recebeu 200 com o corpo guardado (a revalidação é invisível para o JavaScript). Com `max-age=60`, a segunda chamada não chegou ao servidor. Com `no-store`, as duas foram completas.
- **Validação nativa, medida no Chromium:** campo obrigatório vazio começa inválido, mas `:user-invalid` só aplica o estilo depois da interação; `minlength` gera `tooShort` para texto digitado e não para valor atribuído por script; `setCustomValidity` marca `customError`; as mensagens nativas vêm no idioma do navegador; o `fieldset` vira um grupo com o nome da `legend` na árvore de acessibilidade. Num `type="number"`, digitar "01310-100" deixa o `value` vazio (`badInput`), e o `valueAsNumber` de "01310" é 1310: por isso a lição recomenda `inputmode="numeric"` para CEP.
- **JS funcional, executado nos testes:** os três exemplos da lição e a previsão do pipe rodam e têm cada valor conferido. Uma afirmação foi corrigida antes de publicar: ordenar um array congelado lança `TypeError` em qualquer modo, não só no estrito.
- O conceito `js-mutability` já existia (Bestiário); a lição reutiliza o mesmo id em vez de criar outro.

## D-062 · Aprofundamento: estado da aplicação (fase 8) e CI/CD (fase 12)

- Duas lições nas fases que tinham uma só: `arch-state-01` "Estado: onde cada dado mora" e `tooling-ci-01` "CI/CD, configuração por ambiente e deploy". O carrinho com signals já estava em `angular-services-01`, por isso a lição de estado trata de classificação, URL como estado e estado derivado, sem repetir o service.
- **Medido nesta versão do Angular (22.2):** com `withComponentInputBinding`, um query param ausente chega ao input como `undefined`, e o valor padrão de `input('')` é ignorado, tanto ao abrir a rota sem o parâmetro quanto ao removê-lo de uma rota já aberta. A lição ensina `input<string | undefined>()` normalizado num `computed`. O componente da lição é executado com `RouterTestingHarness` (URL → lista filtrada, digitação → URL codificada, parâmetro removido → `undefined`), com um guard de divergência linha a linha.
- **CI, medido:** num projeto de teste com uma dependência no `package.json` e fora do lockfile, `npm ci` terminou com código 1 (EUSAGE) e não criou `node_modules`; a saída mostrada na lição é a real. No build desta plataforma, textos do conteúdo aparecem legíveis nos `.js` publicados, o que fundamenta "tudo no bundle é público".
- O workflow da lição usa os scripts reais deste projeto. Um teste confere que cada `npm run` existe no `package.json` (e que `npm test` não fica em modo observação) e que os orçamentos e o `outputHashing` mostrados são os da configuração de produção do `angular.json`. O workflow é material didático: o projeto não tem `.github/` e nada foi publicado.
- O tipo `CodeLanguage` não inclui YAML; o workflow aparece como `text` em vez de ampliar o tipo só para um bloco.
- **Bestiário:** duas entradas novas a partir de comportamentos medidos nesta rodada: `bug-route-input-undefined` (input de rota que chega `undefined` e ignora o padrão) e `bug-number-cep` (`type="number"` esvazia "01310-100" e transforma "01310100" em 1310100, medido no Chromium e no jsdom, com teste em `bug-claims.spec.ts`). Um erro meu foi pego antes de publicar: `\d` dentro de template literal vira `d`, o que mostraria `pattern="d{5}-?d{3}"` na correção; foi escapado e conferido.

## D-063 · Missões das lições novas

- Três missões no formato diagnóstico (objetivo) → correção (código executado no laboratório), cada uma com um problema que não repete nenhum laboratório de lição:
  - `mission-double-charge` (HTTP): retentativa que repete POST, desiste do 429, não espera e engole o último erro. A correção recebe `esperar(ms)` injetado, para os testes não dependerem do relógio.
  - `mission-checkout-form` (formulários nativos): CEP em `type="number"`, botão de cupom que envia o pedido, campos sem rótulo e sem `autocomplete`. Só HTML.
  - `mission-dashboard-state` (estado derivado e imutabilidade): contadores guardados, lista interna exposta por referência e ids derivados de `length`.
- **Achado medido no Chromium:** num iframe com `sandbox="allow-scripts"` (o do laboratório), clicar num botão de envio **não dispara** o evento `submit`; com `allow-forms`, dispara. No jsdom, dispara. Por isso o teste do cupom passava vazio no laboratório real com o código inicial errado. O teste passou a verificar o comportamento que define o bug (`type === 'button'`) e mantém o clique como conferência. `allow-forms` **não** foi adicionado: o sandbox continua mínimo, e um envio navegaria a prévia.
- **Erro meu pego pelos testes:** usei `.not.toBe` em dois testes, mas o `expect` do executor real não tem `.not`; a solução de referência falharia no laboratório. Além de corrigir, entrou um guarda em `lab-solutions.spec.ts`: todo matcher encadeado em `expect(...)` nos testes de exercícios precisa existir no executor real, e `.not` é recusado. O mini-executor de jsdom da spec ganhou `toEqual`, que o real já tinha.
- Afirmação do debrief verificada com o RxJS do projeto: `retry({ count, delay })` repetiu até o sucesso na terceira tentativa.
- Os testes das telas de missões e do Bestiário passaram a derivar as contagens do catálogo, em vez de números fixos.

## D-064 · Aprofundamento: tipos e números (fase 3), signals a fundo (fase 6), responsividade moderna (fase 2)

- **`js-types-01`**, executado no Node e nos testes: `19.9 * 3` é `59.699999999999996` e `(1990 * 3) / 100` é `59.7`; `(1.005).toFixed(2)` é `"1.00"`; `Number('')` é 0 e `isNaN('')` é `false` (por isso o campo vazio passa por uma validação com `isNaN`); `parseInt('2abc')` é 2. O `Intl.NumberFormat` em pt-BR usa espaço não separável (U+00A0) entre "R$" e o número; o teste do laboratório compara com o próprio `Intl` e com o espaço normalizado.
- **`angular-signals-01`**, medido com o Angular do projeto: `computed` é preguiçoso (0 execuções antes da leitura), memoizado, ignora `set` com o mesmo valor e corta a propagação quando um intermediário produz o mesmo valor; escrever num signal dentro de `computed` lança NG0600; `untracked` não congela o valor (11, 11, 22); `push` no array não notifica; `effect` não roda no `set`, e três `set` seguidos geram uma execução com o valor final, com o cleanup antes da nova execução e no `destroy`; `linkedSignal` na forma curta reinicia mesmo quando a escolha ainda existe, e na forma `{ source, computation }` pode preservá-la. O componente da lição roda em TestBed com guard de divergência. O laboratório implementa signal e computed mínimos com dependências dinâmicas.
- **`css-responsive-01`**, medido no Chromium: `clamp(1rem, 4vw, 2rem)` dá 16, 24 e 32px em 320, 600 e 1400px; o mesmo cartão fica em bloco num contêiner de 300px e em flex num de 640px, e sem `container-type` fica em bloco mesmo com 640px; com movimento reduzido emulado, a transição cai de 0,3s para 0,01ms; com a fonte padrão do navegador em 24px, 10rem vira 240px e 160px continua 160px. O laboratório mede layout real e, dentro dos testes, alarga o contêiner para provar que o cartão reage a ele e não à tela.
- Uma afirmação foi retirada antes de publicar, por não ter sido medida (eventos `transitionend` com duração de 0,01ms).
- O Prettier formata templates inline do Angular; o trecho da lição foi alinhado ao formato que o guard de divergência encontrou na spec.

## D-065 · Aprofundamento: erros (fase 4), tipos a partir dos dados (fase 5), performance em execução (fase 11)

- `js-errors-01`, medido no Node e nos testes: `return` no `finally` substitui o do `try`; `throw "texto"` chega sem `stack`; subclasse sem `this.name` aparece como "Error"; `try` sem `await` não captura a rejeição; `allSettled` versus `all`.
- `ts-const-satisfies-01`, medido pelo compilador: `satisfies` sozinho manteve os literais quando o alvo é um tipo de template (`/${string}`), mas com `Record<Status, string>` os valores ficaram `string`. Cada linha da tabela de erros (TS2339, TS1360, TS2353, TS2551 e a que compila) é compilada no teste.
- `perf-runtime-01`, medido em TestBed: ao inverter a lista, com `track t.id` o texto digitado fica com o item; com `track $index`, vai para a linha de outro; com cópias, `track t.id` reaproveita 3 de 3 elementos e `track t` 0 de 3; um método no template rodou 4 vezes, contra 1 do `computed`. Corrigi uma afirmação minha sobre esta plataforma: ela usa `$index` em 11 listas, todas estáticas ou que só crescem no fim, e o texto passou a dizer isso.
- Verificado no Chromium: os três laboratórios rodaram nos executores reais (código inicial falha, solução passa em todos os testes; o transpilador do worker aceitou `as const satisfies`), e as 36 páginas novas saíram sem violações de acessibilidade, transbordo ou links mortos.

## D-066 · Aprofundamento: testes assíncronos (fase 10), tabelas e mídia (fase 1), URLs e origens (fase 0)

- **`testing-async-01`**, medido com o Vitest 5.0.5 do projeto numa spec descartável: uma asserção dentro de um `setTimeout` não aguardado deixou o teste passar, e o erro apareceu depois como "unhandled error" atribuído a **outro** teste; `expect(...).resolves` sem `await` foi reprovado com "was not awaited"; um debounce de 300 ms não chamou em 299 ms e chamou uma vez em 300 ms; `advanceTimersByTime` não executou a continuação de um `await` dentro do timer, e `advanceTimersByTimeAsync` executou; `setInterval` deixou 1 timer pendente. Os três testes da lição rodam como estão na suíte (`testing-async.spec.ts`, com guard de divergência); as duas medições que reprovam a suíte de propósito ficaram só na spec descartável. O laboratório implementa um relógio falso.
- **`html-tables-media-01`**, medido no Chromium: `caption` virou o nome da tabela; `th scope` virou `columnheader` e `rowheader`; a mesma informação em divs ficou `generic`; `alt=""` foi ignorado, e sem `alt` a imagem ficou como imagem sem nome. Duas expectativas minhas foram corrigidas pela medição: a `figcaption` **não** virou o nome do `figure`, e a lição diz isso; e a primeira medição de reserva de espaço era inválida (`img` sem `src`), refeita com uma imagem lenta de verdade: com `width` e `height`, os 300px já estavam reservados; sem eles, o texto abaixo pulou 300px. `srcset` escolheu 400w numa tela de 400px e 1600w numa de 1200px.
- **`web-url-01`**, executado no Node e no Chromium: o servidor recebeu `/pagina?busca=caf%C3%A9` sem o fragmento (e um pedido automático de `/favicon.ico`); a barra final muda a resolução de relativos; 443 some da origem; `mailto:` tem origem `"null"`; concatenar "café com leite & pão" quebra a query em dois parâmetros, e `encodeURI` não codifica o `&`.

## D-067 · Aprofundamento: dependências entre módulos (fase 8) e qualidade automatizada (fase 12); três regras de lint ligadas

- **`arch-deps-01`** usa esta plataforma como caso real. Medido no grafo de imports estáticos de `src/app` (sem testes) em 2026-10-30: 121 arquivos, 354 imports internos, nenhum ciclo; `core` e `shared` nunca importam `features`; a única feature que importa outras é o modo foco (lição, laboratório, revisão e o cartão do painel), conforme D-043, e nenhuma importa o modo foco de volta. Os números exatos ficam só aqui, para a lição não envelhecer a cada mudança. `src/content/arch-deps.spec.ts` é agora um **teste de arquitetura** deste repositório: monta o grafo com `ts.sys`, usa a própria solução do laboratório (detector de ciclos e verificador de camadas) e falha se surgir um ciclo, um import proibido ou uma nova dependência entre features.
- **`tooling-lint-01`**, medido com o ESLint e o Prettier deste repositório: o exemplo de TypeScript gerou 5 problemas e o de template, 5 (a tabela da lição é a saída real). Ficaram sem aviso, mesmo com as regras extras: campo sem rótulo e link com `href="#"` usado como botão (inclusive só com ícone, medido separadamente), cobertos por axe e testes.
- **Regras ligadas no projeto:** `eqeqeq`, `@angular-eslint/prefer-signals` e `@angular-eslint/template/button-has-type`. Antes de ligar, uma configuração temporária fora do repositório mediu 0 violações nos 306 arquivos lintados; agora as regras impedem regressões (por exemplo, um `@Input()` novo, que o CLAUDE.md já proíbe). Nenhuma dependência nova: as regras vêm de plugins já instalados. Alternativa descartada: ligar como aviso, desnecessário com zero ocorrências.
- `tooling-lint.spec.ts` confere que cada regra citada na lição existe nos plugins instalados e que a configuração que produziu a tabela continua no lugar.

## D-068 · Bestiário e missão a partir das lições recentes

- **Quatro entradas no Bestiário**, todas sobre comportamentos já medidos: `bug-track-index-state` (texto digitado vai para outra linha com `track $index`, medido em `perf-runtime.spec.ts`), `bug-float-money` (`19.9 * 3`, com teste em `bug-claims.spec.ts`), `bug-container-no-type` (medido no Chromium, D-064) e `bug-late-assertion` (medido no Vitest, D-066).
- **Missão `mission-order-import`**, que junta dinheiro em centavos, status a partir de uma lista única e erros que não são engolidos. O código inicial foi medido no Node antes de entrar no diagnóstico: `"19,90"` vira `1989.9999999999998` centavos e `"1.234,56"` vira `123.4`, mil vezes menor e sem nenhum erro. A correção devolve `{ pedidos, erros }` com linha e motivo, sem try/catch: os erros esperados viram verificações explícitas e os inesperados voltam a aparecer.
- Verificado: a correção roda no executor real do laboratório (código inicial 0 de 5, solução 5 de 5) e as 8 páginas novas ou alteradas saíram sem violações de acessibilidade, transbordo ou links mortos.

## D-069 · Aprofundamento: objetos, Map e Set (fase 3) e templates a fundo (fase 6)

- **`js-collections-01`**, executado no Node e nos testes: chaves de objeto que parecem inteiros vêm primeiro, em ordem crescente (`1 2 10 b a -1`), enquanto `Map` mantém a ordem de inserção; `Set` usa SameValueZero (1 e "1" diferentes, NaN igual a NaN, objetos pela referência); `obj["__proto__"]` não cria chave própria; objeto como chave de objeto vira `"[object Object]"`; valores padrão da desestruturação só valem para `undefined`. `Object.groupBy` existe no ambiente, mas o TypeScript deste projeto (target ES2022) acusou TS2550; a lição avisa.
- **`angular-templates-01`**, medido com o Angular do projeto: interpolação não cria elementos a partir de HTML; `[attr.aria-expanded]="false"` gera o texto `"false"` e `null` remove o atributo; `[aria-pressed]` liga direto; `[disabled]="false"` habilita, mas `[attr.disabled]="false"` e `disabled="{{ false }}"` desabilitam; um pipe puro não rodou depois de um `push` no mesmo array (a tela mostrou 6 com soma real 10) nem com outro signal mudando, e rodou com um array novo; `(keydown.enter)` ignora outras teclas; `currency: 'BRL'` sem `LOCALE_ID` deu `R$1,234.50`, e com `LOCALE_ID` pt-BR sem os dados do locale, NG0701.
- O lint pegou um espaço não separável literal numa expressão regular da spec; foi trocado pelo escape ` `.

## D-070 · Backend local: Spring Boot 4.1 para o progresso, atrás do ProgressRepository

- **O quê:** `backend/` com Spring Boot 4.1.2 (versão estável mais recente no Maven Central em 2026-10-30; 4.2.0 ainda era RC), Java 21, Maven Wrapper 3.9.16. API `GET/PUT/DELETE /api/progress`. No frontend, `HttpProgressRepository` implementa o mesmo `ProgressRepository`; `provideHttpProgressRepository()` troca a implementação numa linha. O padrão continua sendo o `localStorage`: o backend é opt-in, e nenhuma feature mudou.
- **Fronteira de confiança (PRODUCT_SPEC):** o servidor não confia no cliente. Rejeita corpo vazio ou JSON inválido (400), não objeto ou `schemaVersion` ausente, não inteira, menor que 1 ou maior que a atual (422) e mais de 512 KiB (413), sem alterar o que está guardado. E o cliente não confia no servidor: o documento recebido passa pela mesma validação profunda do `localStorage` (`parseProgressJson`).
- **Concorrência:** cada gravação aumenta a versão, exposta como `ETag`. O cliente devolve a última como `If-Match`; uma aba desatualizada recebe 412 (`ProgressConflictError`, com orientação para recarregar), em vez de sobrescrever progresso mais novo. É o mecanismo ensinado na lição de HTTP, aplicado na própria plataforma. Respostas com `Cache-Control: no-store`.
- **Sem autenticação, por isso só local:** um estudante, `server.address=127.0.0.1`. Medido: com o servidor real rodando, a conexão pelo IP externo da máquina foi recusada. Publicar o backend exige autenticação antes; fica registrado como requisito, não como recurso.
- **Dependências (todas do ecossistema Spring Boot, gratuitas):** `spring-boot-starter-webmvc` (HTTP), `spring-boot-starter-jdbc` com `JdbcClient` (SQL direto, sem ORM para uma tabela), `h2` em arquivo (`backend/data/`, sem servidor de banco para instalar), `spring-boot-starter-webmvc-test` (MockMvc). Descartados: JPA (camada a mais para uma tabela com um documento), PostgreSQL agora (exige instalar e rodar um servidor; a troca é de configuração quando houver deploy), CORS (o proxy do `npm start` deixa tudo na mesma origem).
- **Spring Boot 4 mudou nomes:** o Jackson é o 3 (`tools.jackson`), o JUnit é o 6 e o `@AutoConfigureMockMvc` mudou de pacote; os nomes foram conferidos nos jars baixados, não de memória.
- **Verificado:** 13 testes de backend (MockMvc + H2 em memória); 9 testes do repositório HTTP no frontend (HttpTestingController), incluindo um que lê o `CURRENT_SCHEMA_VERSION` do código Java e compara com o do frontend; servidor real exercitado com curl (204, ETag v1, 412, 422 com mensagem) e de ponta a ponta pelo proxy do `ng serve`. O lint (`preserve-caught-error`) obrigou a anexar `cause` aos erros relançados, o que a lição de erros ensina.

## D-071 · Contas no backend: sessão em cookie, CSRF, hash de senha e progresso por conta

- **O quê:** cadastro, login, logout e `GET /api/auth/me`; o progresso passou a ser por conta (`progress.user_id`), com o id vindo da sessão e nunca da requisição. No frontend, `AccountService` e a seção **Conta** em Configurações, que só existe no modo servidor (sem rota nova nem link que pudesse ficar morto no modo local).
- **Como, e por quê:** sessão em cookie `HttpOnly` e `SameSite=Lax` (o JavaScript não lê a sessão; medido no Chromium: `document.cookie` não contém `JSESSIONID`), CSRF no padrão que a lição de sessões ensina (`csrf().spa()` do Spring Security 7.1, cookie `XSRF-TOKEN` legível e cabeçalho `X-XSRF-TOKEN`, que o `HttpClient` do Angular envia sozinho em escritas para URLs relativas; medido nos testes: não envia em GET nem para URLs absolutas de outro site), senhas com `DelegatingPasswordEncoder` (bcrypt), novo id de sessão a cada login, mesma resposta para senha errada e conta inexistente, e 5 falhas em 15 minutos bloqueiam com 429 e `Retry-After`. Senha de 12 a 128 caracteres. Alternativas descartadas: token JWT no `localStorage` (exposto a XSS, como a lição de sessões explica) e Basic Auth.
- **Quatro problemas encontrados pela verificação, antes de declarar pronto:**
  1. `csrf().spa()` **não** entrega o cookie no primeiro GET (o token é adiado); sem o cookie, toda escrita seria recusada. Solução: `CsrfCookieFilter`, que carrega o token em toda requisição.
  2. O auxiliar `csrf()` do spring-security-test troca o repositório de CSRF do contexto compartilhado e escondeu esse problema nos testes seguintes; o fluxo real ficou numa classe com contexto próprio.
  3. No servidor real, uma recusa de CSRF chegava como **401**, porque o 403 é encaminhado para `/error`, que exigia login; o MockMvc não faz esse encaminhamento. Solução: liberar o dispatch de erro. Um teste com Tomcat real (`RealServerSecurityTest`) cobre o caso, e falha sem a correção (conferido removendo a correção).
  4. **Mistura de dados entre contas:** `ProgressService.load()` mantinha o progresso em memória quando o servidor respondia 204; quem entrasse depois na mesma aba veria o progresso anterior, e o próximo salvamento o copiaria para a nova conta. Agora `load()` sempre substitui o estado (pelo carregado ou por um vazio). No modo local nada muda, porque o estado já começa vazio.
- **Telas:** os avisos de "não foi possível ler o progresso" ganharam a variante "Entre na sua conta" (`signInRequired`), e o aviso "salvo apenas neste navegador" diz a verdade no modo servidor.
- **Estilo:** `.text-input`, `.field-error` e `.form` estavam duplicados ou presos a componentes; a seção nova ficou com o fundo padrão do navegador e falhou contraste no tema claro (1,58:1, apontado pelo axe). As classes foram para o design system global, com uma definição só; as telas que já as usavam foram auditadas de novo, sem regressão.
- **Ainda local:** antes de publicar, HTTPS, `server.servlet.session.cookie.secure=true` e um limite de tentativas compartilhado (o atual fica em memória, por processo).
- **Verificado:** 23 testes de backend (MockMvc, Tomcat real, relógio controlado para o limite de tentativas); 571 no frontend; servidor real com curl (cookies, 403/401/429, cabeçalhos de segurança); fluxo completo no Chromium real (cadastro, progresso salvo e recarregado, logout limpa a tela, outra conta vê progresso vazio, a primeira recupera o seu); axe sem violações nas telas do modo servidor e nas do modo local que usam as classes movidas.

## D-072 · Escolher local ou servidor em Configurações

- **O quê:** a seção "Onde salvar o progresso" troca entre "Neste navegador (padrão)" e "No servidor desta instalação, com uma conta", sem editar código. A preferência fica no `KeyValueStorage` (`frontend-forge.storage-mode`); `provideProgressStorage()` lê a preferência na inicialização e escolhe o `ProgressRepository` com uma fábrica. `provideHttpProgressRepository()` continua existindo para forçar o modo servidor (testes ou uma instalação fixa).
- **Por que recarregar a página na troca:** o repositório é escolhido uma vez. Trocar com o progresso já em memória convidaria a mistura entre os dois lugares, o mesmo tipo de problema corrigido em D-071. A troca pede confirmação e explica que o progresso não vai junto (exportar e importar resolvem); cancelar, inclusive com Escape, devolve a seleção.
- **Nada de opção morta:** a opção de servidor confere se esta instalação tem o backend. O endpoint de sessão responde JSON (200 ou 401); medido: um host estático respondeu `200 text/html` (a própria página), um proxy sem backend responde 502, e sem rede o status é 0, e nesses casos a opção aparece desabilitada, com o motivo ligado por `aria-describedby`.
- **ConfirmDialog** ganhou a saída `cancelled`, emitida em qualquer fechamento sem confirmação (botão, Escape). Medido no Chromium com o `<dialog>` nativo: Escape fechou e manteve a seleção local. O jsdom desta versão não tem `showModal`/`close`; os testes de componente instalam uma versão mínima que dispara `close` como os navegadores.
- **A lição de arquitetura** (`arch-boundaries-01`) usava como estudo de caso a linha do `app.config.ts` que escolhia o repositório, e o guard de divergência apontou a mudança. O estudo de caso foi atualizado para o que de fato aconteceu: o backend entrou como uma segunda implementação do contrato, nenhuma página mudou, e a escolha virou uma fábrica. O guard agora confere cada linha do trecho no arquivo de providers.
- **Verificado:** 580 testes no frontend; no Chromium real, sem editar nenhum arquivo: opção habilitada com o backend, Escape cancela, confirmar recarrega no modo servidor com a seção Conta, cadastro e progresso salvos no servidor sem gravar progresso no `localStorage`, volta para local com o aviso correto; com o build de produção servido sem backend, opção desabilitada com o motivo; axe sem violações em Configurações.

## D-073 · Um comando, um processo: o jar do backend serve o frontend

- **O quê:** `npm run app` faz o build do Angular, empacota o jar do backend com esse build em `static/` (recurso do Maven apontando para `dist/frontend-forge/browser`; sem build, o jar sobe só com a API) e inicia o servidor em `127.0.0.1:8080`. Frontend e API ficam na mesma origem: sem proxy, sem CORS, e a detecção do backend (D-072) encontra o servidor sozinha. `npm start` continua sendo o caminho de desenvolvimento do frontend, com recarga automática.
- **Reescrita de SPA:** caminhos que não são arquivos e não estão em `/api` recebem o `index.html` (`FrontendConfig`), para que links diretos e recarregamentos funcionem, como a lição de CI/CD ensina; `/api` nunca cai na página. A segurança passou a proteger só `/api/**`: as páginas, scripts e estilos são públicos.
- **Cache, como a lição de HTTP ensina:** arquivos com hash no nome (`main-JRZ5SSMF.js`, `chunk-BGm8AK-M.js`) com `public, max-age=31536000, immutable`; o resto (`index.html` e rotas) com `no-cache`. O Spring Security escreve `no-store` em toda resposta, exceto quando o cabeçalho já existe; por isso um filtro define o cabeçalho antes.
- **Encontrado no servidor real, não nos testes:** a primeira medição, com `curl -I`, mostrou `no-store` em tudo. A causa era o método: o filtro tratava só GET, e `curl -I` envia HEAD. GET já estava correto, mas HEAD precisa dos mesmos cabeçalhos; o filtro passou a tratar HEAD, com teste. Também medido: `/` é a página de boas-vindas do Spring Boot, um encaminhamento para `index.html` que o MockMvc não segue; o teste confere o encaminhamento, e o servidor real entregou a página.
- **Verificado:** 29 testes de backend (com arquivos de teste no lugar do build); `npm run app` real, com um único processo Java na porta 8080; cabeçalhos medidos com GET e HEAD; fluxo completo no Chromium no endereço único (opção de servidor detectada, Escape cancela, modo servidor com conta, progresso salvo no servidor, volta para local); link direto para `/lessons/js-closures-01?step=3` abriu a lição; axe sem violações. As verificações usaram banco em memória (`npm run app -- --spring.datasource.url=jdbc:h2:mem:...`); o banco local criado pela primeira execução ficou vazio (0 contas, 0 progressos).
