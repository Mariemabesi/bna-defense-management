package com.bna.defense.service.referentiel;

import com.bna.defense.entity.Tribunal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("tribunalReferentielService")
@Transactional
public class TribunalService extends GenericReferentielService<Tribunal, Long> {
}
