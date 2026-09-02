# language: fr
Fonctionnalité: Administration de l'application et sécurité des comptes

  En tant qu'administrateur système de la BNA,
  Je souhaite gérer les comptes des utilisateurs et consulter les logs d'activité,
  Afin de surveiller et sécuriser la plateforme de gestion des contentieux.

  Contexte:
    Étant donné que l'utilisateur est authentifié avec le rôle "ADMIN"

  Scénario: Activation ou suspension d'un compte utilisateur
    Quand l'administrateur crée un utilisateur de test "temp_user_qa"
    Et accède à la console de gestion des utilisateurs
    Et sélectionne le compte de l'utilisateur "temp_user_qa"
    Et clique sur le bouton pour basculer le statut du compte
    Alors le compte utilisateur doit être désactivé avec succès
    Et l'utilisateur "temp_user_qa" ne doit plus pouvoir s'authentifier sur la plateforme

  Scénario: Protection du compte administrateur principal système
    Quand l'administrateur tente de désactiver le compte "admin" principal
    Alors le système doit rejeter l'action avec un message d'avertissement "Action impossible : le compte administrateur principal système est protégé."
    Et le statut du compte "admin" doit demeurer actif (enabled = true)
