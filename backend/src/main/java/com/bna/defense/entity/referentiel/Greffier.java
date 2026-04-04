package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import com.bna.defense.entity.Tribunal;
import jakarta.persistence.*;

@Entity
@Table(name = "ref_greffiers")
public class Greffier extends BaseEntity {

    @Column(nullable = false)
    private String nom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tribunal_id")
    private Tribunal tribunal;

    private String telephone;

    private String email;

    public Greffier() {}

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public Tribunal getTribunal() { return tribunal; }
    public void setTribunal(Tribunal tribunal) { this.tribunal = tribunal; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
