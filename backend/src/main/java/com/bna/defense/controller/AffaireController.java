package com.bna.defense.controller;

import com.bna.defense.entity.Affaire;
import com.bna.defense.service.AffaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/affaires")
public class AffaireController {

    @Autowired
    private AffaireService affaireService;

    @Autowired
    private com.bna.defense.service.UserService userService;

    @Autowired
    private com.bna.defense.service.ReportingService reportingService;

    @GetMapping
    public List<Affaire> getAll(java.security.Principal principal) {
        com.bna.defense.entity.User user = userService.findByUsername(principal.getName());
        if (user == null) user = userService.findByEmail(principal.getName());
        return affaireService.getAll(user);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportListPdf(java.security.Principal principal) {
        com.bna.defense.entity.User user = userService.findByUsername(principal.getName());
        if (user == null) user = userService.findByEmail(principal.getName());
        byte[] pdf = reportingService.exportAffaireListToPdf(user);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", "affaires.pdf");
        return new org.springframework.http.ResponseEntity<>(pdf, headers, org.springframework.http.HttpStatus.OK);
    }

    @GetMapping("/{id}/export/pdf")
    public ResponseEntity<byte[]> exportSinglePdf(@PathVariable Long id) {
        byte[] pdf = reportingService.exportSingleAffaireToPdf(id);
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", "affaire_" + id + ".pdf");
        return new org.springframework.http.ResponseEntity<>(pdf, headers, org.springframework.http.HttpStatus.OK);
    }

    @GetMapping("/dossier/{dossierId}")
    public List<Affaire> getByDossier(@PathVariable Long dossierId) {
        return affaireService.getAffairesByDossierId(dossierId);
    }

    @PostMapping
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN')")
    public ResponseEntity<Affaire> create(@RequestBody Affaire affaire) {
        return ResponseEntity.ok(affaireService.createAffaire(affaire));
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN') or hasRole('VALIDATEUR') or hasRole('PRE_VALIDATEUR') or hasRole('SUPER_VALIDATEUR')")
    public ResponseEntity<Affaire> updateStatut(@PathVariable Long id, @RequestParam Affaire.StatutAffaire statut) {
        return ResponseEntity.ok(affaireService.updateStatut(id, statut));
    }
}
