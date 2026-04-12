package com.bna.defense.repository;

import com.bna.defense.entity.ProcedureJudiciaire;
import com.bna.defense.entity.Affaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProcedureJudiciaireRepository extends JpaRepository<ProcedureJudiciaire, Long> {
    List<ProcedureJudiciaire> findByAffaire(Affaire affaire);
    List<ProcedureJudiciaire> findByStatut(ProcedureJudiciaire.StatutProcedure statut);
}
