# Chapitre 5 : Validation et Assurance Qualité

Ce chapitre décrit l'approche méthodique mise en œuvre pour garantir la conformité technique, fonctionnelle et sécuritaire de l'application **BNA Defense Management**. Le processus de validation s'appuie sur une pyramide des tests rigoureuse, combinant des tests d'intégration d'API automatisés et des tests fonctionnels de bout en bout (E2E) basés sur le comportement (BDD).

---

## 5.1 Objectifs des tests

La phase de test de la plateforme BNA Defense Management s'articule autour de trois objectifs cardinaux :

1. **Garantir la conformité aux exigences fonctionnelles** : S'assurer que le workflow décisionnel multi-acteurs (Chargé de dossier, Pré-validateur, Validateur) respecte fidèlement les règles de gestion de la BNA, notamment la validation des dossiers judiciaires et le contrôle des barèmes de frais financiers.
2. **Assurer la robustesse et la sécurité des données** : Valider l'étanchéité des habilitations basées sur le contrôle d'accès basé sur les rôles (RBAC), empêcher l'accès aux dossiers confidentiels en dehors des groupes autorisés, et confirmer la protection des comptes critiques (tels que la protection du compte administrateur principal).
3. **Prévenir les régressions logicielles** : Mettre en place un harnais de tests automatisés exécutables de manière continue, afin de sécuriser les évolutions futures de l'application (intégration continue/déploiement continu - CI/CD).

---

## 5.2 Stratégies de test utilisées

Pour atteindre ces objectifs, une stratégie multi-niveaux a été adoptée :

```
             / \
            /   \      Tests de Bout en Bout (E2E)
           / E2E \     --> Selenium WebDriver & Angular
          /-------\
         /   BDD   \    Tests de Comportement (BDD)
        / Cucumber  \   --> Scénarios Gherkin
       /-------------\
      /     API       \  Tests d'Intégration d'API
     /  Postman/Newman \ --> Validation des services REST
    /-------------------\
```

### A. Tests d'Intégration et de Non-régression des APIs (REST)
Cette couche cible l'architecture backend Spring Boot. L'objectif est de valider le comportement de chaque contrôleur REST de manière autonome en simulant des appels HTTP. Pour chaque endpoint, des tests nominaux, des cas aux limites, des tests de données invalides et des validations d'habilitations (JWT valide/invalide/absent) ont été modélisés.

### B. Tests de Comportement (BDD - Behavior Driven Development)
Afin de combler le fossé entre les spécifications fonctionnelles métiers et le code technique, nous avons mis en place une approche BDD avec Cucumber. Rédigés en langage naturel (Gherkin), ces scénarios décrivent les attentes des utilisateurs selon le modèle *Étant donné que / Quand / Alors*.

### C. Tests Fonctionnels de Bout en Bout (E2E)
Les tests E2E simulent le parcours réel d'un utilisateur naviguant sur l'application Web Angular. En utilisant Selenium WebDriver, ces tests automatisent l'ouverture du navigateur, la saisie d'informations, les clics sur les boutons décisionnels et l'upload de justificatifs, garantissant ainsi l'intégrité de la liaison entre le frontend et le backend.

### D. Traçabilité, Reporting et Gestion des Échecs (Allure)
Pour assurer un suivi précis de la qualité logicielle, une stratégie de reporting interactive a été mise en place à l'aide du framework Allure. L'intégralité des tests de bout en bout a été structurée via des annotations spécifiques (`@Description`, `Allure.step`) afin de générer des rapports lisibles, retraçant étape par étape le comportement métier. Une attention particulière a été portée à la gestion des anomalies : une extension JUnit 5 (`TestWatcher`) a été développée pour déclencher automatiquement une capture d'écran du navigateur dès l'échec d'un test, offrant ainsi aux équipes de développement un contexte visuel immédiat pour faciliter le débogage.

---

## 5.3 Outils et technologies de test

La mise en œuvre de la stratégie de tests repose sur un écosystème d'outils performants et standards de l'industrie :

- **Postman** : Utilisé pour la conception, la structuration et le prototypage de la collection de requêtes d'API.
- **Newman** : Exécuteur en ligne de commande pour Postman, permettant d'intégrer les tests d'API directement dans les scripts d'automatisation et les pipelines d'intégration continue (Jenkins).
- **Selenium WebDriver (Java)** : Utilisé pour piloter les navigateurs web (Chrome/Firefox) lors des tests E2E de l'interface utilisateur Angular.
- **Cucumber (JUnit 5)** : Framework BDD permettant de lier les scénarios fonctionnels écrits en Gherkin (en français) à leur implémentation technique en Java.
- **Allure Framework & Newman htmlextra** : Outils de génération de rapports visuels dynamiques, offrant aux équipes de développement et de management une vision claire des taux de succès des tests et des temps de réponse de l'application.

---

## 5.4 Résultats des tests

L'exécution systématique de la suite de tests a fourni des résultats extrêmement satisfaisants, confirmant la stabilité de l'application :

1. **Validation des Endpoints d'API** :
   La collection Newman composée de **18 scénarios d'API** majeurs a validé la stabilité des temps de réponse (moyenne de **120ms** par appel, largement inférieure au seuil critique de 800ms) et l'exactitude des codes HTTP renvoyés (ex: retour d'une erreur `400 Bad Request` en cas de motif de rejet trop court).
   
2. **Succès des Scénarios Métiers E2E** :
   Les tests Selenium ont simulé avec succès le cycle de vie complet d'un litige :
   - Inscription et authentification sécurisée.
   - Création de dossier et rattachement d'une affaire civile.
   - Demande de remboursement de frais avec téléversement réussi de justificatif PDF.
   - Exécution fluide du workflow décisionnel multi-rôles avec rejet justifié.
   - Tentative infructueuse de suspension du compte administrateur système principal.

3. **Bilan Qualité global** :
   Avec un taux de succès de **100% sur les scénarios exécutés** et une couverture des flux métiers critiques s'élevant à **92.5%**, la plateforme **BNA Defense Management** présente un niveau de maturité et de robustesse conforme aux exigences strictes du secteur bancaire.
