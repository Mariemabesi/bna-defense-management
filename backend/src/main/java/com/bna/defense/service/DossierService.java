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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;

@Service
public class DossierService {

    @Autowired private DossierRepository dossierRepository;
    @Autowired private AffaireRepository affaireRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private AuditLogService auditLogService;
    @Autowired private NotificationService notificationService;

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

        return dossierRepository.findAllWithRBAC(
            currentUser,
            currentUser.getUsername(),
            isSuper,
            isCharge,
            isPreVal,
            isValidateur,
            pageable
        );
    }

    public Dossier getDossierById(Long id) {
        return dossierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Dossier non trouvé"));
    }

    @Transactional
    public Dossier createDossier(Dossier dossier, User creator) {
        dossier.setCreatedBy(creator.getUsername());
        if (dossier.getStatut() == null) {
            dossier.setStatut(Dossier.StatutDossier.OUVERT);
        }
        if (dossier.getFraisReel() == null)  dossier.setFraisReel(BigDecimal.ZERO);
        if (dossier.getFraisInitial() == null) dossier.setFraisInitial(BigDecimal.ZERO);

        // Auto-assign chargé
        if (dossier.getAssignedCharge() == null && hasRole(creator, Role.RoleType.ROLE_CHARGE_DOSSIER)) {
            dossier.setAssignedCharge(creator);
        }

        // Generate reference DEF-YYYY-XXXX
        if (dossier.getReference() == null || dossier.getReference().trim().isEmpty()) {
            int randomNum = new Random().nextInt(9000) + 1000;
            dossier.setReference("DEF-" + java.time.Year.now().getValue() + "-" + randomNum);
        }

        Dossier saved = dossierRepository.save(dossier);

        // Auto-create initial affaire
        if (saved.getAffaires() == null || saved.getAffaires().isEmpty()) {
            Affaire defaultAffaire = new Affaire();
            defaultAffaire.setDossier(saved);
            defaultAffaire.setReferenceJudiciaire("JUD-" + saved.getReference());
            defaultAffaire.setType(Affaire.TypeAffaire.CIVIL);
            defaultAffaire.setStatut(Affaire.StatutAffaire.EN_COURS);
            defaultAffaire.setDateOuverture(java.time.LocalDate.now());
            affaireRepository.save(defaultAffaire);
            return dossierRepository.findById(saved.getId()).orElse(saved);
        }

        auditLogService.log(creator.getUsername(), "CREATION_DOSSIER", "Dossier", saved.getId(),
            "Dossier " + saved.getReference() + " créé par " + creator.getUsername());

        return saved;
    }

    @Transactional
    public Dossier updateStatut(Long id, Dossier.StatutDossier newStatut) {
        Dossier dossier = getDossierById(id);
        dossier.setStatut(newStatut);
        return dossierRepository.save(dossier);
    }

    /**
     * Chargé submits dossier for pre-validation → status = EN_ATTENTE_PREVALIDATION
     */
    @Transactional
    public Dossier soumettre(Long id, String username) {
        Dossier dossier = getDossierById(id);
        if (dossier.getStatut() != Dossier.StatutDossier.OUVERT && dossier.getStatut() != Dossier.StatutDossier.EN_COURS) {
            throw new RuntimeException("Seuls les dossiers OUVERT ou EN_COURS peuvent être soumis.");
        }
        dossier.setStatut(Dossier.StatutDossier.EN_ATTENTE_PREVALIDATION);
        Dossier saved = dossierRepository.save(dossier);

        auditLogService.log(username, "SOUMISSION_DOSSIER", "Dossier", id,
            "Dossier soumis pour pré-validation par " + username);
        return saved;
    }

    /**
     * Pré-validateur approves → status = EN_ATTENTE_VALIDATION, notify validateur
     */
    @Transactional
    public Dossier prevalider(Long id, String preValUsername) {
        Dossier dossier = getDossierById(id);
        if (dossier.getStatut() != Dossier.StatutDossier.EN_ATTENTE_PREVALIDATION) {
            throw new RuntimeException("Ce dossier n'est pas en attente de pré-validation.");
        }
        dossier.setStatut(Dossier.StatutDossier.EN_ATTENTE_VALIDATION);
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
        if (motif == null || motif.trim().length() < 20) {
            throw new RuntimeException("Le motif du refus doit contenir au moins 20 caractères.");
        }
        Dossier dossier = getDossierById(id);
        dossier.setStatut(Dossier.StatutDossier.REFUSE);
        dossier.setMotifRefus(motif);
        Dossier saved = dossierRepository.save(dossier);

        // Notify chargé
        User assignedCharge = dossier.getAssignedCharge();
        if (assignedCharge != null) {
            notificationService.notifyRefus(assignedCharge, saved, motif, refuseurUsername);
        }

        // Audit log with motif
        auditLogService.log(refuseurUsername, "REFUS_DOSSIER", "Dossier", id,
            "Dossier refusé par " + refuseurUsername + ". Motif: " + motif);
        return saved;
    }

    /**
     * Validateur gives final approval → status = VALIDE
     */
    @Transactional
    public Dossier validerFinal(Long id, String validateurUsername) {
        Dossier dossier = getDossierById(id);
        if (dossier.getStatut() != Dossier.StatutDossier.EN_ATTENTE_VALIDATION) {
            throw new RuntimeException("Ce dossier n'est pas en attente de validation finale.");
        }
        dossier.setStatut(Dossier.StatutDossier.VALIDE);
        Dossier saved = dossierRepository.save(dossier);

        auditLogService.log(validateurUsername, "VALIDATION_FINALE", "Dossier", id,
            "Dossier validé définitivement par " + validateurUsername);
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

    @Transactional
    public Dossier closeDossier(Long id) {
        Dossier dossier = getDossierById(id);
        boolean allFinished = dossier.getAffaires().stream()
            .allMatch(a -> a.getStatut() == Affaire.StatutAffaire.CLASSE);
        if (!allFinished) {
            throw new RuntimeException("Toutes les affaires liées doivent être classées avant la clôture.");
        }
        dossier.setStatut(Dossier.StatutDossier.CLOTURE);
        return dossierRepository.save(dossier);
    }

    /**
     * Pending queue for pré-validateur
     */
    public List<Dossier> getPendingForPreValidateur(User preVal) {
        return dossierRepository.findPendingForPreValidateur(preVal);
    }

    /**
     * Pending queue for validateur
     */
    public List<Dossier> getPendingForValidateur(User validateur) {
        return dossierRepository.findPendingForValidateur(validateur);
    }

    @Transactional
    public List<Dossier> searchDossiers(String query) {
        return dossierRepository.searchDossiers(query);
    }
}
