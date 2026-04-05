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
     * Role-scoped RBAC Query (Fixed for proper hierarchy isolation):
     * - ADMIN / SUPER_VALIDATEUR: see everything
     * - VALIDATEUR: see dossiers where the Chargé's manager's manager = validateur (i.e. entire subtree)
     * - PRE_VALIDATEUR: ONLY see dossiers where assignedCharge.manager = currentUser (their direct Chargés only)
     * - CHARGE_DOSSIER: ONLY see their own dossiers (createdBy = username)
     */
    @Query("SELECT d FROM Dossier d LEFT JOIN FETCH d.assignedCharge ac " +
           "WHERE (:isSuper = true) " +
           "OR (d.createdBy = :username AND :isCharge = true) " +
           "OR (:isPreVal = true AND ac IS NOT NULL AND ac.manager = :user) " +
           "OR (:isValidateur = true AND ac IS NOT NULL AND (ac.manager = :user OR ac.manager.manager = :user))")
    Page<Dossier> findAllWithRBAC(
        @Param("user") User user,
        @Param("username") String username,
        @Param("isSuper") boolean isSuper,
        @Param("isCharge") boolean isCharge,
        @Param("isPreVal") boolean isPreVal,
        @Param("isValidateur") boolean isValidateur,
        Pageable pageable
    );

    /**
     * Pre-validateur specific: dossiers waiting for pre-validation from their own Chargés
     */
    @Query("SELECT d FROM Dossier d LEFT JOIN FETCH d.assignedCharge ac " +
           "WHERE ac.manager = :preValidateur " +
           "AND d.statut = StatutDossier.EN_ATTENTE_PREVALIDATION")
    List<Dossier> findPendingForPreValidateur(@Param("preValidateur") User preValidateur);

    /**
     * Validateur specific: dossiers waiting for final validation in their hierarchy
     */
    @Query("SELECT d FROM Dossier d LEFT JOIN FETCH d.assignedCharge ac " +
           "WHERE (ac.manager = :validateur OR ac.manager.manager = :validateur) " +
           "AND d.statut = StatutDossier.EN_ATTENTE_VALIDATION")
    List<Dossier> findPendingForValidateur(@Param("validateur") User validateur);

    @Query("SELECT DISTINCT d FROM Dossier d LEFT JOIN d.affaires a LEFT JOIN a.avocat aux " +
           "WHERE UPPER(d.reference) LIKE UPPER(CONCAT('%', :q, '%')) " +
           "OR UPPER(d.titre) LIKE UPPER(CONCAT('%', :q, '%')) " +
           "OR UPPER(d.description) LIKE UPPER(CONCAT('%', :q, '%')) " +
           "OR UPPER(d.clientName) LIKE UPPER(CONCAT('%', :q, '%')) " +
           "OR UPPER(aux.nom) LIKE UPPER(CONCAT('%', :q, '%'))")
    List<Dossier> searchDossiers(@Param("q") String query);
}
