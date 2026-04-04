package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "ref_types_procedure")
public class TypeProcedure extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String nom;
    private String code;
    @Column(columnDefinition = "TEXT")
    private String description;
    private Integer delaiMoyen; // en jours

    public TypeProcedure() {}

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getCode() { return code; }
    public void setCode(String c) { this.code = c; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDelaiMoyen() { return delaiMoyen; }
    public void setDelaiMoyen(Integer d) { this.delaiMoyen = d; }
}
