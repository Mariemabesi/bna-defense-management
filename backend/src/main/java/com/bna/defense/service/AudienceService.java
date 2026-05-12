package com.bna.defense.service;

import com.bna.defense.entity.Audience;
import com.bna.defense.entity.ProcedureJudiciaire;
import com.bna.defense.entity.User;
import com.bna.defense.repository.AudienceRepository;
import com.bna.defense.repository.ProcedureJudiciaireRepository;
import com.bna.defense.repository.UserRepository;
import com.bna.defense.security.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AudienceService {

    private final AudienceRepository audienceRepository;
    private final UserRepository userRepository;
    private final ProcedureJudiciaireRepository procedureRepository;

    public AudienceService(AudienceRepository audienceRepository, 
                           UserRepository userRepository,
                           ProcedureJudiciaireRepository procedureRepository) {
        this.audienceRepository = audienceRepository;
        this.userRepository = userRepository;
        this.procedureRepository = procedureRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            return userRepository.findById(((UserDetailsImpl) principal).getId()).orElse(null);
        }
        return userRepository.findByUsername(auth.getName()).orElse(null);
    }

    public Audience saveAudience(Audience audience) {
        User user = getCurrentUser();
        
        // Ensure the full procedure entity is loaded (including Affaire -> Dossier) for access checks
        if (audience.getProcedure() != null && audience.getProcedure().getId() != null) {
            ProcedureJudiciaire fullProc = procedureRepository.findById(audience.getProcedure().getId())
                    .orElseThrow(() -> new RuntimeException("Procédure non trouvée."));
            audience.setProcedure(fullProc);
        }

        if (audience.getProcedure() != null && !canAccessAudience(audience, user)) {
            throw new RuntimeException("Access Denied: You cannot create/update audiences for this dossier.");
        }
        return audienceRepository.save(audience);
    }


    public List<Audience> getByProcedure(ProcedureJudiciaire procedure) {
        User user = getCurrentUser();
        
        // Resolve full procedure for visibility check
        if (procedure.getId() != null && procedure.getAffaire() == null) {
            procedure = procedureRepository.findById(procedure.getId()).orElse(procedure);
        }

        if (user != null && user.isChargeDossier()) {
             // Check if procedure belongs to user's dossier
             if (procedure.getAffaire() != null && procedure.getAffaire().getDossier() != null) {
                 User assigned = procedure.getAffaire().getDossier().getAssignedCharge();
                 if (assigned == null || !assigned.getId().equals(user.getId())) {
                     return java.util.Collections.emptyList();
                 }
             }
        }
        return audienceRepository.findByProcedureOrderByDateHeureAsc(procedure);
    }




    public Optional<Audience> getAudienceById(Long id) {
        return audienceRepository.findById(id).map(a -> {
            if (!canAccessAudience(a, getCurrentUser())) {
                return null;
            }
            return a;
        });
    }

    public void deleteAudience(Long id) {
        audienceRepository.findById(id).ifPresent(a -> {
            if (canAccessAudience(a, getCurrentUser())) {
                audienceRepository.delete(a);
            } else {
                throw new RuntimeException("Access Denied: You cannot delete this audience.");
            }
        });
    }


    public List<Audience> getAllAudiences() {
        User user = getCurrentUser();
        if (user != null) {
            if (user.isChargeDossier()) {
                return audienceRepository.findAllByAssignedCharge(user);
            }
            if (user.isPreValidateur()) {
                return audienceRepository.findAllForManager(user.getId());
            }
        }
        return audienceRepository.findAll();
    }

    public Map<String, Object> getAudienceStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endOfWeek = now.plusDays(7);
        LocalDateTime in48h = now.plusHours(48);

        User user = getCurrentUser();
        List<Audience> thisWeek;
        List<Audience> urgent;
        Audience next;

        if (user != null && user.isChargeDossier()) {
            thisWeek = audienceRepository.findByDateHeureBetweenAndAssignedCharge(now, endOfWeek, user);
            urgent = audienceRepository.findByDateHeureBetweenAndAssignedCharge(now, in48h, user);
            List<Audience> nextList = audienceRepository.findNextByAssignedCharge(now, user);
            next = nextList.isEmpty() ? null : nextList.get(0);
        } else if (user != null && user.isPreValidateur()) {
            thisWeek = audienceRepository.findByDateHeureBetweenAndManager(now, endOfWeek, user.getId());
            urgent = audienceRepository.findByDateHeureBetweenAndManager(now, in48h, user.getId());
            List<Audience> nextList = audienceRepository.findNextForManager(now, user.getId());
            next = nextList.isEmpty() ? null : nextList.get(0);
        } else {
            thisWeek = audienceRepository.findByDateHeureBetweenOrderByDateHeureAsc(now, endOfWeek);
            urgent = audienceRepository.findByDateHeureBetweenOrderByDateHeureAsc(now, in48h);
            next = audienceRepository.findFirstByDateHeureAfterOrderByDateHeureAsc(now).orElse(null);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("countThisWeek", thisWeek.size());
        stats.put("countUrgent", urgent.size());
        stats.put("nextAudience", next);
        return stats;
    }

    public boolean canAccessAudience(Audience audience, User user) {
        if (user == null) return false;
        if (user.isAdmin() || user.isValidateur() || user.isSuperValidateur()) return true;

        if (user.isPreValidateur()) {
            return audience.getProcedure() != null && 
                   audience.getProcedure().getAffaire() != null && 
                   audience.getProcedure().getAffaire().getDossier() != null &&
                   audience.getProcedure().getAffaire().getDossier().getAssignedCharge() != null &&
                   audience.getProcedure().getAffaire().getDossier().getAssignedCharge().getManager() != null &&
                   audience.getProcedure().getAffaire().getDossier().getAssignedCharge().getManager().getId().equals(user.getId());
        }

        if (user.isChargeDossier()) {
            if (audience.getProcedure() != null && 
                audience.getProcedure().getAffaire() != null && 
                audience.getProcedure().getAffaire().getDossier() != null) {
                User assignedCharge = audience.getProcedure().getAffaire().getDossier().getAssignedCharge();
                return assignedCharge != null && assignedCharge.getId().equals(user.getId());
            }
        }
        return false;
    }
}
