package com.bna.defense.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recent_dossiers")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RecentDossier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id", nullable = false)
    private Dossier dossier;
    @Column(nullable = false)
    private LocalDateTime accessedAt;

    public RecentDossier() {}
    public Long getId() { return id; }
    public void setId(Long i) { this.id = i; }
    public User getUser() { return user; }
    public void setUser(User u) { this.user = u; }
    public Dossier getDossier() { return dossier; }
    public void setDossier(Dossier d) { this.dossier = d; }
    public LocalDateTime getAccessedAt() { return accessedAt; }
    public void setAccessedAt(LocalDateTime a) { this.accessedAt = a; }
}
