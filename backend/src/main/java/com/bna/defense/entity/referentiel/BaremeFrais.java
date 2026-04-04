package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ref_baremes_frais")
public class BaremeFrais extends BaseEntity {

    private String nom;
    private String typeProcedure; 
    private String tribunalType; 
    private BigDecimal montantDeBase; // TND
    private String uniteCalcul; // Forfait / Pourcentage / Par audience

    public BaremeFrais() {}

    public String getNom() { return nom; }
    public void setNom(String n) { this.nom = n; }
    public String getTypeProcedure() { return typeProcedure; }
    public void setTypeProcedure(String typeProcedure) { this.typeProcedure = typeProcedure; }
    public BigDecimal getMontantDeBase() { return montantDeBase; }
    public void setMontantDeBase(BigDecimal montantDeBase) { this.montantDeBase = montantDeBase; }
    public String getTribunalType() { return tribunalType; }
    public void setTribunalType(String tribunalType) { this.tribunalType = tribunalType; }
    public String getUniteCalcul() { return uniteCalcul; }
    public void setUniteCalcul(String u) { this.uniteCalcul = u; }
}
