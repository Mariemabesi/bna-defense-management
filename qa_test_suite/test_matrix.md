# Matrice de Test - BNA Defense Management

Cette matrice cartographie les fonctionnalités de l'application "BNA Defense Management", les endpoints associés, les exigences de sécurité et les cas de tests correspondants.

## Rôles Utilisateurs et Niveaux d'Accès

- **ADMIN** : Accès complet (administration des utilisateurs, logs, tous les dossiers et configurations).
- **CHARGE_DOSSIER** : Création et modification des dossiers, gestion des affaires, demande de frais, soumission des dossiers et finalisations financières.
- **PRE_VALIDATEUR** : Pré-validation des dossiers, des clôtures, des frais et des finalisations financières.
- **VALIDATEUR** : Validation finale des dossiers, des clôtures, des frais et des finalisations financières.
- **SUPER_VALIDATEUR** : Même droits que Validateur avec priorités étendues et gestion de certains référentiels.

---

## 1. Module Authentification

| ID Test | Endpoint | Méthode | Rôle Requis | Description / Cas de Test | Code Attendu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AUTH-001** | `/api/auth/login` | POST | Public | **Cas nominal** : Connexion réussie avec des identifiants valides. Retourne le jeton JWT. | `200 OK` |
| **AUTH-002** | `/api/auth/login` | POST | Public | **Erreur** : Connexion rejetée avec identifiants erronés. | `401 Unauthorized` |
| **AUTH-003** | `/api/auth/login` | POST | Public | **Sécurité** : Connexion d'un compte suspendu (enabled = false). | `403 Forbidden` |
| **AUTH-004** | `/api/auth/register` | POST | Public | **Cas nominal** : Inscription d'un nouvel utilisateur (créé en statut suspendu par défaut). | `200 OK` |
| **AUTH-005** | `/api/auth/register` | POST | Public | **Cas d'erreur** : Nom d'utilisateur ou Email déjà existant. | `400 Bad Request` |
| **AUTH-006** | `/api/auth/forgot-password` | POST | Public | **Cas nominal** : Demande d'OTP pour réinitialisation du mot de passe. | `200 OK` |
| **AUTH-007** | `/api/auth/verify-otp` | POST | Public | **Cas nominal** : Vérification de l'OTP reçu par e-mail et obtention du resetToken. | `200 OK` |
| **AUTH-008** | `/api/auth/reset-password` | POST | Public | **Cas nominal** : Changement effectif du mot de passe à l'aide du resetToken. | `200 OK` |
| **AUTH-009** | `/api/auth/change-password` | POST | Authentifié | **Cas nominal** : Changement de mot de passe à partir d'une session active. | `200 OK` |
| **AUTH-010** | `/api/auth/update-profile` | POST | Authentifié | **Cas nominal** : Mise à jour des informations de profil (email, nom, prénom). | `200 OK` |
| **AUTH-011** | `/api/auth/upload-avatar` | POST | Authentifié | **Cas nominal** : Upload d'un fichier image d'avatar pour l'utilisateur en cours. | `200 OK` |

---

## 2. Module Gestion des Dossiers

| ID Test | Endpoint | Méthode | Rôle Requis | Description / Cas de Test | Code Attendu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DOS-001** | `/api/dossiers` | GET | Authentifié | **Cas nominal** : Liste paginée de tous les dossiers accessibles par l'utilisateur. | `200 OK` |
| **DOS-002** | `/api/dossiers/mine` | GET | Authentifié | **Cas nominal** : Liste paginée des dossiers affectés spécifiquement à l'utilisateur courant. | `200 OK` |
| **DOS-003** | `/api/dossiers` | POST | CHARGE_DOSSIER, ADMIN | **Cas nominal** : Création d'un nouveau dossier avec références et données valides. | `200 OK` |
| **DOS-004** | `/api/dossiers/{id}` | GET | Autorisé / ADMIN | **Cas nominal** : Récupération d'un dossier par ID (vérification canAccessDossier). | `200 OK` |
| **DOS-005** | `/api/dossiers/{id}` | GET | Non autorisé | **Sécurité** : Tentative d'accès à un dossier par un utilisateur d'un autre groupe. | `403 Forbidden` |
| **DOS-006** | `/api/dossiers/{id}` | GET | Authentifié | **Cas d'erreur** : ID de dossier inexistant. | `404 Not Found` |
| **DOS-007** | `/api/dossiers/{id}` | PUT | Autorisé / ADMIN | **Cas nominal** : Mise à jour des informations du dossier. | `200 OK` |
| **DOS-008** | `/api/dossiers/{id}` | DELETE | CHARGE_DOSSIER, ADMIN | **Cas nominal** : Archivage logique (suppression logique) d'un dossier. | `204 No Content` |
| **DOS-009** | `/api/dossiers/search` | GET | Authentifié | **Cas nominal** : Recherche textuelle multicritères sur les dossiers. | `200 OK` |

