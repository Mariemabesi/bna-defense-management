package com.bna.defense.repository.referentiel;

import com.bna.defense.entity.referentiel.PhaseProcedure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PhaseProcedureRepository extends JpaRepository<PhaseProcedure, Long>, JpaSpecificationExecutor<PhaseProcedure> {
}
