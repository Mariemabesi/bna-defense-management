package com.bna.defense.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIAnalysisDTO {
    
    // Request fields
    private String affaire_type;
    private String avocat_specialite;
    private Double nb_reportees;
    private Double avocat_experience_annees;
    private String qualite_preuves;
    private String solidite_dossier;
    private Double dossier_budget_provisionne;
    private String specialite_compatible;

    // Response fields
    private String prediction;
    private Double probabilitySuccess;
    private Double probabilityFailure;
    private String riskLevel;
    private String analysis;
    private String status;
}
