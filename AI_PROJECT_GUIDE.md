## Visão geral do projeto

- **Nome**: TimesheetImportTrace  
- **Tipo**: App desktop com **Electron + React + TypeScript + Redux Toolkit + Material UI**  
- **Objetivo**: Consultar o log de importação de timesheets, exibindo o estado atual dos jobs de sincronização (`TimesheetSyncJobInfo`) de forma paginada e filtrável.

## Stack e ferramentas principais

- **Electron**: processo principal em `src/main/main.ts`, empacotado via `electron-builder`.
- **Frontend**:
  - React 18+ com TypeScript.
  - Vite (`root` em `src/renderer`) para dev/build do renderer.
  - Material UI (`@mui/material`, `@emotion/*`) para UI.
  - `@mui/x-data-grid` para grid paginada de jobs.
  - `dayjs` para formatação de datas na grid.
- **Estado**:
  - Redux Toolkit (`configureStore`) em `src/renderer/store.ts`.
  - RTK Query (`createApi`) para chamadas HTTP ao backend de timesheets.
  - Preferências de ambiente armazenadas apenas em memória (Redux state), não persistidas em disco.

## Estrutura relevante de pastas (renderer)

- `src/renderer/main.tsx`
  - Ponto de entrada do React.
  - Envolve a aplicação com:
    - `ThemeProvider` usando o tema custom em `theme.ts`.
    - `CssBaseline`.
    - `Provider` do Redux com `store`.
    - Renderiza o `AppShell`.

- `src/renderer/theme.ts`
  - Tema Material UI **claro**, com:
    - Paleta primária azul arroxeada.
    - Secundária laranja para destaques/avisos.
    - `background.default` suave.
    - `shape.borderRadius` mais alto (UI moderna).
    - Overrides para `MuiAppBar`, `MuiButton`, `MuiPaper`, `MuiTextField` com:
      - Gradiente + blur na AppBar.
      - Botões pill com animação de hover.
      - Cards (`Paper`) com sombra e leve “lift” no hover.

- `src/renderer/store.ts`
  - Configura o `configureStore` com:
    - `timesheetApi.reducer` (RTK Query) em `reducerPath: "timesheetApi"`.
    - `environmentReducer` (controle de ambiente atual).
    - Middleware: `getDefaultMiddleware().concat(timesheetApi.middleware)`.
  - Expõe `RootState` e `AppDispatch` para tipar hooks.

- `src/renderer/hooks.ts`
  - Hooks tipados:
    - `useAppDispatch()`.
    - `useAppSelector`.

## API de timesheets (RTK Query)

- Arquivo: `src/renderer/services/timesheetApi.ts`

- **Ambientes suportados** (backend):
  - `develop`: `https://api-transporter.dev.transporter.brqapps.com`
  - `qa`: `https://api-transporter.qa.transporter.brqapps.com`
  - `prod`: `https://api-transporter.prod.transporter.brqapps.com`

- **BaseQuery dinâmica**:
  - `dynamicBaseQuery` lê `state.environment.current` (slice `environment`) e:
    - Resolve `baseUrl` a partir de `hostsByEnv` ou do `customHost` quando o ambiente é `local`.
    - Normaliza o host (`/` finais) e faz o join seguro com o path da requisição.
  - A chave da query inclui campos técnicos (`_ts`, `_env`) para forçar **refetch automático** quando:
    - O usuário clica em **Buscar** (`_ts` muda).
    - O ambiente/host muda (`_env` muda), garantindo nova chamada de API ao mudar de ambiente.

- **Endpoint principal**:
  - `getQueueJobs`: `GET /api/v1/Sync/queue-jobs`
  - Parâmetros aceitos pelo hook (`QueueJobsQuery`):
    - `status?: TimesheetSyncJobStatus` (ex.: `Enqueued`, `Processing`, `Completed`, `Failed`).
    - `page: number` (1-based).
    - `pageSize: number`.
    - `driverName?: string`.
    - `email?: string`.
    - `timeSheetDateIni?: string` – data/hora inicial no formato `YYYY-MM-DDTHH:mm:ss` (frontend envia `T00:00:00`).
    - `timeSheetDateEnd?: string` – data/hora final no formato `YYYY-MM-DDTHH:mm:ss` (frontend envia `T23:59:59`).
  - Tipos TypeScript principais:
    - `TimesheetSyncJobPage` → `{ totalCount, page, pageSize, items }`.
    - `TimesheetSyncJobInfo` → campos do job + `payload: SyncData`.
    - `SyncData`, `DriverSyncData`, `TimesheetSyncData`, `ServicesSyncData`, `SyncActionEnum`.

