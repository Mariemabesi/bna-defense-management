package com.bna.defense.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "affaires")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Affaire extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id", nullable = false)
    private Dossier dossier;

    @Column(nullable = false)
    private String referenceJudiciaire;

    @Enumerated(EnumType.STRING)
    private TypeAffaire type;

    private LocalDate dateOuverture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adversaire_id")
    private PartieLitige adversaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avocat_id")
    private Auxiliaire avocat;

    @Enumerated(EnumType.STRING)
    private StatutAffaire statut;

    public enum TypeAffaire {
        CIVIL, PENAL, PRUDHOMME, PATRIMOINE_IMMOBILIER
    }

    public enum StatutAffaire {
        EN_COURS, GAGNE, PERDU, CLASSE
    }
}
