package com.bna.defense.service;

import com.bna.defense.dto.search.GlobalSearchResultDTO;
import com.bna.defense.entity.Auxiliaire;
import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.Role;
import com.bna.defense.entity.User;
import com.bna.defense.repository.AuxiliaireRepository;
import com.bna.defense.repository.DossierRepository;
import com.bna.defense.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SearchService {

    private final DossierRepository dossierRepository;
    private final AuxiliaireRepository auxiliaireRepository;
    private final UserRepository userRepository;

    public SearchService(DossierRepository dossierRepository,
                         AuxiliaireRepository auxiliaireRepository,
                         UserRepository userRepository) {
        this.dossierRepository = dossierRepository;
        this.auxiliaireRepository = auxiliaireRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public GlobalSearchResultDTO globalSearch(String query, String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        
        boolean isSuper = isSuper(user);
        boolean isCharge = !isSuper && hasRole(user, Role.RoleType.ROLE_CHARGE_DOSSIER);
        boolean isPreVal = !isSuper && hasRole(user, Role.RoleType.ROLE_PRE_VALIDATEUR);
        boolean isValidateur = !isSuper && hasRole(user, Role.RoleType.ROLE_VALIDATEUR);

        List<Dossier> dossiers = dossierRepository.globalSearchWithRBAC(
            query, user, username, isSuper, isCharge, isPreVal, isValidateur
        );

        List<Auxiliaire> auxiliaires = auxiliaireRepository.searchAuxiliaires(query);

        return new GlobalSearchResultDTO(dossiers, auxiliaires);
    }

    private boolean hasRole(User user, Role.RoleType roleType) {
        return user.getRoles().stream().anyMatch(r -> r.getName() == roleType);
    }

    private boolean isSuper(User user) {
        return user.isSuperValidateur()
            || hasRole(user, Role.RoleType.ROLE_ADMIN)
            || hasRole(user, Role.RoleType.ROLE_SUPER_VALIDATEUR);
    }
}
