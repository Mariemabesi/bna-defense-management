package com.bna.defense.repository;

import com.bna.defense.entity.Audience;
import com.bna.defense.entity.ProcedureJudiciaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDateTime;
import java.util.Optional;

public interface AudienceRepository extends JpaRepository<Audience, Long> {
    List<Audience> findByProcedureOrderByDateHeureAsc(ProcedureJudiciaire procedure);
    List<Audience> findByDateHeureBetweenOrderByDateHeureAsc(LocalDateTime start, LocalDateTime end);
    Optional<Audience> findFirstByDateHeureAfterOrderByDateHeureAsc(LocalDateTime now);
}
