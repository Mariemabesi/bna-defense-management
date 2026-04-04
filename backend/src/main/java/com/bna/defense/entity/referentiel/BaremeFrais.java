package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ref_baremes_frais")
public class BaremeFrais extends BaseEntity {

    @Column(nullable = false)
    private String typeProcedure; 

    @Column(nullable = false)
    private BigDecimal montantDeBase;

    private String tribunalType; 

    private String notes;

    public BaremeFrais() {}

    public String getTypeProcedure() { return typeProcedure; }
    public void setTypeProcedure(String typeProcedure) { this.typeProcedure = typeProcedure; }
    public BigDecimal getMontantDeBase() { return montantDeBase; }
    public void setMontantDeBase(BigDecimal montantDeBase) { this.montantDeBase = montantDeBase; }
    public String getTribunalType() { return tribunalType; }
    public void setTribunalType(String tribunalType) { this.tribunalType = tribunalType; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
