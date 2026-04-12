package com.bna.defense.controller;

import com.bna.defense.entity.Jugement;
import com.bna.defense.repository.JugementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/jugements")
@CrossOrigin(origins = "*", maxAge = 3600)
public class JugementController {

    @Autowired
    private JugementRepository jugementRepository;

    @GetMapping
    public List<Jugement> getAllJugements() {
        return jugementRepository.findAll();
    }

    @PostMapping
    public Jugement createJugement(@RequestBody Jugement jugement) {
        return jugementRepository.save(jugement);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Jugement> getJugementById(@PathVariable Long id) {
        return jugementRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Jugement> updateJugement(@PathVariable Long id, @RequestBody Jugement details) {
        return jugementRepository.findById(id).map(jugement -> {
            jugement.setDateJugement(details.getDateJugement());
            jugement.setDecision(details.getDecision());
            jugement.setImpactFinancier(details.getImpactFinancier());
            jugement.setReferenceJugement(details.getReferenceJugement());
            return ResponseEntity.ok(jugementRepository.save(jugement));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJugement(@PathVariable Long id) {
        return jugementRepository.findById(id).map(jugement -> {
            jugementRepository.delete(jugement);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
