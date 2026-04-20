package com.bna.defense.service.referentiel;

import com.bna.defense.entity.referentiel.CourCassation;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CourCassationService extends GenericReferentielService<CourCassation, Long> {
}
