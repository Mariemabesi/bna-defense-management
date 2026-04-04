package com.bna.defense.repository.referentiel;

import com.bna.defense.entity.referentiel.Parquet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ParquetRepository extends JpaRepository<Parquet, Long>, JpaSpecificationExecutor<Parquet> {
}
