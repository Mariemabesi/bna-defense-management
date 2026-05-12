package com.bna.defense.repository;

import com.bna.defense.entity.Audience;
import com.bna.defense.entity.ProcedureJudiciaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDateTime;
import java.util.Optional;

import com.bna.defense.entity.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AudienceRepository extends JpaRepository<Audience, Long> {
    List<Audience> findByProcedureOrderByDateHeureAsc(ProcedureJudiciaire procedure);
    List<Audience> findByDateHeureBetweenOrderByDateHeureAsc(LocalDateTime start, LocalDateTime end);
    Optional<Audience> findFirstByDateHeureAfterOrderByDateHeureAsc(LocalDateTime now);

    @Query("SELECT a FROM Audience a " +
           "JOIN a.procedure p " +
           "JOIN p.affaire aff " +
           "JOIN aff.dossier d " +
           "WHERE d.assignedCharge = :user " +
           "ORDER BY a.dateHeure ASC")
    List<Audience> findAllByAssignedCharge(@Param("user") User user);

    @Query("SELECT a FROM Audience a " +
           "JOIN a.procedure p " +
           "JOIN p.affaire aff " +
           "JOIN aff.dossier d " +
           "WHERE d.assignedCharge = :user " +
           "AND a.dateHeure BETWEEN :start AND :end " +
           "ORDER BY a.dateHeure ASC")
    List<Audience> findByDateHeureBetweenAndAssignedCharge(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("user") User user);

    @Query("SELECT a FROM Audience a " +
           "JOIN a.procedure p " +
           "JOIN p.affaire aff " +
           "JOIN aff.dossier d " +
           "WHERE d.assignedCharge = :user " +
           "AND a.dateHeure > :now AND a.statut = 'PREVUE' " +
           "ORDER BY a.dateHeure ASC")
    List<Audience> findNextByAssignedCharge(@Param("now") LocalDateTime now, @Param("user") User user);

    @Query("SELECT a FROM Audience a " +
           "JOIN a.procedure p " +
           "JOIN p.affaire aff " +
           "JOIN aff.dossier d " +
           "WHERE d.assignedCharge.manager.id = :managerId " +
           "ORDER BY a.dateHeure ASC")
    List<Audience> findAllForManager(@Param("managerId") Long managerId);

    @Query("SELECT a FROM Audience a " +
           "JOIN a.procedure p " +
           "JOIN p.affaire aff " +
           "JOIN aff.dossier d " +
           "WHERE d.assignedCharge.manager.id = :managerId " +
           "AND a.dateHeure BETWEEN :start AND :end " +
           "ORDER BY a.dateHeure ASC")
    List<Audience> findByDateHeureBetweenAndManager(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("managerId") Long managerId);

    @Query("SELECT a FROM Audience a " +
           "JOIN a.procedure p " +
           "JOIN p.affaire aff " +
           "JOIN aff.dossier d " +
           "WHERE d.assignedCharge.manager.id = :managerId " +
           "AND a.dateHeure > :now AND a.statut = 'PREVUE' " +
           "ORDER BY a.dateHeure ASC")
    List<Audience> findNextForManager(@Param("now") LocalDateTime now, @Param("managerId") Long managerId);
}


