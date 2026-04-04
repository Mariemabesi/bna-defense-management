package com.bna.defense.controller.referentiel;

import com.bna.defense.entity.referentiel.BaremeFrais;
import com.bna.defense.repository.referentiel.BaremeFraisRepository;
import com.bna.defense.service.referentiel.GenericReferentielService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/referentiel/baremes-frais")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BaremeFraisController {

    @Autowired
    private BaremeFraisRepository repository;

    @Autowired
    private GenericReferentielService<BaremeFrais, Long> service;

    @GetMapping
    public ResponseEntity<Page<BaremeFrais>> getAll(
            @RequestParam(required = false) String typeProcedure,
            @RequestParam(required = false) String tribunalType,
            Pageable pageable) {
        
        Specification<BaremeFrais> spec = Specification.where(null);
        if (typeProcedure != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("typeProcedure"), typeProcedure));
        if (tribunalType != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("tribunalType"), tribunalType));
        
        return ResponseEntity.ok(service.findAll(repository, spec, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaremeFrais> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaremeFrais> create(@RequestBody BaremeFrais entity) {
        return ResponseEntity.ok(service.save(repository, entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaremeFrais> update(@PathVariable Long id, @RequestBody BaremeFrais entity) {
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
