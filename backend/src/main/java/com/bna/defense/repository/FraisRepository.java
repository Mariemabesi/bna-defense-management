package com.bna.defense.repository;

import com.bna.defense.entity.Frais;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FraisRepository extends JpaRepository<Frais, Long> {
    List<Frais> findByStatut(Frais.StatutFrais statut);
}
