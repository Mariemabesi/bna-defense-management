#!/usr/bin/env bash

# BNA Defense Management - Script d'Exécution Newman & Allure
# Ce script exécute la collection Postman en utilisant Newman, génère des rapports enrichis HTML et JSON,
# et intègre les commandes de reporting Allure.

set -e

# Configuration des couleurs de sortie
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}        BNA Defense Management - Lancement des Tests d'API (Newman)    ${NC}"
echo -e "${BLUE}======================================================================${NC}"

# 1. Vérification des dépendances
echo -e "${YELLOW}[1/4] Vérification des prérequis...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Erreur : Node.js n'est pas installé. Veuillez l'installer.${NC}"
    exit 1
fi

if ! command -v newman &> /dev/null; then
    echo -e "${YELLOW}Newman non détecté. Installation globale en cours...${NC}"
    npm install -g newman
fi

# Installation du reportecr HTML enrichi s'il n'est pas présent
if ! npm list -g newman-reporter-htmlextra &> /dev/null; then
    echo -e "${YELLOW}Installation du reporter htmlextra...${NC}"
    npm install -g newman-reporter-htmlextra
fi

# 2. Création du répertoire de rapports
REPORT_DIR="./reports"
mkdir -p "$REPORT_DIR"

# 3. Exécution de la collection
echo -e "${GREEN}[2/4] Exécution de la collection d'API...${NC}"
echo -e "${YELLOW}Délai entre requêtes : 200ms${NC}"

newman run ./postman_collection.json \
  -e ./environment.json \
  --delay-request 200 \
  --reporters cli,json,htmlextra \
  --reporter-json-export "$REPORT_DIR/newman-report.json" \
  --reporter-htmlextra-export "$REPORT_DIR/newman-report-extra.html" \
  --reporter-htmlextra-title "Rapport de Validation API - BNA Defense Management" \
  --reporter-htmlextra-darkTheme

echo -e "${GREEN}[3/4] Exécution des tests d'API terminée !${NC}"
echo -e "${GREEN}Rapport JSON généré : $REPORT_DIR/newman-report.json${NC}"
echo -e "${GREEN}Rapport HTML enrichi généré : $REPORT_DIR/newman-report-extra.html${NC}"

# 4. Guide Allure et intégration
echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}         Commandes de Génération et Visualisation Allure               ${NC}"
echo -e "${BLUE}======================================================================${NC}"
echo -e "Pour intégrer les résultats Newman avec Allure, procédez comme suit :"
echo -e "1. Installez le reporter Allure pour Newman : ${GREEN}npm install -g newman-reporter-allure${NC}"
echo -e "2. Lancez Newman avec Allure activé : "
echo -e "   ${YELLOW}newman run postman_collection.json -e environment.json -r allure --reporter-allure-export allure-results${NC}"
echo -e "3. Générez le rapport visuel Allure : "
echo -e "   ${YELLOW}allure generate allure-results --clean -o allure-report${NC}"
echo -e "4. Ouvrez le rapport Allure dans votre navigateur : "
echo -e "   ${YELLOW}allure open allure-report${NC}"
echo -e "${BLUE}======================================================================${NC}"
