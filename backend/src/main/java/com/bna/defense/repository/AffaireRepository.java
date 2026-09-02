package com.bna.defense.repository;

import com.bna.defense.entity.Affaire;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AffaireRepository extends JpaRepository<Affaire, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"dossier", "dossier.assignedCharge", "adversaire", "avocat", "tribunal", "procedures"})
    List<Affaire> findAll();

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT a FROM Affaire a " +
            "LEFT JOIN a.dossier d " +
            "LEFT JOIN d.assignedCharge ac " +
            "LEFT JOIN ac.manager m " +
            "WHERE ( " +
            "  :isSuper = true " +
            "  OR d.createdBy = :username " +
            "  OR ac.username = :username " +
            "  OR (:isPreVal = true AND m.id = :userId) " +
            ") " +
            "AND (:searchTerm IS NULL OR a.referenceJudiciaire LIKE :searchTerm OR a.titre LIKE :searchTerm) " +
            "AND (:type IS NULL OR a.type = :type) " +
            "AND (:statut IS NULL OR a.statut = :statut)")
    org.springframework.data.domain.Page<Affaire> findAllWithRBAC(
            @org.springframework.data.repository.query.Param("username") String username,
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("isSuper") boolean isSuper,
            @org.springframework.data.repository.query.Param("isPreVal") boolean isPreVal,
            @org.springframework.data.repository.query.Param("searchTerm") String searchTerm,
            @org.springframework.data.repository.query.Param("type") Affaire.TypeAffaire type,
            @org.springframework.data.repository.query.Param("statut") Affaire.StatutAffaire statut,
            org.springframework.data.domain.Pageable pageable);

    List<Affaire> findByDossier_Id(Long dossierId);
    List<Affaire> findByTribunal_Id(Long tribunalId);
    List<Affaire> findByAvocat_Id(Long avocatId);
    List<Affaire> findByHuissier_Id(Long huissierId);
    List<Affaire> findByExpert_Id(Long expertId);
}
