# Guide d'Ajout de Widgets

Ce guide explique comment ajouter de nouveaux widgets au système de widgets personnalisables de TrackUp.

## Vue d'ensemble

Le système de widgets personnalisables permet aux utilisateurs de :

- Glisser-déposer des widgets pour les réorganiser
- Redimensionner les widgets
- Ajouter/supprimer des widgets
- Sauvegarder automatiquement la disposition en local (localStorage)

## Structure du Système

### Composables

- **`useWidgets.ts`** : Découvre et charge automatiquement tous les widgets d'un contexte donné
- **`useWidgetLayout.ts`** : Gère la persistance et la manipulation du layout des widgets

### Composants

- **`WidgetDashboard.vue`** : Composant réutilisable pour afficher un tableau de bord de widgets avec drag-and-drop
- **Widgets** : Fichiers `.widget.vue` dans `components/widgets/{category}/`

## Comment Ajouter un Nouveau Widget

### Étape 1 : Créer le Fichier Widget

Créez un fichier avec l'extension `.widget.vue` dans le bon répertoire :

- Pour les widgets serveur : `src/renderer/src/components/widgets/server/`
- Pour les widgets activité : `src/renderer/src/components/widgets/activity/`

**Exemple de nom de fichier :**

```
ServerNewWidget.widget.vue
ActivityNewWidget.widget.vue
```

### Étape 2 : Définir les Métadonnées du Widget

Dans votre composant, utilisez `defineOptions` pour déclarer les métadonnées :

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
// ... autres imports

defineOptions({
    widgetMetadata: {
        id: 'unique-widget-id', // ID unique (kebab-case)
        title: 'Titre du Widget', // Titre affiché
        icon: 'pi pi-icon-name', // Icône PrimeIcons
        description: 'Description courte', // Description (optionnel)
        category: 'server', // 'server' ou 'activity'
        defaultSize: {
            w: 3, // Largeur par défaut (colonnes sur 12)
            h: 2, // Hauteur par défaut (unités)
            minW: 2, // Largeur minimale (optionnel)
            minH: 2, // Hauteur minimale (optionnel)
            maxW: 12, // Largeur maximale (optionnel)
            maxH: 10 // Hauteur maximale (optionnel)
        }
    }
})

// ... reste du code du composant
</script>

<template>
    <!-- Votre template -->
</template>
```

### Étape 3 : Implémenter le Composant

Implémentez votre composant comme n'importe quel composant Vue normal :

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServerStatsStore } from '@/stores/server-stats'
import BaseOverviewStatWidget from '../BaseOverviewStatWidget.vue'

defineOptions({
    widgetMetadata: {
        id: 'server-custom-metric',
        title: 'Métrique Personnalisée',
        icon: 'pi pi-chart-bar',
        description: 'Affiche une métrique personnalisée',
        category: 'server',
        defaultSize: { w: 3, h: 2, minW: 2, minH: 2 }
    }
})

const { t } = useI18n()
const server_stats_store = useServerStatsStore()

const value = computed(() => {
    // Votre logique ici
    return server_stats_store.getDetails?.custom_metric ?? 0
})
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('widgets.custom_metric')"
        :value="value"
        icon="pi pi-chart-bar"
        color="text-blue-500"
        bg="bg-blue-500/10"
        :loading="server_stats_store.isLoading"
    />
</template>
```

### Étape 4 : Le Widget est Automatiquement Disponible !

**C'est tout !** Le widget sera automatiquement :

- Découvert par le système
- Disponible dans le dialogue "Ajouter un Widget"
- Prêt à être utilisé dans le dashboard

## Tailles de Widget Recommandées

### Widgets Stat Simple

```typescript
defaultSize: { w: 3, h: 2, minW: 2, minH: 2 }
```

Parfait pour afficher une seule métrique (nombre, pourcentage, etc.)

### Widgets Liste/Tableau

```typescript
defaultSize: { w: 6, h: 4, minW: 4, minH: 3 }
```

Pour afficher des listes de top membres, top activités, etc.

### Widgets Graphique

```typescript
defaultSize: { w: 12, h: 5, minW: 6, minH: 4 }
```

Pour les graphiques et visualisations complexes

### Widgets Distribution/Donut

```typescript
defaultSize: { w: 6, h: 4, minW: 4, minH: 3 }
```

Pour les graphiques en donut, camembert, etc.

## Contextes Disponibles

### Context 'server'

Widgets affichés dans la page `/servers/:id/stats`

- Accès aux données via `useServerStatsStore()`
- ID du serveur : `useServerStore().getPublicId`

