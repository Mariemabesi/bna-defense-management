package com.bna.defense.controller;

import com.bna.defense.entity.referentiel.Greffier;
import com.bna.defense.entity.referentiel.Notaire;
import com.bna.defense.entity.referentiel.Mandataire;
import com.bna.defense.entity.Groupe;
import com.bna.defense.entity.Dossier;
import com.bna.defense.repository.DossierRepository;
import com.bna.defense.repository.referentiel.GreffierRepository;
import com.bna.defense.repository.referentiel.NotaireRepository;
import com.bna.defense.repository.referentiel.MandataireRepository;
import com.bna.defense.repository.GroupeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/referentiel")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReferentielController {

    @Autowired private GreffierRepository greffierRepository;
    @Autowired private NotaireRepository notaireRepository;
    @Autowired private MandataireRepository mandataireRepository;
    @Autowired private GroupeRepository groupeRepository;
    @Autowired private DossierRepository dossierRepository;

    @GetMapping("/greffiers")
    public org.springframework.data.domain.Page<Greffier> getAllGreffiers(org.springframework.data.domain.Pageable pageable) { 
        return greffierRepository.findAll(pageable); 
    }

    @PostMapping("/greffiers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL') or hasRole('CHARGE_DOSSIER')")
    public Greffier createGreffier(@RequestBody Greffier item) { return greffierRepository.save(item); }

    @GetMapping("/notaires")
    public org.springframework.data.domain.Page<Notaire> getAllNotaires(org.springframework.data.domain.Pageable pageable) { 
        return notaireRepository.findAll(pageable); 
    }

    @PostMapping("/notaires")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL') or hasRole('CHARGE_DOSSIER')")
    public Notaire createNotaire(@RequestBody Notaire item) { return notaireRepository.save(item); }

    @GetMapping("/mandataires")
    public org.springframework.data.domain.Page<Mandataire> getAllMandataires(org.springframework.data.domain.Pageable pageable) { 
        return mandataireRepository.findAll(pageable); 
    }

    @PostMapping("/mandataires")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL') or hasRole('CHARGE_DOSSIER')")
    public Mandataire createMandataire(@RequestBody Mandataire item) { return mandataireRepository.save(item); }

    @GetMapping("/groupes")
    public org.springframework.data.domain.Page<Groupe> getAllGroupes(org.springframework.data.domain.Pageable pageable) { 
        return groupeRepository.findAll(pageable); 
    }

    /**
     * Returns all dossiers linked to a specific PartieLitige (client) by ID.
     * Provides a compact summary: reference, titre, statut, priorite, montantLitige.
     */
    @GetMapping("/parties-litige/{id}/dossiers")
    public ResponseEntity<List<Map<String, Object>>> getDossiersByPartieLitige(@PathVariable Long id) {
        List<Dossier> dossiers = dossierRepository.findByPartieLitige_Id(id);
        List<Map<String, Object>> result = dossiers.stream().map(d -> {
            Map<String, Object> item = new java.util.LinkedHashMap<>();
            item.put("id", d.getId());
            item.put("reference", d.getReference());
            item.put("titre", d.getTitre());
            item.put("statut", d.getStatut() != null ? d.getStatut().name() : null);
            item.put("priorite", d.getPriorite() != null ? d.getPriorite().name() : null);
            item.put("montantLitige", d.getMontantLitige());
            item.put("clientName", d.getClientName());
            item.put("verdict", d.getVerdict());
            item.put("archived", d.isArchived());
            item.put("natureAffaire", d.getNatureAffaire() != null ? d.getNatureAffaire().getNom() : null);
            return item;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
