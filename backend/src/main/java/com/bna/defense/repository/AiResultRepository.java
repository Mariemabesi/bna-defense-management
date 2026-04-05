package com.bna.defense.repository;

import com.bna.defense.entity.AiResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AiResultRepository extends JpaRepository<AiResult, Long> {
    List<AiResult> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String type, Long id);
    List<AiResult> findByFeatureOrderByCreatedAtDesc(String feature);
}
