package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ref_devises")
public class Devise extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code; 

    @Column(nullable = false)
    private String symbole; 

    @Column(nullable = false)
    private BigDecimal tauxConversionVersTnd;

    public Devise() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getSymbole() { return symbole; }
    public void setSymbole(String symbole) { this.symbole = symbole; }
    public BigDecimal getTauxConversionVersTnd() { return tauxConversionVersTnd; }
    public void setTauxConversionVersTnd(BigDecimal tauxConversionVersTnd) { this.tauxConversionVersTnd = tauxConversionVersTnd; }
}
