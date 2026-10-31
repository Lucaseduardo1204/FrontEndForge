# Frontend Forge

Plataforma web de formação em desenvolvimento frontend, do básico da web até Angular profissional. O produto deve **ensinar de verdade**, com conteúdo real, exercícios avaliados, progresso persistido e revisão espaçada. Não é um dashboard bonito com botões decorativos.

- Especificação completa do produto: `docs/PRODUCT_SPEC.md`. Leia a seção relevante **antes** de implementar uma área nova. Não precisa reler tudo a cada tarefa.
- Decisões de arquitetura: `docs/DECISIONS.md`. Registre ali toda decisão relevante (o quê, por quê, alternativas descartadas).
- Lista de tarefas e estado do MVP: `docs/TASKS.md`. Mantenha atualizada ao terminar cada etapa.

Idioma: interface e conteúdo educacional em **português do Brasil**. Código, nomes de arquivos, variáveis e commits em **inglês**.

---

## Stack

- Angular, **versão estável atual**. Antes de criar o projeto, confirme a versão (`npm view @angular/core version`) e siga a documentação oficial (angular.dev) dessa versão.
- TypeScript em modo `strict`.
- Componentes **standalone**, controle de fluxo nativo de template (`@if`, `@for`, `@switch`), `inject()` em vez de injeção por construtor.
- **Signals** para estado local e derivado. **RxJS** só onde há fluxo assíncrono de verdade (HTTP, eventos encadeados, cancelamento).
- Angular Router com lazy loading por feature.
- Reactive Forms (tipados) quando houver formulário.
- SCSS com design tokens em custom properties.
- Testes: use o runner que a CLI da versão escolhida gera por padrão. Explique a escolha em `docs/DECISIONS.md`.
- ESLint (angular-eslint) + Prettier.

Não misture padrões antigos (NgModules, `*ngIf`, `@Input()` decorators onde existe `input()`) com os modernos. Escolha o padrão moderno e seja consistente.

Sem dependências pagas ou serviços externos para o funcionamento básico. Toda dependência nova precisa de justificativa curta em `docs/DECISIONS.md`.

## Comandos

Angular 22.2 · TypeScript 6 · Node 24 · Vitest (via `ng test`) · angular-eslint · Prettier · ícones `@lucide/angular`.

```bash
npm install          # dependências
npm start            # servidor de desenvolvimento (http://localhost:4200)
npm test             # testes unitários, execução única (ng test --watch=false)
npm run test:watch   # testes em modo observação
npm run lint         # lint (TS + templates + acessibilidade)
npm run format       # Prettier
npm run build        # build de produção (dist/frontend-forge)
npm run app          # tudo num processo: build + jar do backend servindo frontend e API em 127.0.0.1:8080
cd backend && ./mvnw test             # testes do backend (Spring Boot 4.1, Java 21)
cd backend && ./mvnw spring-boot:run  # backend local em 127.0.0.1:8080 (opcional; npm start faz proxy de /api)
```

Antes de dizer que algo está pronto: rode testes, lint e build. Se algum falhar, corrija ou relate claramente.

## Estrutura

Organização por feature. Adapte se fizer sentido, mas não crie camadas sem uso.

```
src/app/
  core/          # serviços singleton, persistência, motor de aprendizagem, config
  layout/        # shell, sidebar, header
  shared/        # componentes de UI reutilizáveis, pipes, utils
  features/
    dashboard/
    academy/     # trilha / mapa de progressão
    lessons/
    lab/         # laboratório de código + executor isolado
    missions/
    projects/
    bugs/        # bestiário de bugs
    library/     # biblioteca técnica
    profile/     # competências
    focus/       # modo de foco
src/content/     # conteúdo educacional estruturado (dados, não componentes)
docs/
```

Regras:
- Componentes de apresentação recebem dados via `input()` e emitem via `output()`. Lógica de negócio fica em services, não em templates.
- Componente passou de ~200 linhas ou tem mais de uma responsabilidade? Quebre.
- Sem facades, stores ou abstrações "pra quando precisar". YAGNI.

## Regras inegociáveis

1. **Nada de dados fictícios apresentados como reais.** Sem histórico → estado vazio claro com orientação de como começar.
2. **Nada de execução simulada.** Se o código do estudante não rodou de verdade, a UI não pode mostrar resultado.
3. **Nada de link ou botão morto.** Funcionalidade não implementada aparece marcada como "Planejado", nunca fingindo funcionar.
4. **Código do estudante nunca roda no contexto da aplicação.** Ver seção do Laboratório.
5. **Nenhuma credencial ou chave no frontend/bundle.** Integração futura com IA passa obrigatoriamente por backend.
6. **Exemplo vulnerável só com explicação do risco e a correção** ao lado. Nunca apresentar prática insegura como recomendada.
7. **Conteúdo técnico correto e compatível com a versão usada.** Na dúvida sobre API do Angular, consulte a doc oficial em vez de chutar.
8. Não declare tarefa concluída sem verificar que funciona.

