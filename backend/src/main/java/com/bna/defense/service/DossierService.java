package com.bna.defense.service;

import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.Affaire;
import com.bna.defense.entity.User;
import com.bna.defense.repository.DossierRepository;
import com.bna.defense.repository.AffaireRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Service
public class DossierService {

    @Autowired
    private DossierRepository dossierRepository;
    
    @Autowired
    private AffaireRepository affaireRepository;

    public Page<Dossier> getAllDossiers(User currentUser, Pageable pageable) {
        boolean isSuper = currentUser.isSuperValidateur() || currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == com.bna.defense.entity.Role.RoleType.ROLE_ADMIN || 
                               r.getName() == com.bna.defense.entity.Role.RoleType.ROLE_SUPER_VALIDATEUR);
        
        User validatorGroup = null;
        if (!isSuper) {
            if (currentUser.getRoles().stream().anyMatch(r -> r.getName() == com.bna.defense.entity.Role.RoleType.ROLE_VALIDATEUR)) {
                validatorGroup = currentUser;
            } else if (currentUser.getGroupe() != null) {
                validatorGroup = currentUser.getGroupe().getValidateur();
            }
        }
        
        return dossierRepository.findAllWithRBAC(validatorGroup, currentUser.getUsername(), isSuper, pageable);
    }

    public Dossier getDossierById(Long id) {
        return dossierRepository.findById(id).orElseThrow(() -> new RuntimeException("Dossier non trouvé"));
    }

    @Transactional
    public Dossier createDossier(Dossier dossier, User creator) {
        dossier.setCreatedBy(creator.getUsername());
        if (dossier.getStatut() == null) {
            dossier.setStatut(Dossier.StatutDossier.OUVERT);
        }
        
        // Ensure mandatory BigDecimals are not null
        if (dossier.getFraisReel() == null) dossier.setFraisReel(java.math.BigDecimal.ZERO);
        if (dossier.getFraisInitial() == null) dossier.setFraisInitial(java.math.BigDecimal.ZERO);
        
        // Point 6: Assign Group Validateur
        if (creator.getGroupe() != null) {
            dossier.setGroupValidateur(creator.getGroupe().getValidateur());
        } else if (creator.getRoles().stream().anyMatch(r -> r.getName() == com.bna.defense.entity.Role.RoleType.ROLE_VALIDATEUR)) {
            dossier.setGroupValidateur(creator);
        }

        // Point 10: Generate reference DEF-2026-XXXX
        if (dossier.getReference() == null || dossier.getReference().trim().isEmpty()) {
            int randomNum = new Random().nextInt(9000) + 1000;
            dossier.setReference("DEF-2026-" + randomNum);
        }

        Dossier saved = dossierRepository.save(dossier);

        // Auto-create initial affaire if empty to allow fee management
        if (saved.getAffaires() == null || saved.getAffaires().isEmpty()) {
            Affaire defaultAffaire = new Affaire();
            defaultAffaire.setDossier(saved);
            defaultAffaire.setReferenceJudiciaire("JUD-" + saved.getReference());
            defaultAffaire.setType(Affaire.TypeAffaire.CIVIL);
            defaultAffaire.setStatut(Affaire.StatutAffaire.EN_COURS);
            defaultAffaire.setDateOuverture(java.time.LocalDate.now());
            
            // Explicitly save the affaire
            affaireRepository.save(defaultAffaire);
            
            // Re-fetch to ensure relationship is clean
            return dossierRepository.findById(saved.getId()).orElse(saved);
        }

        return saved;
    }

    @Transactional
    public Dossier updateStatut(Long id, Dossier.StatutDossier newStatut) {
        Dossier dossier = getDossierById(id);
        dossier.setStatut(newStatut);
        return dossierRepository.save(dossier);
    }

    @Transactional
    public Dossier closeDossier(Long id) {
        Dossier dossier = getDossierById(id);

        // Checklist: all affaires must be CLASSE
        boolean allFinished = dossier.getAffaires().stream()
                .allMatch(a -> a.getStatut() == Affaire.StatutAffaire.CLASSE);

        if (!allFinished) {
            throw new RuntimeException("Toutes les affaires liées doivent être classées avant la clôture du dossier.");
        }

        dossier.setStatut(Dossier.StatutDossier.CLOTURE);
        return dossierRepository.save(dossier);
    }

    @Transactional
    public List<Dossier> searchDossiers(String query) {
        return dossierRepository.searchDossiers(query);
    }
}
