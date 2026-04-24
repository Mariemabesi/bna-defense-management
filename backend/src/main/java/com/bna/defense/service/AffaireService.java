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
    public List<Affaire> getAll(com.bna.defense.entity.User currentUser) {
        if (currentUser == null) return java.util.Collections.emptyList();
        
        List<Affaire> all = affaireRepository.findAll();
        if (all == null) return java.util.Collections.emptyList();

        // Check for Admin or Validateur (Global Read)
        boolean isGlobalRead = currentUser.isAdmin() || 
                              currentUser.hasRole("ROLE_VALIDATEUR") || 
                              currentUser.hasRole("ROLE_SUPER_VALIDATEUR");
        
        if (isGlobalRead) return all;

        boolean isPreVal = currentUser.hasRole("ROLE_PRE_VALIDATEUR");
        final String uname = currentUser.getUsername();

        return all.stream()
            .filter(a -> a != null && a.getDossier() != null)
            .filter(a -> {
                Dossier d = a.getDossier();
                
                // Charge check: own dossiers
                boolean isChargeOwn = (d.getCreatedBy() != null && d.getCreatedBy().equalsIgnoreCase(uname)) ||
                                      (d.getAssignedCharge() != null && d.getAssignedCharge().getUsername().equalsIgnoreCase(uname));
                
                if (isChargeOwn) return true;

                // Pre-validateur check: dossiers managed by their charges
                if (isPreVal && d.getAssignedCharge() != null && d.getAssignedCharge().getManager() != null) {
                    return d.getAssignedCharge().getManager().getId().equals(currentUser.getId());
                }

                return false;
            })
            .collect(java.util.stream.Collectors.toList());
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
