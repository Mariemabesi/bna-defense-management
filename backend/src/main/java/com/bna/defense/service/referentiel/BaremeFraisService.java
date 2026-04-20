package com.bna.defense.service.referentiel;

import com.bna.defense.entity.referentiel.BaremeFrais;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BaremeFraisService extends GenericReferentielService<BaremeFrais, Long> {
}
