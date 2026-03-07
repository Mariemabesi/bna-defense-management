package com.bna.defense.service;

import com.bna.defense.dto.FraisDTO;
import com.bna.defense.entity.Affaire;
import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.Frais;
import com.bna.defense.repository.AffaireRepository;
import com.bna.defense.repository.DossierRepository;
import com.bna.defense.repository.FraisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FraisService {

    @Autowired
    private FraisRepository fraisRepository;

    @Autowired
    private DossierRepository dossierRepository;

    @Autowired
    private AffaireRepository affaireRepository;

    public List<Frais> getAllFrais() {
        return fraisRepository.findAll();
    }

    @Transactional
    public Frais demandFrais(FraisDTO dto) {
        Affaire affaire = null;
        if (dto.getReferenceAffaire() != null && !dto.getReferenceAffaire().isEmpty()) {
            // Find by affaire reference if provided
            // For now let's assume we search by judicial reference or id
            // But let's simplify and use Dossier reference as fallback
        }

        if (affaire == null && dto.getReferenceDossier() != null) {
            Dossier dossier = dossierRepository.findByReference(dto.getReferenceDossier())
                    .orElseThrow(() -> new RuntimeException("Dossier non trouvé: " + dto.getReferenceDossier()));

            if (dossier.getAffaires().isEmpty()) {
                throw new RuntimeException("Le dossier n'a pas d'affaires liées pour imputer des frais");
            }
            affaire = dossier.getAffaires().get(0); // Take first one as default
        }

        if (affaire == null) {
            throw new RuntimeException("Impossible d'associer le frais à une affaire");
        }

        Frais frais = Frais.builder()
                .affaire(affaire)
                .libelle(dto.getLibelle())
                .montant(dto.getMontant())
                .type(dto.getType() != null ? dto.getType() : Frais.TypeFrais.AUTRE)
                .statut(Frais.StatutFrais.ATTENTE)
                .observation(dto.getObservation())
                .build();

        return fraisRepository.save(frais);
    }

    public Frais preValidate(Long id) {
        Frais frais = fraisRepository.findById(id).orElseThrow();
        if (frais.getStatut() != Frais.StatutFrais.ATTENTE) {
            throw new RuntimeException("Statut invalide pour pré-validation");
        }
        frais.setStatut(Frais.StatutFrais.PRE_VALIDE);
        return fraisRepository.save(frais);
    }

    public Frais validate(Long id) {
        Frais frais = fraisRepository.findById(id).orElseThrow();
        if (frais.getStatut() != Frais.StatutFrais.PRE_VALIDE) {
            throw new RuntimeException("Statut invalide pour validation finale");
        }
        frais.setStatut(Frais.StatutFrais.VALIDE);
        return fraisRepository.save(frais);
    }

    public Frais sendToTreasury(Long id) {
        Frais frais = fraisRepository.findById(id).orElseThrow();
        if (frais.getStatut() != Frais.StatutFrais.VALIDE) {
            throw new RuntimeException("Seuls les frais validés peuvent être envoyés à la trésorerie");
        }
        frais.setStatut(Frais.StatutFrais.ENVOYE_TRESORERIE);
        return fraisRepository.save(frais);
    }

    public List<Frais> findByStatut(Frais.StatutFrais statut) {
        return fraisRepository.findByStatut(statut);
    }

    public int batchSendToTreasury() {
        List<Frais> valideFrais = fraisRepository.findByStatut(Frais.StatutFrais.VALIDE);
        for (Frais frais : valideFrais) {
            frais.setStatut(Frais.StatutFrais.ENVOYE_TRESORERIE);
        }
        fraisRepository.saveAll(valideFrais);
        return valideFrais.size();
    }
}
