## TimesheetImportTrace

Monitor de jobs de sincronização de timesheets (**Electron + React + TypeScript + Redux Toolkit + Material UI**).

Aplicação desktop usada para:
- Consultar os jobs de sincronização de timesheets.
- Filtrar por status, motorista, e-mail e intervalo de datas.
- Ver detalhes do payload enviado para o backend.

---

### 1. Requisitos

- **Node.js** 18+ (recomendado)  
- **npm**  
- Windows 10+ (build de produção atual focado em Windows)

---

### 2. Instalação

```bash
npm install
```

> Após o `npm install`, é executado automaticamente `electron-rebuild` (script `postinstall`) para recompilar módulos nativos como `better-sqlite3` para a versão do Electron usada pelo projeto.

---

### 3. Desenvolvimento (debug)

Subir o app em modo desenvolvimento:

```bash
npm run dev
```

Esse comando:
- Sobe o **renderer** com Vite em `http://localhost:5173`.
- Compila o processo **main** (`src/main`) com TypeScript.
- Abre o Electron apontando para o Vite.

Arquivos principais:
- Processo main: `src/main/main.ts`
- Preload: `src/preload/preload.ts`
- Renderer (React): `src/renderer/main.tsx` → `AppShell` → `TimesheetPage`.

---

### 4. Scripts principais

- `npm run dev`  
  Sobe o app em modo desenvolvimento (Electron + Vite).

- `npm run build`  
  Gera build do renderer (Vite) e do processo main (TypeScript) para a pasta `dist/`.

- `npm run build:win`  
  - Roda `npm run rebuild`.
  - Roda `npm run build`.
  - Empacota com `electron-builder` para Windows (instalador NSIS + build x64).

- `npm run build:win:portable`  
  Gera uma versão **portável** (portable) do app para Windows.

- `npm run lint`  
  Roda ESLint em `src/**/*.{ts,tsx}`.

- `npm run rebuild`  
  Executa `electron-rebuild` manualmente para recompilar módulos nativos para a versão do Electron atual.

---

### 5. Ambientes de API

A API de timesheets é acessada via RTK Query (`src/renderer/services/timesheetApi.ts`) e suporta os ambientes:

- `develop`: `https://api-transporter.dev.transporter.brqapps.com`
- `qa`: `https://api-transporter.qa.transporter.brqapps.com`
- `prod`: `https://api-transporter.prod.transporter.brqapps.com`
- `local`: usa o host digitado pelo usuário (ex.: `http://localhost:5000`)

O ambiente atual é controlado pelo slice `environment` e selecionado pela combobox **Ambiente** na AppBar (`EnvironmentSelector`).

Quando o usuário altera o ambiente:
- O host base da API é atualizado.
- A chave da query inclui um campo técnico `_env`, o que faz o RTK Query **refazer automaticamente** a chamada da API com o novo ambiente.

---

### 6. Onde fica o banco SQLite (`settings.db`)

Persistência de preferências (ambiente atual e host local) é feita via **SQLite** usando `better-sqlite3` no processo main (`src/main/storage.ts`).

- **Em desenvolvimento (`npm run dev`)**  
  - O arquivo fica em: `app.getPath("userData")/settings.db`  
  - Exemplo no Windows: algo como  
    `C:\Users\<Usuário>\AppData\Roaming\TimesheetImportTrace\settings.db`

- **Em build / produção (aplicativo empacotado)**  
  - O arquivo fica **na mesma pasta do executável** (`.exe`):  
    - Caminho base: `path.dirname(app.getPath("exe"))`
    - Arquivo: `settings.db`

Isso facilita cenários portáteis (copiar pasta com `.exe` + `settings.db` para outra máquina).

---

### 7. Build para Windows

1. Gerar os artefatos de build (renderer + main) e empacotar:

```bash
npm run build:win
```

2. Para gerar a versão portável (sem instalador):

```bash
npm run build:win:portable
```

Notas:
- O Electron carrega o frontend a partir de `dist/renderer/index.html`.
- O processo main, ao rodar empacotado, usa:
  - `__dirname ≈ dist/main/main`
  - Caminho para o `index.html` resolvido como: `../../renderer/index.html`.

---

### 8. Fluxo da tela principal

- `AppShell` (layout + AppBar + seletor de ambiente).
- `TimesheetPage`:
  - Filtros (`TimesheetFilters`).
  - Grid paginada (`TimesheetJobsGrid`).
  - Drawer de detalhes (`JobDetailsDrawer`).
  - Snackbar de erro.

Quando o usuário:
- Ajusta filtros e clica em **Buscar** → incrementa `_ts`, força nova chamada à API.
- Muda de ambiente → `_env` muda, a query de jobs é automaticamente refeita para o novo host.
- Clica em uma linha da grid → abre o drawer com detalhes do job e **mostra apenas o objeto do `payload`** formatado em JSON.

---

### 9. Observações

- Se o `npm install` acusar arquivos bloqueados no Windows (`EBUSY` / `ENOTEMPTY`), feche terminais/IDE que possam estar usando `node_modules` e tente novamente.
- Se houver erro de módulo nativo (`better-sqlite3` compilado para versão diferente do Node/Electron), rode:

```bash
npm run rebuild
```

---

### 10. Short English summary

- **Stack**: Electron + React + TypeScript + Redux Toolkit + Material UI + RTK Query + SQLite (`better-sqlite3`).
- **Purpose**: Desktop app to monitor paginated timesheet sync jobs and inspect payloads.
- **Dev**: `npm run dev`.
- **Windows build**: `npm run build:win` (installer) or `npm run build:win:portable` (portable).
- **SQLite location**:
  - Dev: `app.getPath("userData")/settings.db`
  - Prod: next to the app `.exe` (`settings.db` in the same folder).

