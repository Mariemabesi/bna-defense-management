package com.bna.defense.service;

import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.User;
import com.bna.defense.repository.DossierRepository;
import com.bna.defense.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("permissionService")
public class PermissionService {

    @Autowired
    private DossierRepository dossierRepository;

    @Autowired
    private UserRepository userRepository;

    public boolean canAccessDossier(Authentication authentication, Long dossierId) {
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (currentUser.isSuperValidateur()) {
            return true;
        }

        Dossier dossier = dossierRepository.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier non trouvé"));

        // Rule 1: Creator can access
        if (dossier.getCreatedBy() != null && dossier.getCreatedBy().equals(username)) {
            return true;
        }

        // Rule 2: Validateur of the group can access
        if (dossier.getGroupValidateur() != null && dossier.getGroupValidateur().getId().equals(currentUser.getId())) {
            return true;
        }

        // Rule 3: Members of the same group can access (if they are assigned to it)
        if (currentUser.getGroupe() != null && dossier.getGroupValidateur() != null) {
            if (currentUser.getGroupe().getValidateur().getId().equals(dossier.getGroupValidateur().getId())) {
                return true;
            }
        }

        return false;
    }
}
