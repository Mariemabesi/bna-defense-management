package com.bna.defense.controller.referentiel;

import com.bna.defense.entity.Tribunal;
import com.bna.defense.repository.TribunalRepository;
import com.bna.defense.service.referentiel.GenericReferentielService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/referentiel/tribunaux")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TribunalController {

    @Autowired
    private TribunalRepository repository;

    @Autowired
    private GenericReferentielService<Tribunal, Long> service;

    @GetMapping
    public ResponseEntity<Page<Tribunal>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean actif,
            Pageable pageable) {
        
        Specification<Tribunal> spec = Specification.where(null);
        if (search != null) spec = spec.and((r, q, cb) -> cb.like(cb.lower(r.get("nom")), "%" + search.toLowerCase() + "%"));
        if (region != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("region"), region));
        if (type != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("type"), type));
        if (actif != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("actif"), actif));
        
        return ResponseEntity.ok(service.findAll(repository, spec, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tribunal> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CHARGE_DOSSIER') or hasRole('REFERENTIEL')")
    public ResponseEntity<Tribunal> create(@RequestBody Tribunal entity) {
        return ResponseEntity.ok(service.save(repository, entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CHARGE_DOSSIER') or hasRole('REFERENTIEL')")
    public ResponseEntity<Tribunal> update(@PathVariable Long id, @RequestBody Tribunal entity) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        entity.setId(id);
        return ResponseEntity.ok(service.save(repository, entity));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        // linkage check logic would go here
        service.delete(repository, id);
        return ResponseEntity.ok().build();
    }
}
