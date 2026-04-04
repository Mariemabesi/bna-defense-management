package com.bna.defense.controller.referentiel;

import com.bna.defense.entity.referentiel.PhaseProcedure;
import com.bna.defense.repository.referentiel.PhaseProcedureRepository;
import com.bna.defense.service.referentiel.GenericReferentielService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/referentiel/phases-procedure")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PhaseProcedureController {

    @Autowired
    private PhaseProcedureRepository repository;

    @Autowired
    private GenericReferentielService<PhaseProcedure, Long> service;

    @GetMapping
    public ResponseEntity<Page<PhaseProcedure>> getAll(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        
        Specification<PhaseProcedure> spec = Specification.where(null);
        if (search != null) spec = spec.and((r, q, cb) -> cb.like(cb.lower(r.get("nom")), "%" + search.toLowerCase() + "%"));
        
        return ResponseEntity.ok(service.findAll(repository, spec, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhaseProcedure> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PhaseProcedure> create(@RequestBody PhaseProcedure entity) {
        return ResponseEntity.ok(service.save(repository, entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PhaseProcedure> update(@PathVariable Long id, @RequestBody PhaseProcedure entity) {
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
