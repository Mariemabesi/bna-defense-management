# Éléments Manquants et Prérequis pour l'Automatisation Complète

Pour exécuter avec succès la suite de tests automatisée générée (Postman, Newman, Cucumber et Selenium), certains fichiers, dépendances ou configurations doivent être préparés au préalable sur votre machine ou serveur CI/CD.

---

## 1. Données de Test (Database Seeding)

### ✅ Correction Automatique Appliquée
Pour simplifier l'exécution, les utilisateurs de test requis par la suite de tests (`charge`, `preval`, `val`) avec le mot de passe standard `password123` ont été configurés pour être **insérés automatiquement en base de données à chaque démarrage** de l'application Spring Boot via la classe [DataInitializer.java](file:///Users/utilisateur/Documents/bna-pfe/backend/src/main/java/com/bna/defense/config/DataInitializer.java).

Si vous préférez exécuter un peuplement manuel (par exemple sur un environnement de staging externe), vous pouvez utiliser le script SQL ci-dessous :

### Fichier SQL de Seeding à exécuter (`seed_test_data.sql`) :
```sql
-- Nettoyage préalable (optionnel)
DELETE FROM users_roles WHERE user_id IN (1, 2, 3, 4);

-- Insertion des Rôles (si absents)
INSERT INTO roles (id, name) VALUES (1, 'ROLE_ADMIN') ON CONFLICT DO NOTHING;
INSERT INTO roles (id, name) VALUES (2, 'ROLE_CHARGE_DOSSIER') ON CONFLICT DO NOTHING;
INSERT INTO roles (id, name) VALUES (3, 'ROLE_PRE_VALIDATEUR') ON CONFLICT DO NOTHING;
INSERT INTO roles (id, name) VALUES (4, 'ROLE_VALIDATEUR') ON CONFLICT DO NOTHING;

-- Insertion des Utilisateurs (Mots de passe encodés en BCrypt)
-- admin / admin123
INSERT INTO users (id, username, email, password, enabled, full_name, is_super_validateur) 
VALUES (1, 'admin', 'admin@bna.com.tn', '$2a$10$vK6Fw.7gT.d3eO/b7L/99.zU1aM7L2v2tK/0P9iQ8h5N.Z5g5LgTq', true, 'Administrateur Système', false)
ON CONFLICT (username) DO NOTHING;

-- charge / password123
INSERT INTO users (id, username, email, password, enabled, full_name, is_super_validateur) 
VALUES (2, 'charge', 'charge@bna.com.tn', '$2a$10$tM2xK/34E/W/b8.541zNNeV9.aV2m2L4k3r2P/6Q9h5N.X5g5LgTr', true, 'Chargé de Dossier BNA', false)
ON CONFLICT (username) DO NOTHING;

-- preval / password123
INSERT INTO users (id, username, email, password, enabled, full_name, is_super_validateur) 
VALUES (3, 'preval', 'preval@bna.com.tn', '$2a$10$tM2xK/34E/W/b8.541zNNeV9.aV2m2L4k3r2P/6Q9h5N.X5g5LgTr', true, 'Pré-validateur Contentieux', false)
ON CONFLICT (username) DO NOTHING;

-- val / password123
INSERT INTO users (id, username, email, password, enabled, full_name, is_super_validateur) 
VALUES (4, 'val', 'val@bna.com.tn', '$2a$10$tM2xK/34E/W/b8.541zNNeV9.aV2m2L4k3r2P/6Q9h5N.X5g5LgTr', true, 'Validateur Final BNA', false)
ON CONFLICT (username) DO NOTHING;

-- Assignation des Rôles
INSERT INTO users_roles (user_id, role_id) VALUES (1, 1) ON CONFLICT DO NOTHING;
INSERT INTO users_roles (user_id, role_id) VALUES (2, 2) ON CONFLICT DO NOTHING;
INSERT INTO users_roles (user_id, role_id) VALUES (3, 3) ON CONFLICT DO NOTHING;
INSERT INTO users_roles (user_id, role_id) VALUES (4, 4) ON CONFLICT DO NOTHING;
```

---

## 2. Dépendances Maven (`pom.xml` du Backend)

### ✅ Correction Automatique Appliquée
Les dépendances requises pour compiler et exécuter les tests JUnit de Selenium et Cucumber ont été ajoutées dans le fichier [pom.xml](file:///Users/utilisateur/Documents/bna-pfe/backend/pom.xml).

---

## 3. Configuration des répertoires d'upload
Les répertoires de stockage temporaire `uploads/` et `uploads/avatars/` sont déjà créés sous le dossier `backend` et prêts pour vos tests de téléchargement de justificatifs.
