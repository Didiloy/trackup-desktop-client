# Composables Documentation

Ce document décrit tous les composables créés pour effectuer des requêtes vers le backend.

## Structure

Les composables sont organisés en deux catégories principales :

- **`composables/entities/`** - Composables pour les opérations CRUD sur les entités
- **`composables/entity-stats/`** - Composables pour les statistiques des entités

## Caractéristiques

✅ **Méthodes indépendantes** - Chaque méthode contient tous les paramètres nécessaires à son exécution
✅ **Type-safe** - Utilisation complète de TypeScript avec typage strict
✅ **Pas de dépendances** - Chaque méthode peut être appelée indépendamment
✅ **Simple à utiliser** - Interface claire et cohérente

## Composables Entities

### useActivityCRUD

Gestion des activités dans un serveur.

```typescript
import { useActivityCRUD } from '@/composables/entities'

const { createActivity, listActivities, getActivityById, updateActivity, deleteActivity } =
    useActivityCRUD()

// Exemple d'utilisation
const result = await createActivity(
    serverId,
    {
        name: 'Football',
        description: 'Sport collectif'
    },
    accessToken
)
```

**Méthodes disponibles :**

- `createActivity(serverId, request, accessToken)` - Créer une nouvelle activité
- `listActivities(serverId, options, accessToken)` - Lister les activités avec filtres
- `getActivityById(serverId, activityId, accessToken)` - Obtenir les détails d'une activité
- `updateActivity(serverId, activityId, request, accessToken)` - Mettre à jour une activité
- `deleteActivity(serverId, activityId, accessToken)` - Supprimer une activité

---

### useServerCRUD

Gestion des serveurs.

```typescript
import { useServerCRUD } from '@/composables/entities'

const {
    createServer,
    refreshInviteCode,
    joinServer,
    getServerDetails,
    updateServer,
    deleteServer
} = useServerCRUD()

// Exemple d'utilisation
const result = await createServer(
    {
        name: 'Mon Serveur',
        type_public_id: 'type-uuid'
    },
    accessToken
)
```

**Méthodes disponibles :**

- `createServer(request, accessToken)` - Créer un nouveau serveur
- `refreshInviteCode(serverId, accessToken)` - Rafraîchir le code d'invitation
- `joinServer(request, accessToken)` - Rejoindre un serveur avec un code
- `getServerDetails(serverId, accessToken)` - Obtenir les détails d'un serveur
- `updateServer(serverId, request, accessToken)` - Mettre à jour un serveur
- `deleteServer(serverId, accessToken)` - Supprimer un serveur

---

### useUserCRUD

Gestion des utilisateurs.

```typescript
import { useUserCRUD } from '@/composables/entities'

const { getMe, getMyServers } = useUserCRUD()

// Exemple d'utilisation
const user = await getMe(accessToken)
const servers = await getMyServers(accessToken)
```

**Méthodes disponibles :**

- `getMe(accessToken)` - Obtenir les informations de l'utilisateur courant
- `getMyServers(accessToken)` - Obtenir les serveurs de l'utilisateur

---

### useMemberCRUD

Gestion des membres d'un serveur.

```typescript
import { useMemberCRUD } from '@/composables/entities'

const { inviteMember, quitServer, listMembers, getMemberById, kickMember, updateMemberNickname } =
    useMemberCRUD()

// Exemple d'utilisation
const members = await listMembers(serverId, { page: 1, limit: 20 }, accessToken)
```

**Méthodes disponibles :**

- `inviteMember(serverId, request, accessToken)` - Inviter un membre
- `quitServer(serverId, accessToken)` - Quitter un serveur
- `listMembers(serverId, options, accessToken)` - Lister les membres avec pagination
- `getMemberById(serverId, memberId, accessToken)` - Obtenir un membre par ID
- `kickMember(serverId, memberId, accessToken)` - Expulser un membre
- `updateMemberNickname(serverId, memberId, request, accessToken)` - Mettre à jour le surnom

---

### useSessionCRUD

Gestion des sessions d'activité.

