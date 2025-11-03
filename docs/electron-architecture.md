# Architecture Electron — Guide d’utilisation

Ce document décrit l’architecture à utiliser pour cette application Electron + Vue + TypeScript. Il est prescriptif et va à l’essentiel: où placer chaque élément, comment les couches interagissent et quelles conventions suivre.

## Objectifs

- Séparation des responsabilités par domaine (app, window, auth, settings, updater, …)
- Sécurité par défaut (aucun accès Node dans le renderer, API preload minimaliste)
- Contrats IPC typés et explicites, partagés entre les couches
- Modules cohérents, testables, remplaçant les patterns ad hoc

---

## Arborescence

- src/main
  - index.ts (point d’entrée: ordre d’initialisation, single-instance-lock, handlers globaux)
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

- src/preload
  - index.ts (agrégateur : enregistre les bridges)
  - bridges/
    - app.bridge.ts (API app: getVersion, openExternal, etc.)
    - auth.bridge.ts (API auth: signIn, signOut si nécessaire)
    - updater.bridge.ts (API updater: check, download, events)
    - settings.bridge.ts (API settings: get/set)
  - index.ts (constantes de noms de canaux IPC)
  - types/
    - global.d.ts (déclare `window.api` typé)

- src/shared (accédé par main + preload + renderer)
  - contracts/
    - types/ (DTO, interfaces d’API, ex: TUseAuth, TUpdater)
    - events.ts (noms d’événements + payloads)
    - schemas.ts (Zod pour valider les payloads côté main)

---

## Responsabilités par couche

- main/
  - Gère le cycle de vie de l’application, les fenêtres, les capacités OS, et les endpoints IPC
  - Implemente des handlers IPC par domaine (aucune UI ici)
  - Délègue optionnellement aux services (logique testable)
- preload/
  - Expose une API limitée: `window.api.<domaine>.<méthode>()`
  - Traduit les appels du renderer en `ipcRenderer.send/invoke`
  - Ne contient aucune logique métier; c’est une façade
- renderer/
  - Application web (Vue) pure. N’importe jamais `electron` et n’accède jamais à Node
  - Utilise uniquement `window.api` pour interagir avec le desktop
- shared/
  - Source unique des canaux IPC et des types partagés
  - Aucun code d’exécution

---

## Cycle de vie (bootstrap)

1. Single instance lock + early exits.
2. Sécurité globale (permissions, CSP, hardening).
3. Protocols (deep link, file handlers).
4. Logging & Config.
5. IPC: `registerAllIpc(ipcMain, services)`.
6. Windows: `WindowManager.createMain()` + restore/snapshot state.

---

## Gestion des fenêtres (WindowManager)

- Expose: `createX`, `get(id|name)`, `focusOrCreate`, `all()`, `closeAll()`, `dispose()`.
- Chaque fenêtre a sa classe dédiée qui encapsule les options BrowserWindow, preload, listeners (`close`, `ready-to-show`), restauration position/taille.
- Aucune logique applicative dans les classes de fenêtre: elles délèguent aux services via IPC.

---

## IPC et Bridges

- Côté main: modules `*.ipc.ts` recevant `ipcMain` + dépendances (services) et enregistrant:
  - `ipcMain.handle('ns:action', handler)` pour les requêtes
  - `webContents.send('ns:event', payload)` pour pousser des événements
- Côté preload: un bridge par domaine, namespacé: `contextBridge.exposeInMainWorld('api', { ns: nsBridge })`.
- Canaux constants dans `shared/contracts/channels` (ex: `export const CH = { updater: { check: 'updater:check', progress: 'updater:progress' } }`).
- Typage partagé des requêtes/réponses dans `shared/contracts`, validation avec Zod côté main avant d’appeler un service.
- Règles: pas d’IPC sync, pas d’`remote`, inputs validés, erreurs normalisées.

---

## Sécurité (essentiel)

- `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`.
- `BrowserWindow` avec `webPreferences` stricts (désactiver les features non-utilisées).
- `session.setPermissionRequestHandler` refuse par défaut.
- CSP en-têtes (via `webRequest.onHeadersReceived`) et/ou meta CSP en dev.
- Preload minimal: uniquement les méthodes nécessaires, jamais d’accès brut au FS/réseau depuis le renderer.

---

## Conventions

- Nommage canaux: `domaine:action`.
- Unité de code = un domaine par fichier (registre IPC / bridge / service).
- Éviter l’état global mutable dans main; préférer des services instanciés dans `app.ts`.

---

## Exemples de fichiers (squelettes)

- `src/main/bootstrap.ts`
  - Initialise sécurité, protocols, IPC, WindowManager, puis crée MainWindow.
- `src/main/ipc/index.ts`
  - `export function registerAllIpc(ipcMain, services) { registerAuthIpc(...); registerUpdaterIpc(...); }`
- `src/preload/index.ts`
  - Importe chaque `*.bridge.ts` et expose: `contextBridge.exposeInMainWorld('api', { app: appBridge, updater: updaterBridge, ... })`.
- `src/preload/types/global.d.ts`
  - `declare global { interface Window { api: { app: AppBridge; updater: UpdaterBridge; ... } } }`