---

## 3. Module Gestion des Affaires et Procédures

| ID Test | Endpoint | Méthode | Rôle Requis | Description / Cas de Test | Code Attendu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AFF-001** | `/api/affaires` | GET | Authentifié | **Cas nominal** : Récupération paginée de la liste des affaires avec critères. | `200 OK` |
| **AFF-002** | `/api/affaires/dossier/{dossierId}` | GET | Authentifié | **Cas nominal** : Récupération des affaires liées à un dossier spécifique. | `200 OK` |
| **AFF-003** | `/api/affaires` | POST | CHARGE_DOSSIER, ADMIN | **Cas nominal** : Création d'une affaire liée à un dossier existant. | `200 OK` |
| **AFF-004** | `/api/affaires/{id}/statut` | PUT | CHARGE_DOSSIER, ADMIN | **Cas nominal** : Mise à jour du statut d'une affaire (ex. EN_COURS, CLOS). | `200 OK` |
| **AFF-005** | `/api/affaires/export/pdf` | GET | Authentifié | **Cas nominal** : Génération et téléchargement du PDF de la liste des affaires. | `200 OK (PDF)` |
| **PROC-001** | `/api/procedures` | GET | Authentifié | **Cas nominal** : Liste paginée de toutes les procédures judiciaires. | `200 OK` |
| **PROC-002** | `/api/procedures` | POST | CHARGE_DOSSIER, ADMIN | **Cas nominal** : Création d'une procédure liée à une affaire. | `200 OK` |
| **PROC-003** | `/api/procedures/{id}` | PUT | CHARGE_DOSSIER, ADMIN | **Cas nominal** : Mise à jour d'une procédure par un utilisateur autorisé. | `200 OK` |
| **PROC-004** | `/api/procedures/{id}` | DELETE | CHARGE_DOSSIER, ADMIN | **Cas nominal** : Suppression physique d'une procédure. | `200 OK` |

---

## 4. Module Gestion des Frais et Documents

| ID Test | Endpoint | Méthode | Rôle Requis | Description / Cas de Test | Code Attendu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FRAIS-001**| `/api/frais` | GET | Authentifié | **Cas nominal** : Liste paginée des frais demandés par l'utilisateur courant. | `200 OK` |
| **FRAIS-002**| `/api/frais` | POST | CHARGE_DOSSIER, ADMIN | **Cas nominal** : Demande de remboursement de frais avec DTO multipart/form-data. | `200 OK` |
| **FRAIS-003**| `/api/frais/{id}/attachments` | POST | CHARGE_DOSSIER, ADMIN | **Cas nominal** : Ajout d'une pièce jointe (document PDF/Image) à un frais. | `200 OK` |
| **FRAIS-004**| `/api/frais/attachments/{id}/download` | GET | Authentifié | **Cas nominal** : Téléchargement et visualisation de la pièce jointe d'un frais. | `200 OK` |
| **FRAIS-005**| `/api/dossiers/{id}/frais` | GET | Autorisé / ADMIN | **Cas nominal** : Liste des frais associés à un dossier spécifique. | `200 OK` |
| **FRAIS-006**| `/api/dossiers/{id}/frais/summary` | GET | Autorisé / ADMIN | **Cas nominal** : Synthèse financière du dossier (frais initiaux, réels, dépassement). | `200 OK` |

---

## 5. Module Workflow de Validation

