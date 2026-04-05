package com.bna.defense.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_results")
public class AiResult extends BaseEntity {

    @Column(nullable = false)
    private String feature; // CLASSIFY, RISK_SCORE, SUMMARY, etc.

    private String entityType; // DOSSIER, FRAIS, AVOCAT

    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String resultJson;

    private String feedback; // GOOD, BAD, etc.

    public AiResult() {}

    public AiResult(String feature, String entityType, Long entityId, String resultJson) {
        this.feature = feature;
        this.entityType = entityType;
        this.entityId = entityId;
        this.resultJson = resultJson;
    }

    // Getters and Setters
    public String getFeature() { return feature; }
    public void setFeature(String f) { this.feature = f; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String t) { this.entityType = t; }
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long i) { this.entityId = i; }
    public String getResultJson() { return resultJson; }
    public void setResultJson(String r) { this.resultJson = r; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String f) { this.feedback = f; }
}
