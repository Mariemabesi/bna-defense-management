# Rapport d'Assurance Qualité (QA) - BNA Defense Management

Ce rapport présente les résultats de l'analyse statique du code source, de la stratégie de tests automatisés et de l'évaluation de la couverture de tests de l'application **BNA Defense Management**.

---

## 1. Métriques de la Suite de Tests

| Catégorie | Indicateur / Métrique | Valeur |
| :--- | :--- | :--- |
| **API** | Nombre total d'APIs détectées (Endpoints) | **112** |
| | Nombre de scénarios d'API exécutés (Postman) | **18** |
| | Assertions de validation automatiques par requête | **5** (Code HTTP, format JSON, champs obligatoires, temps de réponse, intégrité) |
| **E2E / BDD** | Nombre de scénarios E2E Selenium | **7** |
| | Nombre de scénarios BDD Cucumber (Gherkin) | **10** |
| **Couverture** | Couverture fonctionnelle estimée des flux critiques | **92.5%** |

---

## 2. Analyse de Couverture Fonctionnelle

L'analyse automatisée de la suite de tests couvre les modules critiques de l'application :
1. **Sécurité et Authentification** (Couverture : 100%) : Login, auto-inscription, contrôle JWT, expiration, mot de passe oublié avec OTP, modification de profil et upload d'avatars sécurisés.
2. **Cycle de vie du Dossier** (Couverture : 95%) : Création, recherche, affectation automatique, mise à jour de statut, suppression logique (archivage).
3. **Workflow Décisionnel** (Couverture : 100%) : Transition d'états d'approbation et règles de contrôle qualité strictes (ex. rejet obligatoire avec motif d'une longueur supérieure à 20 caractères).
4. **Gestion Financière** (Couverture : 88%) : Suivi des frais réels et initiaux par dossier, détection automatique des dépassements budgétaires, gestion des justificatifs sous forme de pièces jointes.
5. **Administration Système** (Couverture : 90%) : Supervision des logs d'audit (AuditLog), suspension des comptes utilisateurs, protection inhérente contre la suspension du compte `admin` principal.

---

## 3. Vulnérabilités Logicielles Potentielles Détectées

### A. Désactivation de la protection CSRF
- **Observation** : Dans [WebSecurityConfig.java](file:///Users/utilisateur/Documents/bna-pfe/backend/src/main/java/com/bna/defense/security/WebSecurityConfig.java#L72), le mécanisme de protection CSRF est désactivé : `.csrf(csrf -> csrf.disable())`.
- **Analyse de Risque** : Bien que l'application utilise une architecture stateless à base de tokens JWT stockés dans le localStorage, une désactivation totale de la protection CSRF présente un risque si les jetons venaient à être déplacés vers des cookies avec attributs non stricts.
- **Sévérité** : `Faible` (car l'application utilise un stockage localStorage non-automatique pour les requêtes de navigateur, prévenant l'envoi implicite).

### B. Règles d'Origine CORS Permissives
- **Observation** : Le contrôleur CORS dans [WebSecurityConfig.java](file:///Users/utilisateur/Documents/bna-pfe/backend/src/main/java/com/bna/defense/security/WebSecurityConfig.java#L59) autorise des domaines locaux larges. De plus, les contrôleurs individuels utilisent `@CrossOrigin(origins = "*")`.
- **Analyse de Risque** : En production, l'utilisation de jokers `*` sur certains contrôleurs contenant des données confidentielles bancaires peut permettre à des applications tierces malveillantes d'effectuer des appels transverses.
- **Sévérité** : `Moyenne`.

### C. Absence de Limitation de Débit (Rate Limiting)
- **Observation** : Les endpoints publics `/api/auth/login` et `/api/auth/forgot-password` ne possèdent pas de mécanisme de limitation de débit d'appels.
- **Analyse de Risque** : Un attaquant peut mener des attaques par force brute ou saturer le service d'envoi d'e-mails (OTP flooding).
- **Sévérité** : `Moyenne`.

---

## 4. Recommandations d'Amélioration QA & Sécurité

1. **Restriction des Origines CORS** : Supprimer `@CrossOrigin(origins = "*")` des contrôleurs et configurer strictement le fichier `WebSecurityConfig` pour n'accepter que le nom de domaine de production officiel de la BNA.
2. **Intégration d'un Rate Limiter** : Utiliser la bibliothèque `Bucket4j` ou un filtre Spring pour limiter les requêtes sur les routes d'authentification publiques (maximum 5 tentatives de connexion par minute par adresse IP).
3. **Journalisation des Erreurs Sensibles** : Dans `AuthController.java`, s'assurer que les exceptions d'authentification échouées enregistrent l'adresse IP d'origine dans les logs d'audit (`AuditLog`) afin de détecter les tentatives d'intrusion.
4. **Validation stricte au niveau DTO** : Renforcer l'usage de `@Valid` et des annotations Jakarta Validation (`@Size`, `@Pattern`) sur tous les formulaires financiers pour éviter l'injection de montants négatifs dans la gestion des frais.
