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

    private final AffaireRepository affaireRepository;
    private final com.bna.defense.repository.DossierRepository dossierRepository;
    private final com.bna.defense.repository.ProcedureJudiciaireRepository procedureRepository;

    public AffaireService(AffaireRepository affaireRepository, 
                          com.bna.defense.repository.DossierRepository dossierRepository, 
                          com.bna.defense.repository.ProcedureJudiciaireRepository procedureRepository) {
        this.affaireRepository = affaireRepository;
        this.dossierRepository = dossierRepository;
        this.procedureRepository = procedureRepository;
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Affaire> getAll(com.bna.defense.entity.User currentUser, 
                                                               String searchTerm, Affaire.TypeAffaire type, Affaire.StatutAffaire statut,
                                                               org.springframework.data.domain.Pageable pageable) {
        if (currentUser == null) return org.springframework.data.domain.Page.empty();
        
        boolean isSuper = currentUser.isAdmin() || 
                         currentUser.hasRole("ROLE_VALIDATEUR") || 
                         currentUser.hasRole("ROLE_SUPER_VALIDATEUR");
        
        boolean isPreVal = currentUser.hasRole("ROLE_PRE_VALIDATEUR");

        String wildcardSearch = (searchTerm != null && !searchTerm.isBlank()) ? "%" + searchTerm + "%" : null;

        return affaireRepository.findAllWithRBAC(
            currentUser.getUsername(),
            currentUser.getId(),
            isSuper,
            isPreVal,
            wildcardSearch,
            type,
            statut,
            pageable
        );
    }


    public Affaire getAffaireById(Long id) {
        return affaireRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Affaire non trouvée avec l'id: " + id));
    }

    public List<Affaire> getAffairesByDossierId(Long dossierId) {
        return affaireRepository.findByDossier_Id(dossierId);
    }

    @Transactional
    public Affaire createAffaire(Affaire affaire) {
        // Business Rule: Une Affaire doit obligatoirement appartenir à un Dossier
        if (affaire.getDossierId() == null) {
            throw new RuntimeException("Une affaire doit être obligatoirement liée à un dossier.");
        }
        com.bna.defense.entity.Dossier dossier = dossierRepository.findById(affaire.getDossierId())
                .orElseThrow(() -> new RuntimeException("Dossier non trouvé avec l'id: " + affaire.getDossierId()));
        affaire.setDossier(dossier);
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
 
    @Transactional(readOnly = true)
    public List<Affaire> getByTribunal(Long tribunalId) {
        return affaireRepository.findByTribunal_Id(tribunalId);
    }
 
    @Transactional(readOnly = true)
    public List<Affaire> getByAvocat(Long avocatId) {
        return affaireRepository.findByAvocat_Id(avocatId);
    }
 
    @Transactional(readOnly = true)
    public List<Affaire> getByHuissier(Long huissierId) {
        return affaireRepository.findByHuissier_Id(huissierId);
    }
 
    @Transactional(readOnly = true)
    public List<Affaire> getByExpert(Long expertId) {
        return affaireRepository.findByExpert_Id(expertId);
    }
}
