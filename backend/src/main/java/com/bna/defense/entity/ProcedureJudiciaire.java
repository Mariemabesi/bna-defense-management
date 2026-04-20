package com.bna.defense.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Module Action en Justice: Gère les procédures judiciaires (assignations, etc.)
 */
@Entity
@Table(name = "procedures_judiciaires")
public class ProcedureJudiciaire extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "affaire_id", nullable = false)
    @JsonBackReference
    private Affaire affaire;

    @Transient
    private Long affaireId; // used by the frontend to pass the affaire ID

    @Column(nullable = false)
    private String titre;

    @Enumerated(EnumType.STRING)
    private TypeProcedure type;

    @Enumerated(EnumType.STRING)
    private StatutProcedure statut;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "procedure", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Audience> audiences = new ArrayList<>();

    @OneToOne(mappedBy = "procedure", cascade = CascadeType.ALL)
    private Jugement jugement;

    public ProcedureJudiciaire() {}

    public Affaire getAffaire() { return affaire; }
    public void setAffaire(Affaire affaire) { this.affaire = affaire; }
    public Long getAffaireId() { return affaireId; }
    public void setAffaireId(Long affaireId) { this.affaireId = affaireId; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public TypeProcedure getType() { return type; }
    public void setType(TypeProcedure type) { this.type = type; }
    public StatutProcedure getStatut() { return statut; }
    public void setStatut(StatutProcedure statut) { this.statut = statut; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<Audience> getAudiences() { return audiences; }
    public void setAudiences(List<Audience> audiences) { this.audiences = audiences; }
    public Jugement getJugement() { return jugement; }
    public void setJugement(Jugement jugement) { this.jugement = jugement; }

    public enum TypeProcedure {
        ASSIGNATION, REQUETE, APPEL, CASSATION, REFERE, AUTRE
    }

    public enum StatutProcedure {
        BROUILLON, EN_COURS, VALIDEE, TERMINEE, ANNULEE
    }
}
