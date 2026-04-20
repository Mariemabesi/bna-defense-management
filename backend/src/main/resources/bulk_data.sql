-- BNA Defense Management Bulk Test Data (Fixed Schema)
-- This script populates the database with realistic test data for all modules

-- 1. Roles (Does NOT extend BaseEntity)
INSERT INTO roles (name) VALUES ('ROLE_ADMIN') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_CHARGE_DOSSIER') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_PRE_VALIDATEUR') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_VALIDATEUR') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_SUPER_VALIDATEUR') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_AVOCAT') ON CONFLICT (name) DO NOTHING;

-- 2. Groups (Extends BaseEntity)
INSERT INTO groupes (nom, created_at, updated_at) VALUES 
('Direction Générale', NOW(), NOW()),
('Contentieux Tunis Nord', NOW(), NOW()),
('Contentieux Tunis Sud', NOW(), NOW()),
('Contentieux Sousse', NOW(), NOW()),
('Contentieux Sfax', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 3. Referential Data (Extends BaseEntity)
-- ref_devises (nom, code_iso)
INSERT INTO ref_devises (nom, code_iso, created_at, updated_at) VALUES 
('Dinar Tunisien', 'TND', NOW(), NOW()), 
('Euro', 'EUR', NOW(), NOW()), 
('Dollar US', 'USD', NOW(), NOW()) 
ON CONFLICT DO NOTHING;

-- ref_modes_reglement (nom, code)
INSERT INTO ref_modes_reglement (nom, code, created_at, updated_at) VALUES 
('Virement Bancaire', 'VIREMENT', NOW(), NOW()), 
('Chèque', 'CHEQUE', NOW(), NOW()), 
('Espèces', 'ESPECES', NOW(), NOW()) 
ON CONFLICT DO NOTHING;

-- ref_natures_affaire (nom, code)
INSERT INTO ref_natures_affaire (nom, code, created_at, updated_at) VALUES 
('Civil', 'CIV', NOW(), NOW()), 
('Pénal', 'PEN', NOW(), NOW()), 
('Immobilier', 'IMM', NOW(), NOW()), 
('Commercial', 'COM', NOW(), NOW()), 
('Social', 'SOC', NOW(), NOW()) 
ON CONFLICT (nom) DO NOTHING;

-- ref_phases_procedure (nom, ordre)
INSERT INTO ref_phases_procedure (nom, ordre, created_at, updated_at) VALUES 
('Initialisation', 1, NOW(), NOW()), 
('Instruction', 2, NOW(), NOW()), 
('Plaidoirie', 3, NOW(), NOW()), 
('Délibéré', 4, NOW(), NOW()), 
('Exécution', 5, NOW(), NOW()) 
ON CONFLICT DO NOTHING;

-- ref_types_procedure (nom, code)
INSERT INTO ref_types_procedure (nom, code, created_at, updated_at) VALUES 
('Ordinaire', 'ORD', NOW(), NOW()), 
('Référé', 'REF', NOW(), NOW()), 
('Appel', 'APP', NOW(), NOW()), 
('Cassation', 'CAS', NOW(), NOW()) 
ON CONFLICT DO NOTHING;

-- 4. Tribunaux (Extends BaseEntity)
INSERT INTO tribunaux (nom, type, region, created_at, updated_at) VALUES 
('TPI Tunis', 'TPI', 'Tunis', NOW(), NOW()), 
('TPI Ariana', 'TPI', 'Ariana', NOW(), NOW()), 
('Cour d''Appel Tunis', 'APPEL', 'Tunis', NOW(), NOW()), 
('Tribunal Immobilier', 'IMMOBILIER', 'Tunis', NOW(), NOW()) 
ON CONFLICT DO NOTHING;

-- 5. Auxiliaires (Extends BaseEntity)
INSERT INTO auxiliaires (nom, type, telephone, email, adresse, created_at, updated_at) VALUES 
('Me. Ahmed Mansour', 'AVOCAT', '71222333', 'a.mansour@avocat.tn', 'Rue de Palestine, Tunis', NOW(), NOW()),
('Me. Leila Ferchiou', 'AVOCAT', '71444555', 'l.ferchiou@avocat.tn', 'Ennasr, Ariana', NOW(), NOW()),
('M. Salem Trabelsi', 'HUISSIER', '71888999', 's.trabelsi@huissier.tn', 'Centre Urbain Nord, Tunis', NOW(), NOW()),
('Dr. Faouzi Rebai', 'EXPERT', '70111222', 'f.rebai@expert.tn', 'Lac 2, Tunis', NOW(), NOW()),
('Me. Slimane Jendoubi', 'AVOCAT', '73222111', 's.jendoubi@avocat.tn', 'AV Habib Bourguiba, Sousse', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 6. Parties Litige (Extends BaseEntity)
INSERT INTO parties_litige (nom, type, identifiant_fiscal, cin, telephone, adresse, created_at, updated_at) VALUES 
('Société Carthage Construction', 'CJN', '0012345M', NULL, '71999888', 'Berges du Lac, Tunis', NOW(), NOW()),
('M. Moncef Ben Abdallah', 'PHYSIQUE', NULL, '01223344', '98111222', 'La Marina, Gammarth', NOW(), NOW()),
('Banque de l''Habitat (BH)', 'CJN', '9988776B', NULL, '71333444', 'AV Mohamed V, Tunis', NOW(), NOW()),
('Mme. Fatima Zohra', 'PHYSIQUE', NULL, '04455667', '21666777', 'Sidi Bou Said, Tunis', NOW(), NOW()),
('Société Import-Export Sahel', 'CJN', '4455667S', NULL, '73555444', 'Zone Portuaire, Sousse', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 7. Add some users
-- Passwords are "password" (BCrypt)
-- $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb47a
INSERT INTO users (username, password, email, first_name, last_name, full_name, enabled, is_super_validateur, created_at, updated_at) VALUES 
('admin_test', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb47a', 'admin_test@bna.tn', 'Admin', 'Global', 'Administrator Test', true, true, NOW(), NOW()),
('charge_tn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb47a', 'charge_tn@bna.tn', 'Sami', 'Chargé', 'Sami Tunis', true, false, NOW(), NOW()),
('charge_ss', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb47a', 'charge_ss@bna.tn', 'Amira', 'Chargé', 'Amira Sousse', true, false, NOW(), NOW()),
('preval_test', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb47a', 'preval_test@bna.tn', 'Walid', 'Préval', 'Walid Pré-validateur', true, false, NOW(), NOW()),
('val_test', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQUb47a', 'val_test@bna.tn', 'Imen', 'Val', 'Imen Validateur', true, false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 8. Bulk Dossiers
INSERT INTO dossiers (reference, titre, priorite, statut, budget_provisionne, description, created_at, updated_at, created_by, assigned_charge_id, risk_score, frais_reel) VALUES 
('DOS-2026-101', 'Litige Hypothécaire Carthage Const', 'HAUTE', 'EN_COURS', 50000.00, 'Dossier complexe relatif à une hypothèque impayée.', NOW(), NOW(), 'admin', (SELECT id FROM users WHERE username='charge_tn'), 'ÉLEVÉ', 0),
('DOS-2026-102', 'Récupération Créance Moncef B.A', 'MOYENNE', 'OUVERT', 12000.00, 'Crédit à la consommation non remboursé depuis 12 mois.', NOW(), NOW(), 'admin', (SELECT id FROM users WHERE username='charge_tn'), 'MOYEN', 0),
('DOS-2026-103', 'Conflit Foncier Sousse Port', 'HAUTE', 'EN_ATTENTE_PREVALIDATION', 85000.00, 'Contestation de propriété sur un terrain stratégique.', NOW(), NOW(), 'admin', (SELECT id FROM users WHERE username='charge_ss'), 'ÉLEVÉ', 0),
('DOS-2026-104', 'Dossier Fatima Z. - Fraude CB', 'BASSE', 'VALIDE', 3000.00, 'Suspicion de fraude sur carte bancaire.', NOW(), NOW(), 'admin', (SELECT id FROM users WHERE username='charge_tn'), 'FAIBLE', 0),
('DOS-2026-105', 'Arbitrage BH vs BNA', 'HAUTE', 'EN_COURS', 200000.00, 'Arbitrage international pour compensation interbancaire.', NOW(), NOW(), 'admin', (SELECT id FROM users WHERE username='charge_tn'), 'MOYEN', 0),
('DOS-2026-106', 'Contentieux Social Sousse', 'MOYENNE', 'REFUSE', 15000.00, 'Licenciement abusif contesté par ancien employé.', NOW(), NOW(), 'admin', (SELECT id FROM users WHERE username='charge_ss'), 'MOYEN', 0),
('DOS-2026-107', 'Saisie Conservatoire Alpha', 'HAUTE', 'EN_ATTENTE_VALIDATION', 45000.00, 'Saisie sur comptes bancaires suite à jugement.', NOW(), NOW(), 'admin', (SELECT id FROM users WHERE username='charge_tn'), 'ÉLEVÉ', 0),
('DOS-2026-108', 'Dossier Succession Ben Ahmed', 'BASSE', 'CLOTURE', 0.00, 'Gestion administrative de la succession.', NOW(), NOW(), 'admin', (SELECT id FROM users WHERE username='charge_tn'), 'FAIBLE', 0),
('DOS-2026-109', 'Litige Bail Commercial Sfax', 'MOYENNE', 'EN_COURS', 25000.00, 'Non-paiement du loyer agence Sfax.', NOW(), NOW(), 'admin', (SELECT id FROM users WHERE username='charge_ss'), 'MOYEN', 0),
('DOS-2026-110', 'Recouvrement International USD', 'HAUTE', 'OUVERT', 150000.00, 'Dossier en devises pour client étranger.', NOW(), NOW(), 'admin', (SELECT id FROM users WHERE username='charge_tn'), 'ÉLEVÉ', 0)
ON CONFLICT DO NOTHING;

-- 9. Bulk Affaires
INSERT INTO affaires (dossier_id, reference_judiciaire, titre, type, statut, date_ouverture, created_at, updated_at, tribunal_id, avocat_id) VALUES 
((SELECT id FROM dossiers WHERE reference='DOS-2026-101'), 'TPI-T1-2026-100', 'Affaire Hypothèque Carthage', 'IMM', 'EN_COURS', '2026-01-10', NOW(), NOW(), (SELECT id FROM tribunaux WHERE nom='TPI Tunis'), (SELECT id FROM auxiliaires WHERE nom='Me. Ahmed Mansour')),
((SELECT id FROM dossiers WHERE reference='DOS-2026-101'), 'APP-T1-2026-050', 'Appel Hypothèque Carthage', 'IMM', 'EN_COURS', '2026-03-05', NOW(), NOW(), (SELECT id FROM tribunaux WHERE nom='Cour d''Appel Tunis'), (SELECT id FROM auxiliaires WHERE nom='Me. Ahmed Mansour')),
((SELECT id FROM dossiers WHERE reference='DOS-2026-102'), 'TPI-T2-2026-200', 'Récupération Moncef', 'CREDIT', 'GAGNE', '2026-02-15', NOW(), NOW(), (SELECT id FROM tribunaux WHERE nom='TPI Tunis'), (SELECT id FROM auxiliaires WHERE nom='Me. Leila Ferchiou')),
((SELECT id FROM dossiers WHERE reference='DOS-2026-103'), 'TPI-S1-2026-300', 'Foncier Sousse Port', 'IMM', 'EN_COURS', '2026-02-20', NOW(), NOW(), (SELECT id FROM tribunaux WHERE nom='TPI Tunis'), (SELECT id FROM auxiliaires WHERE nom='Me. Slimane Jendoubi')),
((SELECT id FROM dossiers WHERE reference='DOS-2026-105'), 'ARB-INT-2026-001', 'Arbitrage interbancaire', 'LITIGE', 'EN_COURS', '2026-01-01', NOW(), NOW(), (SELECT id FROM tribunaux WHERE nom='TPI Tunis'), (SELECT id FROM auxiliaires WHERE nom='Me. Ahmed Mansour'))
ON CONFLICT DO NOTHING;

-- 10. Bulk Frais
INSERT INTO frais_reglements (affaire_id, libelle, montant, type, statut, created_at, updated_at, observation, taux_tva) VALUES 
((SELECT id FROM affaires WHERE reference_judiciaire='TPI-T1-2026-100'), 'Dépôt de plainte Carthage', 2500.00, 'HONORAIRES_AVOCAT', 'VALIDE', NOW(), NOW(), 'Initial payment for filing', 19.00),
((SELECT id FROM affaires WHERE reference_judiciaire='TPI-T1-2026-100'), 'Constat d''huissier terrain', 850.00, 'FRAIS_HUISSIER', 'PRE_VALIDE', NOW(), NOW(), 'Site visit report', 19.00),
((SELECT id FROM affaires WHERE reference_judiciaire='TPI-S1-2026-300'), 'Expertise topographique', 4500.00, 'EXPERTISE', 'ATTENTE', NOW(), NOW(), 'Waiting for map delivery', 19.00),
((SELECT id FROM affaires WHERE reference_judiciaire='TPI-T2-2026-200'), 'Timbrage jugement GAGNÉ', 120.00, 'TIMBRAGE', 'VALIDE', NOW(), NOW(), 'Final taxes', 0),
((SELECT id FROM affaires WHERE reference_judiciaire='ARB-INT-2026-001'), 'Honoraires arbitrage international', 25000.00, 'HONORAIRES_AVOCAT', 'ATTENTE', NOW(), NOW(), 'First installment', 19.00)
ON CONFLICT DO NOTHING;

-- 11. Audit Logs (No BaseEntity, custom onCreate)
INSERT INTO audit_logs (action, details, entity_name, entity_id, user_email, timestamp) VALUES 
('CREATE_DOSSIER', 'Dossier DOS-2026-101 créé', 'Dossier', (SELECT id FROM dossiers WHERE reference='DOS-2026-101'), 'admin_test@bna.tn', NOW()),
('UPDATE_STATUT', 'Dossier DOS-2026-103 soumis pour pré-validation', 'Dossier', (SELECT id FROM dossiers WHERE reference='DOS-2026-103'), 'charge_ss@bna.tn', NOW()),
('APPROVE_FRAIS', 'Frais Carthage validés par Walid', 'Frais', (SELECT id FROM frais_reglements WHERE libelle='Dépôt de plainte Carthage'), 'preval_test@bna.tn', NOW())
ON CONFLICT DO NOTHING;
