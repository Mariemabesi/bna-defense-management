package com.bna.defense.controller.referentiel;

import com.bna.defense.entity.referentiel.CentreMediation;
import com.bna.defense.repository.referentiel.CentreMediationRepository;
import com.bna.defense.service.referentiel.GenericReferentielService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/referentiel/centres-mediation")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CentreMediationController {

    @Autowired
    private CentreMediationRepository repository;

    @Autowired
    private GenericReferentielService<CentreMediation, Long> service;

    @GetMapping
    public ResponseEntity<Page<CentreMediation>> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String resultat,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Pageable pageable) {
        
        Specification<CentreMediation> spec = Specification.where(null);
        if (type != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("type"), type));
        if (resultat != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("resultat"), resultat));
        if (date != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("dateSession"), date));
        
        return ResponseEntity.ok(service.findAll(repository, spec, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CentreMediation> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CentreMediation> create(@RequestBody CentreMediation entity) {
        return ResponseEntity.ok(service.save(repository, entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CentreMediation> update(@PathVariable Long id, @RequestBody CentreMediation entity) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        entity.setId(id);
        return ResponseEntity.ok(service.save(repository, entity));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(repository, id);
        return ResponseEntity.ok().build();
    }
}
