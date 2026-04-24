package com.bna.defense.service;

import com.bna.defense.entity.AiResult;
import com.bna.defense.repository.AiResultRepository;
import com.bna.defense.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class AiSchedulingService {

    private final AiClient aiClient;
    private final AiResultRepository aiResultRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public AiSchedulingService(AiClient aiClient, AiResultRepository aiResultRepository, 
                               NotificationService notificationService, UserRepository userRepository) {
        this.aiClient = aiClient;
        this.aiResultRepository = aiResultRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    /**
     * Daily refresh of Predictive KPIs (Feature 8)
     */
    @Scheduled(cron = "0 0 0 * * *") // Midnight
    public void refreshPredictiveKPIs() {
        aiClient.getPredictiveKPIs().subscribe(result -> {
            AiResult aiResult = new AiResult("PREDICTIVE_KPIS", "SYSTEM", 0L, result.toString());
            aiResultRepository.save(aiResult);
        });
    }

    /**
     * Hourly check for Smart Notifications (Feature 10)
     */
    @Scheduled(cron = "0 0 * * * *") // Hourly
    public void pullSmartNotifications() {
        aiClient.getSmartNotifications().subscribe(notifications -> {
            for (Map<String, Object> n : notifications) {
                // Broadcast to admin for now or logic per user
                userRepository.findByUsername("admin").ifPresent(admin -> {
                    notificationService.create(admin, n.get("message").toString(), "AI_SMART_ALERT", null);
                });
            }
        });
    }

    /**
     * Daily update of Avocat Performance Scores (Feature 6)
     */
    @Scheduled(cron = "0 0 1 * * ?") // 1 AM
    public void updateAvocatScores() {
        // Logic to iterate through lawyers and get their scores
        // For brevity, we could look up the avocat table here
    }
}
