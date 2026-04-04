package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "ref_mandataires")
public class Mandataire extends BaseEntity {

    @Column(nullable = false)
    private String nom;

    private String perimetreMandat;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    private String telephone;

    private String email;

    public Mandataire() {}

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getPerimetreMandat() { return perimetreMandat; }
    public void setPerimetreMandat(String perimetreMandat) { this.perimetreMandat = perimetreMandat; }
    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }
    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
