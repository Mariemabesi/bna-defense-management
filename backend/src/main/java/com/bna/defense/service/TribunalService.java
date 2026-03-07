package com.bna.defense.service;

import com.bna.defense.entity.Tribunal;
import com.bna.defense.repository.TribunalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TribunalService {

    @Autowired
    private TribunalRepository tribunalRepository;

    public List<Tribunal> getAllTribunaux() {
        return tribunalRepository.findAll();
    }

    public Tribunal getTribunalById(Long id) {
        return tribunalRepository.findById(id).orElseThrow(() -> new RuntimeException("Tribunal non trouvé"));
    }

    public Tribunal createTribunal(Tribunal tribunal) {
        return tribunalRepository.save(tribunal);
    }

    public Tribunal updateTribunal(Long id, Tribunal details) {
        Tribunal t = getTribunalById(id);
        t.setNom(details.getNom());
        t.setRegion(details.getRegion());
        t.setAdresse(details.getAdresse());
        t.setTelephone(details.getTelephone());
        return tribunalRepository.save(t);
    }

    public void deleteTribunal(Long id) {
        tribunalRepository.deleteById(id);
    }
}
