package com.bna.defense.service;

import com.bna.defense.entity.Auxiliaire;
import com.bna.defense.repository.AuxiliaireRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AuxiliaireService {

    @Autowired
    private AuxiliaireRepository auxiliaireRepository;

    public List<Auxiliaire> getAllAuxiliaires() {
        return auxiliaireRepository.findAll();
    }

    public Auxiliaire createAuxiliaire(Auxiliaire auxiliaire) {
        return auxiliaireRepository.save(auxiliaire);
    }
}
