package com.bna.defense.controller.referentiel;

import com.bna.defense.entity.referentiel.Parquet;
import com.bna.defense.repository.referentiel.ParquetRepository;
import com.bna.defense.service.referentiel.GenericReferentielService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/referentiel/parquets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ParquetController {

    @Autowired
    private ParquetRepository repository;

    @Autowired
    private GenericReferentielService<Parquet, Long> service;

    @GetMapping
    public ResponseEntity<Page<Parquet>> getAll(
            @RequestParam(required = false) Long tribunalId,
            @RequestParam(required = false) String region,
            Pageable pageable) {
        
        Specification<Parquet> spec = Specification.where(null);
        if (tribunalId != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("tribunal").get("id"), tribunalId));
        if (region != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("region"), region));
        
        return ResponseEntity.ok(service.findAll(repository, spec, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Parquet> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Parquet> create(@RequestBody Parquet entity) {
        return ResponseEntity.ok(service.save(repository, entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Parquet> update(@PathVariable Long id, @RequestBody Parquet entity) {
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