| ID Test | Endpoint | Méthode | Rôle Requis | Description / Cas de Test | Code Attendu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **WF-001** | `/api/dossiers/{id}/soumettre` | PUT | CHARGE_DOSSIER, ADMIN | **Cas nominal** : Soumission d'un dossier pour pré-validation. Statut passe à `ATTENTE_PRE_VAL`. | `200 OK` |
| **WF-002** | `/api/dossiers/{id}/prevalider` | PUT | PRE_VALIDATEUR, ADMIN | **Cas nominal** : Approbation par le pré-validateur. Statut passe à `ATTENTE_VAL`. | `200 OK` |
| **WF-003** | `/api/dossiers/{id}/valider-final` | PUT | VALIDATEUR, SUPER_VAL, ADMIN | **Cas nominal** : Approbation finale par le validateur. Statut passe à `VALIDE`. | `200 OK` |
| **WF-004** | `/api/dossiers/{id}/refuser` | PUT | PRE_VAL, VAL, ADMIN | **Cas nominal** : Rejet d'un dossier avec un motif de rejet obligatoire (>=20 chars). | `200 OK` |
| **WF-005** | `/api/dossiers/{id}/refuser` | PUT | PRE_VAL, VAL, ADMIN | **Cas d'erreur** : Tentative de rejet avec un motif vide ou trop court (< 20 chars). | `400 Bad Request` |
| **WF-006** | `/api/dossiers/{id}/cloturer` | PUT | CHARGE_DOSSIER, ADMIN | **Cas nominal** : Demande de clôture d'un dossier. Statut passe à `CLOTURE_ATTENTE_PRE_VAL`. | `200 OK` |
| **WF-007** | `/api/dossiers/{id}/prevalider-cloture` | PUT | PRE_VALIDATEUR, ADMIN | **Cas nominal** : Pré-validation de la clôture. Statut passe à `CLOTURE_ATTENTE_VAL`. | `200 OK` |
| **WF-008** | `/api/dossiers/{id}/valider-cloture` | PUT | VALIDATEUR, SUPER_VAL, ADMIN | **Cas nominal** : Validation finale de clôture. Le dossier passe à l'état `CLOTURE`. | `200 OK` |
| **WF-009** | `/api/dossiers/{id}/finance/soumettre` | PUT | CHARGE_DOSSIER, ADMIN | **Cas nominal** : Soumission du bilan financier de finalisation. | `200 OK` |
| **WF-010** | `/api/dossiers/{id}/finance/prevalider` | PUT | PRE_VALIDATEUR, ADMIN | **Cas nominal** : Pré-validation de la finalisation financière. | `200 OK` |
| **WF-011** | `/api/dossiers/{id}/finance/valider-final` | PUT | VALIDATEUR, SUPER_VAL, ADMIN | **Cas nominal** : Approbation financière finale par le validateur. | `200 OK` |

---

## 6. Module Dashboard et KPI

| ID Test | Endpoint | Méthode | Rôle Requis | Description / Cas de Test | Code Attendu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **KPI-001** | `/api/stats/global` | GET | Authentifié | **Cas nominal** : Récupération des KPI globaux (dossiers totaux, taux, frais). | `200 OK` |
| **KPI-002** | `/api/stats/user` | GET | Authentifié | **Cas nominal** : Récupération des statistiques associées à l'utilisateur courant. | `200 OK` |
| **KPI-003** | `/api/stats/validation-rate` | GET | Authentifié | **Cas nominal** : Statistiques sur le taux de validation par statut de dossier. | `200 OK` |
| **KPI-004** | `/api/stats/frais-comparison` | GET | Authentifié | **Cas nominal** : Comparaison entre frais initiaux et frais réels par dossier. | `200 OK` |
| **KPI-005** | `/api/reports/dashboard-stats` | GET | Authentifié | **Cas nominal** : Récupération des statistiques avancées du tableau de bord. | `200 OK` |
| **KPI-006** | `/api/reports/dashboard/export/pdf`| GET | Authentifié | **Cas nominal** : Téléchargement du PDF de rapport statistique global. | `200 OK` |

---

## 7. Module Administration

| ID Test | Endpoint | Méthode | Rôle Requis | Description / Cas de Test | Code Attendu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ADM-001** | `/api/admin/users` | GET | ADMIN | **Cas nominal** : Récupération de la liste complète des utilisateurs par l'Admin. | `200 OK` |
| **ADM-002** | `/api/admin/users` | GET | CHARGE_DOSSIER | **Sécurité** : Tentative d'accès à la liste des utilisateurs par un non-admin. | `403 Forbidden` |
| **ADM-003** | `/api/admin/users/{id}/toggle-status` | PUT | ADMIN | **Cas nominal** : Suspension / Activation du compte d'un utilisateur par son ID. | `200 OK` |
| **ADM-004** | `/api/admin/users/{id}/toggle-status` | PUT | ADMIN | **Cas d'erreur** : Tentative de suspension du compte "admin" principal (protégé). | `400 Bad Request` |
| **ADM-005** | `/api/admin/users/{id}` | DELETE | ADMIN | **Cas nominal** : Suppression définitive d'un utilisateur par son ID. | `200 OK` |
| **ADM-006** | `/api/admin/logs` | GET | ADMIN | **Cas nominal** : Visualisation des logs d'audit du système. | `200 OK` |
