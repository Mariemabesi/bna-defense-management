package com.bna.defense.controller;

import com.bna.defense.service.AiClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    @Autowired
    private AiClient aiClient;

    @PostMapping("/classify-dossier")
    public Mono<Map<String, Object>> classifyDossier(@RequestBody Map<String, String> request) {
        return aiClient.classifyDossier(request.get("description"));
    }

    @PostMapping("/risk-score")
    public Mono<Map<String, Object>> calculateRiskScore(@RequestBody Map<String, Object> request) {
        // Simple proxy for now
        Long dossierId = Long.valueOf(request.get("dossierId").toString());
        return aiClient.calculateRiskScore(dossierId, request);
    }
}
