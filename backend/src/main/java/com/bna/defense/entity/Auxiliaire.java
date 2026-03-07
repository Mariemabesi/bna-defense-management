package com.bna.defense.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "auxiliaires")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Auxiliaire extends BaseEntity {

    @Column(nullable = false)
    private String nom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeAuxiliaire type;

    private String adresse;
    private String telephone;
    private String email;

    public enum TypeAuxiliaire {
        AVOCAT, HUISSIER, EXPERT
    }
}
