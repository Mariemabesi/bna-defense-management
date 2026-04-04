package com.bna.defense.dto;
import java.math.BigDecimal;

public class DossierDTO {
    private Long id;
    private String reference;
    private String titre;
    private String priorite;
    private BigDecimal budgetProvisionne;
    private String description;
    private String statut;

    public DossierDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getPriorite() { return priorite; }
    public void setPriorite(String priorite) { this.priorite = priorite; }
    public BigDecimal getBudgetProvisionne() { return budgetProvisionne; }
    public void setBudgetProvisionne(BigDecimal budgetProvisionne) { this.budgetProvisionne = budgetProvisionne; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}
