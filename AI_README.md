# AI README – TrackUp Electron App

Purpose: This guide gives AI agents a fast, safe playbook to work on this repo. It explains the architecture, entry points, commands, and rules to avoid breaking security or conventions.

Repository stack

- Electron + electron-vite
- TypeScript
- Vue 3 + Pinia + Vue Router + PrimeVue

Core entry points

- Main process (Electron): src/main/index.channels.ts
- Window classes: src/main/windows/\*.ts (MainWindow.ts)
- IPC registry: src/main/ipc/index.channels.ts (imports per-domain files: app.ipc.ts, window.ipc.ts, …)
- Preload: src/preload/index.channels.ts (exposes window.api)
- Preload bridges: src/preload/bridges/\*.bridge.ts
- Renderer entry: src/renderer/src/main.ts
- Shared contracts (channels/types): src/shared/contracts/\*\*
- Deep links: src/main/protocols/deepLink.ts
- Security: src/main/security/hardening.ts

Run commands (Windows cmd.exe)

- Install deps:
  npm install
- Dev (HMR):
  npm run dev
- Typecheck TS:
  npm run typecheck
- Lint:
  npm run lint
- Format with Prettier:
  npm run format
- Build app:
  npm run build
- Build + package for Windows:
  npm run build:win

Architecture rules (must follow)

- Do not use ipcRenderer directly in renderer. Only call window.api.<domain>.\* exposed by preload bridges.
- Define channels per domain under src/shared/contracts/channels/<domain>.ts and aggregate in src/shared/contracts/channels.ts.
- Each domain has:
    - Main-side IPC file: src/main/ipc/<domain>.ipc.ts
    - Preload bridge: src/preload/bridges/<domain>.bridge.ts
    - Optional main service: src/main/services/<Domain>Service.ts
- Security: BrowserWindow must use contextIsolation: true, nodeIntegration: false. setWindowOpenHandler must synchronously return { action: 'deny' } and use shell.openExternal for URLs. Keep applySecurity() active.
- Validate inputs in main IPC handlers before calling services. Prefer types + runtime checks.
- Never expose sensitive Node capabilities to renderer via window.api.
- tsconfig.node.json and tsconfig.web.json must include src/shared/\*_/_ when shared content is added.

Deep link flow (trackup://)

- Registration is handled in src/main/protocols/deepLink.ts at app startup.
- App forwards deep link URLs to renderer via CHANNELS.auth.callbackUrl.
- Renderer (useAuth.ts) listens via window.api.auth.onCallbackUrl, extracts code, and completes Supabase session.

Common patterns

- Add a new domain “settings”:
    1. Channels: src/shared/contracts/channels/settings.ts (export SETTINGS_CHANNELS), aggregate in shared/contracts/channels.ts
    2. Main IPC: src/main/ipc/settings.ipc.ts (register handlers), add to src/main/ipc/index.channels.ts
    3. Preload: src/preload/bridges/settings.bridge.ts; add to window.api in src/preload/index.channels.ts and type in src/preload/index.preload.d.ts
    4. Renderer: call window.api.settings.get()/set() and subscribe to events
    5. Validate IPC inputs; do not expose Node APIs directly
- Open external link from renderer:
    - Call await window.api.app.openExternal(url). The main validates http(s) scheme and uses shell.openExternal.
- Window controls:
    - window.api.window.minimize/maximize/close and isMaximized()

Testing and quality gates

- After edits, run:
  npm run typecheck
  npm run lint
  npm run dev
- Fix any TS or ESLint issues before committing. Use npm run format to normalize line endings and style.

Known pitfalls

- setWindowOpenHandler must not be async; it must return a WindowOpenHandlerResponse immediately or TypeScript will error.
- Deep links in dev require correct protocol registration with app.setAsDefaultProtocolClient; see deepLink.ts.
- Renderer must never import electron or use Node APIs; use only window.api.\*.
- If you add shared files but TS cannot find them, ensure tsconfig.node.json and tsconfig.web.json include src/shared/\*_/_.

Checklist for AI contributions

- [ ] New domain: channels file created, IPC and bridge created, aggregated and wired
- [ ] No direct ipcRenderer in renderer code
- [ ] Security: no unsafe exposure via window.api, window open handler returns { action: 'deny' }
- [ ] tsconfig includes updated if new shared files were added
- [ ] typecheck/lint/format pass

File map quick reference

- Channels (aggregator): src/shared/contracts/channels.ts
- Channels (per domain): src/shared/contracts/channels/{app,auth,window}.ts
- IPC: src/main/ipc/{app,auth?,window}.ipc.ts
- Windows: src/main/windows/MainWindow.ts, src/main/windows/WindowManager.ts
- Preload bridges: src/preload/bridges/{app,auth,window}.bridge.ts
- Preload types: src/preload/index.preload.d.ts
- Renderer auth: src/renderer/src/composables/auth/useAuth.ts
- Docs (human): docs/electron-architecture.md

Support contacts (if needed)

- None provided in repo. Follow conventions above.
