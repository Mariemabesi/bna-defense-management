package com.bna.defense.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tribunaux")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tribunal extends BaseEntity {

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String region;

    private String adresse;

    private String telephone;
}
