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
- **Estado**:
  - Redux Toolkit (`configureStore`) em `src/renderer/store.ts`.
  - RTK Query (`createApi`) para chamadas HTTP ao backend de timesheets.

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
    - Resolve `baseUrl` a partir de `hostsByEnv`.
    - Garante que `args.url` seja prefixada com o host correto quando relativa.

- **Endpoint principal**:
  - `getQueueJobs`: `GET /api/v1/Sync/queue-jobs`
  - Parâmetros aceitos pelo hook:
    - `status?: TimesheetSyncJobStatus` (ex.: `Enqueued`, `Processing`, `Completed`, `Failed`).
    - `page: number` (1-based).
    - `pageSize: number`.
    - `driverName?: string`.
    - `email?: string`.
    - `timeSheetDate?: string` (enviado como `YYYY-MM-DDT00:00:00Z`).
  - Tipos TypeScript principais:
    - `TimesheetSyncJobPage` → `{ totalCount, page, pageSize, items }`.
    - `TimesheetSyncJobInfo` → campos do job + `payload: SyncData`.
    - `SyncData`, `DriverSyncData`, `TimesheetSyncData`, `ServicesSyncData`, `SyncActionEnum`.

## Controle de ambiente

- Slice: `src/renderer/features/timesheet/environmentSlice.ts`
  - Estado:
    - `current: "develop" | "qa" | "prod"`.
  - Ações:
    - `setEnvironment(env: EnvironmentKey)`.

- Componente: `src/renderer/features/timesheet/EnvironmentSelector.tsx`
  - Combobox “Ambiente” na AppBar.
  - Opções: Develop / Qualidade / Produção.
  - Ao alterar, dispara `setEnvironment`, impactando o host usado por RTK Query.

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
    - `filters` (status, driverName, email, timeSheetDate).
    - `page`, `pageSize`.
    - `searchTrigger` (força refetch).
    - `selectedJob` (para detalhes).
    - `showError` (snackbar).
  - Interação com API:
    - Monta `queryParams` memorizados e chama `useGetQueueJobsQuery`.
    - `handleSearch()`:
      - Reseta página para 1.
      - Incrementa `searchTrigger`.
    - `handleClear()`:
      - Limpa filtros, reseta página e dispara nova busca.

## Filtros de pesquisa

- Arquivo: `src/renderer/features/timesheet/TimesheetFilters.tsx`

- Recebe via props:
  - `values`: objeto com `status`, `driverName`, `email`, `timeSheetDate`.
  - `onChange(values)`.
  - `onSearch()`.
  - `onClear()`.
  - `loading: boolean`.

- UI:
  - `Paper` com:
    - Cabeçalho (título, descrição curta, spinner opcional).
    - Grid de campos:
      - `Select` de `status` + opção “Padrão (Enqueued)”.
      - `TextField` para nome.
      - `TextField` para e-mail.
      - `TextField` `type="date"` para data de timesheet.
    - Rodapé com botões:
      - **Limpar filtros**: desabilitado se não há filtros ativos.
      - **Buscar**: desabilitado quando `loading`.

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
    - `timeSheetDate` (data).
    - `createdAtUtc`, `lastUpdatedAtUtc` (data/hora formatadas).
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

