package com.bna.defense.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password;

    @Column(nullable = false)
    private String email;

    private String firstName;
    private String lastName;
    private String fullName;

    private boolean enabled = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "groupe_id")
    private Groupe groupe;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    private String resetToken;
    private LocalDateTime tokenExpiry;
    private String avatarUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User manager;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auxiliaire_id")
    private Auxiliaire linkedAuxiliaire;

    public User() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public Groupe getGroupe() { return groupe; }
    public void setGroupe(Groupe groupe) { this.groupe = groupe; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }
    public LocalDateTime getTokenExpiry() { return tokenExpiry; }
    public void setTokenExpiry(LocalDateTime tokenExpiry) { this.tokenExpiry = tokenExpiry; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public Auxiliaire getLinkedAuxiliaire() { return linkedAuxiliaire; }
    public void setLinkedAuxiliaire(Auxiliaire linkedAuxiliaire) { this.linkedAuxiliaire = linkedAuxiliaire; }

    public User getManager() { return manager; }
    public void setManager(User manager) { this.manager = manager; }

    public boolean isAdmin() {
        return roles != null && roles.stream().anyMatch(r -> r.getName() != null && r.getName().name().equals("ROLE_ADMIN"));
    }

    public boolean hasRole(String roleName) {
        return roles != null && roles.stream().anyMatch(r -> r.getName() != null && r.getName().name().equals(roleName));
    }

    public boolean isChargeDossier() {
        return hasRole("ROLE_CHARGE_DOSSIER");
    }

    public boolean isPreValidateur() {
        return hasRole("ROLE_PRE_VALIDATEUR");
    }

    public boolean isValidateur() {
        return hasRole("ROLE_VALIDATEUR");
    }

    public boolean isSuperValidateur() {
        return hasRole("ROLE_SUPER_VALIDATEUR");
    }
}
