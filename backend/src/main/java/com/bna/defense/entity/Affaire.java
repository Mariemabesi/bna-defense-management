package com.bna.defense.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "affaires")
public class Affaire extends BaseEntity {
    public Affaire() {}

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id", nullable = false)
    @JsonBackReference
    private Dossier dossier;

    @Column(nullable = false)
    private String referenceJudiciaire;

    @Enumerated(EnumType.STRING)
    private TypeAffaire type;

    private LocalDate dateOuverture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adversaire_id")
    private PartieLitige adversaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avocat_id")
    private Auxiliaire avocat;

    @Enumerated(EnumType.STRING)
    private StatutAffaire statut;

    // --- MANUAL GETTERS & SETTERS ---
    public Dossier getDossier() { return dossier; }
    public void setDossier(Dossier dossier) { this.dossier = dossier; }
    public String getReferenceJudiciaire() { return referenceJudiciaire; }
    public void setReferenceJudiciaire(String referenceJudiciaire) { this.referenceJudiciaire = referenceJudiciaire; }
    public TypeAffaire getType() { return type; }
    public void setType(TypeAffaire type) { this.type = type; }
    public LocalDate getDateOuverture() { return dateOuverture; }
    public void setDateOuverture(LocalDate dateOuverture) { this.dateOuverture = dateOuverture; }
    public PartieLitige getAdversaire() { return adversaire; }
    public void setAdversaire(PartieLitige adversaire) { this.adversaire = adversaire; }
    public Auxiliaire getAvocat() { return avocat; }
    public void setAvocat(Auxiliaire avocat) { this.avocat = avocat; }
    public StatutAffaire getStatut() { return statut; }
    public void setStatut(StatutAffaire statut) { this.statut = statut; }

    public enum TypeAffaire {
        CIVIL, PENAL, PRUDHOMME, PATRIMOINE_IMMOBILIER
    }

    public enum StatutAffaire {
        EN_COURS, GAGNE, PERDU, CLASSE
    }
}
