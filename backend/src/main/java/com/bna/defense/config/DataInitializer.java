package com.bna.defense.config;

import com.bna.defense.entity.*;
import com.bna.defense.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;

@Configuration
public class DataInitializer {

    @Autowired
    private DossierRepository dossierRepository;

    @Bean
    CommandLineRunner init(RoleRepository roleRepository, UserRepository userRepository,
                    PasswordEncoder passwordEncoder,
                    AffaireRepository affaireRepository, FraisRepository fraisRepository,
                    AuxiliaireRepository auxiliaireRepository, PartieLitigeRepository partieLitigeRepository,
                    TribunalRepository tribunalRepository, com.bna.defense.repository.GroupeRepository groupeRepository) {
        return args -> {
            for (Role.RoleType roleType : Role.RoleType.values()) {
                if (roleRepository.findByName(roleType).isEmpty()) {
                    Role r = new Role();
                    r.setName(roleType);
                    roleRepository.save(r);
                }
            }

            Role adminRole = roleRepository.findByName(Role.RoleType.ROLE_ADMIN).orElseThrow();
            userRepository.findByUsername("admin").ifPresentOrElse(
                admin -> {
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    admin.setRoles(new HashSet<>(Collections.singletonList(adminRole)));
                    admin.setEnabled(true);
                    userRepository.save(admin);
                },
                () -> {
                    User admin = new User();
                    admin.setUsername("admin");
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    admin.setEmail("admin@bna.com");
                    admin.setFirstName("Admin");
                    admin.setLastName("BNA");
                    admin.setRoles(new HashSet<>(Collections.singletonList(adminRole)));
                    admin.setEnabled(true);
                    userRepository.save(admin);
                });

            seedUser(userRepository, roleRepository, passwordEncoder, "validateur@bna.tn", "validateur@bna.tn", Role.RoleType.ROLE_VALIDATEUR);
            seedUser(userRepository, roleRepository, passwordEncoder, "prevalidateur@bna.tn", "prevalidateur@bna.tn", Role.RoleType.ROLE_PRE_VALIDATEUR);
            seedUser(userRepository, roleRepository, passwordEncoder, "profil@bna.tn", "profil@bna.tn", Role.RoleType.ROLE_CHARGE_DOSSIER);
            seedUser(userRepository, roleRepository, passwordEncoder, "charge@bna.tn", "charge@bna.tn", Role.RoleType.ROLE_CHARGE_DOSSIER);

            User validator = userRepository.findByUsername("validateur@bna.tn").orElse(null);
            Groupe groupTunis = groupeRepository.findByNom("Direction Contentieux Tunis").orElseGet(() -> {
                Groupe g = new Groupe();
                g.setNom("Direction Contentieux Tunis");
                g.setValidateur(validator);
                return g;
            });
            groupeRepository.save(groupTunis);
            
            Groupe groupSousse = groupeRepository.findByNom("Direction Contentieux Sousse").orElseGet(() -> {
                Groupe g = new Groupe();
                g.setNom("Direction Contentieux Sousse");
                g.setValidateur(validator);
                return g;
            });
            groupeRepository.save(groupSousse);

            if (auxiliaireRepository.count() == 0) {
                Auxiliaire a1 = new Auxiliaire();
                a1.setNom("Me. Karim Ben Salah"); a1.setType(Auxiliaire.TypeAuxiliaire.AVOCAT);
                a1.setTelephone("71 234 567"); a1.setEmail("k.bensalah@avocat.tn");
                a1.setAdresse("12 Rue de la Liberté, Tunis");
                auxiliaireRepository.save(a1);
            }

            if (partieLitigeRepository.count() <= 1) {
                PartieLitige p1 = new PartieLitige();
                p1.setNom("Société Alpha SARL"); p1.setType(PartieLitige.TypePartie.CJN);
                p1.setIdentifiantFiscal("1234567ABC"); p1.setTelephone("71 111 222");
                p1.setAdresse("Zone Industrielle, Ben Arous");
                partieLitigeRepository.save(p1);

                PartieLitige p2 = new PartieLitige();
                p2.setNom("Ahmed Ben Ali"); p2.setType(PartieLitige.TypePartie.PHYSIQUE);
                p2.setCin("08877665"); p2.setTelephone("98 765 432");
                p2.setAdresse("Rue des Oranges, Tunis");
                partieLitigeRepository.save(p2);

                PartieLitige p3 = new PartieLitige();
                p3.setNom("Boulangerie Moderne SA"); p3.setType(PartieLitige.TypePartie.CJN);
                p3.setIdentifiantFiscal("9988776XYZ"); p3.setTelephone("72 333 444");
                p3.setAdresse("AV Habib Bourguiba, Sfax");
                partieLitigeRepository.save(p3);

                PartieLitige p4 = new PartieLitige();
                p4.setNom("Sonia Mansour"); p4.setType(PartieLitige.TypePartie.PHYSIQUE);
                p4.setCin("01122334"); p4.setTelephone("21 000 999");
                p4.setAdresse("Ennasr 2, Ariana");
                partieLitigeRepository.save(p4);
            }

            if (dossierRepository.count() == 0) {
                Dossier d1 = new Dossier();
                d1.setReference("DEF-2024-001"); d1.setTitre("Contentieux Commercial vs Société Alpha");
                d1.setPriorite(Dossier.Priorite.HAUTE); d1.setStatut(Dossier.StatutDossier.EN_COURS);
                d1.setBudgetProvisionne(new BigDecimal("15000.00"));
                d1.setDescription("Litige commercial relatif au non-paiement de factures.");
                dossierRepository.save(d1);

                Affaire aff1 = new Affaire();
                aff1.setDossier(d1); aff1.setReferenceJudiciaire("TPI-TUN-2024-4521");
                aff1.setType(Affaire.TypeAffaire.CIVIL); aff1.setDateOuverture(LocalDate.of(2024, 3, 15));
                aff1.setStatut(Affaire.StatutAffaire.EN_COURS);
                affaireRepository.save(aff1);

                Frais f1 = new Frais();
                f1.setAffaire(aff1); f1.setLibelle("Honoraires avocat - Phase initiale");
                f1.setMontant(new BigDecimal("3500.00")); f1.setType(Frais.TypeFrais.HONORAIRES_AVOCAT);
                f1.setStatut(Frais.StatutFrais.ATTENTE);
                fraisRepository.save(f1);
            }
        };
    }

    private User seedUser(UserRepository userRepo, RoleRepository roleRepo, PasswordEncoder encoder, String username, String email, Role.RoleType roleType) {
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
        user.setRoles(new HashSet<>(Collections.singletonList(role)));
        return userRepo.save(user);
    }
}
