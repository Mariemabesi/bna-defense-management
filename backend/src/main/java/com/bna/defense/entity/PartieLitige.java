package com.bna.defense.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parties_litige")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartieLitige extends BaseEntity {

    @Column(nullable = false)
    private String nom;

    private String prenom; // Pour PP

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypePartie type; // PP or PM

    private String identifiantFiscal; // Pour PM
    private String cin; // Pour PP
    private String adresse;
    private String telephone;

    public enum TypePartie {
        PP, PM
    }
}
