package com.bna.defense.repository;

import com.bna.defense.entity.PartieLitige;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartieLitigeRepository extends JpaRepository<PartieLitige, Long> {
}
