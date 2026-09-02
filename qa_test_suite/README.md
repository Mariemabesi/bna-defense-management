# Suite de Tests QA - BNA Defense Management

Ce répertoire contient la suite complète de tests professionnels pour l'application **BNA Defense Management**, comprenant les tests d'intégration d'APIs (Postman / Newman) et les scénarios fonctionnels de bout en bout (Selenium WebDriver / Cucumber BDD).

---

## Structure du Projet de Test

```
qa_test_suite/
├── README.md                  # Ce guide d'utilisation
├── test_matrix.md             # Matrice complète de couverture fonctionnelle
├── postman/
│   ├── postman_collection.json # Collection d'API Postman
│   ├── environment.json       # Environnement de variables local
│   └── run_newman.sh          # Script d'exécution Newman & Allure
├── selenium/
│   ├── BnaDefenseE2ETest.java  # Classe de tests Selenium WebDriver (POM)
│   └── selenium_e2e_scenarios.md # Description textuelle des scénarios
├── cucumber/
│   ├── features/              # Fichiers de spécification Gherkin (.feature)
│   └── glue/                  # Code Java de liaison (Hooks, Runner, Steps)
└── reporting/
    ├── qa_report.md           # Rapport QA (Vulnérabilités, recommandations)
    ├── chapitre_memoire.md    # Rédaction du Chapitre 5 du mémoire
    └── missing_items.md       # Prérequis de données (SQL) et dépendances Maven
```

---

## 1. Prérequis Système

Assurez-vous que les éléments suivants sont installés sur votre machine :
- **Node.js** (v18+) et **npm** (pour exécuter Newman).
- **Java JDK 17** ou supérieur (pour compiler et exécuter les tests Java).
- **Maven** (pour la gestion des dépendances Java et l'exécution JUnit).
- **Google Chrome** et **ChromeDriver** (requis par Selenium en tâche de fond).

---

## 2. Étape Préalable : Initialisation des Données de Test

Les tests d'API et E2E nécessitent la présence d'utilisateurs avec des rôles et identifiants spécifiques. 

1. Ouvrez votre gestionnaire de base de données PostgreSQL.
2. Exécutez le script SQL de seeding disponible dans le fichier :
   [missing_items.md (Section 1)](file:///Users/utilisateur/Documents/bna-pfe/qa_test_suite/reporting/missing_items.md)
3. Ce script va créer les rôles et insérer les comptes de test indispensables (`admin`, `charge`, `preval`, `val`).

---

## 3. Lancement des Tests d'API (Postman / Newman)

### A. Exécution locale rapide avec le Script Bash
Nous avons conçu un script automatisé qui installe Newman, exécute la collection et génère les rapports HTML interactifs.

Depuis le répertoire de l'espace de travail, lancez :
```bash
cd qa_test_suite/postman
./run_newman.sh
```

### B. Commandes Newman manuelles
Pour exécuter la suite manuellement depuis le terminal :
```bash
newman run postman_collection.json -e environment.json --delay-request 200 --reporters cli,htmlextra
```

### C. Génération de Rapports Allure
Pour exporter et visualiser les rapports sous format Allure :
1. Lancez Newman avec Allure :
   ```bash
   newman run postman_collection.json -e environment.json -r allure --reporter-allure-export allure-results
   ```
2. Générez le rapport Allure :
   ```bash
   allure generate allure-results --clean -o allure-report
   ```
3. Ouvrez le rapport dans votre navigateur :
   ```bash
   allure open allure-report
   ```

---

## 4. Lancement des Tests E2E et BDD (Selenium & Cucumber)

Les fichiers de tests JUnit se trouvent dans le projet Spring Boot (Backend).

### A. Ajout des dépendances Maven
Avant le premier lancement, vérifiez que votre fichier `pom.xml` intègre bien les dépendances Cucumber et Selenium listées dans le fichier [missing_items.md](file:///Users/utilisateur/Documents/bna-pfe/qa_test_suite/reporting/missing_items.md).

### B. Lancement des tests Cucumber (BDD)
Pour exécuter l'ensemble des scénarios décrits dans les fichiers `.feature` :
```bash
mvn test -Dtest=Runner
```
*Les rapports HTML et XML de Cucumber seront générés dans le dossier `qa_test_suite/reports/`.*

### C. Lancement des tests E2E Selenium
Pour lancer la classe de tests E2E (mode Headless activé par défaut) :
```bash
mvn test -Dtest=BnaDefenseE2ETest
```

---

## 5. Consultation des Rapports de Tests
- **Newman HTML enrichi** : Ouvrez dans votre navigateur le fichier `qa_test_suite/postman/reports/newman-report-extra.html`.
- **Cucumber HTML** : Ouvrez dans votre navigateur le fichier `qa_test_suite/reports/cucumber-reports.html`.