- **Notas sobre serialização de propriedades**:
  - O backend C# expõe modelos em PascalCase (`JobId`, `TimeSheetDate`, `CreatedAtUtc`, etc.).
  - O tipo `TimesheetSyncJobInfo` no frontend aceita **camelCase e PascalCase** simultaneamente (campos duplicados) para ser resiliente à forma como a API serializa.

## Controle de ambiente

- Slice: `src/renderer/features/timesheet/environmentSlice.ts`
  - Estado:
    - `current: "develop" | "qa" | "prod" | "local"`.
    - `customHost: string` para armazenar o host digitado quando o ambiente é `local`.
  - Ações:
    - `setEnvironment(env: EnvironmentKey)`.
    - `setLocalHost(host: string)`.

- Componente: `src/renderer/features/timesheet/EnvironmentSelector.tsx`
  - Combobox “Ambiente” na AppBar.
  - Opções: **Develop / Qualidade / Produção / Local**.
  - Ao alterar, dispara `setEnvironment`, impactando o host usado por RTK Query **e disparando automaticamente nova consulta via RTK Query (por causa do campo `_env` na chave da query)**.
  - Quando `Local` está selecionado:
    - Exibe um `TextField` logo abaixo para digitar o host (ex.: `http://localhost:5000`).
    - O valor do campo é salvo em `customHost` via `setLocalHost`.
  - **Nota**: As preferências de ambiente não são persistidas. A seleção é mantida apenas em memória (Redux state) enquanto o app estiver aberto. Ao fechar e reabrir, o ambiente volta ao padrão (Develop).

## Layout principal da tela

- `src/renderer/AppShell.tsx`
  - Estrutura:
    - `AppBar` fixa com:
      - Logo “TI”.
      - Título/subtítulo explicando o monitor de jobs.
      - `EnvironmentSelector` à direita.
    - `Container` `maxWidth="lg"` para o conteúdo.
    - Renderiza `TimesheetPage`.
  - Usa efeito de `Slide` para esconder/mostrar AppBar ao rolar.

- `src/renderer/features/timesheet/TimesheetPage.tsx`
  - Página principal que orquestra:
    - Filtros (`TimesheetFilters`).
    - Grid (`TimesheetJobsGrid`).
    - Drawer de detalhes (`JobDetailsDrawer`).
    - Snackbar de erro.
  - Estado local:
    - `filters` (status, driverName, email, timeSheetDateIni, timeSheetDateEnd).
    - `page`, `pageSize`.
    - `searchTrigger` (força refetch).
    - `selectedJob` (para detalhes).
    - `showError` (snackbar).
  - Interação com API:
    - Monta `queryParams` memorizados e chama `useGetQueueJobsQuery`.
    - Converte datas do filtro para:
      - `timeSheetDateIni = {dataIni}T00:00:00`.
      - `timeSheetDateEnd = {dataEnd}T23:59:59`.
    - Por padrão:
      - `timeSheetDateIni` = dia atual.
      - `timeSheetDateEnd` = último dia do mês corrente.
    - `handleSearch()`:
      - Reseta página para 1.
      - Incrementa `searchTrigger`.
    - `handleClear()`:
      - Limpa filtros, reseta página e dispara nova busca.

## Filtros de pesquisa

- Arquivo: `src/renderer/features/timesheet/TimesheetFilters.tsx`

- Recebe via props:
  - `values`: objeto com `status`, `driverName`, `email`, `timeSheetDateIni`, `timeSheetDateEnd`.
  - `onChange(values)`.
  - `onSearch()`.
  - `onClear()`.
  - `loading: boolean`.

