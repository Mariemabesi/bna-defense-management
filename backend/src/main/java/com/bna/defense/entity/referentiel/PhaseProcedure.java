package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "ref_phases_procedure")
public class PhaseProcedure extends BaseEntity {

    @Column(nullable = false)
    private String nom;

    private Integer ordre;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer delaiLegalEstimé;

    public PhaseProcedure() {}

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public Integer getOrdre() { return ordre; }
    public void setOrdre(Integer o) { this.ordre = o; }
    public String getDescription() { return description; }
    public void setDescription(String d) { this.description = d; }
    public Integer getDelaiLegalEstimé() { return delaiLegalEstimé; }
    public void setDelaiLegalEstimé(Integer d) { this.delaiLegalEstimé = d; }
}
