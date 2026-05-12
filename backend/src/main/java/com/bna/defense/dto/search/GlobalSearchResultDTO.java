package com.bna.defense.dto.search;

import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.Auxiliaire;
import java.util.List;

public class GlobalSearchResultDTO {
    private List<Dossier> dossiers;
    private List<Auxiliaire> auxiliaires;

    public GlobalSearchResultDTO(List<Dossier> dossiers, List<Auxiliaire> auxiliaires) {
        this.dossiers = dossiers;
        this.auxiliaires = auxiliaires;
    }

    public List<Dossier> getDossiers() { return dossiers; }
    public void setDossiers(List<Dossier> dossiers) { this.dossiers = dossiers; }
    public List<Auxiliaire> getAuxiliaires() { return auxiliaires; }
    public void setAuxiliaires(List<Auxiliaire> auxiliaires) { this.auxiliaires = auxiliaires; }
}
