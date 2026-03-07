package com.bna.defense.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}
