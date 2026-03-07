package com.bna.defense.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dossiers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dossier extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String reference;

    @Column(nullable = false)
    private String titre;

    @Enumerated(EnumType.STRING)
    private Priorite priorite;

    private BigDecimal budgetProvisionne;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private StatutDossier statut;

    @OneToMany(mappedBy = "dossier", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Affaire> affaires = new ArrayList<>();

    public enum Priorite {
        HAUTE, MOYENNE, BASSE
    }

    public enum StatutDossier {
        OUVERT, EN_COURS, CLOTURE, A_PRE_VALIDER, A_VALIDER
    }
}
