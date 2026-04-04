package com.bna.defense.controller;

import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.User;
import com.bna.defense.repository.UserRepository;
import com.bna.defense.service.DossierHistoryService;
import com.bna.defense.service.DossierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/dossiers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DossierController {

    @Autowired private DossierService dossierService;
    @Autowired private DossierHistoryService historyService;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public org.springframework.data.domain.Page<Dossier> getAllDossiers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        return dossierService.getAllDossiers(user, org.springframework.data.domain.PageRequest.of(page, size));
    }

    @PostMapping
    public Dossier createDossier(@RequestBody Dossier dossier, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        return dossierService.createDossier(dossier, user);
    }

    @GetMapping("/{id}")

    public ResponseEntity<Dossier> getDossierById(@PathVariable Long id, Principal principal) {
        historyService.trackAccess(principal.getName(), id);
        try {
            return ResponseEntity.ok(dossierService.getDossierById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/recent")
    public List<Dossier> getRecent(Principal principal) {
        return historyService.getRecentDossiers(principal.getName());
    }

    @GetMapping("/search")
    public List<Dossier> searchDossiers(@RequestParam String query) {
        return dossierService.searchDossiers(query);
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasRole('VALIDATEUR') or hasRole('PRE_VALIDATEUR') or hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR')")
    public Dossier updateStatut(@PathVariable Long id, @RequestParam Dossier.StatutDossier statut) {
        return dossierService.updateStatut(id, statut);
    }
}
