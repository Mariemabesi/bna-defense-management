package com.bna.defense.service.referentiel;

import com.bna.defense.entity.referentiel.TypeProcedure;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TypeProcedureService extends GenericReferentielService<TypeProcedure, Long> {
}
