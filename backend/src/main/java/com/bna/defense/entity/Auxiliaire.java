package com.bna.defense.entity;
import jakarta.persistence.*;
@Entity
@Table(name = "auxiliaires")
public class Auxiliaire extends BaseEntity {
    @Column(nullable = false)
    private String nom;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeAuxiliaire type;
    private String adresse;
    private String telephone;
    private String email;

    // Point 7: Avocat Profile Expansion
    private String numOrdreNational;
    private String specialite;
    private String region;
    private String tribunauxCouverts; // Semicolon separated

    // Point 7: Section 3 - Tarification
    private java.math.BigDecimal tarifTimbre = java.math.BigDecimal.ZERO;
    private java.math.BigDecimal tarifDependances = java.math.BigDecimal.ZERO;
    private java.math.BigDecimal tauxTva = new java.math.BigDecimal("19.00");
    
    // Performance & Popularity (Point 14)
    private Integer dossiersCount = 0;
    private Double rating = 4.5;

    public Auxiliaire() {}
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public TypeAuxiliaire getType() { return type; }
    public void setType(TypeAuxiliaire type) { this.type = type; }
    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getNumOrdreNational() { return numOrdreNational; }
    public void setNumOrdreNational(String n) { this.numOrdreNational = n; }
    public String getSpecialite() { return specialite; }
    public void setSpecialite(String s) { this.specialite = s; }
    public String getRegion() { return region; }
    public void setRegion(String r) { this.region = r; }
    public String getTribunauxCouverts() { return tribunauxCouverts; }
    public void setTribunauxCouverts(String t) { this.tribunauxCouverts = t; }
    public java.math.BigDecimal getTarifTimbre() { return tarifTimbre; }
    public void setTarifTimbre(java.math.BigDecimal t) { this.tarifTimbre = t; }
    public java.math.BigDecimal getTarifDependances() { return tarifDependances; }
    public void setTarifDependances(java.math.BigDecimal t) { this.tarifDependances = t; }
    public java.math.BigDecimal getTauxTva() { return tauxTva; }
    public void setTauxTva(java.math.BigDecimal t) { this.tauxTva = t; }

    public Integer getDossiersCount() { return dossiersCount; }
    public void setDossiersCount(Integer dc) { this.dossiersCount = dc; }
    public Double getRating() { return rating; }
    public void setRating(Double r) { this.rating = r; }


    public enum TypeAuxiliaire {
        AVOCAT, HUISSIER, EXPERT, TRIBUNAL, NOTAIRE, MANDATAIRE, GREFFIER
    }
}
