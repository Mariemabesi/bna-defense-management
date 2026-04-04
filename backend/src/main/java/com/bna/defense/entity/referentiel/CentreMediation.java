package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "ref_centres_mediation")
public class CentreMediation extends BaseEntity {

    @Column(nullable = false)
    private String nom;

    private String arbitreDesigne;
    private String type; // Médiation / Arbitrage
    private java.time.LocalDate dateSession;
    private String resultat;
    private String adresse;
    private String observations;

    public CentreMediation() {}

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getArbitreDesigne() { return arbitreDesigne; }
    public void setArbitreDesigne(String arbitreDesigne) { this.arbitreDesigne = arbitreDesigne; }
    public String getType() { return type; }
    public void setType(String t) { this.type = t; }
    public java.time.LocalDate getDateSession() { return dateSession; }
    public void setDateSession(java.time.LocalDate d) { this.dateSession = d; }
    public String getResultat() { return resultat; }
    public void setResultat(String resultat) { this.resultat = resultat; }
    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
    public String getObservations() { return observations; }
    public void setObservations(String o) { this.observations = o; }
}