```typescript
import { useSessionCRUD } from '@/composables/entities'

const {
    createSession,
    listSessions,
    getSessionById,
    updateSession,
    deleteSession,
    likeSession,
    unlikeSession
} = useSessionCRUD()

// Exemple d'utilisation
const session = await createSession(
    serverId,
    {
        activity_id: 'activity-uuid',
        duration: 3600,
        date: '2024-01-01',
        participants: ['member-uuid-1', 'member-uuid-2']
    },
    accessToken
)
```

**Méthodes disponibles :**

- `createSession(serverId, request, accessToken)` - Créer une nouvelle session
- `listSessions(serverId, options, accessToken)` - Lister les sessions avec pagination
- `getSessionById(serverId, sessionId, accessToken)` - Obtenir une session par ID
- `updateSession(serverId, sessionId, request, accessToken)` - Mettre à jour une session
- `deleteSession(serverId, sessionId, accessToken)` - Supprimer une session
- `likeSession(serverId, sessionId, accessToken)` - Aimer une session
- `unlikeSession(serverId, sessionId, accessToken)` - Ne plus aimer une session

---

### useActivitySkillLevelCRUD

Gestion des niveaux de compétence des activités.

```typescript
import { useActivitySkillLevelCRUD } from '@/composables/entities'

const { createSkillLevel, listSkillLevels, getSkillLevelById, updateSkillLevel, deleteSkillLevel } =
    useActivitySkillLevelCRUD()

// Exemple d'utilisation
const skillLevel = await createSkillLevel(
    serverId,
    activityId,
    {
        name: 'Débutant',
        display_order: 1,
        min_sessions: 0,
        min_duration: 0
    },
    accessToken
)
```

**Méthodes disponibles :**

- `createSkillLevel(serverId, activityId, request, accessToken)` - Créer un niveau
- `listSkillLevels(serverId, activityId, accessToken)` - Lister les niveaux
- `getSkillLevelById(serverId, activityId, skillLevelId, accessToken)` - Obtenir un niveau
- `updateSkillLevel(serverId, activityId, skillLevelId, request, accessToken)` - Mettre à jour
- `deleteSkillLevel(serverId, activityId, skillLevelId, accessToken)` - Supprimer

---

### useEnumDefinitionCRUD

Gestion des définitions d'énumérations.

```typescript
import { useEnumDefinitionCRUD } from '@/composables/entities'

const { createEnumDefinition, listEnumDefinitions, updateEnumDefinition, deleteEnumDefinition } =
    useEnumDefinitionCRUD()
```

**Méthodes disponibles :**

- `createEnumDefinition(serverId, request, accessToken)` - Créer une définition
- `listEnumDefinitions(serverId, accessToken)` - Lister les définitions
- `updateEnumDefinition(serverId, enumDefinitionId, request, accessToken)` - Mettre à jour
- `deleteEnumDefinition(serverId, enumDefinitionId, accessToken)` - Supprimer

---

### useServerTypeCRUD

Gestion des types de serveur.

```typescript
import { useServerTypeCRUD } from '@/composables/entities'

const { getAllServerTypes } = useServerTypeCRUD()

// Exemple d'utilisation
const types = await getAllServerTypes(accessToken)
```

**Méthodes disponibles :**

- `getAllServerTypes(accessToken)` - Obtenir tous les types de serveur

---

## Composables Stats

### useActivityStatsCRUD

Statistiques des activités.

```typescript
import { useActivityStatsCRUD } from '@/composables/entity-stats'

const {
    getActivityLeaderboard,
    getAllActivityStats,
    getActivityStats,
    getActivityDetails,
    getActivityPatterns,
    getActivityRanking,
    getActivityTimeline,
    getActivityGrowthTrends
} = useActivityStatsCRUD()

// Exemple d'utilisation
const leaderboard = await getActivityLeaderboard(serverId, { limit: 10 }, accessToken)
```

**Méthodes disponibles :**

- `getActivityLeaderboard(serverId, params, accessToken)` - Classement des activités
- `getAllActivityStats(serverId, params, accessToken)` - Toutes les stats paginées
- `getActivityStats(serverId, activityId, accessToken)` - Stats d'une activité
- `getActivityDetails(serverId, activityId, accessToken)` - Détails complets
- `getActivityPatterns(serverId, activityId, accessToken)` - Patterns temporels
- `getActivityRanking(serverId, activityId, params, accessToken)` - Classement
- `getActivityTimeline(serverId, activityId, params, accessToken)` - Timeline
- `getActivityGrowthTrends(serverId, activityId, params, accessToken)` - Tendances

