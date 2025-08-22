# n8n-cursor DevOps Guide d'Utilisation

## Démarrage Rapide

```bash
# Vérifier la santé du système
make guard && make doctor && make wf-validate

# Démarrer les services (simulation par défaut)
DRY_RUN=0 make up

# Arrêter les services
make down

# Voir les logs
make logs
```

## Structure du Répertoire

```
n8n-cursor/
├── infra/           # Définitions d'infrastructure
│   ├── docker/      # Fichiers Docker compose
│   └── nginx/       # Configurations Nginx
├── scripts/         # Scripts opérationnels
│   ├── ops/         # Opérations n8n
│   ├── workflows/   # Gestion des workflows
│   ├── safety/      # Sécurité et validation
│   ├── utils/       # Utilitaires communs
│   └── bin/         # Scripts binaires
├── workflows/       # Fichiers de workflow n8n
├── templates/       # Modèles pour nouveaux fichiers
├── docs/           # Documentation
├── reports/        # Rapports générés
├── apps/           # Modules d'application
│   └── repo-brain/ # Intelligence du répertoire
├── config/         # Fichiers de configuration
├── backups/        # Fichiers de sauvegarde
└── logs/           # Fichiers de logs
```

## Cibles Make

### Opérations Principales
- `make up` - Démarrer les services n8n
- `make down` - Arrêter les services n8n
- `make restart` - Redémarrer les services
- `make status` - Vérifier le statut des services
- `make logs` - Voir les logs des services

### Gestion des Workflows
- `make wf-validate` - Valider tous les workflows
- `make wf-dedupe` - Supprimer les workflows en double
- `make wf-import` - Importer des workflows

### Sécurité et Santé
- `make guard` - Exécuter le garde-fou de structure
- `make doctor` - Exécuter les diagnostics de santé
- `make repair` - Réparer les problèmes locaux
- `make repair-remote` - Réparer les problèmes distants

### Développement
- `make new-workflow NAME="nom-workflow"` - Créer un nouveau workflow
- `make new-script NAME="nom-script" DESC="description"` - Créer un nouveau script
- `make fmt` - Formater les scripts shell
- `make lint` - Linter les scripts shell

### Repo Brain
- `make brain-index` - Indexer le répertoire pour l'analyse IA
- `make brain-suggest` - Obtenir des suggestions IA pour le répertoire

### CI/CD
- `make ci` - Exécuter toutes les vérifications (fmt, lint, guard)

## Variables d'Environnement

Définissez ces variables dans votre shell ou fichier `.env` :

```bash
export DRY_RUN=1                    # Mode simulation par défaut
export MASTER_UNLOCK=votre_clé_ici  # Clé de déverrouillage maître (variable d'env uniquement!)
export OPENAI_API_KEY=...           # Pour les fonctionnalités IA du Repo Brain
export SUPABASE_URL=...             # Pour le stockage du Repo Brain
export SUPABASE_ANON_KEY=...        # Pour l'authentification du Repo Brain
```

## Repo Brain

Le Repository Brain fournit des insights et suggestions alimentés par l'IA pour votre base de code.

### Configuration

1. Définir les variables d'environnement requises :
   ```bash
   export OPENAI_API_KEY=votre_clé_openai
   export SUPABASE_URL=votre_url_supabase
   export SUPABASE_ANON_KEY=votre_clé_supabase
   ```

2. Indexer votre répertoire :
   ```bash
   make brain-index
   ```

3. Obtenir des suggestions :
   ```bash
   make brain-suggest
   ```

### Fonctionnalités

- **Indexation Intelligente** : Analyse la structure et le contenu de votre base de code
- **Suggestions IA** : Fournit des recommandations d'amélioration
- **Organisation du Code** : Suggère un meilleur placement et une meilleure structure des fichiers
- **Analyse de Sécurité** : Identifie les problèmes de sécurité potentiels

## Fonctionnalités de Sécurité

### Garde-fou de Structure
- Empêche les chemins de fichiers interdits
- Bloque les secrets en dur
- Applique la structure du répertoire

### Système Doctor
- Vérifie la santé du système
- Valide les configurations
- Signale les problèmes et avertissements

### Sauvegarde et Récupération
- Sauvegardes automatiques de base de données
- Sauvegardes de sécurité des workflows
- Capacités de rollback

## Dépannage

### Problèmes Courants

1. **Port 443 occupé** : Vérifier les services conflictuels
2. **Chemins interdits** : Déplacer les fichiers vers les bons emplacements
3. **MASTER_UNLOCK dans le code** : Utiliser uniquement les variables d'environnement

### Commandes de Récupération

```bash
# Vérifier ce qui ne va pas
make doctor

# Réparer les problèmes
make repair

# Valider la structure
make guard

# Vérifier les workflows
make wf-validate
```

## Sécurité

- Ne jamais commiter de secrets dans le répertoire
- Utiliser les variables d'environnement pour les données sensibles
- Exécuter `make guard` avant de commiter
- Activer les protections de branche dans GitHub

## Contribution

1. Créer une branche de fonctionnalité
2. Effectuer vos modifications
3. Exécuter `make ci` pour assurer la qualité
4. Soumettre une pull request

## Support

Pour les problèmes ou questions :
1. Vérifier les logs : `make logs`
2. Exécuter les diagnostics : `make doctor`
3. Vérifier la structure : `make guard`
4. Consulter ce guide d'utilisation
