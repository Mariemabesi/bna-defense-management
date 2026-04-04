package com.bna.defense.controller.referentiel;

import com.bna.defense.entity.referentiel.CourAppel;
import com.bna.defense.repository.referentiel.CourAppelRepository;
import com.bna.defense.service.referentiel.GenericReferentielService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/referentiel/cours-appel")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CourAppelController {

    @Autowired
    private CourAppelRepository repository;

    @Autowired
    private GenericReferentielService<CourAppel, Long> service;

    @GetMapping
    public ResponseEntity<Page<CourAppel>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Boolean actif,
            Pageable pageable) {
        
        Specification<CourAppel> spec = Specification.where(null);
        if (search != null) spec = spec.and((r, q, cb) -> cb.like(cb.lower(r.get("nom")), "%" + search.toLowerCase() + "%"));
        if (region != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("region"), region));
        if (actif != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("actif"), actif));
        
        return ResponseEntity.ok(service.findAll(repository, spec, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourAppel> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourAppel> create(@RequestBody CourAppel entity) {
        return ResponseEntity.ok(service.save(repository, entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourAppel> update(@PathVariable Long id, @RequestBody CourAppel entity) {
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
