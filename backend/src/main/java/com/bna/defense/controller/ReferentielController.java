package com.bna.defense.controller;

import com.bna.defense.entity.referentiel.*;
import com.bna.defense.entity.Groupe;
import com.bna.defense.repository.referentiel.*;
import com.bna.defense.repository.GroupeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/referentiel")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReferentielController {

    @Autowired private GreffierRepository greffierRepository;
    @Autowired private NotaireRepository notaireRepository;
    @Autowired private MandataireRepository mandataireRepository;
    @Autowired private ParquetRepository parquetRepository;
    @Autowired private CourAppelRepository courAppelRepository;
    @Autowired private CourCassationRepository courCassationRepository;
    @Autowired private CentreMediationRepository centreMediationRepository;
    @Autowired private TypeProcedureRepository typeProcedureRepository;
    @Autowired private PhaseProcedureRepository phaseProcedureRepository;
    @Autowired private NatureAffaireRepository natureAffaireRepository;
    @Autowired private ModeReglementRepository modeReglementRepository;
    @Autowired private DeviseRepository deviseRepository;
    @Autowired private BaremeFraisRepository baremeFraisRepository;
    @Autowired private TvaTimbreRepository tvaTimbreRepository;
    @Autowired private GroupeRepository groupeRepository;

    // --- GREFFIERS ---
    @GetMapping("/greffiers")
    public List<Greffier> getAllGreffiers() { return greffierRepository.findAll(); }

    @PostMapping("/greffiers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public Greffier createGreffier(@RequestBody Greffier item) { return greffierRepository.save(item); }

    // --- NOTAIRES ---
    @GetMapping("/notaires")
    public List<Notaire> getAllNotaires() { return notaireRepository.findAll(); }

    @PostMapping("/notaires")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public Notaire createNotaire(@RequestBody Notaire item) { return notaireRepository.save(item); }

    // --- MANDATAIRES ---
    @GetMapping("/mandataires")
    public List<Mandataire> getAllMandataires() { return mandataireRepository.findAll(); }

    @PostMapping("/mandataires")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public Mandataire createMandataire(@RequestBody Mandataire item) { return mandataireRepository.save(item); }

    // --- PARQUETS ---
    @GetMapping("/parquets")
    public List<Parquet> getAllParquets() { return parquetRepository.findAll(); }

    @PostMapping("/parquets")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public Parquet createParquet(@RequestBody Parquet item) { return parquetRepository.save(item); }

    // --- COURS D'APPEL ---
    @GetMapping("/cours-appel")
    public List<CourAppel> getAllCoursAppel() { return courAppelRepository.findAll(); }

    @PostMapping("/cours-appel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public CourAppel createCourAppel(@RequestBody CourAppel item) { return courAppelRepository.save(item); }

    // --- COURS DE CASSATION ---
    @GetMapping("/cours-cassation")
    public List<CourCassation> getAllCoursCassation() { return courCassationRepository.findAll(); }

    @PostMapping("/cours-cassation")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public CourCassation createCourCassation(@RequestBody CourCassation item) { return courCassationRepository.save(item); }

    // --- CENTRES DE MEDIATION ---
    @GetMapping("/centres-mediation")
    public List<CentreMediation> getAllCentresMediation() { return centreMediationRepository.findAll(); }

    @PostMapping("/centres-mediation")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public CentreMediation createCentreMediation(@RequestBody CentreMediation item) { return centreMediationRepository.save(item); }

    // --- TYPES DE PROCEDURE ---
    @GetMapping("/types-procedure")
    public List<TypeProcedure> getAllTypesProcedure() { return typeProcedureRepository.findAll(); }

    @PostMapping("/types-procedure")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public TypeProcedure createTypeProcedure(@RequestBody TypeProcedure item) { return typeProcedureRepository.save(item); }

    // --- PHASES DE PROCEDURE ---
    @GetMapping("/phases-procedure")
    public List<PhaseProcedure> getAllPhasesProcedure() { return phaseProcedureRepository.findAll(); }

    @PostMapping("/phases-procedure")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public PhaseProcedure createPhaseProcedure(@RequestBody PhaseProcedure item) { return phaseProcedureRepository.save(item); }

    // --- NATURES D'AFFAIRE ---
    @GetMapping("/natures-affaire")
    public List<NatureAffaire> getAllNaturesAffaire() { return natureAffaireRepository.findAll(); }

    @PostMapping("/natures-affaire")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public NatureAffaire createNatureAffaire(@RequestBody NatureAffaire item) { return natureAffaireRepository.save(item); }

    // --- MODES DE REGLEMENT ---
    @GetMapping("/modes-reglement")
    public List<ModeReglement> getAllModesReglement() { return modeReglementRepository.findAll(); }

    @PostMapping("/modes-reglement")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public ModeReglement createModeReglement(@RequestBody ModeReglement item) { return modeReglementRepository.save(item); }

    // --- DEVISES ---
    @GetMapping("/devises")
    public List<Devise> getAllDevises() { return deviseRepository.findAll(); }

    @PostMapping("/devises")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public Devise createDevise(@RequestBody Devise item) { return deviseRepository.save(item); }

    // --- BAREMES DES FRAis ---
    @GetMapping("/baremes-frais")
    public List<BaremeFrais> getAllBaremesFrais() { return baremeFraisRepository.findAll(); }

    @PostMapping("/baremes-frais")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public BaremeFrais createBaremeFrais(@RequestBody BaremeFrais item) { return baremeFraisRepository.save(item); }

    // --- TVA ET TIMBRES ---
    @GetMapping("/tva-timbres")
    public List<TvaTimbre> getAllTvaTimbres() { return tvaTimbreRepository.findAll(); }

    @PostMapping("/tva-timbres")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_VALIDATEUR') or hasRole('REFERENTIEL')")
    public TvaTimbre createTvaTimbre(@RequestBody TvaTimbre item) { return tvaTimbreRepository.save(item); }

    // --- GROUPES ---
    @GetMapping("/groupes")
    public List<Groupe> getAllGroupes() { return groupeRepository.findAll(); }
}

