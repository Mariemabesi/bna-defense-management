package com.bna.defense.controller;

import com.bna.defense.dto.FraisDTO;
import com.bna.defense.entity.Frais;
import com.bna.defense.service.FraisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/frais")
public class FraisController {

    @Autowired
    private FraisService fraisService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        try {
            return ResponseEntity.ok(fraisService.getAllFrais());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN')")
    public ResponseEntity<Frais> create(@RequestBody FraisDTO dto) {
        return ResponseEntity.ok(fraisService.demandFrais(dto));
    }

    @PutMapping("/{id}/pre-valider")
    @PreAuthorize("hasRole('PRE_VALIDATEUR') or hasRole('ADMIN')")
    public ResponseEntity<Frais> preValidate(@PathVariable Long id) {
        return ResponseEntity.ok(fraisService.preValidate(id));
    }

    @PutMapping("/{id}/valider")
    @PreAuthorize("hasRole('VALIDATEUR') or hasRole('ADMIN')")
    public ResponseEntity<Frais> validate(@PathVariable Long id) {
        return ResponseEntity.ok(fraisService.validate(id));
    }

    @PutMapping("/{id}/envoyer-tresorerie")
    @PreAuthorize("hasRole('VALIDATEUR') or hasRole('ADMIN')")
    public ResponseEntity<Frais> sendToTreasury(@PathVariable Long id) {
        return ResponseEntity.ok(fraisService.sendToTreasury(id));
    }

    @PutMapping("/batch-tresorerie")
    @PreAuthorize("hasRole('VALIDATEUR') or hasRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> batchSendToTreasury() {
        int count = fraisService.batchSendToTreasury();
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", count + " frais envoyés à la trésorerie");
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}
