package com.bna.defense.dto;
import java.math.BigDecimal;
public class DashboardStatsDTO {
    private long totalDossiers;
    private long openDossiers;
    private long closedDossiers;
    private long totalFraisPending;
    private BigDecimal totalFraisAmountPending;
    private long totalAvocats;
    private long totalHuissiers;
    private long totalProcedures;
    private long totalAdversaires;
    private double successRate;
    private BigDecimal totalBudgetProvisionne;

    public DashboardStatsDTO() {}
    public long getTotalDossiers() { return totalDossiers; }
    public void setTotalDossiers(long t) { this.totalDossiers = t; }
    public long getOpenDossiers() { return openDossiers; }
    public void setOpenDossiers(long o) { this.openDossiers = o; }
    public long getClosedDossiers() { return closedDossiers; }
    public void setClosedDossiers(long c) { this.closedDossiers = c; }
    public long getTotalFraisPending() { return totalFraisPending; }
    public void setTotalFraisPending(long t) { this.totalFraisPending = t; }
    public BigDecimal getTotalFraisAmountPending() { return totalFraisAmountPending; }
    public void setTotalFraisAmountPending(BigDecimal t) { this.totalFraisAmountPending = t; }
    public long getTotalAvocats() { return totalAvocats; }
    public void setTotalAvocats(long t) { this.totalAvocats = t; }
    public long getTotalHuissiers() { return totalHuissiers; }
    public void setTotalHuissiers(long t) { this.totalHuissiers = t; }
    public long getTotalProcedures() { return totalProcedures; }
    public void setTotalProcedures(long t) { this.totalProcedures = t; }
    public long getTotalAdversaires() { return totalAdversaires; }
    public void setTotalAdversaires(long t) { this.totalAdversaires = t; }
    public double getSuccessRate() { return successRate; }
    public void setSuccessRate(double s) { this.successRate = s; }
    public BigDecimal getTotalBudgetProvisionne() { return totalBudgetProvisionne; }
    public void setTotalBudgetProvisionne(BigDecimal t) { this.totalBudgetProvisionne = t; }
}
