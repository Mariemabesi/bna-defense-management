package com.bna.defense.repository.referentiel;

import com.bna.defense.entity.referentiel.NatureAffaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface NatureAffaireRepository extends JpaRepository<NatureAffaire, Long>, JpaSpecificationExecutor<NatureAffaire> {
}
