package com.bna.defense.repository.referentiel;

import com.bna.defense.entity.referentiel.CentreMediation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CentreMediationRepository extends JpaRepository<CentreMediation, Long>, JpaSpecificationExecutor<CentreMediation> {
}
