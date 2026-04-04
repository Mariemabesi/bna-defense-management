package com.bna.defense.controller.referentiel;

import com.bna.defense.entity.referentiel.TypeProcedure;
import com.bna.defense.repository.referentiel.TypeProcedureRepository;
import com.bna.defense.service.referentiel.GenericReferentielService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/referentiel/types-procedure")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TypeProcedureController {

    @Autowired
    private TypeProcedureRepository repository;

    @Autowired
    private GenericReferentielService<TypeProcedure, Long> service;

    @GetMapping
    public ResponseEntity<Page<TypeProcedure>> getAll(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        
        Specification<TypeProcedure> spec = Specification.where(null);
        if (search != null) spec = spec.and((r, q, cb) -> cb.or(
            cb.like(cb.lower(r.get("nom")), "%" + search.toLowerCase() + "%"),
            cb.like(cb.lower(r.get("code")), "%" + search.toLowerCase() + "%")
        ));
        
        return ResponseEntity.ok(service.findAll(repository, spec, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TypeProcedure> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TypeProcedure> create(@RequestBody TypeProcedure entity) {
        return ResponseEntity.ok(service.save(repository, entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TypeProcedure> update(@PathVariable Long id, @RequestBody TypeProcedure entity) {
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
