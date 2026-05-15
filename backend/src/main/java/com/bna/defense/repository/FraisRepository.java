package com.bna.defense.repository;

import com.bna.defense.entity.Frais;
import com.bna.defense.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface FraisRepository extends JpaRepository<Frais, Long> {

    @Query(value = "SELECT f FROM Frais f " +
            "JOIN FETCH f.affaire a " +
            "JOIN FETCH a.dossier d " +
            "LEFT JOIN d.assignedCharge ac " +
            "LEFT JOIN ac.manager m " +
            "WHERE (:isSuper = true) " +
            "OR (f.createdBy = :username) " +
            "OR (:isCharge = true AND ac = :user) " +
            "OR (:isPreVal = true AND (ac = :user OR m = :user)) " +
            "OR (:isValidateur = true AND (ac = :user OR m = :user OR m.manager = :user))",
            countQuery = "SELECT COUNT(f) FROM Frais f " +
            "JOIN f.affaire a " +
            "JOIN a.dossier d " +
            "LEFT JOIN d.assignedCharge ac " +
            "LEFT JOIN ac.manager m " +
            "WHERE (:isSuper = true) " +
            "OR (f.createdBy = :username) " +
            "OR (:isCharge = true AND ac = :user) " +
            "OR (:isPreVal = true AND (ac = :user OR m = :user)) " +
            "OR (:isValidateur = true AND (ac = :user OR m = :user OR m.manager = :user))")
    org.springframework.data.domain.Page<Frais> findByRBACPaginated(
            @Param("user") User user,
            @Param("username") String username,
            @Param("isSuper") boolean isSuper,
            @Param("isCharge") boolean isCharge,
            @Param("isPreVal") boolean isPreVal,
            @Param("isValidateur") boolean isValidateur,
            org.springframework.data.domain.Pageable pageable);

    @Query("SELECT f FROM Frais f JOIN FETCH f.affaire a JOIN FETCH a.dossier d WHERE d.id = :dossierId")
    List<Frais> findByDossierId(@Param("dossierId") Long dossierId);

    @Query("SELECT COALESCE(SUM(f.montantTtc), 0.0) FROM Frais f JOIN f.affaire a WHERE a.dossier.id = :dossierId")
    BigDecimal sumMontantTtcByDossierId(@Param("dossierId") Long dossierId);
}
