package com.bna.defense.service;

import com.bna.defense.dto.FraisDTO;
import com.bna.defense.entity.Affaire;
import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.Frais;
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
    private DossierService dossierService;

    public List<Frais> getAllFrais() {
        return fraisRepository.findAllWithAffaire();
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
                    .orElse(null);

            if (dossier != null && !dossier.getAffaires().isEmpty()) {
                affaire = dossier.getAffaires().get(0); // Take first one as default
            }
        }

        if (affaire == null) {
            throw new RuntimeException("L'association à une affaire est obligatoire pour les frais de règlement.");
        }

        Frais frais = new Frais();
        frais.setAffaire(affaire);
        frais.setLibelle(dto.getLibelle());
        frais.setMontant(dto.getMontant());
        frais.setType(dto.getType() != null ? dto.getType() : Frais.TypeFrais.AUTRE);
        frais.setStatut(Frais.StatutFrais.ATTENTE);
        frais.setObservation(dto.getObservation());

        // AI Anomaly Detection Simulation
        if (frais.getMontant() != null && frais.getMontant().compareTo(new java.math.BigDecimal("10000")) > 0) {
            String warning = "[NOTE IA] Alerte Anomale : Montant élevé détecté (" + frais.getMontant() + " TND). ";
            frais.setObservation(frais.getObservation() != null ? warning + frais.getObservation() : warning);
        }

        Frais saved = fraisRepository.save(frais);
        triggerRecalculate(saved.getAffaire().getDossier().getId());
        return saved;
    }

    private void triggerRecalculate(Long dossierId) {
        java.math.BigDecimal total = fraisRepository.sumMontantTtcByDossierId(dossierId);
        dossierService.recalculateFrais(dossierId, total != null ? total : java.math.BigDecimal.ZERO);
    }

    @Transactional
    public Frais preValidate(Long id) {
        Frais frais = fraisRepository.findById(id).orElseThrow();
        if (frais.getStatut() != Frais.StatutFrais.ATTENTE) {
            throw new RuntimeException("Statut invalide pour pré-validation");
        }
        frais.setStatut(Frais.StatutFrais.PRE_VALIDE);
        return fraisRepository.save(frais);
    }

    @Transactional
    public Frais validate(Long id) {
        Frais frais = fraisRepository.findById(id).orElseThrow();
        if (frais.getStatut() != Frais.StatutFrais.PRE_VALIDE) {
            throw new RuntimeException("Statut invalide pour validation finale");
        }
        frais.setStatut(Frais.StatutFrais.VALIDE);
        Frais saved = fraisRepository.save(frais);
        triggerRecalculate(saved.getAffaire().getDossier().getId());
        return saved;
    }

    @Transactional
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

    @Transactional
    public Frais reject(Long id, String reason) {
        Frais frais = fraisRepository.findById(id).orElseThrow();
        frais.setStatut(Frais.StatutFrais.REJETE);
        frais.setObservation(reason != null ? "[REFUS] " + reason : "[REFUS] Aucun motif spécifié");
        return fraisRepository.save(frais);
    }
}
