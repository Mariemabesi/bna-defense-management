package com.bna.defense.repository;

import com.bna.defense.entity.Jugement;
import com.bna.defense.entity.ProcedureJudiciaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface JugementRepository extends JpaRepository<Jugement, Long> {
    Optional<Jugement> findByProcedure(ProcedureJudiciaire procedure);
}
