# Guide d'Installation des Extensions DevTools

## 📝 Vue d'ensemble

Ce système permet de gérer facilement les extensions de développement (comme Vue DevTools) dans votre application Electron. Il suffit d'ajouter l'ID de l'extension dans un fichier de configuration, et le système se charge automatiquement de la charger au démarrage.

## 🚀 Comment ajouter une nouvelle extension

### 1. Trouver l'ID de l'extension

Pour ajouter une extension Chrome/Edge :

1. Ouvrez le [Chrome Web Store](https://chrome.google.com/webstore)
2. Recherchez l'extension que vous voulez ajouter
3. Copiez l'ID depuis l'URL (la longue chaîne de caractères après `/detail/`)

**Exemple** : Pour Vue.js DevTools
- URL : `https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd`
- ID : `nhdogjmejiglipccpnnnanhbledajbpd`

### 2. Ajouter l'extension dans la configuration

Ouvrez le fichier `src/main/config/extensions.config.ts` et ajoutez votre extension :

```typescript
export const EXTENSIONS_TO_INSTALL: ExtensionConfig[] = [
  {
    id: 'nhdogjmejiglipccpnnnanhbledajbpd',
    name: 'Vue.js DevTools',
    enabled: true
  },
  {
    id: 'fmkadmapgofadopljbjfkapdkoienihi', // Nouvel ID
    name: 'React Developer Tools',          // Nouveau nom
    enabled: true                           // Activée
  }
]
```

### 3. Installer l'extension dans Chrome/Edge

**Important** : Pour que le système puisse charger l'extension, vous devez d'abord l'installer dans votre navigateur Chrome ou Edge.

1. Ouvrez Chrome ou Edge
2. Allez dans le Web Store
3. Installez l'extension normalement

Le système détectera automatiquement l'extension installée et la chargera dans votre application Electron.

### 4. Redémarrer l'application

Relancez votre application en mode développement :

```bash
npm run dev
```

Vous verrez dans la console :
```
📦 Installation de X extension(s)...
✅ Extension "Vue.js DevTools" chargée (Vue.js devtools 6.x)
✅ Installation des extensions terminée

📋 Extensions chargées (X):
   - Vue.js devtools (nhdogjmejiglipccpnnnanhbledajbpd) vX.X.X
```

## 📚 Extensions populaires

Voici quelques extensions utiles pour le développement :

| Extension | ID | Description |
|-----------|----|-----------|
| Vue.js DevTools | `nhdogjmejiglipccpnnnanhbledajbpd` | DevTools pour Vue.js |
| React Developer Tools | `fmkadmapgofadopljbjfkapdkoienihi` | DevTools pour React |
| Redux DevTools | `lmhkpmbekcpmknklioeibfkpmmfibljd` | DevTools pour Redux |

## ⚙️ Configuration avancée

### Désactiver temporairement une extension

Changez `enabled` à `false` :

```typescript
{
  id: 'nhdogjmejiglipccpnnnanhbledajbpd',
  name: 'Vue.js DevTools',
  enabled: false  // Extension désactivée
}
```

### Charger des extensions uniquement en développement

Les extensions sont automatiquement chargées uniquement quand `NODE_ENV === 'development'`. En production, aucune extension n'est chargée pour des raisons de sécurité.

## 🔧 Dépannage

### L'extension ne se charge pas

**Problème** : "Extension not found locally"

**Solution** :
1. Assurez-vous que l'extension est bien installée dans Chrome/Edge
2. Vérifiez que l'ID est correct
3. Redémarrez Chrome/Edge puis votre application

### Chemins de recherche

Le système cherche les extensions dans ces dossiers :

**Windows** :
- `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Extensions\{ID}`
- `%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Extensions\{ID}`

**macOS** :
- `~/Library/Application Support/Google/Chrome/Default/Extensions/{ID}`

**Linux** :
- `~/.config/google-chrome/Default/Extensions/{ID}`

## 📖 Architecture

```
src/main/
├── config/
│   └── extensions.config.ts    # Configuration des extensions
├── services/
│   └── ExtensionService.ts     # Service de gestion des extensions
└── index.main.ts               # Point d'entrée qui charge les extensions
```

### Fichiers

- **extensions.config.ts** : Fichier de configuration où vous ajoutez vos extensions
- **ExtensionService.ts** : Service qui gère le chargement automatique
- **index.main.ts** : Initialise le service au démarrage de l'app

## 🎯 Avantages de cette approche

✅ **Simple** : Ajoutez juste l'ID dans un fichier
✅ **Pas de dépendances externes** : Utilise l'API native d'Electron
✅ **Pas d'avertissements** : Utilise les nouvelles APIs non-dépréciées
✅ **Multi-plateforme** : Fonctionne sur Windows, macOS et Linux
✅ **Sécurisé** : Ne charge les extensions qu'en développement

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :

1. Vérifiez que `NODE_ENV=development`
2. Consultez les logs dans la console
3. Vérifiez que l'extension est installée dans Chrome/Edge
4. Vérifiez que l'ID est correct dans le fichier de config

