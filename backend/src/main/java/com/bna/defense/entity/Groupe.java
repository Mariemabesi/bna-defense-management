package com.bna.defense.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "groupes")
public class Groupe extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String nom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validateur_id")
    private User validateur;

    @OneToMany(mappedBy = "groupe", fetch = FetchType.LAZY)
    private List<User> membres = new ArrayList<>();

    public Groupe() {}
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public User getValidateur() { return validateur; }
    public void setValidateur(User validateur) { this.validateur = validateur; }
    public List<User> getMembres() { return membres; }
    public void setMembres(List<User> membres) { this.membres = membres; }
}
