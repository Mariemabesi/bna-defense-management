package com.bna.defense.repository;

import com.bna.defense.entity.PartieLitige;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface PartieLitigeRepository extends JpaRepository<PartieLitige, Long> {
    
    @Query("SELECT p FROM PartieLitige p WHERE " +
           "(p.nom LIKE %:search% OR p.prenom LIKE %:search% OR " +
           "p.identifiantFiscal LIKE %:search% OR p.cin LIKE %:search%) " +
           "AND (:type IS NULL OR p.type = :type)")
    Page<PartieLitige> searchParties(@Param("search") String search, 
                                     @Param("type") PartieLitige.TypePartie type, 
                                     Pageable pageable);
}
