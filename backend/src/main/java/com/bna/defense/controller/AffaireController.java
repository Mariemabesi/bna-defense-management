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
    public org.springframework.data.domain.Page<Affaire> getAll(
            java.security.Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Affaire.StatutAffaire statut) {
        if (principal == null) return org.springframework.data.domain.Page.empty();
        com.bna.defense.entity.User user = userService.findByUsername(principal.getName());
        if (user == null) user = userService.findByEmail(principal.getName());
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        return affaireService.getAll(user, searchTerm, type, statut, pageable);
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
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN')")
    public ResponseEntity<Affaire> updateStatut(@PathVariable Long id, @RequestParam Affaire.StatutAffaire statut) {
        return ResponseEntity.ok(affaireService.updateStatut(id, statut));
    }
 
    @GetMapping("/by-tribunal/{tribunalId}")
    public List<Affaire> getByTribunal(@PathVariable Long tribunalId) {
        return affaireService.getByTribunal(tribunalId);
    }
 
    @GetMapping("/by-avocat/{avocatId}")
    public List<Affaire> getByAvocat(@PathVariable Long avocatId) {
        return affaireService.getByAvocat(avocatId);
    }
 
    @GetMapping("/by-huissier/{huissierId}")
    public List<Affaire> getByHuissier(@PathVariable Long huissierId) {
        return affaireService.getByHuissier(huissierId);
    }
 
    @GetMapping("/by-expert/{expertId}")
    public List<Affaire> getByExpert(@PathVariable Long expertId) {
        return affaireService.getByExpert(expertId);
    }
}
