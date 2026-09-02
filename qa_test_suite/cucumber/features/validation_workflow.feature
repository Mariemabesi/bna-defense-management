# language: fr
Fonctionnalité: Workflow de validation décisionnel

  En tant que validateur ou décideur de la BNA,
  Je souhaite approuver, pré-valider ou rejeter les dossiers et les frais associés,
  Afin de garantir le contrôle et la conformité financière des actions judiciaires.

  Scénario: Cycle nominal de validation d'un dossier
    Étant donné que le Chargé de dossier a soumis le dossier "DOS-2026-QA"
    Quand le Pré-validateur valide le dossier "DOS-2026-QA"
    Alors le statut du dossier doit passer à "ATTENTE_VAL"
    Quand le Validateur effectue la validation finale du dossier "DOS-2026-QA"
    Alors le statut final du dossier doit être "VALIDE"

  Scénario: Rejet décisionnel de dossier avec motif obligatoire
    Étant donné que le dossier "DOS-2026-QA" a été soumis au Validateur
    Quand le Validateur rejette le dossier "DOS-2026-QA" avec le motif "Le montant des honoraires declare est hors bareme national"
    Alors le statut du dossier doit changer pour "REFUSE"
    Et le dossier doit être renvoyé dans la boîte de réception du Chargé pour correction

  Scénario: Échec de rejet de dossier pour motif insuffisant ou vide
    Étant donné que le dossier "DOS-2026-QA" a été soumis au Validateur
    Quand le Validateur tente de rejeter le dossier "DOS-2026-QA" avec le motif trop court "Invalide"
    Alors le système doit rejeter l'action avec un message d'erreur
    Et le statut du dossier doit rester inchangé
