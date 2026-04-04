package com.bna.defense.controller.referentiel;

import com.bna.defense.entity.referentiel.NatureAffaire;
import com.bna.defense.repository.referentiel.NatureAffaireRepository;
import com.bna.defense.service.referentiel.GenericReferentielService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/referentiel/natures-affaire")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NatureAffaireController {

    @Autowired
    private NatureAffaireRepository repository;

    @Autowired
    private GenericReferentielService<NatureAffaire, Long> service;

    @GetMapping
    public ResponseEntity<Page<NatureAffaire>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long procedureId,
            Pageable pageable) {
        
        Specification<NatureAffaire> spec = Specification.where(null);
        if (search != null) spec = spec.and((r, q, cb) -> cb.like(cb.lower(r.get("nom")), "%" + search.toLowerCase() + "%"));
        if (procedureId != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("typeProcedure").get("id"), procedureId));
        
        return ResponseEntity.ok(service.findAll(repository, spec, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NatureAffaire> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NatureAffaire> create(@RequestBody NatureAffaire entity) {
        return ResponseEntity.ok(service.save(repository, entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NatureAffaire> update(@PathVariable Long id, @RequestBody NatureAffaire entity) {
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
