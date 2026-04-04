package com.bna.defense.entity;
import jakarta.persistence.*;
@Entity
@Table(name = "parties_litige")
public class PartieLitige extends BaseEntity {
    @Column(nullable = false)
    private String nom;
    private String prenom;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypePartie type;
    private String identifiantFiscal;
    private String cin;
    private String adresse;
    private String telephone;

    public PartieLitige() {}
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    public TypePartie getType() { return type; }
    public void setType(TypePartie type) { this.type = type; }
    public String getIdentifiantFiscal() { return identifiantFiscal; }
    public void setIdentifiantFiscal(String id) { this.identifiantFiscal = id; }
    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }
    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public enum TypePartie {
        BNE, PHYSIQUE, CJN
    }
}
