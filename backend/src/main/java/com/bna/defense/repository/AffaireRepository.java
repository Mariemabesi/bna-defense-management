package com.bna.defense.repository;

import com.bna.defense.entity.Affaire;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AffaireRepository extends JpaRepository<Affaire, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"dossier", "dossier.assignedCharge", "adversaire", "avocat", "tribunal", "procedures"})
    List<Affaire> findAll();

    @org.springframework.data.jpa.repository.Query("SELECT a FROM Affaire a WHERE ( " +
            "(:isSuper = true) OR " +
            "(a.dossier.createdBy = :username) OR " +
            "(a.dossier.assignedCharge.username = :username) OR " +
            "(:isPreVal = true AND a.dossier.assignedCharge.manager.id = :userId) ) " +
            "AND (:searchTerm IS NULL OR UPPER(a.referenceJudiciaire) LIKE UPPER(CONCAT('%', :searchTerm, '%')) OR UPPER(a.titre) LIKE UPPER(CONCAT('%', :searchTerm, '%'))) " +
            "AND (:type IS NULL OR a.type = :type) " +
            "AND (:statut IS NULL OR a.statut = :statut)")
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"dossier", "dossier.assignedCharge", "adversaire", "avocat", "tribunal", "procedures"})
    org.springframework.data.domain.Page<Affaire> findAllWithRBAC(
            @org.springframework.data.repository.query.Param("username") String username,
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("isSuper") boolean isSuper,
            @org.springframework.data.repository.query.Param("isPreVal") boolean isPreVal,
            @org.springframework.data.repository.query.Param("searchTerm") String searchTerm,
            @org.springframework.data.repository.query.Param("type") String type,
            @org.springframework.data.repository.query.Param("statut") Affaire.StatutAffaire statut,
            org.springframework.data.domain.Pageable pageable);

    List<Affaire> findByDossier_Id(Long dossierId);
    List<Affaire> findByTribunal_Id(Long tribunalId);
    List<Affaire> findByAvocat_Id(Long avocatId);
    List<Affaire> findByHuissier_Id(Long huissierId);
    List<Affaire> findByExpert_Id(Long expertId);
}
