package com.bna.defense.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, unique = true)
    private RoleType name;

    public enum RoleType {
        ROLE_CHARGE_DOSSIER,
        ROLE_PRE_VALIDATEUR,
        ROLE_VALIDATEUR,
        ROLE_REFERENTIEL,
        ROLE_ADMIN
    }
}
