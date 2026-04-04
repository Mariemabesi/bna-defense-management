package com.bna.defense.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String userEmail;
    private String action;
    private String entityName;
    private Long entityId;
    @Column(columnDefinition = "TEXT")
    private String details;
    private LocalDateTime timestamp;

    public AuditLog() {}
    @PrePersist protected void onCreate() { timestamp = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String u) { this.userEmail = u; }
    public String getAction() { return action; }
    public void setAction(String a) { this.action = a; }
    public String getEntityName() { return entityName; }
    public void setEntityName(String e) { this.entityName = e; }
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long i) { this.entityId = i; }
    public String getDetails() { return details; }
    public void setDetails(String d) { this.details = d; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime t) { this.timestamp = t; }
}
