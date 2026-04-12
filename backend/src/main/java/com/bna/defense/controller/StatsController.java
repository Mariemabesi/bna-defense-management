package com.bna.defense.controller;

import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.User;
import com.bna.defense.repository.DossierRepository;
import com.bna.defense.repository.UserRepository;
import com.bna.defense.service.DossierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StatsController {

    @Autowired
    private DossierRepository dossierRepository;
    
    @Autowired
    private DossierService dossierService;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/global")
    public Map<String, Object> getGlobalStats() {
        List<Dossier> all = dossierRepository.findAll();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDossiers", all.size());
        stats.put("enCours", all.stream().filter(d -> d.getStatut() != Dossier.StatutDossier.CLOTURE).count());
        
        BigDecimal totalFrais = all.stream()
            .map(Dossier::getFraisReel)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalFrais", totalFrais);

        long validated = all.stream().filter(d -> d.getStatut() == Dossier.StatutDossier.CLOTURE).count();
        double rate = all.isEmpty() ? 0 : (double) validated / all.size() * 100;
        stats.put("tauxValidation", Math.round(rate * 10.0) / 10.0);

        return stats;
    }

    @GetMapping("/user")
    public Map<String, Object> getUserStats(Authentication auth) {
        String username = auth.getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        return dossierService.getDashboardStats(user);
    }

    @GetMapping("/validation-rate")
    public Map<String, Long> getValidationRate() {
        List<Dossier> all = dossierRepository.findAll();
        Map<String, Long> rates = new HashMap<>();
        rates.put("OUVERT", all.stream().filter(d -> d.getStatut() == Dossier.StatutDossier.OUVERT).count());
        rates.put("EN_COURS", all.stream().filter(d -> d.getStatut() == Dossier.StatutDossier.EN_COURS).count());
        rates.put("CLOTURE", all.stream().filter(d -> d.getStatut() == Dossier.StatutDossier.CLOTURE).count());
        return rates;
    }

    @GetMapping("/frais-comparison")
    public List<Map<String, Object>> getFraisComparison() {
        return dossierRepository.findAll().stream().limit(10).map(d -> {
            Map<String, Object> m = new HashMap<>();
            m.put("reference", d.getReference());
            m.put("fraisInitial", d.getFraisInitial());
            m.put("fraisReel", d.getFraisReel());
            m.put("depassement", d.getDepassement());
            return m;
        }).collect(Collectors.toList());
    }
}
