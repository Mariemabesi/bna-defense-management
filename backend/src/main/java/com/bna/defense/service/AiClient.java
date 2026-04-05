package com.bna.defense.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.Map;
import java.util.List;
import java.time.Duration;

@Service
public class AiClient {

    private final WebClient webClient;

    public AiClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://localhost:8000").build();
    }

    public Mono<Map<String, Object>> classifyDossier(String description) {
        return this.webClient.post()
                .uri("/api/ai/classify-dossier")
                .bodyValue(Map.of("description", description))
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofSeconds(30))
                .onErrorReturn(Map.of(
                    "typeProcedure", "CIVIL",
                    "natureAffaire", "Droit commun",
                    "phaseInitiale", "PREMIERE_INSTANCE",
                    "confidence", 0.0
                ));
    }

    public Mono<Map<String, Object>> calculateRiskScore(Long dossierId, Map<String, Object> data) {
        return this.webClient.post()
                .uri("/api/ai/risk-score")
                .bodyValue(Map.of("dossierId", dossierId, "data", data))
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofSeconds(10))
                .onErrorReturn(Map.of("riskScore", "MOYEN"));
    }

    public Mono<Map<String, Object>> summarizeDossier(Long dossierId) {
        return this.webClient.post()
                .uri("/api/ai/summarize-dossier")
                .bodyValue(Map.of("dossierId", dossierId))
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofSeconds(15))
                .onErrorReturn(Map.of("summary", "Résumé non disponible."));
    }

    public Mono<Map<String, Object>> detectAnomaly(Long fraisId) {
        return this.webClient.post()
                .uri("/api/ai/detect-anomaly")
                .bodyValue(Map.of("fraisId", fraisId))
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofSeconds(10))
                .onErrorReturn(Map.of("anomaly", false));
    }

    public Mono<Map<String, Object>> predictBudget(Long dossierId) {
        return this.webClient.post()
                .uri("/api/ai/predict-budget")
                .bodyValue(Map.of("dossierId", dossierId))
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofSeconds(15))
                .onErrorReturn(Map.of("predictedBudget", 0.0));
    }

    public Mono<Map<String, Object>> getAvocatScore(Long avocatId) {
        return this.webClient.get()
                .uri("/api/ai/avocat-score/{id}", avocatId)
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofSeconds(10))
                .onErrorReturn(Map.of("score", 70.0));
    }

    public Mono<Map<String, Object>> recommendStrategy(Long dossierId) {
        return this.webClient.post()
                .uri("/api/ai/recommend-strategy")
                .bodyValue(Map.of("dossierId", dossierId))
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofSeconds(20))
                .onErrorReturn(Map.of("strategy", "Procédure standard recommandée."));
    }

    public Mono<Map<String, Object>> getPredictiveKPIs() {
        return this.webClient.get()
                .uri("/api/ai/predictive-kpis")
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofSeconds(15))
                .onErrorReturn(Map.of("message", "Données non disponibles."));
    }

    public Mono<List<Map<String, Object>>> nlSearch(String query) {
        return this.webClient.post()
                .uri("/api/ai/nl-search")
                .bodyValue(Map.of("query", query))
                .retrieve()
                .bodyToFlux(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                .collectList()
                .timeout(Duration.ofSeconds(20))
                .onErrorReturn(java.util.Collections.emptyList());
    }

    public Mono<List<Map<String, Object>>> getSmartNotifications() {
        return this.webClient.get()
                .uri("/api/ai/smart-notifications")
                .retrieve()
                .bodyToFlux(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                .collectList()
                .timeout(Duration.ofSeconds(15))
                .onErrorReturn(java.util.Collections.emptyList());
    }

    public Mono<Map<String, Object>> analyzeDocument(Long documentId) {
        return this.webClient.post()
                .uri("/api/ai/analyze-document")
                .bodyValue(Map.of("documentId", documentId))
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofSeconds(15))
                .onErrorReturn(Map.of("analysis", "Analyse en attente."));
    }

    public Mono<Map<String, Object>> detectFraud(Long userId) {
        return this.webClient.get()
                .uri("/api/ai/detect-fraud/{id}", userId)
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofSeconds(10))
                .onErrorReturn(Map.of("status", "CLEAN"));
    }
}
