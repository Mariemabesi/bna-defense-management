package com.bna.defense.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.math.BigDecimal;

/**
 * Enregistrement et suivi des impacts des jugements
 */
@Entity
@Table(name = "jugements")
public class Jugement extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedure_id", nullable = false)
    @JsonBackReference
    private ProcedureJudiciaire procedure;

    @Column(nullable = false)
    private LocalDate dateJugement;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String decision;

    private BigDecimal impactFinancier;

    private String referenceJugement;

    public Jugement() {}

    public ProcedureJudiciaire getProcedure() { return procedure; }
    public void setProcedure(ProcedureJudiciaire procedure) { this.procedure = procedure; }
    public LocalDate getDateJugement() { return dateJugement; }
    public void setDateJugement(LocalDate dateJugement) { this.dateJugement = dateJugement; }
    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }
    public BigDecimal getImpactFinancier() { return impactFinancier; }
    public void setImpactFinancier(BigDecimal impactFinancier) { this.impactFinancier = impactFinancier; }
    public String getReferenceJugement() { return referenceJugement; }
    public void setReferenceJugement(String referenceJugement) { this.referenceJugement = referenceJugement; }
}
