package com.bna.defense.repository;

import com.bna.defense.entity.Auxiliaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuxiliaireRepository extends JpaRepository<Auxiliaire, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT a FROM Auxiliaire a WHERE UPPER(a.nom) LIKE UPPER(CONCAT('%', :q, '%')) OR UPPER(a.specialite) LIKE UPPER(CONCAT('%', :q, '%')) OR UPPER(a.region) LIKE UPPER(CONCAT('%', :q, '%'))")
    java.util.List<Auxiliaire> searchAuxiliaires(@org.springframework.data.repository.query.Param("q") String query);

    org.springframework.data.domain.Page<Auxiliaire> findByType(Auxiliaire.TypeAuxiliaire type, org.springframework.data.domain.Pageable pageable);
}
