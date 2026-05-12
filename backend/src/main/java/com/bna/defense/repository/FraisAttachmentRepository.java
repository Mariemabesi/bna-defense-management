package com.bna.defense.repository;

import com.bna.defense.entity.FraisAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FraisAttachmentRepository extends JpaRepository<FraisAttachment, Long> {
}
