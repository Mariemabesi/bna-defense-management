package com.bna.defense.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "affaires")
public class Affaire extends BaseEntity {
    public Affaire() {}

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id", nullable = true)
    @JsonBackReference
    private Dossier dossier;

    @Transient // Only for JSON mapping
    private Long dossierId;

    @Column(nullable = true)
    private String referenceJudiciaire;

    @Column(nullable = true)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private TypeAffaire type;

    private LocalDate dateOuverture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adversaire_id")
    private PartieLitige adversaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avocat_id")
    private Auxiliaire avocat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tribunal_id")
    private Tribunal tribunal;

    @Enumerated(EnumType.STRING)
    private StatutAffaire statut;

    @OneToMany(mappedBy = "affaire", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private java.util.List<ProcedureJudiciaire> procedures = new java.util.ArrayList<>();

    // --- MANUAL GETTERS & SETTERS ---
    public java.util.List<ProcedureJudiciaire> getProcedures() { return procedures; }
    public void setProcedures(java.util.List<ProcedureJudiciaire> procedures) { this.procedures = procedures; }

    public Dossier getDossier() { return dossier; }
    public void setDossier(Dossier dossier) { this.dossier = dossier; }
    public Long getDossierId() { return dossierId; }
    public void setDossierId(Long dossierId) { this.dossierId = dossierId; }
    public String getReferenceJudiciaire() { return referenceJudiciaire; }
    public void setReferenceJudiciaire(String referenceJudiciaire) { this.referenceJudiciaire = referenceJudiciaire; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public TypeAffaire getType() { return type; }
    public void setType(TypeAffaire type) { this.type = type; }
    public LocalDate getDateOuverture() { return dateOuverture; }
    public void setDateOuverture(LocalDate dateOuverture) { this.dateOuverture = dateOuverture; }
    public PartieLitige getAdversaire() { return adversaire; }
    public void setAdversaire(PartieLitige adversaire) { this.adversaire = adversaire; }
    public Auxiliaire getAvocat() { return avocat; }
    public void setAvocat(Auxiliaire avocat) { this.avocat = avocat; }
    public Tribunal getTribunal() { return tribunal; }
    public void setTribunal(Tribunal tribunal) { this.tribunal = tribunal; }
    public StatutAffaire getStatut() { return statut; }
    public void setStatut(StatutAffaire statut) { this.statut = statut; }

    public enum TypeAffaire {
        CIVIL, PENAL, PRUDHOMME, PATRIMOINE_IMMOBILIER, CREDIT, LITIGE, GARANTIE
    }

    public enum StatutAffaire {
        EN_COURS, GAGNE, PERDU, CLASSE
    }
}