---

### useMemberStatsCRUD

Statistiques des membres.

```typescript
import { useMemberStatsCRUD } from '@/composables/entity-stats'

const {
    getMemberLeaderboard,
    getAllMemberStats,
    getMemberStats,
    getMemberDetails,
    getMemberPatterns,
    getMemberRanking,
    getMemberTimeline,
    getMemberGrowthTrends
} = useMemberStatsCRUD()

// Exemple d'utilisation
const stats = await getMemberStats(serverId, memberId, accessToken)
```

**Méthodes disponibles :**

- `getMemberLeaderboard(serverId, params, accessToken)` - Classement des membres
- `getAllMemberStats(serverId, params, accessToken)` - Toutes les stats paginées
- `getMemberStats(serverId, memberId, accessToken)` - Stats d'un membre
- `getMemberDetails(serverId, memberId, accessToken)` - Détails complets
- `getMemberPatterns(serverId, memberId, accessToken)` - Patterns d'activité
- `getMemberRanking(serverId, memberId, accessToken)` - Classement
- `getMemberTimeline(serverId, memberId, params, accessToken)` - Timeline
- `getMemberGrowthTrends(serverId, memberId, params, accessToken)` - Tendances

---

### useServerStatsCRUD

Statistiques des serveurs.

```typescript
import { useServerStatsCRUD } from '@/composables/entity-stats'

const {
    getServerStats,
    getServerStatsDetails,
    getServerTimeline,
    getServerGrowthTrends,
    getComparativeAnalysis
} = useServerStatsCRUD()

// Exemple d'utilisation
const stats = await getServerStats(serverId, accessToken)
```

**Méthodes disponibles :**

- `getServerStats(serverId, accessToken)` - Stats du serveur
- `getServerStatsDetails(serverId, accessToken)` - Détails complets
- `getServerTimeline(serverId, params, accessToken)` - Timeline
- `getServerGrowthTrends(serverId, params, accessToken)` - Tendances de croissance
- `getComparativeAnalysis(serverId, accessToken)` - Analyse comparative

---

### useMemberActivityStatsCRUD

Statistiques des membres par activité.

```typescript
import { useMemberActivityStatsCRUD } from '@/composables/entity-stats'

const { getAllMemberActivities, getMemberActivityStats, getMemberActivityProgression } =
    useMemberActivityStatsCRUD()

// Exemple d'utilisation
const progression = await getMemberActivityProgression(
    serverId,
    memberId,
    activityId,
    { period: '30d' },
    accessToken
)
```

**Méthodes disponibles :**

- `getAllMemberActivities(serverId, memberId, params, accessToken)` - Toutes les activités
- `getMemberActivityStats(serverId, memberId, activityId, accessToken)` - Stats par activité
- `getMemberActivityProgression(serverId, memberId, activityId, params, accessToken)` - Progression

---

### useSnapshotStatsCRUD

Gestion des snapshots de statistiques.

```typescript
import { useSnapshotStatsCRUD } from '@/composables/entity-stats'

const {
    createSnapshot,
    getAllSnapshots,
    getSnapshotById,
    getLatestSnapshot,
    getSnapshotsSummary,
    compareSnapshots,
    cleanupSnapshots
} = useSnapshotStatsCRUD()

// Exemple d'utilisation
const snapshot = await createSnapshot(serverId, { type: 'manual' }, accessToken)
```

**Méthodes disponibles :**

- `createSnapshot(serverId, request, accessToken)` - Créer un snapshot
- `getAllSnapshots(serverId, params, accessToken)` - Liste paginée
- `getSnapshotById(serverId, snapshotId, accessToken)` - Obtenir un snapshot
- `getLatestSnapshot(serverId, params, accessToken)` - Dernier snapshot
- `getSnapshotsSummary(serverId, accessToken)` - Résumé des snapshots
- `compareSnapshots(serverId, snapshotId1, snapshotId2, accessToken)` - Comparer
- `cleanupSnapshots(serverId, params, accessToken)` - Nettoyer les anciens

