package com.bna.defense.service.referentiel;

import com.bna.defense.entity.referentiel.NatureAffaire;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NatureAffaireService extends GenericReferentielService<NatureAffaire, Long> {
}
