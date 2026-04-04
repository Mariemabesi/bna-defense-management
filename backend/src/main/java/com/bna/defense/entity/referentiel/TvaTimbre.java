package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ref_taxes")
public class TvaTimbre extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String nom; 

    @Column(nullable = false)
    private BigDecimal taux; 

    @Column(nullable = false)
    private Boolean estPourcentage; 

    public TvaTimbre() {}

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public BigDecimal getTaux() { return taux; }
    public void setTaux(BigDecimal taux) { this.taux = taux; }
    public Boolean getEstPourcentage() { return estPourcentage; }
    public void setEstPourcentage(Boolean estPourcentage) { this.estPourcentage = estPourcentage; }
}
