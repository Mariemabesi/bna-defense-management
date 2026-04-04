package com.bna.defense.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity
@Table(name = "frais_reglements")
public class Frais extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "affaire_id", nullable = false)
    private Affaire affaire;
    @Column(nullable = false)
    private String libelle;
    @Column(nullable = false)
    private BigDecimal montant;
    @Column(nullable = false)
    private BigDecimal tauxTva = new BigDecimal("19.00");
    @Column(nullable = true)
    private BigDecimal montantTtc;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeFrais type;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutFrais statut;
    @com.fasterxml.jackson.annotation.JsonProperty("affaireReference")
    public String getAffaireReference() {
        return affaire != null ? (affaire.getReferenceJudiciaire() != null ? affaire.getReferenceJudiciaire() : "N/A") : "N/A";
    }

    @com.fasterxml.jackson.annotation.JsonProperty("dossierReference")
    public String getDossierReference() {
        return (affaire != null && affaire.getDossier() != null) ? affaire.getDossier().getReference() : "N/A";
    }

    private String observation;

    public Frais() {}

    @PrePersist @PreUpdate
    public void calculateTtc() {
        if (montant != null) {
            BigDecimal tvaFactor = BigDecimal.ONE.add(tauxTva.divide(new BigDecimal("100"), 4, java.math.RoundingMode.HALF_UP));
            this.montantTtc = montant.multiply(tvaFactor).setScale(2, java.math.RoundingMode.HALF_UP);
        }
    }

    public Affaire getAffaire() { return affaire; }
    public void setAffaire(Affaire affaire) { this.affaire = affaire; }
    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }
    public BigDecimal getMontant() { return montant; }
    public void setMontant(BigDecimal montant) { this.montant = montant; }
    public BigDecimal getTauxTva() { return tauxTva; }
    public void setTauxTva(BigDecimal tauxTva) { this.tauxTva = tauxTva; }
    public BigDecimal getMontantTtc() { return montantTtc; }
    public void setMontantTtc(BigDecimal montantTtc) { this.montantTtc = montantTtc; }
    public TypeFrais getType() { return type; }
    public void setType(TypeFrais type) { this.type = type; }
    public StatutFrais getStatut() { return statut; }
    public void setStatut(StatutFrais statut) { this.statut = statut; }
    public String getObservation() { return observation; }
    public void setObservation(String observation) { this.observation = observation; }

    public enum TypeFrais { HONORAIRES_AVOCAT, FRAIS_HUISSIER, EXPERTISE, CONSIGNATION, TIMBRAGE, AUTRE }
    public enum StatutFrais { ATTENTE, PRE_VALIDE, VALIDE, REJETE, ENVOYE_TRESORERIE }
}
