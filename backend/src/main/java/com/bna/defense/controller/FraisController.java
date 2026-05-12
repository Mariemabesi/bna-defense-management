package com.bna.defense.controller;

import com.bna.defense.dto.FraisDTO;
import com.bna.defense.entity.Frais;
import com.bna.defense.service.FraisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/frais")
public class FraisController {

    @Autowired
    private FraisService fraisService;

    @Autowired
    private com.bna.defense.repository.UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAll(java.security.Principal principal) {
        try {
            com.bna.defense.entity.User user = userRepository.findByUsername(principal.getName()).orElseThrow();
            return ResponseEntity.ok(fraisService.getFraisForUser(user));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN')")
    public ResponseEntity<Frais> create(
            @RequestPart("frais") com.bna.defense.dto.FraisDTO dto,
            @RequestPart(value = "files", required = false) java.util.List<org.springframework.web.multipart.MultipartFile> files) {
        return ResponseEntity.ok(fraisService.demandFrais(dto, files));
    }

    @PostMapping("/{id}/attachments")
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN')")
    public ResponseEntity<?> addAttachment(
            @PathVariable Long id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(fraisService.addAttachment(id, file));
    }

    @Autowired
    private com.bna.defense.service.FileStorageService fileStorageService;

    @GetMapping("/attachments/{id}/download")
    public ResponseEntity<org.springframework.core.io.Resource> downloadAttachment(@PathVariable Long id) {
        com.bna.defense.entity.FraisAttachment attachment = fraisService.getAttachment(id);
        try {
            java.nio.file.Path path = fileStorageService.load(attachment.getFileName(), "frais/" + attachment.getFrais().getId());
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(path.toUri());

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getOriginalName() + "\"")
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, attachment.getContentType())
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}/pre-valider")
    @PreAuthorize("@permissionService.canPreValidateFrais(authentication, #id) or hasRole('ADMIN')")
    public ResponseEntity<Frais> preValidate(@PathVariable Long id) {
        return ResponseEntity.ok(fraisService.preValidate(id));
    }

    @PutMapping("/{id}/valider")
    @PreAuthorize("@permissionService.canValidateFrais(authentication, #id) or hasRole('ADMIN')")
    public ResponseEntity<Frais> validate(@PathVariable Long id) {
        return ResponseEntity.ok(fraisService.validate(id));
    }

    @PutMapping("/{id}/envoyer-tresorerie")
    @PreAuthorize("@permissionService.canValidateFrais(authentication, #id) or hasRole('ADMIN')")
    public ResponseEntity<Frais> sendToTreasury(@PathVariable Long id) {
        return ResponseEntity.ok(fraisService.sendToTreasury(id));
    }

    @PutMapping("/{id}/rejeter")
    @PreAuthorize("@permissionService.canPreValidateFrais(authentication, #id) or hasRole('VALIDATEUR') or hasRole('ADMIN')")
    public ResponseEntity<Frais> reject(@PathVariable Long id, @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(fraisService.reject(id, reason));
    }

    @PutMapping("/batch-tresorerie")
    @PreAuthorize("hasRole('VALIDATEUR') or hasRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> batchSendToTreasury() {
        int count = fraisService.batchSendToTreasury();
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", count + " frais envoyés à la trésorerie");
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}
