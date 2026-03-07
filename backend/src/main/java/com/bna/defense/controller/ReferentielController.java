package com.bna.defense.controller;

import com.bna.defense.entity.Auxiliaire;
import com.bna.defense.service.AuxiliaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/referentiel")
public class ReferentielController {

    @Autowired
    private AuxiliaireService auxiliaireService;

    @GetMapping("/auxiliaires")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHARGE_DOSSIER')")
    public ResponseEntity<List<Auxiliaire>> getAllAuxiliaires() {
        return ResponseEntity.ok(auxiliaireService.getAllAuxiliaires());
    }

    @org.springframework.web.bind.annotation.PostMapping("/auxiliaires")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Auxiliaire> createAuxiliaire(
            @org.springframework.web.bind.annotation.RequestBody Auxiliaire auxiliaire) {
        return ResponseEntity.ok(auxiliaireService.createAuxiliaire(auxiliaire));
    }
}
