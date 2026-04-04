package com.bna.defense.controller.referentiel;

import com.bna.defense.entity.referentiel.Devise;
import com.bna.defense.repository.referentiel.DeviseRepository;
import com.bna.defense.service.referentiel.GenericReferentielService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/referentiel/devises")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DeviseController {

    @Autowired
    private DeviseRepository repository;

    @Autowired
    private GenericReferentielService<Devise, Long> service;

    @GetMapping
    public ResponseEntity<Page<Devise>> getAll(
            @RequestParam(required = false) String codeIso,
            Pageable pageable) {
        
        Specification<Devise> spec = Specification.where(null);
        if (codeIso != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("codeIso"), codeIso));
        
        return ResponseEntity.ok(service.findAll(repository, spec, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Devise> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Devise> create(@RequestBody Devise entity) {
        return ResponseEntity.ok(service.save(repository, entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Devise> update(@PathVariable Long id, @RequestBody Devise entity) {
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
