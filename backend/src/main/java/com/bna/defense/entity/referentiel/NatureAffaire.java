package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "ref_natures_affaire")
public class NatureAffaire extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String nom; 

    private String code;

    public NatureAffaire() {}

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