### Context 'activity'

Widgets affichés dans la page d'activité

- Accès aux données via `useActivityStatsStore()`
- ID de l'activité : `route.params.activityId`

## Exemples de Widgets

### Widget Stat Simple

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseOverviewStatWidget from '../BaseOverviewStatWidget.vue'
import { useServerStatsStore } from '@/stores/server-stats'

defineOptions({
    widgetMetadata: {
        id: 'server-total-sessions',
        title: 'Total Sessions',
        icon: 'pi pi-calendar',
        description: 'Affiche le nombre total de sessions',
        category: 'server',
        defaultSize: { w: 3, h: 2, minW: 2, minH: 2 }
    }
})

const { t } = useI18n()
const server_stats_store = useServerStatsStore()
</script>

<template>
    <BaseOverviewStatWidget
        :label="t('views.server_stats.total_sessions')"
        :value="server_stats_store.getDetails?.server_stats.total_sessions.toLocaleString() ?? 0"
        icon="pi pi-calendar"
        color="text-blue-500"
        bg="bg-blue-500/10"
        :loading="server_stats_store.isLoading"
    />
</template>
```

### Widget Graphique

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { VueUiXy } from 'vue-data-ui'
import type { VueUiXyConfig } from 'vue-data-ui'
import { useServerStatsStore } from '@/stores/server-stats'

defineOptions({
    widgetMetadata: {
        id: 'server-timeline-chart',
        title: 'Graphique Timeline',
        icon: 'pi pi-chart-line',
        description: "Affiche l'évolution des statistiques",
        category: 'server',
        defaultSize: { w: 12, h: 5, minW: 6, minH: 4 }
    }
})

const server_stats_store = useServerStatsStore()

const dataset = computed(() => [
    // Votre dataset
])

const config = computed<VueUiXyConfig>(() => ({
    // Votre configuration
}))
</script>

<template>
    <div class="rounded-3xl bg-surface-0 ring-1 ring-surface-200/60 p-5 shadow-sm h-full">
        <VueUiXy :dataset="dataset" :config="config" />
    </div>
</template>
```

## Bonnes Pratiques

1. **ID Unique** : Utilisez toujours un ID unique en kebab-case (ex: `server-my-widget`)

2. **Taille Appropriée** : Choisissez une taille par défaut qui correspond au contenu

3. **Contraintes de Taille** : Définissez `minW`, `minH` pour empêcher le widget d'être trop petit

4. **Loading State** : Gérez l'état de chargement pour une meilleure UX

5. **Responsive** : Le widget doit s'adapter à sa taille

6. **i18n** : Utilisez toujours les traductions pour le texte

7. **Icônes** : Utilisez les icônes PrimeIcons (https://primevue.org/icons/)

## Layout par Défaut

Pour modifier le layout par défaut, éditez `useWidgetLayout.ts` :

```typescript
const DEFAULT_LAYOUTS: Record<string, Record<string, IWidgetLayoutItem[]>> = {
    server: {
        default: [
            { i: 'server-total-sessions', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
            { i: 'server-active-members', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
            { i: 'server-timeline-chart', x: 0, y: 2, w: 12, h: 4, minW: 6, minH: 3 }
        ]
    }
}
```

## Dépannage

### Le widget n'apparaît pas dans le dialogue

- Vérifiez que le fichier a l'extension `.widget.vue`
- Vérifiez que `defineOptions` est bien déclaré
- Vérifiez que le `category` correspond au contexte
- Vérifiez la console pour les erreurs

### Le widget ne se charge pas correctement

- Vérifiez les imports
- Vérifiez que les stores sont bien initialisés
- Vérifiez la console pour les erreurs

### Le layout ne se sauvegarde pas

- Vérifiez que le composable `useWidgetLayout` est bien utilisé
- Vérifiez le localStorage dans les DevTools
- La clé est : `widgets-layout-{context}-{entityId}`

### Erreur "Missing CSS file" pour grid-layout-plus

- **Pas besoin d'importer de CSS!** Les styles de `grid-layout-plus` sont automatiquement injectés via `vite-plugin-css-injected-by-js`
- N'ajoutez PAS `import 'grid-layout-plus/dist/style.css'` - cela causera une erreur
- Importez seulement les composants : `import { GridLayout, GridItem } from 'grid-layout-plus'`

## Ressources

- PrimeVue Icons: https://primevue.org/icons/
- Vue Data UI: https://github.com/graphieros/vue-data-ui
- Grid Layout Plus: https://github.com/Muousic/grid-layout-plus
