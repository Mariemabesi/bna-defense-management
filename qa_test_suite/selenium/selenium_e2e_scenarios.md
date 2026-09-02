# Scénarios de Test E2E - Selenium Webdriver

Ce document répertorie les scénarios de test d'acceptation de bout en bout (E2E) implémentés pour l'application **BNA Defense Management** avec Selenium WebDriver (Java).

---

## Configuration Technique Requise
- **JDK** : Version 17 ou supérieure
- **Framework de test** : JUnit 5 / Maven
- **Dépendance Selenium** : `selenium-java` version `4.18.0` ou supérieure
- **WebDriver Manager** (ou ChromeDriver installé localement)
- **Environnement de test** : Frontend Angular s'exécutant sur `http://localhost:4200`

---

## 1. Liste des Scénarios de Test E2E

### Scénario 1 : Authentification et Restriction des Habilitations (Multi-rôles)
- **Objectif** : Valider que les rôles `ADMIN`, `CHARGE_DOSSIER`, `PRE_VALIDATEUR` et `VALIDATEUR` accèdent uniquement aux écrans autorisés.
- **Étapes** :
  1. Accéder à `http://localhost:4200/login`.
  2. Entrer les identifiants pour le rôle concerné.
  3. Valider la redirection vers `/dashboard`.
  4. Tenter d'accéder manuellement à des URLs non autorisées (ex: `/admin/users` en tant que Chargé) et vérifier que le `roleGuard` redirige l'utilisateur vers le tableau de bord.
  5. Déconnexion.

### Scénario 2 : Cycle de Vie du Dossier (Création & Modification)
- **Objectif** : Valider le parcours de création et d'édition d'un dossier contentieux par un Chargé de dossier.
- **Étapes** :
  1. Se connecter en tant que Chargé de dossier (`charge` / `password123`).
  2. Cliquer sur le lien du menu "Nouveau Dossier".
  3. Remplir le formulaire (Référence unique, Titre, Client, Montant Litige, Priorité, Description).
  4. Cliquer sur "Enregistrer".
  5. Vérifier la présence du dossier créé dans la table de la page "Mes dossiers".
  6. Cliquer sur l'icône de modification du dossier, changer le titre et sauvegarder à nouveau.
  7. Vérifier que la table affiche le titre mis à jour.

### Scénario 3 : Liaison d'une Affaire Judiciaire à un Dossier
- **Objectif** : Assurer qu'une affaire judiciaire peut être créée et rattachée à un dossier existant.
- **Étapes** :
  1. Se connecter en tant que Chargé de dossier.
  2. Accéder à l'écran de création d'affaire (`/nouvelle-affaire`).
  3. Sélectionner le dossier précédemment créé dans la liste déroulante (relation de clé étrangère requise).
  4. Saisir le numéro unique d'affaire, le titre de l'affaire, sélectionner le type (ex: Civile) et ajouter des précisions.
  5. Enregistrer et vérifier que l'affaire apparaît bien dans la liste générale des affaires judiciaires (`/affaires`).

### Scénario 4 : Gestion Financière (Ajout de Frais & Justificatifs)
- **Objectif** : Valider l'ajout d'une demande de frais avec téléchargement (upload) d'une facture/reçu de frais.
- **Étapes** :
  1. Se connecter en tant que Chargé de dossier.
  2. Accéder à la page de demande de frais (`/nouvelle-demande-frais`).
  3. Sélectionner le dossier par sa référence.
  4. Saisir le montant, le taux de TVA et sélectionner le type de frais (Greffe, Transport, Avocat, etc.).
  5. Utiliser l'input file d'upload pour sélectionner et téléverser un document justificatif (ex: PDF).
  6. Valider la demande et vérifier que le montant brut et TTC est correctement calculé et apparaît dans la liste "Mes Frais".

### Scénario 5 : Workflow de Validation Décisionnel
- **Objectif** : Tester le processus d'escalade d'un dossier du Chargé vers le Pré-validateur, puis le rejet argumenté par le Validateur.
- **Étapes** :
  1. **Soumission** : Le Chargé de dossier soumet le dossier en attente (clic sur "Soumettre pour validation"). Le statut passe à `ATTENTE_PRE_VAL`.
  2. **Pré-validation** : Déconnexion, puis connexion du Pré-validateur (`preval`). Il accède à la file d'attente `/frais-review`, clique sur "Pré-valider". Le statut du dossier passe à `ATTENTE_VAL`.
  3. **Rejet Décisionnel** : Déconnexion, puis connexion du Validateur (`val`). Il accède aux dossiers en attente, clique sur "Rejeter".
  4. **Contrôle Qualité de Rejet** : Saisir un motif vide ou trop court (ex: 5 caractères). Tenter de soumettre. Vérifier que l'interface et le bouton restent désactivés ou affichent une erreur (exigence d'un motif >= 20 caractères).
  5. **Finalisation du Rejet** : Saisir un motif détaillé de 30 caractères. Valider. Vérifier que le statut du dossier repasse à `REFUSE`.

### Scénario 6 : Consultation KPI & Reporting Décisionnel
- **Objectif** : Valider la visibilité et l'exactitude des graphiques et données chiffrées du tableau de bord.
- **Étapes** :
  1. Se connecter en tant qu'Administrateur (`admin`).
  2. Charger la page `/dashboard`.
  3. Vérifier la visibilité de la carte de KPI du nombre total de dossiers.
  4. Vérifier l'affichage du graphique de taux de validation et de comparaison financière (frais initial vs frais réels).
  5. Cliquer sur le bouton "Exporter PDF" et s'assurer que le fichier d'analyse globale se télécharge.

### Scénario 7 : Administration et Habilitations (Sécurité des utilisateurs)
- **Objectif** : Vérifier que l'administrateur peut activer ou suspendre des comptes utilisateurs tout en protégeant le compte administrateur système.
- **Étapes** :
  1. Se connecter en tant qu'Administrateur.
  2. Accéder à l'écran `/admin/users`.
  3. Rechercher l'utilisateur "admin" principal dans la liste.
  4. Tenter de cliquer sur le bouton de bascule de statut de l'admin principal.
  5. Valider qu'un message d'alerte s'affiche : `"Action impossible : le compte administrateur principal système est protégé."` et que son statut reste "Actif" (enabled = true).
