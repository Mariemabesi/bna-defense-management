package com.bna.defense.service;

import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.Affaire;
import com.bna.defense.entity.User;
import com.bna.defense.entity.Role;
import com.bna.defense.repository.DossierRepository;
import com.bna.defense.repository.AffaireRepository;
import com.bna.defense.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;
import com.bna.defense.repository.AuditLogRepository;
import com.bna.defense.entity.AuditLog;
import com.bna.defense.entity.Dossier.StatutDossier;
import com.bna.defense.entity.Dossier.Priorite;
import java.time.LocalDate;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class DossierService {

    @Autowired private DossierRepository dossierRepository;
    @Autowired private AffaireRepository affaireRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private AuditLogService auditLogService;
    @Autowired private NotificationService notificationService;
    @Autowired private AuditLogRepository auditLogRepository;


    private boolean hasRole(User user, Role.RoleType roleType) {
        return user.getRoles().stream().anyMatch(r -> r.getName() == roleType);
    }

    private boolean isSuper(User user) {
        return user.isSuperValidateur()
            || hasRole(user, Role.RoleType.ROLE_ADMIN)
            || hasRole(user, Role.RoleType.ROLE_SUPER_VALIDATEUR);
    }

    public Page<Dossier> getAllDossiers(User currentUser, Pageable pageable) {
        boolean isSuper     = isSuper(currentUser);
        boolean isCharge    = !isSuper && hasRole(currentUser, Role.RoleType.ROLE_CHARGE_DOSSIER);
        boolean isPreVal    = !isSuper && hasRole(currentUser, Role.RoleType.ROLE_PRE_VALIDATEUR);
        boolean isValidateur = !isSuper && hasRole(currentUser, Role.RoleType.ROLE_VALIDATEUR);

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable sortedPageable = PageRequest.of(
            pageable.getPageNumber(), 
            pageable.getPageSize(), 
            sort
        );

        List<StatutDossier> allowedStatuses = Arrays.asList(
            StatutDossier.EN_ATTENTE_VALIDATION,
            StatutDossier.VALIDE,
            StatutDossier.REFUSE,
            StatutDossier.CLOTURE,
            StatutDossier.EN_ATTENTE_VALIDATION_CLOTURE
        );

        return dossierRepository.findAllWithRBAC(
            currentUser,
            currentUser.getUsername(),
            isSuper,
            isCharge,
            isPreVal,
            isValidateur,
            allowedStatuses,
            sortedPageable
        );
    }

    public Page<Dossier> getMyDossiers(User currentUser, Pageable pageable) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable sortedPageable = PageRequest.of(
            pageable.getPageNumber(), 
            pageable.getPageSize(), 
            sort
        );
        return dossierRepository.findAllWithRBAC(
            currentUser,
            currentUser.getUsername(),
            false, // isSuper
            true,  // isCharge (force charge behavior)
            false, // isPreVal
            false, // isValidateur
            java.util.Collections.emptyList(),
            sortedPageable
        );
    }

    public Dossier getDossierById(Long id) {
        return dossierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Dossier non trouvé"));
    }

    public Map<String, Object> getDashboardStats(User user) {
        List<Dossier> relevant;
        boolean isSuper = isSuper(user);
        boolean isCharge = hasRole(user, Role.RoleType.ROLE_CHARGE_DOSSIER);
        boolean isPreVal = hasRole(user, Role.RoleType.ROLE_PRE_VALIDATEUR);
        boolean isValidateur = hasRole(user, Role.RoleType.ROLE_VALIDATEUR);

        if (isSuper) {
            relevant = dossierRepository.findAll();
        } else if (isCharge) {
            relevant = dossierRepository.findAll().stream()
                .filter(d -> user.getUsername().equals(d.getCreatedBy()) || (d.getAssignedCharge() != null && d.getAssignedCharge().getUsername().equals(user.getUsername())))
                .sorted((a,b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
        } else if (isPreVal) {
            relevant = dossierRepository.findPendingForPreValidateur(user, StatutDossier.EN_ATTENTE_PREVALIDATION);
        } else if (isValidateur) {
            relevant = dossierRepository.findPendingForValidateur(user, StatutDossier.EN_ATTENTE_VALIDATION);
        } else {
            relevant = List.of();
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", relevant.size());
        stats.put("urgent", relevant.stream().filter(d -> d.getPriorite() == Priorite.HAUTE).count());
        stats.put("enCours", relevant.stream().filter(d -> 
            d.getStatut() == StatutDossier.EN_COURS || 
            d.getStatut() == StatutDossier.OUVERT || 
            d.getStatut() == StatutDossier.EN_ATTENTE_PREVALIDATION || 
            d.getStatut() == StatutDossier.EN_ATTENTE_VALIDATION).count());
        stats.put("valide", relevant.stream().filter(d -> d.getStatut() == StatutDossier.VALIDE || d.getStatut() == StatutDossier.CLOTURE).count());
        stats.put("refuse", relevant.stream().filter(d -> d.getStatut() == StatutDossier.REFUSE).count());

        return stats;
    }

    @Transactional
    public Dossier createDossier(Dossier dossier, User creator) {
        if (dossier.getReference() != null && dossierRepository.existsByReference(dossier.getReference())) {
            throw new RuntimeException("Cette référence est déjà utilisée par un autre dossier. Veuillez en choisir une autre.");
        }
        dossier.setCreatedBy(creator.getUsername());
        if (dossier.getStatut() == null) {
            dossier.setStatut(StatutDossier.EN_ATTENTE_PREVALIDATION);
        }
        if (dossier.getFraisReel() == null)  dossier.setFraisReel(BigDecimal.ZERO);
        if (dossier.getFraisInitial() == null) dossier.setFraisInitial(BigDecimal.ZERO);

        // Auto-assign chargé
        if (dossier.getAssignedCharge() == null && hasRole(creator, Role.RoleType.ROLE_CHARGE_DOSSIER)) {
            dossier.setAssignedCharge(creator);
        }

        Dossier saved = dossierRepository.save(dossier);

        // Audit log (Point 9 + User Request)
        auditLogService.log(creator.getUsername(), "CREATION_DOSSIER", "Dossier", saved.getId(),
            "Dossier " + saved.getReference() + " créé par " + creator.getUsername());

        // Auto-create initial affaire with referential inheritance
        if (saved.getAffaires() == null || saved.getAffaires().isEmpty()) {
            Affaire defaultAffaire = new Affaire();
            defaultAffaire.setDossier(saved);
            defaultAffaire.setReferenceJudiciaire("JUD-" + saved.getReference());
            defaultAffaire.setType(Affaire.TypeAffaire.CIVIL);
            defaultAffaire.setStatut(Affaire.StatutAffaire.EN_COURS);
            defaultAffaire.setDateOuverture(LocalDate.now());
            // ─── Propagate referential from Dossier ───────────────────────
            if (saved.getAvocat()      != null) defaultAffaire.setAvocat(saved.getAvocat());
            if (saved.getPartieLitige()!= null) defaultAffaire.setAdversaire(saved.getPartieLitige());
            // ─────────────────────────────────────────────────────────────
            affaireRepository.save(defaultAffaire);

            // Notify pré-validateur (manager of chargé)
            if (creator.getManager() != null) {
                notificationService.notifySubmitted(creator.getManager(), saved, creator.getUsername());
            }

            return dossierRepository.findById(saved.getId()).orElse(saved);
        }

        // Notify pré-validateur (manager of chargé)
        if (creator.getManager() != null) {
            notificationService.notifySubmitted(creator.getManager(), saved, creator.getUsername());
        }

        return saved;
    }

    @Transactional
    public Dossier updateStatut(Long id, StatutDossier newStatut) {
        Dossier dossier = getDossierById(id);
        dossier.setStatut(newStatut);
        return dossierRepository.save(dossier);
    }

    @Transactional
    public Dossier updateDossier(Long id, Dossier updatedDossier, String username) {
        Dossier existing = getDossierById(id);

        // Update dossier fields
        existing.setTitre(updatedDossier.getTitre());
        existing.setPriorite(updatedDossier.getPriorite());
        existing.setBudgetProvisionne(updatedDossier.getBudgetProvisionne());
        existing.setDescription(updatedDossier.getDescription());
        existing.setStatut(updatedDossier.getStatut());

        // Apply referential updates if provided
        if (updatedDossier.getAvocat()       != null) existing.setAvocat(updatedDossier.getAvocat());
        if (updatedDossier.getHuissier()     != null) existing.setHuissier(updatedDossier.getHuissier());
        if (updatedDossier.getExpert()       != null) existing.setExpert(updatedDossier.getExpert());
        if (updatedDossier.getPartieLitige() != null) existing.setPartieLitige(updatedDossier.getPartieLitige());

        existing.setLastModifiedBy(username);
        Dossier saved = dossierRepository.save(existing);

        // ─── AUTO-PROPAGATE referential to all linked Affaires ────────────
        List<Affaire> affaires = affaireRepository.findByDossier_Id(saved.getId());
        for (Affaire aff : affaires) {
            boolean changed = false;
            if (saved.getAvocat() != null && !saved.getAvocat().equals(aff.getAvocat())) {
                aff.setAvocat(saved.getAvocat());
                changed = true;
            }
            if (saved.getPartieLitige() != null && !saved.getPartieLitige().equals(aff.getAdversaire())) {
                aff.setAdversaire(saved.getPartieLitige());
                changed = true;
            }
            if (changed) {
                aff.setLastModifiedBy(username);
                affaireRepository.save(aff);
            }
        }
        // ─────────────────────────────────────────────────────────────────

        auditLogService.log(username, "MODIFICATION_DOSSIER", "Dossier", id,
            "Dossier " + existing.getReference() + " modifié par " + username
            + " (référentiel propagé à " + affaires.size() + " affaire(s))");

        return saved;
    }

    /**
     * Chargé submits dossier for pre-validation → status = EN_ATTENTE_PREVALIDATION
     */
    @Transactional
    public Dossier soumettre(Long id, String username) {
        Dossier dossier = getDossierById(id);
        if (dossier.getStatut() != StatutDossier.OUVERT && 
            dossier.getStatut() != StatutDossier.EN_COURS &&
            dossier.getStatut() != StatutDossier.REFUSE) {
            throw new RuntimeException("Seuls les dossiers OUVERT, EN_COURS ou REFUSE peuvent être soumis.");
        }
        dossier.setStatut(StatutDossier.EN_ATTENTE_PREVALIDATION);
        Dossier saved = dossierRepository.save(dossier);

        auditLogService.log(username, "SOUMISSION_DOSSIER", "Dossier", id,
            "Dossier soumis pour pré-validation par " + username);

        // Notify pré-validateur
        User creator = userRepository.findByUsername(username).orElseThrow();
        if (creator.getManager() != null) {
            notificationService.notifySubmitted(creator.getManager(), saved, username);
        }

        return saved;
    }

    /**
     * Pré-validateur approves → status = EN_ATTENTE_VALIDATION, notify validateur
     */
    @Transactional
    public Dossier prevalider(Long id, String preValUsername) {
        Dossier dossier = getDossierById(id);
        if (dossier.getStatut() != StatutDossier.EN_ATTENTE_PREVALIDATION) {
            throw new RuntimeException("Ce dossier n'est pas en attente de pré-validation.");
        }
        dossier.setStatut(StatutDossier.EN_ATTENTE_VALIDATION);
        Dossier saved = dossierRepository.save(dossier);

        // Notify validateur (manager of pré-validateur)
        User preVal = userRepository.findByUsername(preValUsername).orElseThrow();
        User validateur = preVal.getManager();
        if (validateur != null) {
            notificationService.notifyPreValidated(validateur, saved, preValUsername);
        }

        auditLogService.log(preValUsername, "PRE_VALIDATION", "Dossier", id,
            "Dossier pré-validé par " + preValUsername + ". Transmis au validateur.");
        return saved;
    }

    /**
     * Pré-validateur or Validateur rejects dossier → status = REFUSE, notify chargé
     * motif must be >= 20 characters
     */
    @Transactional
    public Dossier refuser(Long id, String motif, String refuseurUsername) {
        if (motif == null || motif.trim().length() < 5) {
            throw new RuntimeException("Le motif du refus doit contenir au moins 5 caractères.");
        }
        Dossier dossier = getDossierById(id);
        dossier.setStatut(StatutDossier.REFUSE);
        dossier.setMotifRefus(motif);
        Dossier saved = dossierRepository.save(dossier);

        // Notify chargé or creator
        try {
            User recipient = dossier.getAssignedCharge();
            if (recipient == null && dossier.getCreatedBy() != null) {
                recipient = userRepository.findByUsername(dossier.getCreatedBy()).orElse(null);
            }

            if (recipient != null) {
                notificationService.notifyRefus(recipient, saved, motif, refuseurUsername);
            } else {
                System.out.println("WARN: Aucun utilisateur trouvé pour notifier le refus du dossier ID: " + id);
            }
        } catch (Exception e) {
            System.err.println("ERROR: Échec de l'envoi de notification de refus: " + e.getMessage());
            // We don't throw here to avoid rolling back the status change if only notification fails
        }

        // Audit log
        try {
            auditLogService.log(refuseurUsername, "REFUS_DOSSIER", "Dossier", id,
                "Dossier refusé par " + refuseurUsername + ". Motif: " + motif);
        } catch (Exception e) {
            System.err.println("ERROR: Échec du log d'audit pour le refus: " + e.getMessage());
        }
        return saved;
    }

    /**
     * Validateur gives final approval → status = VALIDE
     */
    @Transactional
    public Dossier validerFinal(Long id, String validateurUsername) {
        Dossier dossier = getDossierById(id);
        if (dossier.getStatut() != StatutDossier.EN_ATTENTE_VALIDATION) {
            throw new RuntimeException("Ce dossier n'est pas en attente de validation finale.");
        }
        
        // Final update as per user request: Set to OUVERT and return to Chargé
        dossier.setStatut(StatutDossier.OUVERT);
        Dossier saved = dossierRepository.save(dossier);

        // Notify chargé or creator
        User recipient = saved.getAssignedCharge();
        if (recipient == null && saved.getCreatedBy() != null) {
            recipient = userRepository.findByUsername(saved.getCreatedBy()).orElse(null);
        }

        if (recipient != null) {
            notificationService.notifyValidated(recipient, saved, validateurUsername);
        }

        auditLogService.log(validateurUsername, "VALIDATION_FINALE", "Dossier", id,
            "Dossier validé définitivement par " + validateurUsername + ". Statut passé à OUVERT.");
        
        return saved;
    }

    /**
     * Recalculate fraisReel = SUM(montantTtc of all frais for this dossier)
     * If fraisReel > fraisInitial → notify pré-validateur
     */
    @Transactional
    public void recalculateFrais(Long dossierId, BigDecimal newFraisReel) {
        Dossier dossier = getDossierById(dossierId);
        dossier.setFraisReel(newFraisReel);
        dossierRepository.save(dossier);

        BigDecimal fraisInitial = dossier.getFraisInitial() != null
            ? dossier.getFraisInitial() : BigDecimal.ZERO;

        if (newFraisReel.compareTo(fraisInitial) > 0) {
            BigDecimal depassement = newFraisReel.subtract(fraisInitial);
            // Notify pré-validateur if there is one
            User assignedCharge = dossier.getAssignedCharge();
            if (assignedCharge != null && assignedCharge.getManager() != null) {
                User preValidateur = assignedCharge.getManager();
                notificationService.notifyDepassement(preValidateur, dossier, depassement);
            }
        }
    }

    /**
     * Chargé submits the dossier for closure pre-validation.
     * Status: OUVERT | EN_COURS → EN_ATTENTE_PREVALIDATION_CLOTURE
     */
    @Transactional
    public Dossier demanderCloture(Long id, String chargeUsername) {
        Dossier dossier = getDossierById(id);
        if (dossier.getStatut() != StatutDossier.OUVERT &&
            dossier.getStatut() != StatutDossier.EN_COURS) {
            throw new RuntimeException("Seuls les dossiers OUVERT ou EN_COURS peuvent être soumis à clôture.");
        }
        dossier.setStatut(StatutDossier.EN_ATTENTE_PREVALIDATION_CLOTURE);
        Dossier saved = dossierRepository.save(dossier);

        // Notify pre-validateur
        User charge = userRepository.findByUsername(chargeUsername).orElseThrow();
        if (charge.getManager() != null) {
            notificationService.notifyClotureSubmitted(charge.getManager(), saved, chargeUsername);
        }

        auditLogService.log(chargeUsername, "DEMANDE_CLOTURE", "Dossier", id,
            "Demande de clôture du dossier " + saved.getReference() + " par " + chargeUsername);
        return saved;
    }

    /**
     * Pré-validateur validates the closure request.
     * Status: EN_ATTENTE_PREVALIDATION_CLOTURE → EN_ATTENTE_VALIDATION_CLOTURE
     */
    @Transactional
    public Dossier prevaliderCloture(Long id, String preValUsername) {
        Dossier dossier = getDossierById(id);
        if (dossier.getStatut() != StatutDossier.EN_ATTENTE_PREVALIDATION_CLOTURE) {
            throw new RuntimeException("Ce dossier n'est pas en attente de pré-validation de clôture.");
        }
        dossier.setStatut(StatutDossier.EN_ATTENTE_VALIDATION_CLOTURE);
        Dossier saved = dossierRepository.save(dossier);

        // Notify validateur (manager of pre-validateur)
        User preVal = userRepository.findByUsername(preValUsername).orElseThrow();
        User validateur = preVal.getManager();
        if (validateur != null) {
            notificationService.notifyCloturePreValidated(validateur, saved, preValUsername);
        }

        auditLogService.log(preValUsername, "PREVALIDATION_CLOTURE", "Dossier", id,
            "Clôture du dossier " + saved.getReference() + " pré-validée par " + preValUsername);
        return saved;
    }

    /**
     * Validateur gives final approval of the closure.
     * Status: EN_ATTENTE_VALIDATION_CLOTURE → CLOTURE
     */
    @Transactional
    public Dossier validerCloture(Long id, String validateurUsername) {
        Dossier dossier = getDossierById(id);
        if (dossier.getStatut() != StatutDossier.EN_ATTENTE_VALIDATION_CLOTURE) {
            throw new RuntimeException("Ce dossier n'est pas en attente de validation finale de clôture.");
        }
        dossier.setStatut(StatutDossier.CLOTURE);
        Dossier saved = dossierRepository.save(dossier);

        // Notify chargé
        User recipient = saved.getAssignedCharge();
        if (recipient == null && saved.getCreatedBy() != null) {
            recipient = userRepository.findByUsername(saved.getCreatedBy()).orElse(null);
        }
        if (recipient != null) {
            notificationService.notifyClotureDefinitive(recipient, saved, validateurUsername);
        }

        auditLogService.log(validateurUsername, "VALIDATION_CLOTURE", "Dossier", id,
            "Clôture définitive du dossier " + saved.getReference() + " validée par " + validateurUsername);
        return saved;
    }

    /**
     * Pending queue for pré-validateur (opening workflow)
     */
    public List<Dossier> getPendingForPreValidateur(User preVal) {
        return dossierRepository.findPendingForPreValidateur(preVal, StatutDossier.EN_ATTENTE_PREVALIDATION);
    }

    /**
     * Pending queue for pré-validateur (closure workflow)
     */
    public List<Dossier> getPendingClosureForPreValidateur(User preVal) {
        return dossierRepository.findPendingClosureForPreValidateur(preVal, StatutDossier.EN_ATTENTE_PREVALIDATION_CLOTURE);
    }

    /**
     * Pending queue for validateur (opening workflow)
     */
    public List<Dossier> getPendingForValidateur(User validateur) {
        return dossierRepository.findPendingForValidateur(validateur, StatutDossier.EN_ATTENTE_VALIDATION);
    }

    /**
     * Pending queue for validateur (closure workflow)
     */
    public List<Dossier> getPendingClosureForValidateur(User validateur) {
        return dossierRepository.findPendingClosureForValidateur(validateur, StatutDossier.EN_ATTENTE_VALIDATION_CLOTURE);
    }

    @Transactional
    public List<Dossier> searchDossiers(String query) {
        return dossierRepository.searchDossiers(query);
    }

    public List<AuditLog> getDossierHistory(Long dossierId) {
        return auditLogRepository.findByEntityNameAndEntityIdOrderByTimestampDesc("Dossier", dossierId);
    }

    public void archiveDossier(Long id) {
        Dossier dossier = dossierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Dossier non trouvé"));
        dossier.setArchived(true);
        dossierRepository.save(dossier);
    }
}


