package com.bna.defense.repository;

import com.bna.defense.entity.Frais;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FraisRepository extends JpaRepository<Frais, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT f FROM Frais f JOIN FETCH f.affaire a JOIN FETCH a.dossier d")
    List<Frais> findAllWithAffaire();

    List<Frais> findByStatut(Frais.StatutFrais statut);
}
