package com.bna.defense.controller;

import com.bna.defense.entity.Auxiliaire;
import com.bna.defense.entity.Affaire;
import com.bna.defense.entity.Frais;
import com.bna.defense.repository.AuxiliaireRepository;
import com.bna.defense.repository.AffaireRepository;
import com.bna.defense.repository.FraisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/referentiel/auxiliaires")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuxiliaireController {

    @Autowired private AuxiliaireRepository auxiliaireRepository;
    @Autowired private AffaireRepository affaireRepository;
    @Autowired private FraisRepository fraisRepository;

    @GetMapping
    public List<Auxiliaire> getAll(@RequestParam(required = false) Auxiliaire.TypeAuxiliaire type) {
        if (type != null) {
            return auxiliaireRepository.findAll().stream()
                    .filter(a -> a.getType() == type)
                    .collect(Collectors.toList());
        }
        return auxiliaireRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL') or hasRole('CHARGE_DOSSIER')")
    public ResponseEntity<Auxiliaire> create(@RequestBody Auxiliaire auxiliaire) {
        if (auxiliaire.getType() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(auxiliaireRepository.save(auxiliaire));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Auxiliaire> getById(@PathVariable Long id) {
        return auxiliaireRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<Map<String, Object>> getFullDetails(@PathVariable Long id) {
        Auxiliaire aux = auxiliaireRepository.findById(id).orElse(null);
        if (aux == null) return ResponseEntity.notFound().build();

        Map<String, Object> details = new HashMap<>();
        details.put("info", aux);

        // Section 2: Associated Cases
        List<Affaire> affaires = affaireRepository.findAll().stream()
                .filter(a -> a.getAvocat() != null && a.getAvocat().getId().equals(id))
                .collect(Collectors.toList());
        details.put("affaires", affaires);

        // Section 3: Fees
        List<Frais> frais = fraisRepository.findAll().stream()
                .filter(f -> f.getAffaire() != null && f.getAffaire().getAvocat() != null && f.getAffaire().getAvocat().getId().equals(id))
                .collect(Collectors.toList());
        details.put("frais", frais);

        BigDecimal totalFees = frais.stream()
                .map(Frais::getMontant)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        details.put("totalFees", totalFees);
        details.put("avgFee", affaires.isEmpty() ? BigDecimal.ZERO : totalFees.divide(BigDecimal.valueOf(affaires.size()), 2, java.math.RoundingMode.HALF_UP));

        return ResponseEntity.ok(details);
    }
}
