# language: fr
Fonctionnalité: Gestion des dossiers judiciaires

  En tant que Chargé de dossier dans le système BNA,
  Je souhaite créer, modifier et consulter des dossiers,
  Afin de suivre l'avancement des affaires contentieuses de la banque.

  Contexte:
    Étant donné que l'utilisateur est authentifié avec le rôle "CHARGE_DOSSIER"

  Scénario: Création nominale d'un nouveau dossier contentieux
    Quand l'utilisateur accède au formulaire de création de dossier
    Et saisit la référence unique "DOS-2026-QA"
    Et saisit le titre du dossier "Dossier Contentieux Test"
    Et saisit le nom du client "Société Test Tunisie"
    Et saisit le montant du litige 50000.00
    Et clique sur le bouton de sauvegarde du dossier
    Alors le dossier "DOS-2026-QA" doit être créé avec le statut "OUVERT"
    Et le dossier doit être listé dans la table de mes dossiers en cours

  Scénario: Échec de création de dossier en cas de données manquantes
    Quand l'utilisateur accède au formulaire de création de dossier
    Et saisit uniquement la référence "DOS-BAD"
    Et laisse le titre vide
    Et clique sur le bouton de sauvegarde du dossier
    Alors un message d'erreur de validation doit être affiché à l'écran
    Et le dossier ne doit pas être créé en base de données
