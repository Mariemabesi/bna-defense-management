package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ref_devises")
public class Devise extends BaseEntity {

    @Column(nullable = false)
    private String nom;

    private String codeIso; // TND, EUR, USD

    private String symbole;

    private BigDecimal tauxConversionVersTND;

    private LocalDateTime dateMiseAJourTaux;

    public Devise() {}

    public String getNom() { return nom; }
    public void setNom(String n) { this.nom = n; }
    public String getCodeIso() { return codeIso; }
    public void setCodeIso(String c) { this.codeIso = c; }
    public String getSymbole() { return symbole; }
    public void setSymbole(String s) { this.symbole = s; }
    public BigDecimal getTauxConversionVersTND() { return tauxConversionVersTND; }
    public void setTauxConversionVersTND(BigDecimal t) { this.tauxConversionVersTND = t; }
    public LocalDateTime getDateMiseAJourTaux() { return dateMiseAJourTaux; }
    public void setDateMiseAJourTaux(LocalDateTime d) { this.dateMiseAJourTaux = d; }
}
