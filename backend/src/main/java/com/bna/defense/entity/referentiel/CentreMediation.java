package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "ref_centres_mediation")
public class CentreMediation extends BaseEntity {

    @Column(nullable = false)
    private String nom;

    private String arbitreDesigne;

    private String resultat;

    private String adresse;

    public CentreMediation() {}

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getArbitreDesigne() { return arbitreDesigne; }
    public void setArbitreDesigne(String arbitreDesigne) { this.arbitreDesigne = arbitreDesigne; }
    public String getResultat() { return resultat; }
    public void setResultat(String resultat) { this.resultat = resultat; }
    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
}
