# Architecture scalable pour `main` et `preload` (Electron)

Objectif: organiser les dossiers `main` et `preload` pour une app Electron de grande taille, avec des modules isolés, des APIs typées, et une sécurité stricte.

- Principes
  - Modularité par "domaines" (windows, ipc, services, protocols, menu, security, updater).
  - API côté `preload` strictement limitée et namespacée: `window.api.<domaine>`; pas d’objets globaux génériques.
  - Typage partagé (`shared/contracts`) + validation d’entrées côté main (ex: Zod).
  - Séparation nette orchestration (bootstrap) vs. logique (services) vs. IHM (windows).

- Arborescence proposée
  - src/main
    - bootstrap.ts (point d’entrée: ordre d’initialisation, single-instance-lock, handlers globaux)
    - app.ts (orchestrateur: start/stop, wiring des modules)
    - windows/
      - WindowManager.ts (registre des BrowserWindow, création paresseuse, cleanup)
      - MainWindow.ts (config d’une fenêtre spécifique)
      - SettingsWindow.ts (exemple supplémentaire)
    - ipc/
      - index.ts (registre central qui appelle chaque `registerXyzIpc`)
      - auth.ipc.ts, settings.ipc.ts, updater.ipc.ts (par domaine)
    - services/
      - AuthService.ts, SettingsService.ts, UpdaterService.ts, FileSystemService.ts (stateless ou DI légère)
    - protocols/
      - deepLink.ts (custom protocol client + parsing)
      - safeFileProtocol.ts (si besoin d’accès fichiers)
    - menu/
      - applicationMenu.ts (construction du menu)
    - security/
      - permissions.ts (session.setPermissionRequestHandler)
      - csp.ts (headers CSP via webRequest)
      - hardening.ts (désactiver features non-utilisées)
    - logging/
      - logger.ts (electron-log/pino/winston)
    - update/
      - autoUpdater.ts (intégration electron-updater)
    - config/
      - env.ts (lecture d’ENV, defaults)
  - src/preload
    - index.ts (agrégateur: enregistre les bridges)
    - bridges/
      - app.bridge.ts (API app: getVersion, openExternal, etc.)
      - auth.bridge.ts (API auth: signIn, signOut si nécessaire)
      - updater.bridge.ts (API updater: check, download, events)
      - settings.bridge.ts (API settings: get/set)
    - index.ts (constantes de noms de canaux IPC)
    - types/
      - global.d.ts (déclare `window.api` typé)
  - src/shared (accédé par main + renderer)
    - contracts/
      - types/ (DTO, interfaces d’API, ex: TUseAuth, TUpdater)
      - events.ts (noms d’événements + payloads)
      - schemas.ts (Zod pour valider les payloads côté main)

- Cycle de vie (bootstrap)
  1. Single instance lock + early exits.
  2. Sécurité globale (permissions, CSP, hardening).
  3. Protocols (deep link, file handlers).
  4. Logging + Config.
  5. IPC: `registerAllIpc(ipcMain, services)`.
  6. Windows: `WindowManager.createMain()` + restore/snapshot state.
  7. Updater (facultatif) après `ready`.

- Gestion des fenêtres (WindowManager)
  - Expose: createX, get(id|name), focusOrCreate, all(), closeAll(), dispose().
  - Chaque fenêtre a sa classe dédiée qui encapsule BrowserWindow options, preload, listeners (close, ready-to-show), restore de position/taille.
  - Aucune logique applicative dans les classes de fenêtre: elles délèguent aux services via IPC.

- IPC et Bridges
  - Côté main: modules `*.ipc.ts` qui reçoivent `ipcMain` + dépendances (services) et enregistrent `ipcMain.handle('ns:action', handler)` et `webContents.send('ns:event', payload)`.
  - Côté preload: un bridge par domaine, namespacé: `contextBridge.exposeInMainWorld('api', { ns: nsBridge })`.
  - Canaux constants dans `index.ts` (ex: `export const CH = { updater: { check: 'updater:check', progress: 'updater:progress' } }`).
  - Typage partagé des requêtes/réponses dans `shared/contracts`, validation avec Zod côté main avant d’appeler un service.
  - Règles: pas d’IPC sync, pas d’`remote`, inputs validés, erreurs normalisées.

- Sécurité (essentiel)
  - `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`.
  - `BrowserWindow` avec `webPreferences` stricts (disable aux features non-utilisées).
  - `session.setPermissionRequestHandler` pour bloquer par défaut.
  - CSP en-têtes (via `webRequest.onHeadersReceived`) et/ou meta CSP en dev.
  - Preload minimal: uniquement des méthodes nécessaires, jamais d’accès brut au FS ou au réseau depuis renderer.

- Logging & Config
  - Un `logger` central injecté dans les services.
  - `config/env.ts` pour centraliser l’accès aux ENV (dev/prod).

- Updater
  - `UpdaterService` encapsule electron-updater.
  - IPC: `checkForUpdates`, `downloadUpdate`, `quitAndInstall`, et events (`checking`, `available`, `not-available`, `download-progress`, `error`).

