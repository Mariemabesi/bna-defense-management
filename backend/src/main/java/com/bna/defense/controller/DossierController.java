package com.bna.defense.controller;

import com.bna.defense.entity.Dossier;
import com.bna.defense.service.DossierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dossiers")
public class DossierController {

    @Autowired
    private DossierService dossierService;

    @GetMapping
    public List<Dossier> getAll() {
        return dossierService.getAllDossiers();
    }

    @PostMapping
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN')")
    public ResponseEntity<Dossier> create(@RequestBody Dossier dossier) {
        return ResponseEntity.ok(dossierService.createDossier(dossier));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dossier> getById(@PathVariable Long id) {
        return ResponseEntity.ok(dossierService.getDossierById(id));
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasRole('PRE_VALIDATEUR') or hasRole('VALIDATEUR') or hasRole('ADMIN')")
    public ResponseEntity<Dossier> updateStatus(@PathVariable Long id, @RequestParam Dossier.StatutDossier statut) {
        return ResponseEntity.ok(dossierService.updateStatut(id, statut));
    }

    @PostMapping("/{id}/cloturer")
    @PreAuthorize("hasRole('VALIDATEUR') or hasRole('ADMIN')")
    public ResponseEntity<Dossier> close(@PathVariable Long id) {
        return ResponseEntity.ok(dossierService.closeDossier(id));
    }

    @GetMapping("/search")
    public List<Dossier> search(@RequestParam String q) {
        return dossierService.searchDossiers(q);
    }
}
