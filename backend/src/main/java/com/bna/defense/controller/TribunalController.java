package com.bna.defense.controller;

import com.bna.defense.entity.Tribunal;
import com.bna.defense.service.TribunalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/referentiel/tribunaux")
public class TribunalController {

    @Autowired
    private TribunalService tribunalService;

    @GetMapping
    public List<Tribunal> getAll() {
        return tribunalService.getAllTribunaux();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public ResponseEntity<Tribunal> create(@RequestBody Tribunal tribunal) {
        return ResponseEntity.ok(tribunalService.createTribunal(tribunal));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public ResponseEntity<Tribunal> update(@PathVariable Long id, @RequestBody Tribunal tribunal) {
        return ResponseEntity.ok(tribunalService.updateTribunal(id, tribunal));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        tribunalService.deleteTribunal(id);
        return ResponseEntity.ok().build();
    }
}