- Settings/Store
  - `SettingsService` basé sur `electron-store` (ou JSON dans `app.getPath('userData')`).
  - Ne jamais exposer le store directement au renderer: passer par IPC et valider.

- Tests
  - Services purs testables sans Electron avec DI (logger, config, FS virtualisé).
  - Bridges testés via mocks d’IPC.

- Conventions
  - Nommage canaux: `domaine:action`.
  - Unité de code = un domaine par fichier de registre IPC/bridge/service.
  - Éviter l’état global mutable dans main; préférer des services instanciés dans `app.ts`.

- Exemples de fichiers (squelettes)
  - src/main/bootstrap.ts
    - initialise sécurité, protocols, IPC, WindowManager, puis crée MainWindow.
  - src/main/ipc/index.ts
    - `export function registerAllIpc(ipcMain, services) { registerAuthIpc(...); registerUpdaterIpc(...); }`
  - src/preload/index.ts
    - importe chaque `*.bridge.ts` et fait un expose unique: `contextBridge.exposeInMainWorld('api', { app: appBridge, updater: updaterBridge, ... })`.
  - src/preload/types/global.d.ts
    - `declare global { interface Window { api: { app: AppBridge; updater: UpdaterBridge; ... } } }`

- Migration progressive depuis votre repo actuel
  1. Ajouter `src/shared/contracts` et y déplacer/centraliser vos types (par ex. `TUseAuth`).
  2. Créer `src/main/ipc/index.ts` et y déplacer la logique IPC existante par domaines.
  3. Introduire `WindowManager` et extraire la création de la fenêtre principale depuis `src/main/index.ts`.
  4. Refactor `src/preload/index.ts` en agrégateur de bridges (créer `preload/bridges` et déplacer les fonctionnalités exposées).
  5. Ajouter `preload/types/global.d.ts` pour typer `window.api`.
  6. Appliquer la validation d’inputs (Zod) côté main dans chaque handler IPC avant d’appeler un service.

---

## Cycle de vie concret de votre app (pas à pas)

Cette section explique comment votre app s’initialise et vit réellement aujourd’hui, en se basant sur les fichiers présents dans le repo.

Références de code clés:
- `src/main/index.ts` (orchestration au démarrage)
- `src/main/windows/WindowManager.ts` (registre des fenêtres)
- `src/main/windows/MainWindow.ts` (configuration de la fenêtre principale)
- `src/main/ipc/index.ts` + `app.ipc.ts`, `window.ipc.ts` (channels IPC)
- `src/main/protocols/deepLink.ts` (deep link: `trackup://...`)
- `src/main/security/hardening.ts` (sécurité par défaut)
- `src/preload/index.ts` + `bridges/*` (exposition `window.api`)
- `src/shared/contracts/channels/*` (canaux par domaine)
- Renderer: `src/renderer/src/views/*.vue`, `composables/auth/useAuth.ts`

### 1) Boot et garde single-instance
- Fichier: `src/main/index.ts`
- Étapes:
  1. `app.requestSingleInstanceLock()` empêche le lancement en double (utile pour deep links).
  2. `app.whenReady().then(...)` déclenche la suite d’initialisation.

### 2) Initialisation (app.whenReady)
- Fichier: `src/main/index.ts`
- Ordre d’exécution:
  1. `electronApp.setAppUserModelId('com.github.trackup')` (Windows notifications, jump list).
  2. Sécurité: `applySecurity()` depuis `src/main/security/hardening.ts`
     - Bloque les permissions par défaut, prépare la surface minimale.
  3. Deep links: `deepLinkHandler.registerProtocol()` puis `deepLinkHandler.setCallback(...)` et `deepLinkHandler.setupListeners()` depuis `src/main/protocols/deepLink.ts`
     - Enregistre le schéma `trackup://` en dev et prod.
     - Définit le callback qui focus la fenêtre et forward l’URL au renderer (voir étape 5).
  4. Raccourcis dev/production: `optimizer.watchWindowShortcuts`.
  5. IPC: `registerAllIpc()` depuis `src/main/ipc/index.ts`
     - Enregistre tous les handlers (ex: `app:getVersion`, `app:openExternal`, `window:maximize`, etc.).
  6. Fenêtre principale: `createMainWindow()`
     - Crée et enregistre la fenêtre dans `WindowManager`.
  7. Deep link initial (Windows): `deepLinkHandler.parseInitialUrl()`
     - Si l’app a démarré via une URL, on la forward immédiatement au renderer.

