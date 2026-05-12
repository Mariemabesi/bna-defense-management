package com.bna.defense.dto;

import java.math.BigDecimal;

public class FinancialFinalizationDTO {
    private BigDecimal honorairesAvocatFinal;
    private BigDecimal fraisHuissierFinal;
    private BigDecimal autresFraisFinal;
    private String observation;

    public FinancialFinalizationDTO() {}

    public BigDecimal getHonorairesAvocatFinal() { return honorairesAvocatFinal; }
    public void setHonorairesAvocatFinal(BigDecimal h) { this.honorairesAvocatFinal = h; }

    public BigDecimal getFraisHuissierFinal() { return fraisHuissierFinal; }
    public void setFraisHuissierFinal(BigDecimal f) { this.fraisHuissierFinal = f; }

    public BigDecimal getAutresFraisFinal() { return autresFraisFinal; }
    public void setAutresFraisFinal(BigDecimal a) { this.autresFraisFinal = a; }

    public String getObservation() { return observation; }
    public void setObservation(String o) { this.observation = o; }
}
