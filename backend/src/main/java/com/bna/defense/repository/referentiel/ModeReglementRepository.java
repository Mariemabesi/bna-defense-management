package com.bna.defense.repository.referentiel;

import com.bna.defense.entity.referentiel.ModeReglement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ModeReglementRepository extends JpaRepository<ModeReglement, Long>, JpaSpecificationExecutor<ModeReglement> {
}