---

### useEnumDefinitionStatsCRUD

Statistiques des énumérations.

```typescript
import { useEnumDefinitionStatsCRUD } from '@/composables/entity-stats'

const { getAllEnumDefinitionStats, getEnumDefinitionStats, getEnumValueDistribution } =
    useEnumDefinitionStatsCRUD()

// Exemple d'utilisation
const distribution = await getEnumValueDistribution(serverId, enumDefinitionId, accessToken)
```

**Méthodes disponibles :**

- `getAllEnumDefinitionStats(serverId, params, accessToken)` - Toutes les stats
- `getEnumDefinitionStats(serverId, enumDefinitionId, params, accessToken)` - Stats d'une enum
- `getEnumValueDistribution(serverId, enumDefinitionId, accessToken)` - Distribution des valeurs

---

## Utilisation Générale

### Import

```typescript
// Import d'un composable spécifique
import { useActivityCRUD } from '@/composables/entities'
import { useActivityStatsCRUD } from '@/composables/entity-stats'

// Import depuis les index
import { useActivityCRUD, useServerCRUD, useMemberCRUD } from '@/composables/entities'
import { useActivityStatsCRUD, useMemberStatsCRUD } from '@/composables/entity-stats'
```

### Pattern d'utilisation

```typescript
// 1. Importer le composable
import { useActivityCRUD } from '@/composables/entities'

// 2. Destructurer les méthodes nécessaires
const { createActivity, listActivities } = useActivityCRUD()

// 3. Appeler les méthodes avec tous les paramètres
const handleCreateActivity = async () => {
    const result = await createActivity(
        serverId, // ID du serveur
        {
            // Données de la requête
            name: 'Football',
            description: "Sport d'équipe"
        },
        accessToken // Token d'authentification
    )

    if (result.error) {
        console.error('Erreur:', result.error)
    } else {
        console.log('Activité créée:', result.data)
    }
}
```

### Gestion des erreurs

Toutes les méthodes retournent une réponse de type `ApiResponse` :

```typescript
interface ApiResponse<T> {
    data?: T
    error?: string
}
```

Exemple de gestion :

```typescript
const result = await getActivityById(serverId, activityId, accessToken)

if (result.error) {
    // Gérer l'erreur
    console.error('Erreur:', result.error)
    showErrorToast(result.error)
} else if (result.data) {
    // Traiter les données
    console.log('Activité:', result.data)
    activity.value = result.data
}
```

### Dans un composant Vue

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useActivityCRUD } from '@/composables/entities'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { listActivities } = useActivityCRUD()

const activities = ref([])
const loading = ref(false)

const loadActivities = async (serverId: string) => {
    loading.value = true

    const result = await listActivities(
        serverId,
        { search: '', page: 1, limit: 20 },
        authStore.accessToken
    )

    if (result.data) {
        activities.value = result.data
    }

    loading.value = false
}
</script>
```

## Notes Importantes

- 🔒 **Token requis** : Toutes les méthodes nécessitent un `accessToken` valide
- 📦 **Pas d'état** : Les composables ne maintiennent pas d'état interne
- 🔄 **Indépendance** : Chaque méthode peut être utilisée séparément
- 📝 **Types** : Utiliser les types TypeScript fournis pour une meilleure expérience développeur
- ⚡ **Performance** : Les requêtes passent par IPC (Electron) vers le backend

## Structure des Fichiers

```
src/renderer/src/composables/
├── entities/
│   ├── useActivityCRUD.ts
│   ├── useActivitySkillLevelCRUD.ts
│   ├── useEnumDefinitionCRUD.ts
│   ├── useMemberCRUD.ts
│   ├── useServerCRUD.ts
│   ├── useServerTypeCRUD.ts
│   ├── useSessionCRUD.ts
│   ├── useUserCRUD.ts
│   └── index.ts
└── entity-stats/
    ├── useActivityStatsCRUD.ts
    ├── useEnumDefinitionStatsCRUD.ts
    ├── useMemberActivityStatsCRUD.ts
    ├── useMemberStatsCRUD.ts
    ├── useServerStatsCRUD.ts
    ├── useSnapshotStatsCRUD.ts
    └── index.ts
```
