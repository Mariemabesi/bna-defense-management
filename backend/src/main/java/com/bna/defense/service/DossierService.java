package com.bna.defense.service;

import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.Affaire;
import com.bna.defense.repository.DossierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DossierService {

    @Autowired
    private DossierRepository dossierRepository;

    public List<Dossier> getAllDossiers() {
        return dossierRepository.findAll();
    }

    public Dossier getDossierById(Long id) {
        return dossierRepository.findById(id).orElseThrow(() -> new RuntimeException("Dossier non trouvé"));
    }

    public Dossier createDossier(Dossier dossier) {
        if (dossier.getStatut() == null) {
            dossier.setStatut(Dossier.StatutDossier.OUVERT);
        }
        // Generat reference if needed
        if (dossier.getReference() == null) {
            dossier.setReference("DOS-" + System.currentTimeMillis());
        }
        return dossierRepository.save(dossier);
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
        return dossierRepository.findByReferenceContainingIgnoreCaseOrTitreContainingIgnoreCase(query, query);
    }
}
