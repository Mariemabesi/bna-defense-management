package com.bna.defense.service.referentiel;

import com.bna.defense.entity.referentiel.PhaseProcedure;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PhaseProcedureService extends GenericReferentielService<PhaseProcedure, Long> {
}
