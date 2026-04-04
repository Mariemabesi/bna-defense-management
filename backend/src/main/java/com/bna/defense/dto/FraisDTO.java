package com.bna.defense.dto;
import com.bna.defense.entity.Frais.TypeFrais;
import java.math.BigDecimal;
public class FraisDTO {
    private String referenceDossier;
    private String referenceAffaire;
    private String libelle;
    private BigDecimal montant;
    private TypeFrais type;
    private String observation;

    public FraisDTO() {}
    public String getReferenceDossier() { return referenceDossier; }
    public void setReferenceDossier(String r) { this.referenceDossier = r; }
    public String getReferenceAffaire() { return referenceAffaire; }
    public void setReferenceAffaire(String r) { this.referenceAffaire = r; }
    public String getLibelle() { return libelle; }
    public void setLibelle(String l) { this.libelle = l; }
    public BigDecimal getMontant() { return montant; }
    public void setMontant(BigDecimal m) { this.montant = m; }
    public TypeFrais getType() { return type; }
    public void setType(TypeFrais t) { this.type = t; }
    public String getObservation() { return observation; }
    public void setObservation(String o) { this.observation = o; }
}
