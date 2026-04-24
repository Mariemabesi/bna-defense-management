package com.bna.defense.repository;

import com.bna.defense.entity.ProcedureJudiciaire;
import com.bna.defense.entity.Affaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProcedureJudiciaireRepository extends JpaRepository<ProcedureJudiciaire, Long> {
    List<ProcedureJudiciaire> findByAffaire(Affaire affaire);
    List<ProcedureJudiciaire> findByAffaire_Id(Long affaireId);
    
    @org.springframework.data.jpa.repository.Query("SELECT p FROM ProcedureJudiciaire p WHERE p.creator.id = :userId OR (p.creator IS NULL AND p.createdBy = :username)")
    List<ProcedureJudiciaire> findAllVisibleToUser(Long userId, String username);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM ProcedureJudiciaire p WHERE p.affaire.id = :affaireId AND (p.creator.id = :userId OR (p.creator IS NULL AND p.createdBy = :username))")
    List<ProcedureJudiciaire> findByAffaireIdAndVisibleToUser(Long affaireId, Long userId, String username);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM ProcedureJudiciaire p JOIN p.affaire a JOIN a.dossier d WHERE d.assignedCharge.manager.id = :managerId")
    List<ProcedureJudiciaire> findAllForManager(@org.springframework.data.repository.query.Param("managerId") Long managerId);

    List<ProcedureJudiciaire> findByStatut(ProcedureJudiciaire.StatutProcedure statut);
    long countByAffaire_Id(Long affaireId);
}
