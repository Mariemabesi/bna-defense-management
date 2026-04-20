package com.bna.defense.service.referentiel;

import com.bna.defense.entity.referentiel.CentreMediation;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CentreMediationService extends GenericReferentielService<CentreMediation, Long> {
}
