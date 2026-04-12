package com.bna.defense.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Gestion du planning des audiences
 */
@Entity
@Table(name = "audiences")
public class Audience extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedure_id", nullable = false)
    @JsonBackReference
    private ProcedureJudiciaire procedure;

    @Column(nullable = false)
    private LocalDateTime dateAudience;

    private String lieu;

    @Enumerated(EnumType.STRING)
    private StatutAudience statut;

    @Column(columnDefinition = "TEXT")
    private String compteRendu;

    public Audience() {}

    public ProcedureJudiciaire getProcedure() { return procedure; }
    public void setProcedure(ProcedureJudiciaire procedure) { this.procedure = procedure; }
    public LocalDateTime getDateAudience() { return dateAudience; }
    public void setDateAudience(LocalDateTime dateAudience) { this.dateAudience = dateAudience; }
    public String getLieu() { return lieu; }
    public void setLieu(String lieu) { this.lieu = lieu; }
    public StatutAudience getStatut() { return statut; }
    public void setStatut(StatutAudience statut) { this.statut = statut; }
    public String getCompteRendu() { return compteRendu; }
    public void setCompteRendu(String compteRendu) { this.compteRendu = compteRendu; }

    public enum StatutAudience {
        PLANIFIEE, REPORTEE, MENEE, ANNULEE
    }
}
