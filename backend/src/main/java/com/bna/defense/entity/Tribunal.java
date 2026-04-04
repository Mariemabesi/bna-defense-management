package com.bna.defense.entity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
@Entity
@Table(name = "tribunaux")
public class Tribunal extends BaseEntity {
    private String nom;
    private String region;
    private String adresse;
    private String telephone;

    public Tribunal() {}
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
}
