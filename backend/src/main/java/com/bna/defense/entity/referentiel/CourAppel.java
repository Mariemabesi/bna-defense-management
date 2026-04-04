package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "ref_cours_appel")
public class CourAppel extends BaseEntity {

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String region;

    private String competenceTerritoriale;

    private String adresse;

    public CourAppel() {}

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public String getCompetenceTerritoriale() { return competenceTerritoriale; }
    public void setCompetenceTerritoriale(String competenceTerritoriale) { this.competenceTerritoriale = competenceTerritoriale; }
    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
}
