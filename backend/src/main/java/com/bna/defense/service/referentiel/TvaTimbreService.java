package com.bna.defense.service.referentiel;

import com.bna.defense.entity.referentiel.TvaTimbre;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TvaTimbreService extends GenericReferentielService<TvaTimbre, Long> {
}
