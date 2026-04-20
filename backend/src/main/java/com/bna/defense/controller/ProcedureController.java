package com.bna.defense.controller;

import com.bna.defense.entity.Affaire;
import com.bna.defense.entity.ProcedureJudiciaire;
import com.bna.defense.repository.AffaireRepository;
import com.bna.defense.repository.ProcedureJudiciaireRepository;
import com.bna.defense.service.ProcedureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    @GetMapping
    public List<ProcedureJudiciaire> getAllProcedures() {
        return procedureRepository.findAll();
    }

    @PostMapping
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
        return ResponseEntity.ok(procedureRepository.save(procedure));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProcedureJudiciaire> getProcedureById(@PathVariable Long id) {
        return procedureRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProcedureJudiciaire> updateProcedure(@PathVariable Long id,
                                                                @RequestBody ProcedureJudiciaire details) {
        return procedureRepository.findById(id).map(procedure -> {
            procedure.setTitre(details.getTitre());
            procedure.setType(details.getType());
            procedure.setStatut(details.getStatut());
            procedure.setDescription(details.getDescription());
            return ResponseEntity.ok(procedureRepository.save(procedure));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<ProcedureJudiciaire> validateProcedure(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(procedureService.validateProcedure(id));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProcedure(@PathVariable Long id) {
        return procedureRepository.findById(id).map(procedure -> {
            procedureRepository.delete(procedure);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
