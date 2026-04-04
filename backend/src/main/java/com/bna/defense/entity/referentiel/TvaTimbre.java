package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ref_tva_timbre")
public class TvaTimbre extends BaseEntity {

    @Column(nullable = false)
    private String typeTaxe; // TVA / Timbre / Droit d'enregistrement

    private BigDecimal taux;

    private LocalDate dateEntreeVigueur;

    private String descriptionLegale;

    public TvaTimbre() {}

    public String getTypeTaxe() { return typeTaxe; }
    public void setTypeTaxe(String t) { this.typeTaxe = t; }
    public BigDecimal getTaux() { return taux; }
    public void setTaux(BigDecimal t) { this.taux = t; }
    public LocalDate getDateEntreeVigueur() { return dateEntreeVigueur; }
    public void setDateEntreeVigueur(LocalDate d) { this.dateEntreeVigueur = d; }
    public String getDescriptionLegale() { return descriptionLegale; }
    public void setDescriptionLegale(String d) { this.descriptionLegale = d; }
}
