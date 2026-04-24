package com.bna.defense.controller;

import com.bna.defense.dto.FraisDTO;
import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.Frais;
import com.bna.defense.entity.User;
import com.bna.defense.repository.FraisRepository;
import com.bna.defense.repository.UserRepository;
import com.bna.defense.service.DossierHistoryService;
import com.bna.defense.service.DossierService;
import com.bna.defense.service.FraisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dossiers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DossierController {

    @Autowired private DossierService dossierService;
    @Autowired private DossierHistoryService historyService;
    @Autowired private UserRepository userRepository;
    @Autowired private FraisService fraisService;
    @Autowired private FraisRepository fraisRepository;

    // ─────────────────────────────────────────────────
    // CORE DOSSIER ENDPOINTS
    // ─────────────────────────────────────────────────

    @GetMapping
    public org.springframework.data.domain.Page<Dossier> getAllDossiers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        return dossierService.getAllDossiers(user, org.springframework.data.domain.PageRequest.of(page, size));
    }

    @GetMapping("/mine")
    public org.springframework.data.domain.Page<Dossier> getMyDossiers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        return dossierService.getMyDossiers(user, org.springframework.data.domain.PageRequest.of(page, size));
    }

    @PostMapping
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN')")
    public Dossier createDossier(@RequestBody Dossier dossier, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        return dossierService.createDossier(dossier, user);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@permissionService.canAccessDossier(authentication, #id) or hasRole('ADMIN')")
    public ResponseEntity<Dossier> getDossierById(@PathVariable Long id, Principal principal) {
        historyService.trackAccess(principal.getName(), id);
        try {
            return ResponseEntity.ok(dossierService.getDossierById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("@permissionService.canAccessDossier(authentication, #id) or hasRole('ADMIN')")
    public ResponseEntity<List<com.bna.defense.entity.AuditLog>> getDossierHistory(@PathVariable Long id) {
        return ResponseEntity.ok(dossierService.getDossierHistory(id));
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
    @PreAuthorize("@permissionService.canAccessDossier(authentication, #id) or hasRole('ADMIN')")
    public Dossier updateStatut(@PathVariable Long id, @RequestParam Dossier.StatutDossier statut) {
        return dossierService.updateStatut(id, statut);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@permissionService.canAccessDossier(authentication, #id) or hasRole('ADMIN')")
    public Dossier updateDossier(@PathVariable Long id, @RequestBody Dossier dossier, Principal principal) {
        return dossierService.updateDossier(id, dossier, principal.getName());
    }

    // ─────────────────────────────────────────────────
    // WORKFLOW ENDPOINTS (Point 9)
    // ─────────────────────────────────────────────────

    /**
     * Chargé submits dossier for pre-validation
     */
    @PutMapping("/{id}/soumettre")
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN')")
    public ResponseEntity<Dossier> soumettre(@PathVariable Long id, Principal principal) {
        try {
            return ResponseEntity.ok(dossierService.soumettre(id, principal.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Pré-validateur approves dossier → routes to validateur
     */
    @PutMapping("/{id}/prevalider")
    @PreAuthorize("hasRole('PRE_VALIDATEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> prevalider(@PathVariable Long id, Principal principal) {
        try {
            Dossier result = dossierService.prevalider(id, principal.getName());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Validateur gives final approval
     */
    @PutMapping("/{id}/valider-final")
    @PreAuthorize("hasRole('VALIDATEUR') or hasRole('SUPER_VALIDATEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> validerFinal(@PathVariable Long id, Principal principal) {
        try {
            Dossier result = dossierService.validerFinal(id, principal.getName());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Chargé marks dossier as EN_COURS
     */
    @PutMapping("/{id}/en-cours")
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN')")
    public ResponseEntity<Dossier> setEnCours(@PathVariable Long id) {
        return ResponseEntity.ok(dossierService.updateStatut(id, Dossier.StatutDossier.EN_COURS));
    }

    /**
     * Chargé requests closure of the dossier → sent to Pré-validateur for approval
     */
    @PutMapping("/{id}/cloturer")
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN')")
    public ResponseEntity<?> demanderCloture(@PathVariable Long id, Principal principal) {
        try {
            return ResponseEntity.ok(dossierService.demanderCloture(id, principal.getName()));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Pré-validateur approves the closure request → routes to Validateur
     */
    @PutMapping("/{id}/prevalider-cloture")
    @PreAuthorize("hasRole('PRE_VALIDATEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> prevaliderCloture(@PathVariable Long id, Principal principal) {
        try {
            return ResponseEntity.ok(dossierService.prevaliderCloture(id, principal.getName()));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Validateur gives final approval of closure → dossier is definitively CLOSED
     */
    @PutMapping("/{id}/valider-cloture")
    @PreAuthorize("hasRole('VALIDATEUR') or hasRole('SUPER_VALIDATEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> validerCloture(@PathVariable Long id, Principal principal) {
        try {
            return ResponseEntity.ok(dossierService.validerCloture(id, principal.getName()));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Pré-validateur or Validateur rejects dossier with a mandatory motif (>=20 chars)
     */
    @PutMapping("/{id}/refuser")
    @PreAuthorize("hasRole('PRE_VALIDATEUR') or hasRole('VALIDATEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> refuser(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Principal principal) {
        String motif = body.get("motif");
        try {
            Dossier result = dossierService.refuser(id, motif, principal.getName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Une erreur imprévue est survenue.");
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ─────────────────────────────────────────────────
    // PENDING QUEUES PER ROLE (Point 9)
    // ─────────────────────────────────────────────────

    @GetMapping("/pending/prevalider")
    @PreAuthorize("hasRole('PRE_VALIDATEUR') or hasRole('ADMIN')")
    public List<Dossier> getPendingForPreValidateur(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        return dossierService.getPendingForPreValidateur(user);
    }

    @GetMapping("/pending/valider")
    @PreAuthorize("hasRole('VALIDATEUR') or hasRole('SUPER_VALIDATEUR') or hasRole('ADMIN')")
    public List<Dossier> getPendingForValidateur(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        return dossierService.getPendingForValidateur(user);
    }

    @GetMapping("/pending/prevalider-cloture")
    @PreAuthorize("hasRole('PRE_VALIDATEUR') or hasRole('ADMIN')")
    public List<Dossier> getPendingClosureForPreValidateur(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        return dossierService.getPendingClosureForPreValidateur(user);
    }

    @GetMapping("/pending/valider-cloture")
    @PreAuthorize("hasRole('VALIDATEUR') or hasRole('SUPER_VALIDATEUR') or hasRole('ADMIN')")
    public List<Dossier> getPendingClosureForValidateur(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        return dossierService.getPendingClosureForValidateur(user);
    }

    // ─────────────────────────────────────────────────
    // FRAIS PER DOSSIER (Point 6 + 9)
    // ─────────────────────────────────────────────────

    /**
     * POST /api/dossiers/:id/frais — add a frais entry to this dossier
     * After adding, recalculates fraisReel and checks for depassement
     */
    @PostMapping("/{id}/frais")
    @PreAuthorize("@permissionService.canAccessDossier(authentication, #id) or hasRole('ADMIN')")
    public ResponseEntity<Frais> addFrais(@PathVariable Long id, @RequestBody FraisDTO dto, Principal principal) {
        Dossier dossier = dossierService.getDossierById(id);
        // Set referenceDossier from path param (takes priority over body)
        dto.setReferenceDossier(dossier.getReference());
        Frais frais = fraisService.demandFrais(dto);

        // Recalculate fraisReel = SUM of all montantTtc for this dossier
        BigDecimal totalFraisReel = fraisRepository.sumMontantTtcByDossierId(id);
        dossierService.recalculateFrais(id, totalFraisReel != null ? totalFraisReel : BigDecimal.ZERO);

        return ResponseEntity.ok(frais);
    }

    /**
     * GET /api/dossiers/:id/frais — list all frais entries for this dossier
     */
    @GetMapping("/{id}/frais")
    @PreAuthorize("@permissionService.canAccessDossier(authentication, #id) or hasRole('ADMIN')")
    public ResponseEntity<List<Frais>> getFraisByDossier(@PathVariable Long id) {
        List<Frais> fraisList = fraisRepository.findByDossierId(id);
        return ResponseEntity.ok(fraisList);
    }

    /**
     * GET /api/dossiers/:id/frais/summary — returns fraisInitial, fraisReel, tvaTotale, depassement
     */
    @GetMapping("/{id}/frais/summary")
    @PreAuthorize("@permissionService.canAccessDossier(authentication, #id) or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getFraisSummary(@PathVariable Long id) {
        Dossier dossier = dossierService.getDossierById(id);
        BigDecimal fraisInitial = dossier.getFraisInitial() != null ? dossier.getFraisInitial() : BigDecimal.ZERO;
        BigDecimal fraisReel = dossier.getFraisReel() != null ? dossier.getFraisReel() : BigDecimal.ZERO;

        // Calculate TVA total from all frais entries
        List<Frais> fraisList = fraisRepository.findByDossierId(id);
        BigDecimal tvaTotale = fraisList.stream()
            .filter(f -> f.getMontantTtc() != null && f.getMontant() != null)
            .map(f -> f.getMontantTtc().subtract(f.getMontant()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal depassement = fraisReel.subtract(fraisInitial);
        boolean hasDepassement = depassement.compareTo(BigDecimal.ZERO) > 0;

        Map<String, Object> summary = new HashMap<>();
        summary.put("fraisInitial", fraisInitial);
        summary.put("fraisReel", fraisReel);
        summary.put("tvaTotale", tvaTotale);
        summary.put("depassement", hasDepassement ? depassement : BigDecimal.ZERO);
        summary.put("hasDepassement", hasDepassement);
        summary.put("dossierReference", dossier.getReference());

        return ResponseEntity.ok(summary);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CHARGE_DOSSIER') or hasRole('ADMIN')")
    public ResponseEntity<Void> archiverDossier(@PathVariable Long id) {
        dossierService.archiveDossier(id);
        return ResponseEntity.noContent().build();
    }
 
    // ─────────────────────────────────────────────────
    // REFERENTIEL LINK ENDPOINTS
    // ─────────────────────────────────────────────────
 
    @GetMapping("/by-nature/{natureId}")
    public List<Dossier> getByNature(@PathVariable Long natureId) {
        return dossierService.getByNature(natureId);
    }
 
    @GetMapping("/by-phase/{phaseId}")
    public List<Dossier> getByPhase(@PathVariable Long phaseId) {
        return dossierService.getByPhase(phaseId);
    }
 
    @GetMapping("/by-avocat/{avocatId}")
    public List<Dossier> getByAvocat(@PathVariable Long avocatId) {
        return dossierService.getByAvocat(avocatId);
    }
 
    @GetMapping("/by-huissier/{huissierId}")
    public List<Dossier> getByHuissier(@PathVariable Long huissierId) {
        return dossierService.getByHuissier(huissierId);
    }
 
    @GetMapping("/by-expert/{expertId}")
    public List<Dossier> getByExpert(@PathVariable Long expertId) {
        return dossierService.getByExpert(expertId);
    }
}


