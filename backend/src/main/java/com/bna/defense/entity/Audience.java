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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tribunal_id")
    private Tribunal tribunal;

    @Column(nullable = false)
    private LocalDateTime dateHeure;

    private String salle;

    @Enumerated(EnumType.STRING)
    private StatutAudience statut;

    @Column(columnDefinition = "TEXT")
    private String observation;

    public Audience() {}

    public ProcedureJudiciaire getProcedure() { return procedure; }
    public void setProcedure(ProcedureJudiciaire procedure) { this.procedure = procedure; }

    public Tribunal getTribunal() { return tribunal; }
    public void setTribunal(Tribunal tribunal) { this.tribunal = tribunal; }

    public LocalDateTime getDateHeure() { return dateHeure; }
    public void setDateHeure(LocalDateTime dateHeure) { this.dateHeure = dateHeure; }

    public String getSalle() { return salle; }
    public void setSalle(String salle) { this.salle = salle; }

    public StatutAudience getStatut() { return statut; }
    public void setStatut(StatutAudience statut) { this.statut = statut; }

    public String getObservation() { return observation; }
    public void setObservation(String observation) { this.observation = observation; }

    public enum StatutAudience {
        PREVUE, REPORTEE, TENUE, ANNULEE
    }
}
