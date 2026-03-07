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

    public List<Affaire> getAffairesByDossierId(Long dossierId) {
        return affaireRepository.findByDossierId(dossierId);
    }

    @Transactional
    public Affaire createAffaire(Affaire affaire) {
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
