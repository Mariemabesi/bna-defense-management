package com.bna.defense.config;

import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.Role;
import com.bna.defense.entity.User;
import com.bna.defense.repository.DossierRepository;
import com.bna.defense.repository.RoleRepository;
import com.bna.defense.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Component
public class HierarchicalRbacDemoRunner implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private DossierRepository dossierRepository;
    @Autowired private PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.existsByUsername("validateur1")) return;

        System.out.println("--- GENERATING HIERARCHICAL RBAC DEMO DATA ---");

        // 1. Roles
        Role roleValidateur = roleRepository.findByName(Role.RoleType.ROLE_VALIDATEUR).orElse(null);
        Role rolePreValidateur = roleRepository.findByName(Role.RoleType.ROLE_PRE_VALIDATEUR).orElse(null);
        Role roleCharge = roleRepository.findByName(Role.RoleType.ROLE_CHARGE_DOSSIER).orElse(null);

        // 2. Validateur
        User validateur = new User();
        validateur.setUsername("validateur1");
        validateur.setEmail("validateur1@bna.tn");
        validateur.setPassword(encoder.encode("password123"));
        validateur.setFullName("Chef Validateur");
        validateur.setRoles(new HashSet<>(Collections.singletonList(roleValidateur)));
        validateur = userRepository.save(validateur);

        // 3. Pré-validateurs
        User preValidateurA = createSubUser("pre_val_a", "Pré-Validateur A", validateur, rolePreValidateur);
        User preValidateurB = createSubUser("pre_val_b", "Pré-Validateur B", validateur, rolePreValidateur);

        // 4. Chargés for PV A
        User chargeA1 = createSubUser("charge_a1", "Chargé A1", preValidateurA, roleCharge);
        User chargeA2 = createSubUser("charge_a2", "Chargé A2", preValidateurA, roleCharge);

        // 5. Chargés for PV B
        User chargeB1 = createSubUser("charge_b1", "Chargé B1", preValidateurB, roleCharge);

        // 6. Dossiers for each Chargé
        createDossier("DOS-A1-001", "Litige Immobilier A1", chargeA1);
        createDossier("DOS-A2-001", "Recouvrement Créance A2", chargeA2);
        createDossier("DOS-B1-001", "Contentieux Social B1", chargeB1);

        System.out.println("--- HIERARCHICAL RBAC DEMO DATA READY ---");
    }

    private User createSubUser(String username, String fullName, User manager, Role role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(username + "@bna.tn");
        user.setPassword(encoder.encode("password123"));
        user.setFullName(fullName);
        user.setManager(manager);
        user.setRoles(new HashSet<>(Collections.singletonList(role)));
        return userRepository.save(user);
    }

    private void createDossier(String ref, String titre, User assignedCharge) {
        Dossier dossier = new Dossier();
        dossier.setReference(ref);
        dossier.setTitre(titre);
        dossier.setAssignedCharge(assignedCharge);
        dossier.setStatut(Dossier.StatutDossier.OUVERT);
        dossier.setCreatedBy("admin");
        dossierRepository.save(dossier);
    }
}