### 3) Création de la fenêtre principale
- Fichier: `src/main/windows/MainWindow.ts`
- Ce que fait `create()`:
  - Configure `BrowserWindow` avec des options strictes:
    - `preload: ../preload/index.js`, `contextIsolation: true`, `nodeIntegration: false`, `sandbox: false` (peut être `true` si vos dépendances le supportent).
    - Taille minimale, `frame: false` (UI custom), `autoHideMenuBar: true`.
  - `setWindowOpenHandler`: bloque l’ouverture de nouvelles fenêtres et ouvre les liens externes dans le navigateur par défaut (retour synchrone `{ action: 'deny' }`).
  - Charge le contenu:
    - Dev: `process.env.ELECTRON_RENDERER_URL` (HMR).
    - Prod: `../renderer/index.html` packagé.
  - `ready-to-show`: affiche la fenêtre et, si un deep link est arrivé avant, l’envoie au renderer (file d’attente interne `pendingDeepLinkUrl`).

### 4) Exposition d’API au renderer (preload)
- Fichiers: `src/preload/index.ts`, `src/preload/bridges/*`
- `preload/index.ts` agrège les bridges et expose `window.api` via `contextBridge`:
  - `window.api.window`: minimise/maximise/ferme la fenêtre, `isMaximized()`.
  - `window.api.app`: `ping()`, `getVersion()`, `openExternal(url)` (validation côté main).
  - `window.api.auth`: `onCallbackUrl(cb)` pour écouter les deep links de login.
- Typage global: `src/preload/index.d.ts` déclare `window.api` typé pour TypeScript.

### 5) IPC (main ⇄ renderer)
- Canaux constants: `src/shared/contracts/channels/{window,app,auth}.ts` puis agrégation dans `src/shared/contracts/channels.ts`.
- Côté main:
  - `src/main/ipc/window.ipc.ts`: écoute `window:minimize|maximize|close`, et handle `window:isMaximized`.
  - `src/main/ipc/app.ipc.ts`: écoute `app:ping`, handle `app:getVersion` et `app:openExternal` (vérifie l’URL).
  - `MainWindow.sendAuthCallback(url)`: envoie `auth:callbackUrl` au renderer.
- Côté preload: chaque bridge utilise `ipcRenderer.send/invoke` et masque la complexité au renderer.
- Côté renderer: utilisez `window.api.*` (jamais `ipcRenderer` directement).

### 6) Gestion des deep links (login OAuth)
- Fichier: `src/main/protocols/deepLink.ts`
  - Enregistre le schéma `trackup://`.
  - Gère:
    - macOS: `app.on('open-url', ...)`.
    - Win/Linux: `app.on('second-instance', ...)` + parsing argv.
  - Forward l’URL au `MainWindow` via `main.sendAuthCallback(url)`.
- Côté renderer: `src/renderer/src/composables/auth/useAuth.ts`
  - S’abonne à `window.api.auth.onCallbackUrl((url) => { ... })`.
  - Extrait `code` depuis l’URL, puis `supabase.auth.exchangeCodeForSession(code)`.
  - Met à jour l’état (`user`, `session`).

### 7) Fermeture et cycle de vie
- Fichier: `src/main/index.ts`
  - `app.on('window-all-closed')`: quitte l’app sauf sur macOS (comportement standard).
  - `app.on('activate')`: sur macOS, recrée une fenêtre si aucune n’est ouverte.

---

## TL;DR (en 10 points)
1. Lock single-instance.
2. `whenReady`: set AppUserModelId.
3. Appliquer la sécurité globale.
4. Enregistrer le protocole deep link et ses listeners.
5. Brancher les raccourcis/devtools.
6. Enregistrer tous les IPC par domaine.
7. Créer la fenêtre principale et l’afficher.
8. Si deep link initial, le transmettre au renderer.
9. Dans le renderer, écouter `auth:callbackUrl` pour finaliser la session.
10. À la fermeture de toutes les fenêtres: quitter (sauf macOS), sinon réactiver.

---

## Points de personnalisation
- Sécurité: activez `sandbox: true` si compatible, ajoutez CSP via `webRequest.onHeadersReceived`.
- Services: isolez la logique (auth, updater, settings) dans `src/main/services` et validez toutes les entrées via Zod.
- Windows: ajoutez d’autres classes de fenêtres et utilisez `WindowManager.focusOrCreate()`.
- IPC: gardez un fichier par domaine; exportez les canaux dans `shared/contracts/channels/<domaine>.ts`.
- Preload: n’exposez que des méthodes nécessaires, jamais d’accès brut au système.

## Debug rapide
- Si un clic UI ne fait rien: vérifiez que la vue appelle `window.api.<ns>.<action>()`, que le bridge appelle le bon canal, et que le handler `ipcMain` existe.
- Si un lien externe ouvre une nouvelle fenêtre Electron: contrôlez `setWindowOpenHandler` (retour synchrone `{ action: 'deny' }`) et utilisez `app.openExternal` côté main.
- Si les deep links ne marchent pas en dev: vérifiez l’enregistrement du protocole dans `deepLink.registerProtocol()` (arguments `process.execPath`, etc.).
- Si TypeScript se plaint d’un fichier dans `shared/`: assurez-vous que `tsconfig.node.json` et `tsconfig.web.json` incluent `src/shared/**/*`.
