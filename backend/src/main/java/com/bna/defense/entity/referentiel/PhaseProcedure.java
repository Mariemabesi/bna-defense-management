package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "ref_phases_procedure")
public class PhaseProcedure extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String nom; 

    private Integer ordre;

    public PhaseProcedure() {}

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public Integer getOrdre() { return ordre; }
    public void setOrdre(Integer ordre) { this.ordre = ordre; }
}
