package com.bna.defense.controller;

import com.bna.defense.entity.Affaire;
import com.bna.defense.entity.ProcedureJudiciaire;
import com.bna.defense.repository.AffaireRepository;
import com.bna.defense.repository.ProcedureJudiciaireRepository;
import com.bna.defense.service.ProcedureService;
import com.bna.defense.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/procedures")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProcedureController {

    @Autowired
    private ProcedureJudiciaireRepository procedureRepository;

    @Autowired
    private AffaireRepository affaireRepository;

    @Autowired
    private ProcedureService procedureService;

    @Autowired
    private com.bna.defense.service.AuditLogService auditLogService;

    private UserDetailsImpl getCurrentUser() {
        return (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping
    public org.springframework.data.domain.Page<ProcedureJudiciaire> getAllProcedures(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) ProcedureJudiciaire.TypeProcedure type,
            @RequestParam(required = false) ProcedureJudiciaire.StatutProcedure statut) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"));
        return procedureService.getAllProcedures(getCurrentUser(), searchTerm, type, statut, pageable);
    }

    /** Business Rule: Une Procédure est toujours liée à une Affaire */
    @GetMapping("/affaire/{affaireId}")
    public ResponseEntity<List<ProcedureJudiciaire>> getByAffaire(@PathVariable Long affaireId) {
        if (!affaireRepository.existsById(affaireId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(procedureService.getByAffaire(affaireId, getCurrentUser()));
    }

    @PostMapping
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN')")
    public ResponseEntity<?> createProcedure(@RequestBody ProcedureJudiciaire procedure) {
        // The frontend sends affaireId as a transient field — resolve it to the entity
        Long affaireId = procedure.getAffaireId();
        if (affaireId == null) {
            return ResponseEntity.badRequest().body("affaireId is required");
        }
        Affaire affaire = affaireRepository.findById(affaireId)
                .orElse(null);
        if (affaire == null) {
            return ResponseEntity.badRequest().body("Affaire with id " + affaireId + " not found");
        }
        procedure.setAffaire(affaire);
        ProcedureJudiciaire saved = procedureService.createProcedure(procedure, getCurrentUser());
        auditLogService.log(getCurrentUser().getUsername(), "CREATION_PROCEDURE", "Procedure", saved.getId(),
                "Création de la procédure : " + saved.getTitre() + " (Type: " + saved.getType() + ")");
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProcedureJudiciaire> getProcedureById(@PathVariable Long id) {
        return procedureRepository.findById(id)
                .map(procedure -> {
                    if (!procedureService.canAccessProcedure(procedure, getCurrentUser())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<ProcedureJudiciaire>build();
                    }
                    return ResponseEntity.ok(procedure);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN')")
    public ResponseEntity<ProcedureJudiciaire> updateProcedure(@PathVariable Long id,
                                                                @RequestBody ProcedureJudiciaire details) {
        return procedureRepository.findById(id).map(procedure -> {
            if (!procedureService.canAccessProcedure(procedure, getCurrentUser())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).<ProcedureJudiciaire>build();
            }
            String oldType = String.valueOf(procedure.getType());
            String oldStatut = String.valueOf(procedure.getStatut());
            procedure.setTitre(details.getTitre());
            procedure.setType(details.getType());
            procedure.setStatut(details.getStatut());
            procedure.setDescription(details.getDescription());
            ProcedureJudiciaire saved = procedureRepository.save(procedure);
            auditLogService.log(getCurrentUser().getUsername(), "MODIFICATION_PROCEDURE", "Procedure", saved.getId(),
                    "Modification de la procédure " + saved.getTitre() + " (Type: " + oldType + "->" + saved.getType() + ", Statut: " + oldStatut + "->" + saved.getStatut() + ")");
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<ProcedureJudiciaire> validateProcedure(@PathVariable Long id) {
        try {
            ProcedureJudiciaire procedure = procedureRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Procédure non trouvée"));
            
            if (!procedureService.canAccessProcedure(procedure, getCurrentUser())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            ProcedureJudiciaire validated = procedureService.validateProcedure(id);
            auditLogService.log(getCurrentUser().getUsername(), "VALIDATION_PROCEDURE", "Procedure", id,
                    "Validation de la procédure : " + validated.getTitre());
            return ResponseEntity.ok(validated);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProcedure(@PathVariable Long id) {
        return procedureRepository.findById(id).map(procedure -> {
            if (!procedureService.canAccessProcedure(procedure, getCurrentUser())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
            }
            procedureRepository.delete(procedure);
            auditLogService.log(getCurrentUser().getUsername(), "SUPPRESSION_PROCEDURE", "Procedure", id,
                    "Suppression de la procédure : " + procedure.getTitre());
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
