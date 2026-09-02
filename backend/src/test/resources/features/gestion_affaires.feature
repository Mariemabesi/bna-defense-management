# language: fr
Fonctionnalité: Gestion des affaires judiciaires

  En tant que Chargé de dossier dans le système BNA,
  Je souhaite rattacher des affaires à un dossier contentieux,
  Afin de gérer les procédures en justice associées.

  Contexte:
    Étant donné que l'utilisateur est connecté et dispose d'un dossier existant "DOS-2026-QA"

  Scénario: Rattachement nominal d'une affaire à un dossier
    Quand l'utilisateur accède à la page d'ajout d'affaires
    Et sélectionne le dossier référencé "DOS-2026-QA"
    Et saisit le numéro unique d'affaire "AFF-999-E2E"
    Et saisit le titre de l'affaire "Instance de Cassation BNA"
    Et choisit le type d'affaire "CIVILE"
    Et clique sur le bouton de sauvegarde de l'affaire
    Alors l'affaire "AFF-999-E2E" doit être créée et liée au dossier "DOS-2026-QA"
    Et l'affaire doit figurer dans la liste des affaires avec le statut "EN_COURS"
