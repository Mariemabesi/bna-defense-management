package com.bna.defense.service;

import com.bna.defense.entity.ProcedureJudiciaire;
import com.bna.defense.entity.Frais;
import com.bna.defense.repository.ProcedureJudiciaireRepository;
import com.bna.defense.repository.FraisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
public class ProcedureService {

    @Autowired
    private ProcedureJudiciaireRepository procedureRepository;

    @Autowired
    private FraisRepository fraisRepository;

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