## Conteúdo educacional

- Todo conteúdo vive em `src/content/` como dados tipados (TS ou JSON validado por tipos). **Nunca** escreva texto de lição direto no template de um componente.
- Defina e mantenha contratos em `core/models/`: `Phase`, `Module`, `Lesson`, `LessonStep`, `Exercise`, `Mission`, `Project`, `BugEntry`, `Assessment`, `Attempt`, `Achievement`, `Competency`, `Progress`.
- Cada item tem `id` estável (ex.: `js-closures-01`). IDs não mudam depois de publicados, porque o progresso salvo depende deles.
- Lições seguem, quando fizer sentido, as etapas: contexto → intuição → explicação técnica → código guiado → experimentação → prática → depuração → aplicação real → avaliação → revisão. Ajuste a profundidade ao assunto, não encha linguiça.
- Exercícios: enunciado, requisitos, exemplos, testes, dicas progressivas e solução comentada (liberada só após tentativa ou pedido explícito).
- Avaliações aceitam múltiplas soluções válidas. Teste o comportamento, não o texto exato do código.
- Todo feedback de resposta explica **por que** está certo ou errado.

Currículo: 14 fases (0 a 13), descritas em `docs/PRODUCT_SPEC.md` seção 5.

## Laboratório e execução isolada

- HTML/CSS: prévia em `<iframe sandbox="allow-scripts">` usando `srcdoc`. **Nunca** adicionar `allow-same-origin` junto com `allow-scripts`.
- JS/TS: executar em iframe sandbox ou Web Worker, comunicação só via `postMessage` com mensagens validadas.
- Timeout obrigatório: se passar do limite, destruir o iframe/worker e informar "tempo esgotado" (protege contra loop infinito).
- O ambiente de execução não pode acessar `localStorage` da app, progresso, tokens ou APIs internas.
- TS do estudante é transpilado no worker antes de rodar.
- Proibido `eval`, `new Function` ou `innerHTML` com código do estudante no contexto principal.
- Se o executor ainda não estiver pronto, o exercício é avaliado de outra forma real (ex.: perguntas, análise estática simples) e a UI deixa claro que a execução está planejada.

## Motor de aprendizagem

- Regras **determinísticas e transparentes**. Sem IA paga.
- Revisão espaçada simples e documentada (ex.: caixas de Leitner com intervalos de 1, 3, 7, 14 e 30 dias). Erro na revisão volta o conceito para a primeira caixa.
- A recomendação da próxima atividade considera: pré-requisitos, conceitos com revisão vencida, erros recorrentes, desempenho recente e dificuldade.
- **Toda recomendação mostra o motivo** ("Você errou 2 de 3 exercícios de narrowing na última sessão").
- A lógica fica em funções puras em `core/learning/`, com testes unitários cobrindo os casos principais.

## Competências e gamificação

- Nível de competência é calculado a partir de avaliações, exercícios independentes, retenção nas revisões e uso em projetos. Concluir um módulo **não** torna ninguém "avançado".
- XP: concedido na primeira conclusão de cada atividade. Repetir a mesma tarefa não gera XP cheio. Revisões geram XP reduzido.
- Níveis são motivacionais, não certificado. A UI não deve sugerir o contrário.
- Sequência de dias sem punição agressiva (perder a sequência não tira XP nem conquista).
- Proibido: loot box, recompensa aleatória, contador de pressão, notificação manipulativa.

## Persistência

- MVP: `localStorage` atrás de uma interface (ex.: `ProgressRepository`). Componentes nunca acessam `localStorage` direto.
- Dados salvos com `schemaVersion` e função de migração, para não perder progresso quando o modelo mudar.
- Não salvar dado sensível no navegador.
- A UI avisa que o progresso local não é backup. Oferecer exportar/importar progresso em JSON.
- A interface do repositório deve permitir trocar por um backend (futuro Spring Boot) sem reescrever as features.

## UI e design

