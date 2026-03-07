package com.bna.defense.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "frais_reglements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Frais extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "affaire_id", nullable = false)
    private Affaire affaire;

    @Column(nullable = false)
    private String libelle;

    @Column(nullable = false)
    private BigDecimal montant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeFrais type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutFrais statut;

    private String observation;

    public enum TypeFrais {
        HONORAIRES_AVOCAT, FRAIS_HUISSIER, EXPERTISE, CONSIGNATION, TIMBRAGE, AUTRE
    }

    public enum StatutFrais {
        ATTENTE, PRE_VALIDE, VALIDE, REJETE, ENVOYE_TRESORERIE
    }
}
