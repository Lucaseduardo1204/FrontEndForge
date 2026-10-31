# Frontend Forge

Plataforma web de formação em desenvolvimento frontend, do funcionamento da web até Angular
profissional. Ensina com conteúdo real, exercícios avaliados de verdade, progresso salvo e revisão
espaçada. Funciona inteira no navegador, sem conta e sem serviços pagos; um servidor local com
contas é opcional.

Estado do MVP e próximos passos: [`docs/TASKS.md`](docs/TASKS.md).

## Como rodar (passo a passo)

### 1. Confira se você tem o que precisa

Abra um terminal e rode:

```bash
node -v      # precisa ser v24 ou mais novo
java -version   # precisa ser 21 ou mais novo
```

Se algum comando não for encontrado, instale o [Node.js](https://nodejs.org) (versão 24 LTS) e um
JDK 21 (por exemplo, o [Eclipse Temurin](https://adoptium.net)). O Maven **não** precisa ser
instalado: ele vem junto no projeto (`backend/mvnw`).

### 2. Instale as dependências (só na primeira vez)

Na pasta do projeto:

```bash
npm install
```

### 3. Rode o app

```bash
npm run app
```

Esse comando faz o build do frontend, empacota tudo junto com o servidor e o inicia. A primeira
vez demora mais, porque baixa as dependências do Java. Quando aparecer
`Started BackendApplication` no terminal, abra no navegador:

**http://127.0.0.1:8080**

Para parar, volte ao terminal e aperte `Ctrl + C`.

### 4. Escolha onde salvar o seu progresso

Por padrão, o progresso fica salvo **neste navegador**: não precisa criar conta. Se preferir
guardar numa conta, no servidor:

1. Abra **Configurações → Onde salvar o progresso**.
2. Escolha **"No servidor desta instalação, com uma conta"** e confirme. A página recarrega.
3. Na seção **Conta**, crie a sua conta ou entre.

Trocar de modo não leva o progresso junto. Para levar, use **Exportar** antes e **Importar** depois,
na mesma tela.

### Para mexer no código (desenvolvimento)

`npm run app` refaz o build a cada execução. Para editar o frontend e ver as mudanças na hora, use:

```bash
npm start
```

e abra **http://localhost:4200**. A página recarrega sozinha a cada mudança. Esse modo roda só o
frontend; para usar o modo servidor nele, rode também o backend em outro terminal
(`cd backend && ./mvnw spring-boot:run`). O `npm start` encaminha `/api` para ele.

### Se algo der errado

| Sintoma                                          | O que fazer                                                                                                                                                                        |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Port 8080 was already in use`                   | Outro programa usa a porta. Feche-o, ou rode em outra porta: `npm run app -- --server.port=9090` e abra http://127.0.0.1:9090.                                                     |
| `java: command not found` ou versão menor que 21 | Instale o JDK 21 (passo 1) e abra um terminal novo.                                                                                                                                |
| `./mvnw: Permission denied`                      | Rode `chmod +x backend/mvnw` uma vez.                                                                                                                                              |
| No Windows, `npm run app` não funciona           | O script foi feito para Linux e macOS. Use o WSL, ou rode `npm run build` e depois, dentro de `backend`, `mvnw.cmd package` e `java -jar target\frontend-forge-backend-0.1.0.jar`. |
| A opção "No servidor" aparece desabilitada       | O app não encontrou o servidor: confira se ele está rodando e se você abriu o endereço da porta 8080.                                                                              |
| Quer apagar todas as contas locais               | Pare o servidor e apague a pasta `backend/data/`.                                                                                                                                  |

## O que tem

| Área                          | O que faz                                                                                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Central de comando            | Próxima atividade recomendada, sempre com o motivo; revisões do dia; progresso.                                                           |
| Academia                      | Trilha de 14 fases (0 a 13) com introdução, tópicos e pré-requisitos. Fases sem conteúdo publicado aparecem como "Planejado".             |
| Lições                        | Etapas de contexto → intuição → explicação → código guiado → experimentação → prática → depuração → aplicação real → avaliação → revisão. |
| Laboratório                   | Exercícios de HTML, CSS, JavaScript e TypeScript avaliados por testes de comportamento, executados em ambiente isolado.                   |
| Revisões                      | Revisão espaçada com caixas de Leitner (1, 3, 7, 14 e 30 dias).                                                                           |
| Missões, projetos e bestiário | Situações reais de trabalho, projetos guiados com verificação automática e bugs comuns para diagnosticar.                                 |
| Biblioteca                    | Referência técnica com fontes oficiais.                                                                                                   |
| Competências, XP e conquistas | Calculados a partir do histórico de respostas, com regras públicas. Níveis são motivacionais, não certificado.                            |
| Modo foco                     | Sessão com tempo escolhido, plano sugerido e resumo do que você demonstrou ter aprendido.                                                 |

## Comandos de desenvolvimento

Testado com Node.js 24.18, npm 11 e Java 21.

```bash
npm install          # dependências
npm start            # servidor de desenvolvimento em http://localhost:4200
npm test             # testes unitários e de integração (Vitest), execução única
npm run test:watch   # testes em modo observação
npm run lint         # ESLint (TS + templates + acessibilidade)
npm run format       # Prettier
npm run build        # build de produção em dist/frontend-forge/browser
npm run app          # tudo num processo: build + servidor em http://127.0.0.1:8080
```

Antes de considerar uma mudança pronta: `npm test`, `npm run lint` e `npm run build`.

## Backend (opcional, local)

`backend/` tem um servidor Spring Boot 4.1 (Java 21) com contas e progresso por conta, como
alternativa ao `localStorage`. Por padrão, a aplicação **continua usando o navegador**; o backend
é opt-in. Com `npm run app`, o mesmo servidor entrega o frontend e a API no mesmo endereço (sem
proxy e sem CORS); links diretos para qualquer página funcionam, e os arquivos com hash no nome
ficam em cache por um ano, enquanto o `index.html` é sempre revalidado (D-073).

```bash
cd backend
./mvnw test                 # testes do backend (MockMvc e um Tomcat real)
./mvnw spring-boot:run      # servidor em http://127.0.0.1:8080 (só nesta máquina)
```

Com o servidor rodando, abra **Configurações → Onde salvar o progresso** e escolha "No servidor
desta instalação". A página recarrega, aparece a seção **Conta**, e o progresso passa a ser salvo
na sua conta. Sem o servidor, a opção aparece desabilitada, com o motivo. Trocar de modo não leva o
progresso junto: use Exportar e Importar. O `npm start` encaminha `/api` para `127.0.0.1:8080`
(`proxy.conf.json`), então não é preciso CORS.

Segurança: sessão em cookie `HttpOnly` e `SameSite=Lax`, proteção CSRF (cookie `XSRF-TOKEN` e
cabeçalho `X-XSRF-TOKEN`), senhas com hash bcrypt, limite de tentativas de login e progresso
separado por conta. O servidor escuta só em `127.0.0.1`: publicá-lo exige HTTPS, cookie `Secure`
e um limite de tentativas compartilhado entre instâncias (ver D-071).

## Stack

Angular 22 (componentes standalone, signals, zoneless, controle de fluxo nativo), TypeScript 6 em
modo `strict`, SCSS com design tokens, Vitest via `ng test`, angular-eslint e Prettier. Ícones de
`@lucide/angular`; `sucrase` transpila o TypeScript do estudante dentro de um worker. A justificativa
de cada dependência está em [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Estrutura

```
src/app/
  core/        # modelos, persistência, motor de aprendizagem (funções puras), laboratório, gamificação
  layout/      # shell, barra lateral, cabeçalho
  shared/      # componentes reutilizáveis (blocos de conteúdo, player de exercício, editor, prévia)
  features/    # uma pasta por área, carregada sob demanda pelo roteador
src/content/   # todo o conteúdo educacional, como dados tipados
docs/          # especificação, decisões e tarefas
```

## Conteúdo

Todo o conteúdo fica em `src/content/` como dados TypeScript tipados pelos contratos de
`src/app/core/models/`. Nenhum texto de lição fica em template de componente.

- Cada item tem um `id` estável. **Não mude um `id` publicado**: o progresso salvo depende dele.
- Registre o item novo em `src/content/index.ts`.
- `content-integrity.spec.ts` verifica referências (exercícios, conceitos, módulos, fases), ids
  duplicados e tabelas. As soluções de referência dos exercícios de código são executadas contra os
  próprios testes (`lab-solutions.spec.ts`, `project-solutions.spec.ts`), e os exemplos de Angular
  da lição de componentes são compilados e executados (`angular-examples.spec.ts`). Conteúdo novo
  com código deve seguir o mesmo padrão: o que a lição afirma, um teste comprova.

## Segurança

- **Código do estudante nunca roda no contexto da aplicação.** JavaScript e TypeScript rodam em um
  Web Worker criado a partir de uma URL `data:` (origem opaca), sem rede nem armazenamento, com tempo
  limite e encerramento do worker. HTML e CSS são exibidos em `<iframe sandbox="allow-scripts">` (sem
  `allow-same-origin`) com CSP própria: os scripts do estudante não rodam na prévia, só os testes.
  Toda mensagem que volta dos ambientes isolados é validada e tem tamanho limitado.
- Não há `eval`, `new Function` nem `innerHTML` com conteúdo do estudante na aplicação, e nenhum uso
  de `bypassSecurityTrust*`. A interpolação do Angular escapa todo texto.
- Progresso importado é tratado como dado não confiável: cada campo é validado contra o modelo antes
  de ser aceito, e o erro diz onde está o problema.
- Nenhuma chave ou credencial no código. Integrações futuras (por exemplo, com IA) devem passar por
  um backend.

## Publicação

O build é um site estático. Qualquer hospedagem estática serve, desde que caminhos desconhecidos
devolvam `index.html` (fallback de SPA), porque as rotas são do lado do cliente.

Cabeçalhos HTTP recomendados (testados com o laboratório funcionando):

```
Content-Security-Policy: object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
```

Uma CSP que restrinja scripts (`script-src`/`worker-src`) **quebra o laboratório**: a prévia
(`srcdoc`) e o worker (`data:`) herdam a política da página, e o executor precisa avaliar o código do
estudante. Se isso acontecer, o laboratório informa que o ambiente isolado não iniciou e não registra
tentativa. O caminho para uma CSP estrita é servir os executores em uma origem separada
(ver D-046 em [`docs/DECISIONS.md`](docs/DECISIONS.md)).

## Seus dados

Por padrão, o progresso fica salvo apenas no `localStorage` deste navegador. Isso **não é backup**: limpar os
dados do site apaga tudo. Use Configurações → Exportar progresso para guardar um arquivo JSON, e
Importar para restaurá-lo (inclusive em outro navegador). Nenhum dado sai do seu computador.
No modo servidor (Configurações), o progresso fica num banco H2 em `backend/data/`, também só na sua máquina.

## Acessibilidade

Meta: WCAG 2.2 AA. Tudo é operável por teclado, com foco visível e link para pular ao conteúdo; o
editor de código não prende o foco (Esc e depois Tab). Temas escuro e claro, e
`prefers-reduced-motion` é respeitado. A auditoria automatizada da última versão está descrita em
[`docs/TASKS.md`](docs/TASKS.md).

## Documentação

- [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md): especificação do produto
- [`docs/DECISIONS.md`](docs/DECISIONS.md): decisões de arquitetura
- [`docs/TASKS.md`](docs/TASKS.md): tarefas, estado do MVP e limitações conhecidas
