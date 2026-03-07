package com.bna.defense.dto;

import com.bna.defense.entity.Frais.TypeFrais;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class FraisDTO {
    private String referenceDossier;
    private String referenceAffaire;
    private String libelle;
    private BigDecimal montant;
    private TypeFrais type;
    private String observation;
}
