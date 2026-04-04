package com.bna.defense.controller;

import com.bna.defense.entity.Affaire;
import com.bna.defense.service.AffaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/affaires")
public class AffaireController {

    @Autowired
    private AffaireService affaireService;

    @GetMapping("/dossier/{dossierId}")
    public List<Affaire> getByDossier(@PathVariable Long dossierId) {
        return affaireService.getAffairesByDossierId(dossierId);
    }

    @PostMapping
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN')")
    public ResponseEntity<Affaire> create(@RequestBody Affaire affaire) {
        return ResponseEntity.ok(affaireService.createAffaire(affaire));
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN') or hasRole('VALIDATEUR') or hasRole('PRE_VALIDATEUR') or hasRole('SUPER_VALIDATEUR')")
    public ResponseEntity<Affaire> updateStatut(@PathVariable Long id, @RequestParam Affaire.StatutAffaire statut) {
        return ResponseEntity.ok(affaireService.updateStatut(id, statut));
    }
}
