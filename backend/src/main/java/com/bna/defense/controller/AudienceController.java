package com.bna.defense.controller;

import com.bna.defense.entity.Audience;
import com.bna.defense.repository.AudienceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/audiences")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AudienceController {

    @Autowired
    private AudienceRepository audienceRepository;

    @GetMapping
    public List<Audience> getAllAudiences() {
        return audienceRepository.findAll();
    }

    @PostMapping
    public Audience createAudience(@RequestBody Audience audience) {
        return audienceRepository.save(audience);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Audience> getAudienceById(@PathVariable Long id) {
        return audienceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Audience> updateAudience(@PathVariable Long id, @RequestBody Audience details) {
        return audienceRepository.findById(id).map(audience -> {
            audience.setDateAudience(details.getDateAudience());
            audience.setLieu(details.getLieu());
            audience.setStatut(details.getStatut());
            audience.setCompteRendu(details.getCompteRendu());
            return ResponseEntity.ok(audienceRepository.save(audience));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAudience(@PathVariable Long id) {
        return audienceRepository.findById(id).map(audience -> {
            audienceRepository.delete(audience);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
