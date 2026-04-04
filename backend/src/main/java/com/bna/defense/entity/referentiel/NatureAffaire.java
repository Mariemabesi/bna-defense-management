package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "ref_natures_affaire")
public class NatureAffaire extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String nom;

    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_procedure_id")
    private TypeProcedure typeProcedure;

    public NatureAffaire() {}

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getCode() { return code; }
    public void setCode(String c) { this.code = c; }
    public String getDescription() { return description; }
    public void setDescription(String d) { this.description = d; }
    public TypeProcedure getTypeProcedure() { return typeProcedure; }
    public void setTypeProcedure(TypeProcedure t) { this.typeProcedure = t; }
}
