package com.bna.defense.repository.referentiel;

import com.bna.defense.entity.referentiel.TypeProcedure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface TypeProcedureRepository extends JpaRepository<TypeProcedure, Long>, JpaSpecificationExecutor<TypeProcedure> {
}
