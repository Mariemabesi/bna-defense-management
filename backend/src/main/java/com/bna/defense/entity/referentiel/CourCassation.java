package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "ref_cours_cassation")
public class CourCassation extends BaseEntity {

    @Column(nullable = false)
    private String chambre;

    private String referenceArret;

    private String resultat; // Cassé / Rejeté / Renvoyé
    private String notes;
    private java.time.LocalDate dateArret;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id")
    private com.bna.defense.entity.Dossier dossier;

    public CourCassation() {}

    public String getChambre() { return chambre; }
    public void setChambre(String chambre) { this.chambre = chambre; }
    public String getReferenceArret() { return referenceArret; }
    public void setReferenceArret(String referenceArret) { this.referenceArret = referenceArret; }
    public String getResultat() { return resultat; }
    public void setResultat(String resultat) { this.resultat = resultat; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public java.time.LocalDate getDateArret() { return dateArret; }
    public void setDateArret(java.time.LocalDate d) { this.dateArret = d; }
    public com.bna.defense.entity.Dossier getDossier() { return dossier; }
    public void setDossier(com.bna.defense.entity.Dossier d) { this.dossier = d; }
}
