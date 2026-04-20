package com.bna.defense.service.referentiel;

import com.bna.defense.entity.referentiel.CourAppel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CourAppelService extends GenericReferentielService<CourAppel, Long> {
}
