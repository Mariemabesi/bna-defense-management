package com.bna.defense.repository;

import com.bna.defense.entity.ProcedureJudiciaire;
import com.bna.defense.entity.Affaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProcedureJudiciaireRepository extends JpaRepository<ProcedureJudiciaire, Long> {
    List<ProcedureJudiciaire> findByAffaire(Affaire affaire);
    List<ProcedureJudiciaire> findByAffaire_Id(Long affaireId);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM ProcedureJudiciaire p WHERE " +
            "((:isSuper = true) OR " +
            "(p.creator.id = :userId) OR " +
            "(p.creator IS NULL AND p.createdBy = :username) OR " +
            "(:isPreVal = true AND p.affaire.dossier.assignedCharge.manager.id = :userId)) " +
            "AND (:searchTerm IS NULL OR p.titre LIKE :searchTerm OR p.description LIKE :searchTerm) " +
            "AND (:type IS NULL OR p.type = :type) " +
            "AND (:statut IS NULL OR p.statut = :statut)")
    org.springframework.data.domain.Page<ProcedureJudiciaire> findAllPaginated(
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("username") String username,
            @org.springframework.data.repository.query.Param("isSuper") boolean isSuper,
            @org.springframework.data.repository.query.Param("isPreVal") boolean isPreVal,
            @org.springframework.data.repository.query.Param("searchTerm") String searchTerm,
            @org.springframework.data.repository.query.Param("type") ProcedureJudiciaire.TypeProcedure type,
            @org.springframework.data.repository.query.Param("statut") ProcedureJudiciaire.StatutProcedure statut,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM ProcedureJudiciaire p JOIN p.affaire a JOIN a.dossier d WHERE d.assignedCharge.manager.id = :managerId")
    List<ProcedureJudiciaire> findAllForManager(@org.springframework.data.repository.query.Param("managerId") Long managerId);

    List<ProcedureJudiciaire> findByStatut(ProcedureJudiciaire.StatutProcedure statut);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM ProcedureJudiciaire p WHERE p.affaire.id = :affaireId AND (" +
            "(p.creator.id = :userId) OR " +
            "(p.creator IS NULL AND p.createdBy = :username))")
    List<ProcedureJudiciaire> findByAffaireIdAndVisibleToUser(
            @org.springframework.data.repository.query.Param("affaireId") Long affaireId,
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("username") String username);

    long countByAffaire_Id(Long affaireId);
}
