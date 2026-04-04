package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "ref_notaires")
public class Notaire extends BaseEntity {

    @Column(nullable = false)
    private String nom;

    private String adresse;

    @Column(nullable = false)
    private String region;

    private String numeroOrdre;

    private String telephone;

    private String email;

    public Notaire() {}

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public String getNumeroOrdre() { return numeroOrdre; }
    public void setNumeroOrdre(String numeroOrdre) { this.numeroOrdre = numeroOrdre; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
