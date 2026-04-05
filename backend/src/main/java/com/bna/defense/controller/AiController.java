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

    @Autowired private AiClient aiClient;
    @Autowired private com.bna.defense.repository.AiResultRepository aiResultRepository;
    @Autowired private com.bna.defense.repository.AuditLogRepository auditLogRepository;
    @Autowired private com.bna.defense.repository.UserRepository userRepository;

    private void logAiAction(String feature, String entityType, Long entityId, String details, java.security.Principal principal) {
        com.bna.defense.entity.AuditLog log = new com.bna.defense.entity.AuditLog();
        log.setUserEmail(principal != null ? principal.getName() : "SYSTEM");
        log.setAction("AI_" + feature);
        log.setEntityName(entityType);
        log.setEntityId(entityId);
        log.setDetails(details);
        auditLogRepository.save(log);
    }

    private void saveAiResult(String feature, String entityType, Long entityId, Map<String, Object> result) {
        com.bna.defense.entity.AiResult aiResult = new com.bna.defense.entity.AiResult(feature, entityType, entityId, result.toString());
        aiResultRepository.save(aiResult);
    }

    @PostMapping("/classify-dossier")
    public Mono<Map<String, Object>> classifyDossier(@RequestBody Map<String, String> request, java.security.Principal principal) {
        String desc = request.get("description");
        return aiClient.classifyDossier(desc)
            .doOnNext(res -> {
                logAiAction("CLASSIFY", "DOSSIER", 0L, "Description: " + desc, principal);
                saveAiResult("CLASSIFY", "DOSSIER", 0L, res);
            });
    }

    @PostMapping("/risk-score")
    public Mono<Map<String, Object>> calculateRiskScore(@RequestBody Map<String, Object> request, java.security.Principal principal) {
        Long dossierId = Long.valueOf(request.get("dossierId").toString());
        return aiClient.calculateRiskScore(dossierId, request)
            .doOnNext(res -> {
                logAiAction("RISK_SCORE", "DOSSIER", dossierId, "Data: " + request.toString(), principal);
                saveAiResult("RISK_SCORE", "DOSSIER", dossierId, res);
            });
    }

    @PostMapping("/summarize-dossier")
    public Mono<Map<String, Object>> summarizeDossier(@RequestBody Map<String, Object> request, java.security.Principal principal) {
        Long dossierId = Long.valueOf(request.get("dossierId").toString());
        return aiClient.summarizeDossier(dossierId)
            .doOnNext(res -> {
                logAiAction("SUMMARIZE", "DOSSIER", dossierId, "Summary generated", principal);
                saveAiResult("SUMMARIZE", "DOSSIER", dossierId, res);
            });
    }

    @PostMapping("/detect-anomaly")
    public Mono<Map<String, Object>> detectAnomaly(@RequestBody Map<String, Object> request, java.security.Principal principal) {
        Long fraisId = Long.valueOf(request.get("fraisId").toString());
        return aiClient.detectAnomaly(fraisId)
            .doOnNext(res -> {
                logAiAction("DETECT_ANOMALY", "FRAIS", fraisId, "Anomaly check", principal);
                saveAiResult("DETECT_ANOMALY", "FRAIS", fraisId, res);
            });
    }

    @PostMapping("/predict-budget")
    public Mono<Map<String, Object>> predictBudget(@RequestBody Map<String, Object> request, java.security.Principal principal) {
        Long dossierId = Long.valueOf(request.get("dossierId").toString());
        return aiClient.predictBudget(dossierId)
            .doOnNext(res -> {
                logAiAction("PREDICT_BUDGET", "DOSSIER", dossierId, "Budget prediction", principal);
                saveAiResult("PREDICT_BUDGET", "DOSSIER", dossierId, res);
            });
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