- Tema escuro padrão (grafite profundo), superfícies em níveis de contraste, **uma** cor de destaque usada com moderação. Tema claro como preferência persistida.
- Tokens em custom properties: cores, espaçamento, raio, tipografia, sombras, duração de transição.
- Ícones de uma única biblioteca. Emoji não substitui ícone de interface.
- Visual de ferramenta profissional, não de jogo infantil. Evitar gradiente em tudo, brilho excessivo e animação que distrai. Respeitar `prefers-reduced-motion`.
- Todo componente interativo tem estados de hover, foco visível, desabilitado, carregamento, erro e sucesso.
- Responsivo de verdade em desktop, tablet e celular. Edição de código prioriza desktop, mas o resto não pode quebrar no celular.
- Ações destrutivas (resetar progresso, apagar tentativa) pedem confirmação.

## Acessibilidade

- HTML semântico primeiro; ARIA só quando a semântica nativa não resolver.
- Tudo operável por teclado, com ordem de foco lógica e foco visível.
- Contraste mínimo WCAG AA.
- Todo campo de formulário com `<label>`; erros associados ao campo e anunciados.
- O editor de código não pode prender o foco do teclado sem saída.

## Testes e definição de pronto

Uma feature só está pronta quando:
- Funciona no fluxo real, com dados reais do conteúdo.
- Tem testes nos pontos críticos (motor de recomendação, avaliação de exercícios, persistência, XP/conquistas, fluxos principais).
- Passa em lint, testes e build.
- Funciona por teclado e em tela pequena.
- Não tem link morto nem dado fictício.
- `docs/TASKS.md` foi atualizado.

## Como trabalhar neste repositório

- Trabalhe em fatias verticais. Primeiro fluxo obrigatório, ponta a ponta:
  **Dashboard → Lição → Exercício → Avaliação → Feedback → Progresso salvo.**
  Só expanda para outras áreas depois que esse fluxo funcionar.
- Ordem do MVP: fundação (layout, tokens, rotas, modelos) → fluxo principal → currículo/trilha → laboratório → revisões e recomendação → XP e conquistas → projetos → missões → bestiário → biblioteca → perfil → modo foco → qualidade final.
- Conteúdo mínimo do MVP: trilha completa das 14 fases (com introdução de cada uma), 3 lições completas (como o navegador interpreta HTML/CSS/JS; interface semântica e responsiva; JS transformando interface estática em interativa), exercícios funcionais para elas, desafios de depuração iniciais, um projeto guiado de HTML/CSS, um projeto introdutório de JS e um módulo de Angular com exemplos reais.
- Decida sozinho detalhes visuais e estruturais razoáveis. Pergunte só quando algo realmente bloquear.
- Não sobrescreva arquivo existente sem entender para que ele serve.
- Ferramenta indisponível? Adapte e diga o que ficou de fora. Nunca invente resultado de teste, build ou execução.
- Ao final de cada etapa, resuma: o que foi feito, o que foi verificado, limitações e próximo passo.

## Estado atual

> Atualize ao fim de cada sessão de trabalho.

- [x] Projeto Angular criado (2026-10-29)
- [x] Fundação (layout, tokens, rotas, modelos, persistência, configurações). Detalhes em `docs/TASKS.md`
- [x] Fluxo principal ponta a ponta (2026-10-29)
- [x] Demais áreas do MVP: Academia, laboratório, revisões e recomendação, XP e conquistas, projetos, missões, bestiário, biblioteca, competências, modo foco e módulo de Angular com exemplos executados nos testes (2026-10-29).
- [x] Qualidade final: auditoria de a11y (axe, 117 páginas + 14 estados), responsividade (320–1400 px, medição corrigida em D-050), segurança (validação do progresso importado, CSP medida), README (2026-10-29)
- [x] Conteúdo mínimo do MVP: 14 fases, as 3 lições pedidas + módulo de Angular, exercícios, depuração, projetos de HTML/CSS e JS (2026-10-29). Próximo: definir com o usuário (ver `docs/TASKS.md`, limitações conhecidas)
- [x] Trilha completa: as 14 fases (0 a 13) com conteúdo, 43 lições e 3 projetos guiados (incluindo o capstone), com exemplos executados nos testes e afirmações medidas (D-045 a D-069) (2026-10-30). Todas as fases de 0 a 12 têm ao menos três lições; 7 missões e 12 entradas no Bestiário (D-068). Próximo: definir com o usuário (mais profundidade por fase ou backend). Ver `docs/TASKS.md`.
- [x] Backend local opcional (`backend/`, Spring Boot 4.1): contas (sessão HttpOnly, CSRF, bcrypt, limite de tentativas), progresso por conta via `HttpProgressRepository`, validação na fronteira e ETag/If-Match; só em 127.0.0.1 (D-070, D-071) (2026-10-30). Modo escolhido em Configurações → Onde salvar o progresso (D-072). `npm run app` sobe frontend e API num processo só (D-073). Próximo: HTTPS, cookie Secure e limite de tentativas compartilhado antes de publicar; PostgreSQL.
