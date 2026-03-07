package com.bna.defense.config;

import com.bna.defense.entity.*;
import com.bna.defense.repository.UserRepository;
import com.bna.defense.repository.RoleRepository;
import com.bna.defense.repository.DossierRepository;
import com.bna.defense.repository.AffaireRepository;
import com.bna.defense.repository.FraisRepository;
import com.bna.defense.repository.AuxiliaireRepository;
import com.bna.defense.repository.PartieLitigeRepository;
import com.bna.defense.repository.TribunalRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;

@Configuration
public class DataInitializer {

        @Bean
        CommandLineRunner init(RoleRepository roleRepository, UserRepository userRepository,
                        PasswordEncoder passwordEncoder, DossierRepository dossierRepository,
                        AffaireRepository affaireRepository, FraisRepository fraisRepository,
                        AuxiliaireRepository auxiliaireRepository, PartieLitigeRepository partieLitigeRepository,
                        TribunalRepository tribunalRepository) {
                return args -> {
                        // ====== SEED ROLES ======
                        for (Role.RoleType roleType : Role.RoleType.values()) {
                                if (roleRepository.findByName(roleType).isEmpty()) {
                                        roleRepository.save(Role.builder().name(roleType).build());
                                }
                        }

                        // ====== SEED USERS ======
                        Role adminRole = roleRepository.findByName(Role.RoleType.ROLE_ADMIN).orElseThrow();
                        userRepository.findByUsername("admin").ifPresentOrElse(
                                        admin -> {
                                                admin.setPassword(passwordEncoder.encode("admin123"));
                                                admin.setRoles(new HashSet<>(Collections.singletonList(adminRole)));
                                                admin.setEnabled(true);
                                                userRepository.save(admin);
                                        },
                                        () -> {
                                                User admin = User.builder()
                                                                .username("admin")
                                                                .password(passwordEncoder.encode("admin123"))
                                                                .email("admin@bna.com")
                                                                .firstName("Admin")
                                                                .lastName("BNA")
                                                                .roles(new HashSet<>(
                                                                                 Collections.singletonList(adminRole)))
                                                                .enabled(true)
                                                                .build();
                                                userRepository.save(admin);
                                        });

                        seedUser(userRepository, roleRepository, passwordEncoder, "validateur@bna.tn",
                                        "validateur@bna.tn",
                                        Role.RoleType.ROLE_VALIDATEUR);
                        seedUser(userRepository, roleRepository, passwordEncoder, "prevalidateur@bna.tn",
                                        "prevalidateur@bna.tn",
                                        Role.RoleType.ROLE_PRE_VALIDATEUR);
                        seedUser(userRepository, roleRepository, passwordEncoder, "profil@bna.tn", "profil@bna.tn",
                                        Role.RoleType.ROLE_CHARGE_DOSSIER);
                        seedUser(userRepository, roleRepository, passwordEncoder, "charge@bna.tn", "charge@bna.tn",
                                        Role.RoleType.ROLE_CHARGE_DOSSIER);

                        // ====== SEED AUXILIAIRES ======
                        if (auxiliaireRepository.count() == 0) {
                                auxiliaireRepository.save(Auxiliaire.builder()
                                                .nom("Me. Karim Ben Salah").type(Auxiliaire.TypeAuxiliaire.AVOCAT)
                                                .telephone("71 234 567").email("k.bensalah@avocat.tn")
                                                .adresse("12 Rue de la Liberté, Tunis").build());
                                auxiliaireRepository.save(Auxiliaire.builder()
                                                .nom("Me. Sonia Trabelsi").type(Auxiliaire.TypeAuxiliaire.AVOCAT)
                                                .telephone("71 345 678").email("s.trabelsi@avocat.tn")
                                                .adresse("45 Avenue Habib Bourguiba, Sfax").build());
                                auxiliaireRepository.save(Auxiliaire.builder()
                                                .nom("Huissier Rachid Mahjoub").type(Auxiliaire.TypeAuxiliaire.HUISSIER)
                                                .telephone("71 456 789").email("r.mahjoub@huissier.tn")
                                                .adresse("8 Rue Ibn Khaldoun, Sousse").build());
                                auxiliaireRepository.save(Auxiliaire.builder()
                                                .nom("Expert Comptable Nizar Ayed")
                                                .type(Auxiliaire.TypeAuxiliaire.EXPERT)
                                                .telephone("71 567 890").email("n.ayed@expert.tn")
                                                .adresse("22 Avenue de la République, Tunis").build());
                        }

                        // ====== SEED ADVERSAIRES ======
                        PartieLitige adversaire1 = null;
                        PartieLitige adversaire2 = null;
                        if (partieLitigeRepository.count() == 0) {
                                adversaire1 = partieLitigeRepository.save(PartieLitige.builder()
                                                .nom("Société Alpha SARL").type(PartieLitige.TypePartie.PM)
                                                .identifiantFiscal("1234567ABC").telephone("71 111 222")
                                                .adresse("Zone Industrielle, Ben Arous").build());
                                adversaire2 = partieLitigeRepository.save(PartieLitige.builder()
                                                .nom("Mohamed Ben Ali").prenom("Mohamed")
                                                .type(PartieLitige.TypePartie.PP)
                                                .cin("07654321").telephone("98 765 432")
                                                .adresse("15 Rue de Carthage, Tunis").build());
                        }

                        // ====== SEED DOSSIERS + AFFAIRES + FRAIS ======
                        if (dossierRepository.count() == 0) {
                                Auxiliaire avocat1 = auxiliaireRepository.findAll().stream()
                                                .filter(a -> a.getType() == Auxiliaire.TypeAuxiliaire.AVOCAT)
                                                .findFirst().orElse(null);
                                if (adversaire1 == null) {
                                        adversaire1 = partieLitigeRepository.findAll().stream().findFirst()
                                                        .orElse(null);
                                }
                                if (adversaire2 == null) {
                                        adversaire2 = partieLitigeRepository.findAll().stream().skip(1).findFirst()
                                                        .orElse(adversaire1);
                                }

                                // --- Dossier 1: EN_COURS with affaires and frais at various statuses ---
                                Dossier dos1 = dossierRepository.save(Dossier.builder()
                                                .reference("DEF-2024-001")
                                                .titre("Contentieux Commercial vs Société Alpha")
                                                .priorite(Dossier.Priorite.HAUTE).statut(Dossier.StatutDossier.EN_COURS)
                                                .budgetProvisionne(new BigDecimal("15000.00"))
                                                .description(
                                                                "Litige commercial relatif au non-paiement de factures. Montant en jeu: 150,000 TND.")
                                                .build());

                                Affaire aff1 = affaireRepository.save(Affaire.builder()
                                                .dossier(dos1).referenceJudiciaire("TPI-TUN-2024-4521")
                                                .type(Affaire.TypeAffaire.CIVIL)
                                                .dateOuverture(LocalDate.of(2024, 3, 15))
                                                .adversaire(adversaire1).avocat(avocat1)
                                                .statut(Affaire.StatutAffaire.EN_COURS).build());

                                // Frais at ATTENTE (needs pre-validation)
                                fraisRepository.save(Frais.builder()
                                                .affaire(aff1).libelle("Honoraires avocat - Phase initiale")
                                                .montant(new BigDecimal("3500.00"))
                                                .type(Frais.TypeFrais.HONORAIRES_AVOCAT)
                                                .statut(Frais.StatutFrais.ATTENTE)
                                                .observation("Provision initiale pour prise en charge du dossier")
                                                .build());

                                // Frais at PRE_VALIDE (needs validation)
                                fraisRepository.save(Frais.builder()
                                                .affaire(aff1).libelle("Frais d'huissier - Signification")
                                                .montant(new BigDecimal("450.00")).type(Frais.TypeFrais.FRAIS_HUISSIER)
                                                .statut(Frais.StatutFrais.PRE_VALIDE)
                                                .observation("Signification de l'assignation").build());

                                // Frais at VALIDE (ready for batch treasury)
                                fraisRepository.save(Frais.builder()
                                                .affaire(aff1).libelle("Consignation expertise judiciaire")
                                                .montant(new BigDecimal("2000.00")).type(Frais.TypeFrais.CONSIGNATION)
                                                .statut(Frais.StatutFrais.VALIDE)
                                                .observation("Consignation ordonnée par le tribunal").build());

                                fraisRepository.save(Frais.builder()
                                                .affaire(aff1).libelle("Timbrage fiscal actes judiciaires")
                                                .montant(new BigDecimal("180.00")).type(Frais.TypeFrais.TIMBRAGE)
                                                .statut(Frais.StatutFrais.VALIDE)
                                                .observation("Timbres fiscaux pour enregistrement").build());

                                // --- Dossier 2: A_PRE_VALIDER ---
                                Dossier dos2 = dossierRepository.save(Dossier.builder()
                                                .reference("DEF-2024-002").titre("Litige Immobilier Terrain Lac 2")
                                                .priorite(Dossier.Priorite.MOYENNE)
                                                .statut(Dossier.StatutDossier.A_PRE_VALIDER)
                                                .budgetProvisionne(new BigDecimal("8000.00"))
                                                .description("Contestation de propriété sur parcelle cadastrale. Procédure en appel.")
                                                .build());

                                Affaire aff2 = affaireRepository.save(Affaire.builder()
                                                .dossier(dos2).referenceJudiciaire("CA-TUN-2024-789")
                                                .type(Affaire.TypeAffaire.PATRIMOINE_IMMOBILIER)
                                                .dateOuverture(LocalDate.of(2024, 6, 1))
                                                .adversaire(adversaire2).avocat(avocat1)
                                                .statut(Affaire.StatutAffaire.EN_COURS).build());

                                fraisRepository.save(Frais.builder()
                                                .affaire(aff2).libelle("Honoraires avocat - Appel")
                                                .montant(new BigDecimal("5000.00"))
                                                .type(Frais.TypeFrais.HONORAIRES_AVOCAT)
                                                .statut(Frais.StatutFrais.ATTENTE)
                                                .observation("Honoraires pour procédure d'appel").build());

                                fraisRepository.save(Frais.builder()
                                                .affaire(aff2).libelle("Expertise immobilière terrain")
                                                .montant(new BigDecimal("3200.00")).type(Frais.TypeFrais.EXPERTISE)
                                                .statut(Frais.StatutFrais.VALIDE)
                                                .observation("Expertise par géomètre agrée").build());

                                // --- Dossier 3: A_VALIDER ---
                                Dossier dos3 = dossierRepository.save(Dossier.builder()
                                                .reference("DEF-2024-003")
                                                .titre("Affaire Prud'homale - Licenciement abusif")
                                                .priorite(Dossier.Priorite.HAUTE)
                                                .statut(Dossier.StatutDossier.A_VALIDER)
                                                .budgetProvisionne(new BigDecimal("6500.00"))
                                                .description(
                                                                "Défense BNA suite à plainte pour licenciement abusif. Demande de dommages: 45,000 TND.")
                                                .build());

                                Affaire aff3 = affaireRepository.save(Affaire.builder()
                                                .dossier(dos3).referenceJudiciaire("CPH-TUN-2024-1234")
                                                .type(Affaire.TypeAffaire.PRUDHOMME)
                                                .dateOuverture(LocalDate.of(2024, 1, 20))
                                                .adversaire(adversaire2).avocat(avocat1)
                                                .statut(Affaire.StatutAffaire.EN_COURS).build());

                                fraisRepository.save(Frais.builder()
                                                .affaire(aff3).libelle("Honoraires avocat - Prud'hommes")
                                                .montant(new BigDecimal("4000.00"))
                                                .type(Frais.TypeFrais.HONORAIRES_AVOCAT)
                                                .statut(Frais.StatutFrais.PRE_VALIDE)
                                                .observation("Procédure prud'homale complète").build());

                                // --- Dossier 4: OUVERT ---
                                Dossier dos4 = dossierRepository.save(Dossier.builder()
                                                .reference("DEF-2024-004").titre("Fraude Chèque Impayé - Client Delta")
                                                .priorite(Dossier.Priorite.BASSE).statut(Dossier.StatutDossier.OUVERT)
                                                .budgetProvisionne(new BigDecimal("2500.00"))
                                                .description("Chèque impayé d'un montant de 12,000 TND. Procédure pénale engagée.")
                                                .build());

                                Affaire aff4 = affaireRepository.save(Affaire.builder()
                                                .dossier(dos4).referenceJudiciaire("TPI-BEN-2024-567")
                                                .type(Affaire.TypeAffaire.PENAL)
                                                .dateOuverture(LocalDate.of(2024, 8, 10))
                                                .adversaire(adversaire1).statut(Affaire.StatutAffaire.EN_COURS)
                                                .build());

                                fraisRepository.save(Frais.builder()
                                                .affaire(aff4).libelle("Frais de constat huissier")
                                                .montant(new BigDecimal("350.00")).type(Frais.TypeFrais.FRAIS_HUISSIER)
                                                .statut(Frais.StatutFrais.ATTENTE)
                                                .observation("Constat de non-paiement").build());

                                // --- Dossier 5: CLOTURE (historical) ---
                                Dossier dos5 = dossierRepository.save(Dossier.builder()
                                                .reference("DEF-2023-042").titre("Recouvrement Créance - Société Beta")
                                                .priorite(Dossier.Priorite.MOYENNE)
                                                .statut(Dossier.StatutDossier.CLOTURE)
                                                .budgetProvisionne(new BigDecimal("4000.00"))
                                                .description("Procédure de recouvrement terminée. Jugement favorable obtenu.")
                                                .build());

                                Affaire aff5 = affaireRepository.save(Affaire.builder()
                                                .dossier(dos5).referenceJudiciaire("TPI-TUN-2023-2100")
                                                .type(Affaire.TypeAffaire.CIVIL)
                                                .dateOuverture(LocalDate.of(2023, 5, 12))
                                                .adversaire(adversaire1).avocat(avocat1)
                                                .statut(Affaire.StatutAffaire.GAGNE).build());

                                fraisRepository.save(Frais.builder()
                                                .affaire(aff5).libelle("Honoraires avocat - Clôture")
                                                .montant(new BigDecimal("2800.00"))
                                                .type(Frais.TypeFrais.HONORAIRES_AVOCAT)
                                                .statut(Frais.StatutFrais.ENVOYE_TRESORERIE)
                                                .observation("Solde final après jugement").build());
                        }

                        // ====== SEED TRIBUNAUX ======
                        if (tribunalRepository.count() == 0) {
                                tribunalRepository.save(Tribunal.builder().nom("Tribunal de Première Instance de Tunis").region("Tunis").adresse("Boulevard du 9 Avril, Tunis").telephone("71 560 333").build());
                                tribunalRepository.save(Tribunal.builder().nom("Tribunal de Première Instance de l'Ariana").region("Ariana").adresse("Avenue Habib Bourguiba, Ariana").telephone("70 730 444").build());
                                tribunalRepository.save(Tribunal.builder().nom("Tribunal de Première Instance de Ben Arous").region("Ben Arous").adresse("Ben Arous Ville").telephone("71 380 555").build());
                                tribunalRepository.save(Tribunal.builder().nom("Cour d'Appel de Tunis").region("Tunis").adresse("Boulevard du 9 Avril, Tunis").telephone("71 561 222").build());
                                tribunalRepository.save(Tribunal.builder().nom("Tribunal de Première Instance de Sousse").region("Sousse").adresse("Avenue du 2 Mars, Sousse").telephone("73 222 111").build());
                        }
                };
        }

        private void seedUser(UserRepository userRepo, RoleRepository roleRepo, PasswordEncoder encoder,
                        String username,
                        String email, Role.RoleType roleType) {
                Role role = roleRepo.findByName(roleType).orElseThrow();
                User user = userRepo.findByUsername(username).orElseGet(() -> {
                        User newUser = new User();
                        newUser.setUsername(username);
                        return newUser;
                });
                
                user.setPassword(encoder.encode(username));
                user.setEmail(email);
                user.setFirstName(username.split("@")[0]);
                user.setLastName("BNA");
                user.setEnabled(true);
                user.setRoles(new java.util.HashSet<>(java.util.Collections.singletonList(role)));
                
                userRepo.save(user);
        }
}
