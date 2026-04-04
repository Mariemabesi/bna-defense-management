package com.bna.defense.repository.referentiel;

import com.bna.defense.entity.referentiel.CourCassation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CourCassationRepository extends JpaRepository<CourCassation, Long>, JpaSpecificationExecutor<CourCassation> {
}
