package com.bna.defense.service.referentiel;

import com.bna.defense.entity.referentiel.Parquet;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ParquetService extends GenericReferentielService<Parquet, Long> {
}
