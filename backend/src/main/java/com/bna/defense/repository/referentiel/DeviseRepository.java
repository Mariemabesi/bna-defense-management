package com.bna.defense.repository.referentiel;

import com.bna.defense.entity.referentiel.Devise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface DeviseRepository extends JpaRepository<Devise, Long>, JpaSpecificationExecutor<Devise> {
}
