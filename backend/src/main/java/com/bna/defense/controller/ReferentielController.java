package com.bna.defense.controller;

import com.bna.defense.entity.referentiel.*;
import com.bna.defense.entity.Groupe;
import com.bna.defense.repository.referentiel.*;
import com.bna.defense.repository.GroupeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Redundant methods for specialized referentials (Tribunaux, Procédures, Finances) 
 * have been moved to their respective controllers in com.bna.defense.controller.referentiel.
 */
@RestController
@RequestMapping("/api/referentiel")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReferentielController {

    @Autowired private GreffierRepository greffierRepository;
    @Autowired private NotaireRepository notaireRepository;
    @Autowired private MandataireRepository mandataireRepository;
    @Autowired private GroupeRepository groupeRepository;

    // --- GREFFIERS ---
    @GetMapping("/greffiers")
    public List<Greffier> getAllGreffiers() { return greffierRepository.findAll(); }

    @PostMapping("/greffiers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL') or hasRole('CHARGE_DOSSIER')")
    public Greffier createGreffier(@RequestBody Greffier item) { return greffierRepository.save(item); }

    // --- NOTAIRES ---
    @GetMapping("/notaires")
    public List<Notaire> getAllNotaires() { return notaireRepository.findAll(); }

    @PostMapping("/notaires")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL') or hasRole('CHARGE_DOSSIER')")
    public Notaire createNotaire(@RequestBody Notaire item) { return notaireRepository.save(item); }

    // --- MANDATAIRES ---
    @GetMapping("/mandataires")
    public List<Mandataire> getAllMandataires() { return mandataireRepository.findAll(); }

    @PostMapping("/mandataires")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL') or hasRole('CHARGE_DOSSIER')")
    public Mandataire createMandataire(@RequestBody Mandataire item) { return mandataireRepository.save(item); }

    // --- GROUPES ---
    @GetMapping("/groupes")
    public List<Groupe> getAllGroupes() { return groupeRepository.findAll(); }
}
