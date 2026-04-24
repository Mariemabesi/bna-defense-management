package com.bna.defense.service;

import com.bna.defense.entity.ProcedureJudiciaire;
import com.bna.defense.entity.Frais;
import com.bna.defense.entity.User;
import com.bna.defense.repository.ProcedureJudiciaireRepository;
import com.bna.defense.repository.FraisRepository;
import com.bna.defense.repository.UserRepository;
import com.bna.defense.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ProcedureService {

    private final ProcedureJudiciaireRepository procedureRepository;
    private final FraisRepository fraisRepository;
    private final UserRepository userRepository;

    public ProcedureService(ProcedureJudiciaireRepository procedureRepository, 
                            FraisRepository fraisRepository, 
                            UserRepository userRepository) {
        this.procedureRepository = procedureRepository;
        this.fraisRepository = fraisRepository;
        this.userRepository = userRepository;
    }

    public List<ProcedureJudiciaire> getAllProcedures(UserDetailsImpl userDetails) {
        if (isGlobalSupervisor(userDetails)) {
            return procedureRepository.findAll();
        }
        if (hasRole(userDetails, "ROLE_PRE_VALIDATEUR")) {
            return procedureRepository.findAllForManager(userDetails.getId());
        }
        return procedureRepository.findAllVisibleToUser(userDetails.getId(), userDetails.getUsername());
    }

    public List<ProcedureJudiciaire> getByAffaire(Long affaireId, UserDetailsImpl userDetails) {
        if (isGlobalSupervisor(userDetails)) {
            return procedureRepository.findByAffaire_Id(affaireId);
        }
        // For Charge and Pre-Validateur, we check visibility. 
        // Pre-validateur will only see it if the affaire belongs to a dossier they manage.
        // We can filter the list returned by findByAffaire_Id for Pre-Validateur or use a more complex query.
        List<ProcedureJudiciaire> allForAffaire = procedureRepository.findByAffaire_Id(affaireId);
        if (hasRole(userDetails, "ROLE_PRE_VALIDATEUR")) {
             // Quick fix: filter the list to ensure the dossier manager is the current user
             return allForAffaire.stream()
                .filter(p -> p.getAffaire() != null && p.getAffaire().getDossier() != null && 
                            p.getAffaire().getDossier().getAssignedCharge() != null && 
                            p.getAffaire().getDossier().getAssignedCharge().getManager() != null &&
                            p.getAffaire().getDossier().getAssignedCharge().getManager().getId().equals(userDetails.getId()))
                .collect(java.util.stream.Collectors.toList());
        }
        
        return procedureRepository.findByAffaireIdAndVisibleToUser(affaireId, userDetails.getId(), userDetails.getUsername());
    }

    public boolean isGlobalSupervisor(UserDetailsImpl userDetails) {
        return userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_VALIDATEUR") 
                            || a.getAuthority().equals("ROLE_SUPER_VALIDATEUR") 
                            || a.getAuthority().equals("ROLE_ADMIN"));
    }

    private boolean hasRole(UserDetailsImpl userDetails, String role) {
        return userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(role));
    }

    public boolean canAccessProcedure(ProcedureJudiciaire procedure, UserDetailsImpl userDetails) {
        if (isGlobalSupervisor(userDetails)) {
            return true;
        }
        
        if (hasRole(userDetails, "ROLE_PRE_VALIDATEUR")) {
            return procedure.getAffaire() != null && procedure.getAffaire().getDossier() != null && 
                   procedure.getAffaire().getDossier().getAssignedCharge() != null && 
                   procedure.getAffaire().getDossier().getAssignedCharge().getManager() != null &&
                   procedure.getAffaire().getDossier().getAssignedCharge().getManager().getId().equals(userDetails.getId());
        }
        
        if (procedure.getCreator() != null) {
            return procedure.getCreator().getId().equals(userDetails.getId());
        }
        
        // Fallback for legacy data using the auditing field
        return userDetails.getUsername().equals(procedure.getCreatedBy());
    }

    /**
     * Valide une procédure et génère automatiquement les frais associés (Honoraires Avocat par défaut)
     */
    @Transactional
    public ProcedureJudiciaire validateProcedure(Long procedureId) {
        ProcedureJudiciaire procedure = procedureRepository.findById(procedureId)
                .orElseThrow(() -> new RuntimeException("Procédure non trouvée"));

        if (procedure.getStatut() == ProcedureJudiciaire.StatutProcedure.VALIDEE) {
            return procedure;
        }

        procedure.setStatut(ProcedureJudiciaire.StatutProcedure.VALIDEE);
        procedure = procedureRepository.save(procedure);

        // Déclenchement automatique des frais selon les contraintes du module financier
        generateAutomaticFees(procedure);

        return procedure;
    }

    @Transactional
    public ProcedureJudiciaire createProcedure(ProcedureJudiciaire procedure, UserDetailsImpl userDetails) {
        User creator = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        procedure.setCreator(creator);
        return procedureRepository.save(procedure);
    }

    private void generateAutomaticFees(ProcedureJudiciaire procedure) {
        Frais frais = new Frais();
        frais.setAffaire(procedure.getAffaire());
        frais.setLibelle("Honoraires automatiques pour procédure: " + procedure.getTitre());
        frais.setMontant(new BigDecimal("500.00")); // Montant forfaitaire exemple
        frais.setType(Frais.TypeFrais.HONORAIRES_AVOCAT);
        frais.setStatut(Frais.StatutFrais.ATTENTE);
        frais.setObservation("Généré automatiquement suite à la validation de la procédure #" + procedure.getId());
        
        fraisRepository.save(frais);
    }
}
