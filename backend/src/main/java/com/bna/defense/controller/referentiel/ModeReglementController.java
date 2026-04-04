package com.bna.defense.controller.referentiel;

import com.bna.defense.entity.referentiel.ModeReglement;
import com.bna.defense.repository.referentiel.ModeReglementRepository;
import com.bna.defense.service.referentiel.GenericReferentielService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/referentiel/modes-reglement")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ModeReglementController {

    @Autowired
    private ModeReglementRepository repository;

    @Autowired
    private GenericReferentielService<ModeReglement, Long> service;

    @GetMapping
    public ResponseEntity<Page<ModeReglement>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean actif,
            Pageable pageable) {
        
        Specification<ModeReglement> spec = Specification.where(null);
        if (search != null) spec = spec.and((r, q, cb) -> cb.like(cb.lower(r.get("nom")), "%" + search.toLowerCase() + "%"));
        if (actif != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("actif"), actif));
        
        return ResponseEntity.ok(service.findAll(repository, spec, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModeReglement> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ModeReglement> create(@RequestBody ModeReglement entity) {
        return ResponseEntity.ok(service.save(repository, entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ModeReglement> update(@PathVariable Long id, @RequestBody ModeReglement entity) {
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
