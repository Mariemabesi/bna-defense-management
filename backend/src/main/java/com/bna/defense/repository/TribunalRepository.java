package com.bna.defense.repository;

import com.bna.defense.entity.Tribunal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TribunalRepository extends JpaRepository<Tribunal, Long> {
    List<Tribunal> findByRegion(String region);
    List<Tribunal> findByNomContainingIgnoreCase(String nom);
}
