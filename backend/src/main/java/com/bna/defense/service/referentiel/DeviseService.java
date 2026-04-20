package com.bna.defense.service.referentiel;

import com.bna.defense.entity.referentiel.Devise;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DeviseService extends GenericReferentielService<Devise, Long> {
}
