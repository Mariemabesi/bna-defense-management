package com.bna.defense.repository.referentiel;

import com.bna.defense.entity.referentiel.BaremeFrais;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface BaremeFraisRepository extends JpaRepository<BaremeFrais, Long>, JpaSpecificationExecutor<BaremeFrais> {
}
