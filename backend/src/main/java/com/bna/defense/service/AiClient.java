package com.bna.defense.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.Map;
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
}
