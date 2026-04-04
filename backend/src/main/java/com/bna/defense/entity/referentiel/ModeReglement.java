package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "ref_modes_reglement")
public class ModeReglement extends BaseEntity {

    @Column(nullable = false)
    private String nom;

    private String code;

    private String description;

    private Boolean actif = true;

    public ModeReglement() {}

    public String getNom() { return nom; }
    public void setNom(String n) { this.nom = n; }
    public String getCode() { return code; }
    public void setCode(String c) { this.code = c; }
    public String getDescription() { return description; }
    public void setDescription(String d) { this.description = d; }
    public Boolean getActif() { return actif; }
    public void setActif(Boolean a) { this.actif = a; }
}
