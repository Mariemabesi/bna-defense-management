package com.bna.defense.service;

import com.bna.defense.entity.Audience;
import com.bna.defense.entity.ProcedureJudiciaire;
import com.bna.defense.repository.AudienceRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AudienceService {

    private final AudienceRepository audienceRepository;

    public AudienceService(AudienceRepository audienceRepository) {
        this.audienceRepository = audienceRepository;
    }

    public Audience saveAudience(Audience audience) {
        return audienceRepository.save(audience);
    }

    public List<Audience> getByProcedure(ProcedureJudiciaire procedure) {
        return audienceRepository.findByProcedureOrderByDateHeureAsc(procedure);
    }

    public Optional<Audience> getAudienceById(Long id) {
        return audienceRepository.findById(id);
    }

    public void deleteAudience(Long id) {
        audienceRepository.deleteById(id);
    }

    public List<Audience> getAllAudiences() {
        return audienceRepository.findAll();
    }

    public Map<String, Object> getAudienceStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endOfWeek = now.plusDays(7);
        LocalDateTime in48h = now.plusHours(48);

        List<Audience> thisWeek = audienceRepository.findByDateHeureBetweenOrderByDateHeureAsc(now, endOfWeek);
        List<Audience> urgent = audienceRepository.findByDateHeureBetweenOrderByDateHeureAsc(now, in48h);
        Audience next = audienceRepository.findFirstByDateHeureAfterOrderByDateHeureAsc(now).orElse(null);

        Map<String, Object> stats = new HashMap<>();
        stats.put("countThisWeek", thisWeek.size());
        stats.put("countUrgent", urgent.size());
        stats.put("nextAudience", next);
        return stats;
    }
}
