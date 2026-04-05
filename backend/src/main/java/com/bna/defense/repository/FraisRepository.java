package com.bna.defense.repository;

import com.bna.defense.entity.Frais;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface FraisRepository extends JpaRepository<Frais, Long> {

    @Query("SELECT f FROM Frais f JOIN FETCH f.affaire a JOIN FETCH a.dossier d")
    List<Frais> findAllWithAffaire();

    List<Frais> findByStatut(Frais.StatutFrais statut);

    @Query("SELECT f FROM Frais f JOIN FETCH f.affaire a JOIN FETCH a.dossier d WHERE d.id = :dossierId")
    List<Frais> findByDossierId(@Param("dossierId") Long dossierId);

    @Query("SELECT COALESCE(SUM(f.montantTtc), 0.0) FROM Frais f JOIN f.affaire a WHERE a.dossier.id = :dossierId")
    BigDecimal sumMontantTtcByDossierId(@Param("dossierId") Long dossierId);
}