- UI:
  - `Paper` com:
    - Cabeçalho (título, descrição curta, spinner opcional).
    - Grid de campos:
      - `Select` de `status` com opção **“Sem filtro de status”** (valor vazio).
      - `TextField` para nome.
      - `TextField` para e-mail.
      - `TextField` `type="date"` para **Data inicial**.
      - `TextField` `type="date"` para **Data final**.
    - Regras:
      - Botão **Limpar filtros** limpa apenas status/nome/email e restaura datas para:
        - `timeSheetDateIni` = hoje.
        - `timeSheetDateEnd` = último dia do mês corrent e.
      - Botão **Buscar** desabilitado quando `loading`.

## Grid paginada de resultados

- Arquivo: `src/renderer/features/timesheet/TimesheetJobsGrid.tsx`

- Props:
  - `data?: TimesheetSyncJobPage`.
  - `page`, `pageSize`, `onPageChange`, `onPageSizeChange`.
  - `loading`, `fetching`.
  - `onSelectJob(job)`.

- Implementação:
  - Usa `DataGrid` (`@mui/x-data-grid`) em `Paper`.
  - Modo de paginação **server-side**:
    - `page` da API é 1-based; `DataGrid` usa 0-based → conversão feita internamente.
    - `pageSizeOptions`: 10, 25, 50.
    - `rowCount` = `data.totalCount`.
  - Colunas:
    - `jobId` truncado, tooltip com valor completo.
    - `status` usando `Chip` com cores contextuais.
    - `driver` (nome + email, vindos de `payload.driver`).
    - `driverInternalNumber`.
    - `timeSheetDate` (data), usando `dayjs` + `format("DD/MM/YYYY")` e lendo tanto `timeSheetDate` quanto `TimeSheetDate`.
    - `createdAtUtc`, `lastUpdatedAtUtc` (data/hora formatadas com `dayjs` em `DD/MM/YYYY HH:mm`, lendo camelCase e PascalCase).
    - `errorMessage` (texto vermelho truncado, tooltip com completo).
  - Estados visuais:
    - Enquanto `loading` sem dados → skeleton de texto + bloco retangular.
    - Hover em linha: `bgcolor: action.hover`, cursor pointer.
    - Texto auxiliar inferior com total de registros e página atual.

## Detalhes do job (payload)

- Arquivo: `src/renderer/features/timesheet/JobDetailsDrawer.tsx`

- Props:
  - `job?: TimesheetSyncJobInfo | null`.
  - `open: boolean`.
  - `onClose()`.

- Comportamento:
  - Abre como `Drawer` lateral direito ao clicar em uma linha da grid.
  - Mostra:
    - Cabeçalho com ID do job e botão para fechar.
    - Chip de status (cores conforme estado).
    - Informações do motorista (nome, e-mail, código interno).
    - Contagem de timesheets no payload.
    - Bloco `pre` com `JSON.stringify({ payload, errorMessage }, null, 2)` para debug.

## Feedbacks, animações e UX

- AppBar com transição de `Slide` baseada em rolagem.
- `Paper` e botões com transições CSS (hover leve, sombras, translateY).
- Skeleton loaders na área da grid quando a primeira busca está em andamento.
- `Snackbar` + `Alert` aparecem na parte inferior em caso de erro ao carregar jobs, com transição `Slide` para cima e fechamento automático.

## Como uma IA deve usar este guia

- Para entender **onde implementar novas features de UI**:
  - Procurar primeiro em `src/renderer/features/timesheet/*`.
  - Usar `TimesheetPage` como ponto de orquestração de tela.

- Para **novas chamadas de API relacionadas a timesheets**:
  - Estender ou criar endpoints no `timesheetApi`.
  - Conectar via hooks RTK Query (`useXxxQuery`, `useXxxMutation`) dentro de componentes de features.

- Para ajustes de **tema / identidade visual**:
  - Modificar `src/renderer/theme.ts` (cores, tipografia, overrides de componentes).

- Para manipular **ambientes / hosts**:
  - Ajustar `hostsByEnv` em `timesheetApi.ts` ou o slice `environmentSlice` caso surjam novos ambientes.

