package com.bna.defense.service;

import com.bna.defense.entity.Affaire;
import com.bna.defense.entity.Dossier;
import com.bna.defense.repository.AffaireRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AffaireService {

    @Autowired
    private AffaireRepository affaireRepository;

    @Autowired
    private com.bna.defense.repository.DossierRepository dossierRepository;

    @Transactional(readOnly = true)
    public List<Affaire> getAll(com.bna.defense.entity.User currentUser) {
        if (currentUser == null) return java.util.Collections.emptyList();
        
        List<Affaire> all = affaireRepository.findAll();
        if (all == null) return java.util.Collections.emptyList();

        // Safe role check
        boolean isSuper = currentUser.isSuperValidateur();
        if (!isSuper && currentUser.getRoles() != null) {
            isSuper = currentUser.getRoles().stream()
                .filter(r -> r != null && r.getName() != null)
                .anyMatch(r -> r.getName().name().equals("ROLE_ADMIN") || 
                               r.getName().name().equals("ROLE_SUPER_VALIDATEUR"));
        }

        if (isSuper) return all;

        final String uname = currentUser.getUsername();
        final String umail = currentUser.getEmail();

        return all.stream()
            .filter(a -> a != null && a.getDossier() != null)
            .filter(a -> {
                Dossier d = a.getDossier();
                String creator = d.getCreatedBy();
                
                boolean isCreator = (creator != null && (
                                     creator.equalsIgnoreCase(uname) || 
                                     (umail != null && creator.equalsIgnoreCase(umail))
                                   ));
                                   
                boolean isAssigned = false;
                if (d.getAssignedCharge() != null) {
                    String assignedUname = d.getAssignedCharge().getUsername();
                    if (assignedUname != null && assignedUname.equalsIgnoreCase(uname)) {
                        isAssigned = true;
                    }
                }
                
                return isCreator || isAssigned;
            })
            .collect(java.util.stream.Collectors.toList());
    }


    public List<Affaire> getAffairesByDossierId(Long dossierId) {
        return affaireRepository.findByDossier_Id(dossierId);
    }

    @Transactional
    public Affaire createAffaire(Affaire affaire) {
        if (affaire.getDossierId() != null) {
            com.bna.defense.entity.Dossier dossier = dossierRepository.findById(affaire.getDossierId())
                    .orElseThrow(() -> new RuntimeException("Dossier non trouvé"));
            affaire.setDossier(dossier);
        }
        affaire.setStatut(Affaire.StatutAffaire.EN_COURS);
        return affaireRepository.save(affaire);
    }

    @Transactional
    public Affaire updateStatut(Long id, Affaire.StatutAffaire statut) {
        Affaire affaire = affaireRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Affaire non trouvée"));
        affaire.setStatut(statut);
        return affaireRepository.save(affaire);
    }
}
