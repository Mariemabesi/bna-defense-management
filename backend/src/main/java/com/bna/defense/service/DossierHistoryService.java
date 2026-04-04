package com.bna.defense.service;

import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.RecentDossier;
import com.bna.defense.entity.User;
import com.bna.defense.repository.DossierRepository;
import com.bna.defense.repository.RecentDossierRepository;
import com.bna.defense.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DossierHistoryService {

    @Autowired private RecentDossierRepository recentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private DossierRepository dossierRepository;

    @Transactional
    public void trackAccess(String username, Long dossierId) {
        User user = userRepository.findByUsername(username).orElse(null);
        Dossier dossier = dossierRepository.findById(dossierId).orElse(null);

        if (user != null && dossier != null) {
            RecentDossier existing = recentRepository.findByUserAndDossier(user, dossier).orElse(null);
            if (existing != null) {
                existing.setAccessedAt(LocalDateTime.now());
                recentRepository.save(existing);
            } else {
                RecentDossier recent = new RecentDossier();
                recent.setUser(user);
                recent.setDossier(dossier);
                recent.setAccessedAt(LocalDateTime.now());
                recentRepository.save(recent);
            }
        }
    }

    public List<Dossier> getRecentDossiers(String username) {
        return userRepository.findByUsername(username)
                .map(user -> recentRepository.findLastConsulted(user, PageRequest.of(0, 5)))
                .orElse(List.of());
    }
}
