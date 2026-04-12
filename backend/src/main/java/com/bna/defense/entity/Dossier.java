package com.bna.defense.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dossiers")
public class Dossier extends BaseEntity {
    public Dossier() {}

    @Column(unique = true, nullable = false)
    private String reference;

    @Column(nullable = false)
    private String titre;

    @Enumerated(EnumType.STRING)
    private Priorite priorite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nature_affaire_id")
    private com.bna.defense.entity.referentiel.NatureAffaire natureAffaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_phase_id")
    private com.bna.defense.entity.referentiel.PhaseProcedure currentPhase;

    private BigDecimal budgetProvisionne;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private StatutDossier statut;

    // Point 6A: Role-Based Grouping
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_validateur_id")
    private User groupValidateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_charge_id")
    private User assignedCharge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avocat_id")
    private Auxiliaire avocat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "huissier_id")
    private Auxiliaire huissier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expert_id")
    private Auxiliaire expert;

    // Point 10: Partie Litige details
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partie_litige_id")
    private PartieLitige partieLitige;

    private String clientName;
    private BigDecimal montantLitige;
    private String clientType; // BNE, Physique, CJN (Point 10)
    
    @Enumerated(EnumType.STRING)
    private PartieLitige.TypePartie typeClient;

    // Point 8: Frais & Dépassement
    private BigDecimal fraisInitial = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private BigDecimal fraisReel = BigDecimal.ZERO;

    @org.hibernate.annotations.Formula("(frais_reel - frais_initial)")
    private BigDecimal depassement;

    private String verdict;

    private String riskScore; // FAIBLE, MOYEN, ÉLEVÉ (Feature 2)

    @Column(columnDefinition = "TEXT")
    private String motifRefus; // Motif de refus (Point 9)

    @OneToMany(mappedBy = "dossier", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Affaire> affaires = new ArrayList<>();

    // Point 10: Auto-generated Reference Hook
    @PrePersist
    public void generateReference() {
        if (this.reference == null || this.reference.isEmpty()) {
            this.reference = "TEMP-" + System.currentTimeMillis();
        }
    }

    // --- MANUAL GETTERS & SETTERS ---
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public Priorite getPriorite() { return priorite; }
    public void setPriorite(Priorite priorite) { this.priorite = priorite; }
    public BigDecimal getBudgetProvisionne() { return budgetProvisionne; }
    public void setBudgetProvisionne(BigDecimal budgetProvisionne) { this.budgetProvisionne = budgetProvisionne; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public StatutDossier getStatut() { return statut; }
    public void setStatut(StatutDossier statut) { this.statut = statut; }
    public User getGroupValidateur() { return groupValidateur; }
    public void setGroupValidateur(User groupValidateur) { this.groupValidateur = groupValidateur; }
    public User getAssignedCharge() { return assignedCharge; }
    public void setAssignedCharge(User user) { this.assignedCharge = user; }
    public List<Affaire> getAffaires() { return affaires; }
    public void setAffaires(List<Affaire> affaires) { this.affaires = affaires; }
    public String getVerdict() { return verdict; }
    public void setVerdict(String verdict) { this.verdict = verdict; }
    public String getRiskScore() { return riskScore; }
    public void setRiskScore(String riskScore) { this.riskScore = riskScore; }
    public String getMotifRefus() { return motifRefus; }
    public void setMotifRefus(String motifRefus) { this.motifRefus = motifRefus; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public PartieLitige getPartieLitige() { return partieLitige; }
    public void setPartieLitige(PartieLitige p) { this.partieLitige = p; }
    public BigDecimal getMontantLitige() { return montantLitige; }
    public void setMontantLitige(BigDecimal montantLitige) { this.montantLitige = montantLitige; }
    public String getClientType() { return clientType; }
    public void setClientType(String clientType) { this.clientType = clientType; }
    public PartieLitige.TypePartie getTypeClient() { return typeClient; }
    public void setTypeClient(PartieLitige.TypePartie typeClient) { this.typeClient = typeClient; }
    public BigDecimal getFraisInitial() { return fraisInitial; }
    public void setFraisInitial(BigDecimal fraisInitial) { this.fraisInitial = fraisInitial; }
    public BigDecimal getFraisReel() { return fraisReel; }
    public void setFraisReel(BigDecimal fraisReel) { this.fraisReel = fraisReel; }
    public BigDecimal getDepassement() { return depassement; }

    public com.bna.defense.entity.referentiel.NatureAffaire getNatureAffaire() { return natureAffaire; }
    public void setNatureAffaire(com.bna.defense.entity.referentiel.NatureAffaire n) { this.natureAffaire = n; }
    public com.bna.defense.entity.referentiel.PhaseProcedure getCurrentPhase() { return currentPhase; }
    public void setCurrentPhase(com.bna.defense.entity.referentiel.PhaseProcedure p) { this.currentPhase = p; }

    public Auxiliaire getAvocat() { return avocat; }
    public void setAvocat(Auxiliaire a) { this.avocat = a; }
    public Auxiliaire getHuissier() { return huissier; }
    public void setHuissier(Auxiliaire h) { this.huissier = h; }
    public Auxiliaire getExpert() { return expert; }
    public void setExpert(Auxiliaire e) { this.expert = e; }

    public enum Priorite { HAUTE, MOYENNE, BASSE }

    /**
     * Full status workflow:
     * OUVERT → EN_ATTENTE_PREVALIDATION (Chargé submits) →
     * EN_ATTENTE_VALIDATION (Pré-val approves) →
     * CLOTURE (Validateur validates) | REFUSE (rejected at any stage)
     */
    public enum StatutDossier {
        OUVERT,
        EN_COURS,
        EN_ATTENTE_PREVALIDATION,
        EN_ATTENTE_VALIDATION,
        VALIDE,
        CLOTURE,
        REFUSE,
        // Legacy aliases kept for backward-compat
        A_PRE_VALIDER,
        A_VALIDER
    }

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean archived = false;

    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }
}


