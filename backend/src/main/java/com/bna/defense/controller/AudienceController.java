package com.bna.defense.controller;

import com.bna.defense.entity.Audience;
import com.bna.defense.service.AudienceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audiences")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AudienceController {

    private final AudienceService audienceService;

    public AudienceController(AudienceService audienceService) {
        this.audienceService = audienceService;
    }

    @GetMapping
    public List<Audience> getAllAudiences() {
        return audienceService.getAllAudiences();
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return audienceService.getAudienceStats();
    }

    @PostMapping
    public Audience createAudience(@RequestBody Audience audience) {
        return audienceService.saveAudience(audience);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Audience> getAudienceById(@PathVariable Long id) {
        return audienceService.getAudienceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Audience> updateAudience(@PathVariable Long id, @RequestBody Audience details) {
        return audienceService.getAudienceById(id).map(audience -> {
            audience.setDateHeure(details.getDateHeure());
            audience.setTribunal(details.getTribunal());
            audience.setSalle(details.getSalle());
            audience.setStatut(details.getStatut());
            audience.setObservation(details.getObservation());
            return ResponseEntity.ok(audienceService.saveAudience(audience));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAudience(@PathVariable Long id) {
        audienceService.deleteAudience(id);
        return ResponseEntity.ok().build();
    }
}
