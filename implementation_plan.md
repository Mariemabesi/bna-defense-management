# Implementation Plan - Gestion des Actions en Défense (BNA)

## 1. Project Initialization
- [ ] Create `backend` directory with Spring Boot (Maven)
- [ ] Create `frontend` directory with Angular
- [ ] Setup shared Docker Compose for local development (PostgreSQL)

## 2. Backend - Module 1 & 2: Security & Roles
- [ ] Setup Spring Security with JWT
- [ ] Implement User and Role entities
- [ ] Create Auth APIs (Login, Password reset)
- [ ] Implement RBAC (Role Based Access Control)

## 3. Backend - Module 3: Référentiel
- [ ] Create entities for Parties, Auxiliaires, Procédures
- [ ] Create CRUD APIs for referential data
- [ ] Implement validation rules for data cancellation

## 4. Backend - Module 4: Gestion des Dossiers
- [ ] Create Dossier, Affaire, and Jugement entities
- [ ] Implement dossier lifecycle management
- [ ] Setup alert engine (e.g., Scheduled tasks for deadlines)

## 5. Backend - Module 5: Frais & Règlements
- [ ] Create entities for Frais and Règlements
- [ ] Implement payment validation workflow (Chargé -> Pré-validateur -> Validateur)
- [ ] Implement integration points for Treasury

## 6. Frontend - Core UI
- [ ] Setup Angular project with a modern UI library (e.g., Angular Material or PrimeNG)
- [ ] Implement Authentication flow (Login, AuthGuard)
- [ ] Create main layout and navigation

## 7. Frontend - Dossier & Reporting
- [ ] Implement Dossier management screens
- [ ] Create Dashboard with visual indicators (Charts)
- [ ] Implement reporting and export features

## 8. Final Polish & Documentation
- [ ] Generate Swagger/OpenAPI documentation
- [ ] Create User Guide and Admin Guide
- [ ] Final security and performance audit
