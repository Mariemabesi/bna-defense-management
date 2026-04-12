package com.bna.defense.repository;

import com.bna.defense.entity.Audience;
import com.bna.defense.entity.ProcedureJudiciaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDateTime;

public interface AudienceRepository extends JpaRepository<Audience, Long> {
    List<Audience> findByProcedure(ProcedureJudiciaire procedure);
    List<Audience> findByDateAudienceBetween(LocalDateTime start, LocalDateTime end);
}
