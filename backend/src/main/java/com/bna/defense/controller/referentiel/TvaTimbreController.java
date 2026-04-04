package com.bna.defense.controller.referentiel;

import com.bna.defense.entity.referentiel.TvaTimbre;
import com.bna.defense.repository.referentiel.TvaTimbreRepository;
import com.bna.defense.service.referentiel.GenericReferentielService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/referentiel/tva-timbre")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TvaTimbreController {

    @Autowired
    private TvaTimbreRepository repository;

    @Autowired
    private GenericReferentielService<TvaTimbre, Long> service;

    @GetMapping
    public ResponseEntity<Page<TvaTimbre>> getAll(
            @RequestParam(required = false) String typeTaxe,
            Pageable pageable) {
        
        Specification<TvaTimbre> spec = Specification.where(null);
        if (typeTaxe != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("typeTaxe"), typeTaxe));
        
        return ResponseEntity.ok(service.findAll(repository, spec, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TvaTimbre> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TvaTimbre> create(@RequestBody TvaTimbre entity) {
        return ResponseEntity.ok(service.save(repository, entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TvaTimbre> update(@PathVariable Long id, @RequestBody TvaTimbre entity) {
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
