package com.bna.defense.repository;

import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DossierRepository extends JpaRepository<Dossier, Long> {
    Optional<Dossier> findByReference(String reference);

    @Query("SELECT d FROM Dossier d WHERE (:isSuper = true) OR (:validator IS NOT NULL AND d.groupValidateur = :validator) OR (d.createdBy = :username)")
    Page<Dossier> findAllWithRBAC(@Param("validator") User validator, @Param("username") String username, @Param("isSuper") boolean isSuper, Pageable pageable);

    @Query("SELECT DISTINCT d FROM Dossier d LEFT JOIN d.affaires a LEFT JOIN a.avocat aux " +
           "WHERE UPPER(d.reference) LIKE UPPER(CONCAT('%', :q, '%')) " +
           "OR UPPER(d.titre) LIKE UPPER(CONCAT('%', :q, '%')) " +
           "OR UPPER(d.description) LIKE UPPER(CONCAT('%', :q, '%')) " +
           "OR UPPER(d.clientName) LIKE UPPER(CONCAT('%', :q, '%')) " +
           "OR UPPER(aux.nom) LIKE UPPER(CONCAT('%', :q, '%'))")
    List<Dossier> searchDossiers(@Param("q") String query);
}
