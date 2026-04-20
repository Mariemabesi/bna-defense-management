# BNA Defense Management — Merge & Integration Plan

This document outlines the assessment and step-by-step strategy to merge the **OLD LOCAL VERSION** (Desktop) with the **NEW GITHUB CLONE** (Documents).

## 📊 Task 1: Full Differences Summary

Comparing `/Desktop/old version /PFE` vs `/Documents/bna-pfe`:

### Layer: Frontend (`frontend/`)
- 🟡 **Modified**: `mes-dossiers.component.ts`, `dossier-form.component.ts`, `header.component.ts`, `affaire-list.component.ts`.
- 🔴 **Only in Old**: `src/app/guards/` (Custom Auth Guards), `frontend.pid`.
- ⚪ **Identical**: `package.json`, `main.ts`, most services.

### Layer: Backend (`backend/`)
- 🟡 **Modified**: `DossierService.java`, `Dossier.java`, `DossierRepository.java`.
- 🔴 **Only in Old**: Specialized referentiel services (`BaremeFraisService.java`, `CentreMediationService.java`, etc.), `spring-boot-devtools` in `pom.xml`.
- 🟢 **Only in GitHub**: `bulk_data.sql`, `TribunalService.java` (concrete implementation).
- ⚪ **Identical**: `WebSecurityConfig.java`, `JwtUtils.java`, `AuthTokenFilter.java`.

### Layer: FastAPI (`fastapi/`)
- ⚪ **Identical**: `main.py`, `requirements.txt`, `Dockerfile`.
- 🔴 **Only in Old**: `.env` (API Keys), `ai_run.log`.

### Layer: Infrastructure & Root
- 🟡 **Modified**: `docker-compose.yml`, `Jenkinsfile`.
- 🟢 **Only in GitHub**: `.env` (at root), `final_implementation_plan.md`, `implementation_plan.md`, `innovation_manifesto.md`.
- 🔴 **Only in Old**: `database/` (scripts), `docker/` (config), `documentation/`.

---

## 🟡 Task 2: Conflict Resolution Decisions

| File | Old Change (Local) | GitHub Change | Recommended Action |
| :--- | :--- | :--- | :--- |
| `Dossier.java` | Complex Closure Statuses added. | Standard logic. | **KEEP OLD** (Required for workflow). |
| `DossierService.java` | Multi-step closure logic. | One-step closing check. | **KEEP OLD** (Preserve custom features). |
| `mes-dossiers.component.ts` | "Eye" detail button & closure UI. | Standard table. | **KEEP OLD** (Preserve Obsidian-Glass UI). |
| `GenericReferentielService` | Abstract base class pattern. | Concrete service. | **MANUAL BLEND** (Use Abstract if children exist). |
| `docker-compose.yml` | `pgvector` container image. | Standard `postgres:15`. | **KEEP OLD** (Required for AI features). |

---

## 🔴 Task 3: My Custom Work Inventory (Must Survive)

1. **3-Step Closure Workflow**: Submitting closure, pre-validating, and final validation by different roles.
2. **"En Cours" Manual Status**: Case officers can explicitly move dossiers from OUVERT to EN_COURS.
3. **Affaire "Eye" Action**: Enhanced UI in the dossier modal to view specific affair details.
4. **Specialized Referentiel Management**: Individual services for each business referential (TVA, Parquet, Notaires, etc.).
5. **Obsidian-Glass UI Polish**: Specific styling and micro-interactions in components.
6. **Custom Guards**: Route protection in Angular.

---

## 🟢 Task 4: Missing from Old (GitHub Additions)

1. **Core AI Planning Docs**: `final_implementation_plan.md` outlines the roadmap for Phases 3 & 4.
2. **Bulk Test Data**: `bulk_data.sql` contains a large volume of test entities for scaling tests.
3. **Infrastructure Cleanup**: Modernized `Jenkinsfile` for CI/CD.

---

## 🚀 Task 5: Step-by-Step Merge Plan

### 1. Root & Infrastructure
- [ ] **Copy** `final_implementation_plan.md`, `implementation_plan.md`, and `task_status.md` from GitHub to the merged root.
- [ ] **Keep** the Old version's `docker-compose.yml` but update the PostgreSQL section to use the `pgvector` image while keeping any new volume mappings from GitHub.
- [ ] **Check** `.env`: Merge GitHub variables (secrets placeholders) with your actual API keys from the Old version.

### 2. Backend (Safe Order)
- [ ] **Copy** all specialized services from `backend/src/main/java/com/bna/defense/service/referentiel/` (Old -> New).
- [ ] **Merge** `pom.xml`: Restore `spring-boot-devtools` if desired.
- [ ] **Overwrite** `Dossier.java` and `DossierService.java` with the Old version (their features are strictly superior to the simplified GitHub versions).
- [ ] **Restore** `GenericReferentielService.java` to its `abstract` state from the Old version to support child services.

### 3. Frontend
- [ ] **Copy** `src/app/guards/` directory (Old -> New).
- [ ] **Overwrite** the components in `src/app/components/` with the Old version files to preserve the "Eye" button and closure UI.
- [ ] **Verify** `proxy.conf.json` matches your local development requirements.

### 4. Database & AI
- [ ] **Ensure** the `pgvector` container is active (from Old `docker-compose.yml`).
- [ ] **Apply** the new `bulk_data.sql` to your merged local DB to verify performance.

## ✅ Verification Checklist
- [ ] All 4 roles can log in.
- [ ] Closure buttons appear only for authorized users (Chargé/Pre-Validateur/Validateur).
- [ ] "Eye" button in Dossier modal displays Affaire details without error.
- [ ] FastAPI container starts successfully and logs "RedCell AI Engine Active".
- [ ] All custom guards redirect correctly to the login page.
