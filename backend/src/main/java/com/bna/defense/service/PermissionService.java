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

    @Autowired
    private com.bna.defense.repository.FraisRepository fraisRepository;

    public boolean canAccessDossier(Authentication authentication, Long dossierId) {
        User currentUser = getCurrentUser(authentication);
        if (isSuper(currentUser)) return true;

        Dossier dossier = dossierRepository.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier non trouvé"));

        return isOwnerOrManager(currentUser, dossier.getAssignedCharge());
    }

    public boolean canPreValidateFrais(Authentication authentication, Long fraisId) {
        User currentUser = getCurrentUser(authentication);
        if (isSuper(currentUser)) return true;

        // Must be at least a PRE_VALIDATEUR
        if (currentUser.getRoles().stream().noneMatch(r -> 
            r.getName() == com.bna.defense.entity.Role.RoleType.ROLE_PRE_VALIDATEUR ||
            r.getName() == com.bna.defense.entity.Role.RoleType.ROLE_VALIDATEUR)) {
            return false;
        }

        com.bna.defense.entity.Frais frais = fraisRepository.findById(fraisId)
                .orElseThrow(() -> new RuntimeException("Frais non trouvé"));
        
        User assignedCharge = frais.getAffaire().getDossier().getAssignedCharge();
        
        // A Pré-validateur can only pre-validate for their assigned Chargés
        // A Validateur can also pre-validate if they want (they oversee the whole branch)
        return isOwnerOrManager(currentUser, assignedCharge);
    }

    public boolean canValidateFrais(Authentication authentication, Long fraisId) {
        User currentUser = getCurrentUser(authentication);
        if (isSuper(currentUser)) return true;

        // Must be a VALIDATEUR
        if (currentUser.getRoles().stream().noneMatch(r -> 
            r.getName() == com.bna.defense.entity.Role.RoleType.ROLE_VALIDATEUR)) {
            return false;
        }

        com.bna.defense.entity.Frais frais = fraisRepository.findById(fraisId)
                .orElseThrow(() -> new RuntimeException("Frais non trouvé"));
        
        User assignedCharge = frais.getAffaire().getDossier().getAssignedCharge();
        
        // A Validateur can validate for anyone in their hierarchy branch
        return isOwnerOrManager(currentUser, assignedCharge);
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    private boolean isSuper(User user) {
        return user.isSuperValidateur() || user.getRoles().stream().anyMatch(r -> 
            r.getName() == com.bna.defense.entity.Role.RoleType.ROLE_ADMIN ||
            r.getName() == com.bna.defense.entity.Role.RoleType.ROLE_SUPER_VALIDATEUR);
    }

    /**
     * Checks if the currentUser is the subordinate, or the manager, or the manager's manager.
     */
    private boolean isOwnerOrManager(User currentUser, User subordinate) {
        if (subordinate == null) return false;
        
        // Level 0: Same user
        if (subordinate.getId().equals(currentUser.getId())) return true;
        
        // Level 1: Manager
        User manager = subordinate.getManager();
        if (manager != null && manager.getId().equals(currentUser.getId())) return true;
        
        // Level 2: Manager of manager (Validateur oversees Pré-validateur who oversees Chargé)
        if (manager != null && manager.getManager() != null && manager.getManager().getId().equals(currentUser.getId())) {
            return true;
        }
        
        return false;
    }
}
