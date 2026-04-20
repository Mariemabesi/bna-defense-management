package com.bna.defense.service.referentiel;

import com.bna.defense.entity.referentiel.ModeReglement;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ModeReglementService extends GenericReferentielService<ModeReglement, Long> {
}
