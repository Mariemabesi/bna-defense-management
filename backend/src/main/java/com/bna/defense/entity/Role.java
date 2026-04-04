package com.bna.defense.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, unique = true)
    private RoleType name;

    public Role() {}
    public Role(RoleType name) { this.name = name; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public RoleType getName() { return name; }
    public void setName(RoleType name) { this.name = name; }

    public enum RoleType {
        ROLE_CHARGE_DOSSIER,
        ROLE_PRE_VALIDATEUR,
        ROLE_VALIDATEUR,
        ROLE_SUPER_VALIDATEUR,
        ROLE_REFERENTIEL,
        ROLE_ADMIN,
        ROLE_AVOCAT
    }
}
