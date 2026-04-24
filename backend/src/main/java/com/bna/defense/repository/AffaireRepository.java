package com.bna.defense.repository;

import com.bna.defense.entity.Affaire;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AffaireRepository extends JpaRepository<Affaire, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"dossier", "dossier.assignedCharge", "adversaire", "avocat", "tribunal", "procedures"})
    List<Affaire> findAll();

    List<Affaire> findByDossier_Id(Long dossierId);
    List<Affaire> findByTribunal_Id(Long tribunalId);
    List<Affaire> findByAvocat_Id(Long avocatId);
    List<Affaire> findByHuissier_Id(Long huissierId);
    List<Affaire> findByExpert_Id(Long expertId);
}
