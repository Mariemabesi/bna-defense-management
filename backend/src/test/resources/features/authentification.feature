# language: fr
Fonctionnalité: Authentification BNA Defense Management

  En tant qu'utilisateur de l'application BNA Defense Management,
  Je souhaite m'authentifier dans le système,
  Afin d'accéder aux fonctionnalités autorisées pour mon profil.

  Contexte:
    Étant donné que l'utilisateur est sur la page de connexion de l'application BNA

  Scénario: Connexion nominale réussie avec des identifiants valides
    Quand l'utilisateur saisit son nom d'utilisateur "admin" et son mot de passe "admin123"
    Et clique sur le bouton de connexion
    Alors l'utilisateur doit être redirigé vers le tableau de bord principal
    Et une session de navigation sécurisée doit être ouverte

  Scénario: Échec de connexion avec des identifiants invalides
    Quand l'utilisateur saisit son nom d'utilisateur "admin" et son mot de passe "mauvais_pass"
    Et clique sur le bouton de connexion
    Alors un message d'erreur "Identifiants incorrects." doit s'afficher
    Et l'utilisateur doit rester sur la page de connexion

  Scénario: Tentative de connexion avec un compte utilisateur suspendu
    Quand l'utilisateur saisit son nom d'utilisateur "suspendu_user" et son mot de passe "password123"
    Et clique sur le bouton de connexion
    Alors un message d'erreur "Votre compte a été suspendu." doit s'afficher
    Et l'utilisateur doit rester sur la page de connexion
