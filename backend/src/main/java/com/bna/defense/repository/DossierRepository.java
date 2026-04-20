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

    /**
     * Role-scoped RBAC Query:
     * - ADMIN / SUPER_VALIDATEUR : see everything
     * - PRE_VALIDATEUR           : see dossiers where assignedCharge.manager = currentUser
     * - CHARGE_DOSSIER           : see only their own dossiers (createdBy or assignedCharge)
     * - VALIDATEUR               : ONLY see dossiers that the pre-validateur has approved
     *                              (statut >= EN_ATTENTE_VALIDATION). A dossier created by a
     *                              chargé is INVISIBLE to the validateur until pre-validated.
     */
    @Query("SELECT DISTINCT d FROM Dossier d " +
           "LEFT JOIN d.assignedCharge ac " +
           "LEFT JOIN ac.manager m " +
           "WHERE d.archived = false AND (" +
           "(:isSuper = true) " +
           "OR (:isCharge = true AND (d.createdBy = :username OR ac.username = :username)) " +
           "OR (:isPreVal = true AND ac IS NOT NULL AND m = :user) " +
           "OR (:isValidateur = true AND d.statut IN :allowedStatuses)" +
           ")")
    Page<Dossier> findAllWithRBAC(
        @Param("user") User user,
        @Param("username") String username,
        @Param("isSuper") boolean isSuper,
        @Param("isCharge") boolean isCharge,
        @Param("isPreVal") boolean isPreVal,
        @Param("isValidateur") boolean isValidateur,
        @Param("allowedStatuses") List<Dossier.StatutDossier> allowedStatuses,
        Pageable pageable
    );

    boolean existsByReference(String reference);

    @Query("SELECT d FROM Dossier d LEFT JOIN FETCH d.assignedCharge ac " +
           "WHERE ac.manager = :preValidateur " +
           "AND d.statut = :status")
    List<Dossier> findPendingForPreValidateur(@Param("preValidateur") User preValidateur, @Param("status") Dossier.StatutDossier status);

    @Query("SELECT d FROM Dossier d LEFT JOIN FETCH d.assignedCharge ac " +
           "WHERE ac.manager = :preValidateur " +
           "AND d.statut = :status")
    List<Dossier> findPendingClosureForPreValidateur(@Param("preValidateur") User preValidateur, @Param("status") Dossier.StatutDossier status);

    @Query("SELECT d FROM Dossier d LEFT JOIN FETCH d.assignedCharge ac " +
           "WHERE (ac.manager = :validateur OR ac.manager.manager = :validateur) " +
           "AND d.statut = :status")
    List<Dossier> findPendingForValidateur(@Param("validateur") User validateur, @Param("status") Dossier.StatutDossier status);

    @Query("SELECT d FROM Dossier d LEFT JOIN FETCH d.assignedCharge ac " +
           "WHERE (ac.manager = :validateur OR ac.manager.manager = :validateur) " +
           "AND d.statut = :status")
    List<Dossier> findPendingClosureForValidateur(@Param("validateur") User validateur, @Param("status") Dossier.StatutDossier status);

    @Query("SELECT DISTINCT d FROM Dossier d LEFT JOIN d.affaires a LEFT JOIN a.avocat aux " +
           "WHERE UPPER(d.reference) LIKE UPPER(CONCAT('%', :q, '%')) " +
           "OR UPPER(d.titre) LIKE UPPER(CONCAT('%', :q, '%')) " +
           "OR UPPER(d.description) LIKE UPPER(CONCAT('%', :q, '%')) " +
           "OR UPPER(d.clientName) LIKE UPPER(CONCAT('%', :q, '%')) " +
           "OR UPPER(aux.nom) LIKE UPPER(CONCAT('%', :q, '%'))")
    List<Dossier> searchDossiers(@Param("q") String query);
}
