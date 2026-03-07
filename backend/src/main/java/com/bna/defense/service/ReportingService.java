package com.bna.defense.service;

import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.Frais;
import com.bna.defense.entity.Auxiliaire;
import com.bna.defense.entity.Affaire;
import com.bna.defense.repository.*;
import com.bna.defense.dto.DashboardStatsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ReportingService {

        @Autowired
        private DossierRepository dossierRepository;

        @Autowired
        private FraisRepository fraisRepository;

        @Autowired
        private AuxiliaireRepository auxiliaireRepository;

        @Autowired
        private PartieLitigeRepository partieLitigeRepository;

        @Autowired
        private AffaireRepository affaireRepository;

        public DashboardStatsDTO getDashboardStats() {
                List<Dossier> dossiers = dossierRepository.findAll();
                List<Frais> frais = fraisRepository.findAll();
                List<Auxiliaire> auxiliaires = auxiliaireRepository.findAll();
                List<Affaire> affaires = affaireRepository.findAll();

                long totalDossiers = dossiers.size();
                long openDossiers = dossiers.stream().filter(
                                d -> d.getStatut() == Dossier.StatutDossier.OUVERT
                                                || d.getStatut() == Dossier.StatutDossier.EN_COURS)
                                .count();
                long closedDossiers = dossiers.stream().filter(d -> d.getStatut() == Dossier.StatutDossier.CLOTURE)
                                .count();

                long totalFraisPending = frais.stream()
                                .filter(f -> f.getStatut() == Frais.StatutFrais.ATTENTE
                                                || f.getStatut() == Frais.StatutFrais.PRE_VALIDE)
                                .count();

                BigDecimal totalFraisAmountPending = frais.stream()
                                .filter(f -> f.getStatut() == Frais.StatutFrais.ATTENTE
                                                || f.getStatut() == Frais.StatutFrais.PRE_VALIDE)
                                .map(Frais::getMontant)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                long totalAvocats = auxiliaires.stream().filter(a -> a.getType() == Auxiliaire.TypeAuxiliaire.AVOCAT)
                                .count();
                long totalHuissiers = auxiliaires.stream()
                                .filter(a -> a.getType() == Auxiliaire.TypeAuxiliaire.HUISSIER).count();

                // Dynamic "Procedures" count - using distinct types in DB or just all affaires?
                // Let's use total unique types of current affaires or just size of affaires
                // table
                long totalProcedures = affaires.stream().map(Affaire::getType).distinct().count();
                if (totalProcedures == 0)
                        totalProcedures = Affaire.TypeAffaire.values().length; // fallback to enum size

                long totalAdversaires = partieLitigeRepository.count();

                // Success rate calculation
                long finishedAffaires = affaires.stream().filter(a -> a.getStatut() == Affaire.StatutAffaire.GAGNE
                                || a.getStatut() == Affaire.StatutAffaire.PERDU).count();
                long wonAffaires = affaires.stream().filter(a -> a.getStatut() == Affaire.StatutAffaire.GAGNE).count();
                double successRate = finishedAffaires > 0 ? (double) wonAffaires / finishedAffaires : 0.0;

                // Total budget
                BigDecimal totalBudgetProvisionne = dossiers.stream()
                                .map(Dossier::getBudgetProvisionne)
                                .filter(b -> b != null)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                return DashboardStatsDTO.builder()
                                .totalDossiers(totalDossiers)
                                .openDossiers(openDossiers)
                                .closedDossiers(closedDossiers)
                                .totalFraisPending(totalFraisPending)
                                .totalFraisAmountPending(totalFraisAmountPending)
                                .totalAvocats(totalAvocats)
                                .totalHuissiers(totalHuissiers)
                                .totalProcedures(totalProcedures)
                                .totalAdversaires(totalAdversaires)
                                .successRate(successRate)
                                .totalBudgetProvisionne(totalBudgetProvisionne)
                                .build();
        }
}
