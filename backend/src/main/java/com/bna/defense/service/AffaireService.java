package com.bna.defense.service;

import com.bna.defense.entity.Affaire;
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

    public List<Affaire> getAll(com.bna.defense.entity.User currentUser) {
        List<Affaire> all = affaireRepository.findAll();
        if (currentUser == null) return java.util.Collections.emptyList();

        boolean isSuper = currentUser.isSuperValidateur() || currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == com.bna.defense.entity.Role.RoleType.ROLE_ADMIN || 
                               r.getName() == com.bna.defense.entity.Role.RoleType.ROLE_SUPER_VALIDATEUR);

        if (isSuper) return all;

        return all.stream()
            .filter(a -> a.getDossier() != null && (
                (a.getDossier().getAssignedCharge() != null && a.getDossier().getAssignedCharge().getUsername().equalsIgnoreCase(currentUser.getUsername())) ||
                (a.getDossier().getCreatedBy() != null && a.getDossier().getCreatedBy().equalsIgnoreCase(currentUser.getUsername())) ||
                (a.getDossier().getCreatedBy() != null && a.getDossier().getCreatedBy().equalsIgnoreCase(currentUser.getEmail()))
            ))
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
