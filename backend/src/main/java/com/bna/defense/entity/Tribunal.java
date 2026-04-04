package com.bna.defense.entity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
@Entity
@Table(name = "tribunaux")
public class Tribunal extends BaseEntity {
    private String nom;
    private String type; // Première Instance, Cantonal, Immobilier, Commercial
    private String region;
    private String gouvernorat;
    private String adresse;
    private String telephone;
    private String email;
    private String president;
    private String competenceTerritoriale;
    private Boolean actif = true;

    public Tribunal() {}
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getType() { return type; }
    public void setType(String t) { this.type = t; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public String getGouvernorat() { return gouvernorat; }
    public void setGouvernorat(String g) { this.gouvernorat = g; }
    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getEmail() { return email; }
    public void setEmail(String e) { this.email = e; }
    public String getPresident() { return president; }
    public void setPresident(String p) { this.president = p; }
    public String getCompetenceTerritoriale() { return competenceTerritoriale; }
    public void setCompetenceTerritoriale(String c) { this.competenceTerritoriale = c; }
    public Boolean getActif() { return actif; }
    public void setActif(Boolean a) { this.actif = a; }
}
