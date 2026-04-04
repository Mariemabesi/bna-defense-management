package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "ref_modes_reglement")
public class ModeReglement extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String nom; 

    private String description;

    public ModeReglement() {}

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
