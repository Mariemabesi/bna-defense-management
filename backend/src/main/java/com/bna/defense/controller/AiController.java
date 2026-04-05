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
        Long dossierId = Long.valueOf(request.get("dossierId").toString());
        return aiClient.calculateRiskScore(dossierId, request);
    }

    @PostMapping("/summarize-dossier")
    public Mono<Map<String, Object>> summarizeDossier(@RequestBody Map<String, Object> request) {
        Long dossierId = Long.valueOf(request.get("dossierId").toString());
        return aiClient.summarizeDossier(dossierId);
    }

    @PostMapping("/detect-anomaly")
    public Mono<Map<String, Object>> detectAnomaly(@RequestBody Map<String, Object> request) {
        Long fraisId = Long.valueOf(request.get("fraisId").toString());
        return aiClient.detectAnomaly(fraisId);
    }

    @PostMapping("/predict-budget")
    public Mono<Map<String, Object>> predictBudget(@RequestBody Map<String, Object> request) {
        Long dossierId = Long.valueOf(request.get("dossierId").toString());
        return aiClient.predictBudget(dossierId);
    }

    @GetMapping("/avocat-score/{id}")
    public Mono<Map<String, Object>> getAvocatScore(@PathVariable Long id) {
        return aiClient.getAvocatScore(id);
    }

    @PostMapping("/recommend-strategy")
    public Mono<Map<String, Object>> recommendStrategy(@RequestBody Map<String, Object> request) {
        Long dossierId = Long.valueOf(request.get("dossierId").toString());
        return aiClient.recommendStrategy(dossierId);
    }

    @GetMapping("/predictive-kpis")
    public Mono<Map<String, Object>> getPredictiveKPIs() {
        return aiClient.getPredictiveKPIs();
    }

    @PostMapping("/nl-search")
    public Mono<java.util.List<Map<String, Object>>> nlSearch(@RequestBody Map<String, String> request) {
        return aiClient.nlSearch(request.get("query"));
    }

    @GetMapping("/smart-notifications")
    public Mono<java.util.List<Map<String, Object>>> getSmartNotifications() {
        return aiClient.getSmartNotifications();
    }

    @PostMapping("/analyze-document")
    public Mono<Map<String, Object>> analyzeDocument(@RequestBody Map<String, Object> request) {
        Long documentId = Long.valueOf(request.get("documentId").toString());
        return aiClient.analyzeDocument(documentId);
    }

    @GetMapping("/detect-fraud/{id}")
    public Mono<Map<String, Object>> detectFraud(@PathVariable Long id) {
        return aiClient.detectFraud(id);
    }
}
