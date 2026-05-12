package com.bna.defense.service;

import com.bna.defense.dto.FraisDTO;
import com.bna.defense.entity.Affaire;
import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.Frais;
import com.bna.defense.entity.FraisAttachment;
import com.bna.defense.repository.DossierRepository;
import com.bna.defense.repository.FraisAttachmentRepository;
import com.bna.defense.repository.FraisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class FraisService {

    @Autowired
    private FraisRepository fraisRepository;

    @Autowired
    private FraisAttachmentRepository attachmentRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private DossierRepository dossierRepository;

    @Autowired
    private DossierService dossierService;

    public List<Frais> getFraisForUser(com.bna.defense.entity.User user) {
        boolean isSuper = user.isSuperValidateur() || user.isAdmin();
        boolean isCharge = user.isChargeDossier();
        boolean isPreVal = user.isPreValidateur();
        boolean isValidateur = user.isValidateur();

        List<Frais> all = fraisRepository.findByRBAC(user, user.getUsername(), isSuper, isCharge, isPreVal, isValidateur);

        // Filter based on workflow visibility rules:
        if (isSuper) return all;

        return all.stream().filter(f -> {
            // Charge sees everything they are assigned to OR they created
            if (isCharge && (
                (f.getAffaire().getDossier().getAssignedCharge() != null && f.getAffaire().getDossier().getAssignedCharge().getId().equals(user.getId())) ||
                (f.getCreatedBy() != null && f.getCreatedBy().equals(user.getUsername()))
            )) {
                return true;
            }
            // Pre-validator and Validator see everything within their branch (RBAC query already filtered the branch)
            // We just return true here because findByRBAC already did the heavy lifting
            if (isPreVal || isValidateur) {
                return true;
            }

            return false;
        }).collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public Frais demandFrais(FraisDTO dto, List<MultipartFile> files) {
        Affaire affaire = null;
        if (dto.getReferenceAffaire() != null && !dto.getReferenceAffaire().isEmpty()) {
            // Simplified: logic to find affaire could be more robust
        }

        if (affaire == null && dto.getReferenceDossier() != null) {
            Dossier dossier = dossierRepository.findByReference(dto.getReferenceDossier())
                    .orElse(null);

            if (dossier != null && !dossier.getAffaires().isEmpty()) {
                affaire = dossier.getAffaires().get(0);
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
        frais.setStatut(Frais.StatutFrais.EN_ATTENTE_PREVALIDATION);
        frais.setObservation(dto.getObservation());
        
        // Handle Date (Default to today if null)
        // If DTO had a date field we'd use it here. Let's assume we use it if present.
        // For now using entity default.

        Frais saved = fraisRepository.save(frais);

        // Handle File Uploads
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    addFileToFrais(saved, file);
                }
            }
        }

        triggerRecalculate(saved.getAffaire().getDossier().getId());
        return saved;
    }

    @Transactional
    public FraisAttachment addAttachment(Long fraisId, MultipartFile file) {
        Frais frais = fraisRepository.findById(fraisId).orElseThrow();
        return addFileToFrais(frais, file);
    }

    private FraisAttachment addFileToFrais(Frais frais, MultipartFile file) {
        String savedFilename = fileStorageService.save(file, "frais/" + frais.getId());
        
        FraisAttachment attachment = new FraisAttachment();
        attachment.setFrais(frais);
        attachment.setFileName(savedFilename);
        attachment.setOriginalName(file.getOriginalFilename());
        attachment.setContentType(file.getContentType());
        attachment.setFileSize(file.getSize());
        
        return attachmentRepository.save(attachment);
    }

    private void triggerRecalculate(Long dossierId) {
        java.math.BigDecimal total = fraisRepository.sumMontantTtcByDossierId(dossierId);
        dossierService.recalculateFrais(dossierId, total != null ? total : java.math.BigDecimal.ZERO);
    }

    @Transactional
    public Frais preValidate(Long id) {
        Frais frais = fraisRepository.findById(id).orElseThrow();
        if (frais.getStatut() != Frais.StatutFrais.EN_ATTENTE_PREVALIDATION) {
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
        return fraisRepository.findAll().stream().filter(f -> f.getStatut() == statut).collect(java.util.stream.Collectors.toList());
    }

    public int batchSendToTreasury() {
        List<Frais> valideFrais = this.findByStatut(Frais.StatutFrais.VALIDE);
        for (Frais frais : valideFrais) {
            frais.setStatut(Frais.StatutFrais.ENVOYE_TRESORERIE);
        }
        fraisRepository.saveAll(valideFrais);
        return valideFrais.size();
    }

    @Transactional
    public Frais reject(Long id, String reason) {
        Frais frais = fraisRepository.findById(id).orElseThrow();
        frais.setStatut(Frais.StatutFrais.REFUSE);
        frais.setObservation(reason != null ? "[REFUS] " + reason : "[REFUS] Aucun motif spécifié");
        return fraisRepository.save(frais);
    }

    public FraisAttachment getAttachment(Long id) {
        return attachmentRepository.findById(id).orElseThrow();
    }
}
