# Structure des Traductions

## Organisation des fichiers de traduction

Les fichiers de traduction sont organisés par namespace pour une meilleure maintenabilité :

### Langues supportées
- **Français (fr)** : Langue par défaut
- **Arabe (ar)** : Langue RTL

### Structure des dossiers
```
src/locales/
├── fr/
│   ├── common.json          # Éléments communs (boutons, messages génériques)
│   ├── navigation.json      # Menu et navigation
│   ├── auth.json           # Authentification
│   ├── analysis.json       # Page des analyses
│   ├── newAnalysis.json    # Nouvelle analyse
│   ├── dashboard.json      # Tableau de bord
│   ├── batchUpload.json    # Upload multiple
│   ├── patientHistory.json # Historique patient
│   ├── analytics.json      # Statistiques
│   ├── settings.json       # Paramètres
│   ├── pagination.json     # Pagination
│   ├── errors.json         # Messages d'erreur
│   └── validation.json     # Messages de validation
└── ar/
    └── [mêmes fichiers]
```

## Utilisation dans les composants

### Import du hook de traduction
```javascript
import { useTranslation } from 'react-i18next';

// Utilisation de base
const { t } = useTranslation();
const title = t('common.loading');

// Utilisation avec namespace spécifique
const { t } = useTranslation('analysis');
const title = t('title');
```

### Hook d'aide avec raccourcis
```javascript
import { useI18n } from '../utils/translationHelpers';

const { tCommon, tAnalysis, tDashboard } = useI18n();

const loadingText = tCommon('loading');
const analysisTitle = tAnalysis('title');
const welcomeMessage = tDashboard('welcome', { name: 'Utilisateur' });
```

## Raccourcis disponibles

- `tCommon(key)` : Traductions communes
- `tNavigation(key)` : Navigation
- `tAuth(key)` : Authentification
- `tAnalysis(key)` : Analyses
- `tDashboard(key)` : Tableau de bord
- `tNewAnalysis(key)` : Nouvelle analyse
- `tBatchUpload(key)` : Upload multiple
- `tPatientHistory(key)` : Historique patient
- `tAnalytics(key)` : Statistiques
- `tSettings(key)` : Paramètres
- `tPagination(key)` : Pagination
- `tErrors(key)` : Erreurs
- `tValidation(key)` : Validation

## Helpers spéciaux

### Types d'analyse
```javascript
const { getAnalysisType, getAnalysisStatus } = useI18n();

const type = getAnalysisType('bloodAnalysis'); // "Analyse sanguine" ou "تحليل دم"
const status = getAnalysisStatus('sent'); // "Envoyé" ou "مُرسل"
```

## Interpolation de variables

```javascript
// Avec une variable
t('dashboard.welcome', { name: 'Jean' }) // "Bienvenue Jean, ..."

// Avec pluralisation
t('analytics.recommendations.pendingAnalyses', { count: 5 })
```

## Support RTL

Le système détecte automatiquement si la langue est RTL (arabe) et :
- Met à jour `document.documentElement.dir = 'rtl'`
- Met à jour `document.documentElement.lang = 'ar'`
- Ajuste les styles CSS automatiquement

## Ajout de nouvelles traductions

1. Ajouter la clé dans les deux fichiers de langue (fr et ar)
2. Si c'est un nouveau namespace, l'ajouter dans `i18n.js`
3. Ajouter le raccourci dans `translationHelpers.js` si nécessaire

## Bonnes pratiques

1. **Utiliser des clés descriptives** : `analysis.actions.send` plutôt que `send`
2. **Grouper logiquement** : toutes les actions dans `actions.*`
3. **Éviter la duplication** : utiliser `common.*` pour les termes répétés
4. **Tester les deux langues** : vérifier l'affichage en français et en arabe
5. **Respecter le contexte RTL** : adapter les icônes et directions si nécessaire
