package com.bna.defense.service;

import com.bna.defense.entity.*;
import com.bna.defense.repository.*;
import com.bna.defense.dto.DashboardStatsDTO;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ReportingService {

    private final DossierRepository dossierRepository;
    private final FraisRepository fraisRepository;
    private final AuxiliaireRepository auxiliaireRepository;
    private final PartieLitigeRepository partieLitigeRepository;
    private final AffaireRepository affaireRepository;

    public ReportingService(DossierRepository dossierRepository,
            FraisRepository fraisRepository,
            AuxiliaireRepository auxiliaireRepository,
            PartieLitigeRepository partieLitigeRepository,
            AffaireRepository affaireRepository) {
        this.dossierRepository = dossierRepository;
        this.fraisRepository = fraisRepository;
        this.auxiliaireRepository = auxiliaireRepository;
        this.partieLitigeRepository = partieLitigeRepository;
        this.affaireRepository = affaireRepository;
    }

    public byte[] exportDashboardStatsToPdf(User currentUser) {
        try (java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            DashboardStatsDTO stats = getDashboardStats(currentUser);
            com.lowagie.text.Document document = new com.lowagie.text.Document(com.lowagie.text.PageSize.A4);
            com.lowagie.text.pdf.PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font fontTitle = com.lowagie.text.FontFactory
                    .getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 20);
            com.lowagie.text.Font fontSubTitle = com.lowagie.text.FontFactory
                    .getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 14);
            com.lowagie.text.Font fontNormal = com.lowagie.text.FontFactory
                    .getFont(com.lowagie.text.FontFactory.HELVETICA, 11);

            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph(
                    "Analyse Statistique Globale - BNA LegalOps", fontTitle);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(title);
            document.add(new com.lowagie.text.Paragraph("Date du rapport : " + java.time.LocalDateTime.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))));
            document.add(new com.lowagie.text.Chunk("\n"));

            // Section 1: Dossiers
            document.add(new com.lowagie.text.Paragraph("1. État des Dossiers", fontSubTitle));
            com.lowagie.text.pdf.PdfPTable tableDossiers = new com.lowagie.text.pdf.PdfPTable(2);
            tableDossiers.setWidthPercentage(100);
            tableDossiers.setSpacingBefore(10f);
            tableDossiers.addCell("Total des Dossiers");
            tableDossiers.addCell(String.valueOf(stats.getTotalDossiers()));
            tableDossiers.addCell("Dossiers Ouverts / En cours");
            tableDossiers.addCell(String.valueOf(stats.getOpenDossiers()));
            tableDossiers.addCell("Dossiers Clôturés");
            tableDossiers.addCell(String.valueOf(stats.getClosedDossiers()));
            document.add(tableDossiers);

            // Section 2: Finances
            document.add(new com.lowagie.text.Chunk("\n"));
            document.add(new com.lowagie.text.Paragraph("2. Aperçu Financier", fontSubTitle));
            com.lowagie.text.pdf.PdfPTable tableFinances = new com.lowagie.text.pdf.PdfPTable(2);
            tableFinances.setWidthPercentage(100);
            tableFinances.setSpacingBefore(10f);
            tableFinances.addCell("Budget Global Provisionné");
            tableFinances.addCell(stats.getTotalBudgetProvisionne().toString() + " TND");
            tableFinances.addCell("Frais en Attente de Validation");
            tableFinances.addCell(String.valueOf(stats.getTotalFraisPending()));
            tableFinances.addCell("Montant Total en Attente");
            tableFinances.addCell(stats.getTotalFraisAmountPending().toString() + " TND");
            document.add(tableFinances);

            // Section 3: Performance
            document.add(new com.lowagie.text.Chunk("\n"));
            document.add(new com.lowagie.text.Paragraph("3. Performance & Contentieux", fontSubTitle));
            com.lowagie.text.pdf.PdfPTable tablePerformance = new com.lowagie.text.pdf.PdfPTable(2);
            tablePerformance.setWidthPercentage(100);
            tablePerformance.setSpacingBefore(10f);
            tablePerformance.addCell("Taux de Réussite global");
            tablePerformance.addCell(String.format("%.2f%%", stats.getSuccessRate() * 100));
            tablePerformance.addCell("Types de Procédures actifs");
            tablePerformance.addCell(String.valueOf(stats.getTotalProcedures()));
            tablePerformance.addCell("Nombre d'Adversaires");
            tablePerformance.addCell(String.valueOf(stats.getTotalAdversaires()));
            document.add(tablePerformance);

            // Section 4: Réseau
            document.add(new com.lowagie.text.Chunk("\n"));
            document.add(new com.lowagie.text.Paragraph("4. Réseau d'Auxiliaires", fontSubTitle));
            com.lowagie.text.pdf.PdfPTable tableAuxiliaires = new com.lowagie.text.pdf.PdfPTable(2);
            tableAuxiliaires.setWidthPercentage(100);
            tableAuxiliaires.setSpacingBefore(10f);
            tableAuxiliaires.addCell("Nombre d'Avocats conventionnés");
            tableAuxiliaires.addCell(String.valueOf(stats.getTotalAvocats()));
            tableAuxiliaires.addCell("Nombre d'Huissiers");
            tableAuxiliaires.addCell(String.valueOf(stats.getTotalHuissiers()));
            document.add(tableAuxiliaires);

            document.add(new com.lowagie.text.Chunk("\n"));
            com.lowagie.text.Paragraph footer = new com.lowagie.text.Paragraph(
                    "Ce rapport est généré automatiquement par la plateforme BNA LegalOps.", fontNormal);
            footer.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du rapport global PDF: " + e.getMessage());
        }
    }

    public byte[] exportFraisToPdf(java.time.LocalDate startDate, java.time.LocalDate endDate, Long groupeId) {
        try (java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            com.lowagie.text.Document document = new com.lowagie.text.Document(com.lowagie.text.PageSize.A4);
            com.lowagie.text.pdf.PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font fontTitle = com.lowagie.text.FontFactory
                    .getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 18);
            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph("Rapport Filtré des Honoraires - BNA",
                    fontTitle);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(title);
            document.add(new com.lowagie.text.Paragraph("Période: " + (startDate != null ? startDate : "Début") + " au "
                    + (endDate != null ? endDate : "Fin")));
            document.add(new com.lowagie.text.Chunk("\n"));

            com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(5);
            table.setWidthPercentage(100);
            String[] headers = { "Référence", "Libellé", "Type", "Montant", "Statut" };
            for (String h : headers) {
                com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase(h));
                cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                table.addCell(cell);
            }

            List<Frais> list = filterFrais(startDate, endDate, groupeId);
            for (Frais f : list) {
                table.addCell(f.getAffaire().getDossier().getReference());
                table.addCell(f.getLibelle());
                table.addCell(f.getType().toString());
                table.addCell(f.getMontant().toString() + " TND");
                table.addCell(f.getStatut().toString());
            }
            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur PDF: " + e.getMessage());
        }
    }

    public byte[] exportFraisToExcel(java.time.LocalDate startDate, java.time.LocalDate endDate, Long groupeId) {
        try (org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
                java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Frais Filtrés");
            org.apache.poi.ss.usermodel.Row header = sheet.createRow(0);
            String[] headers = { "Référence Dossier", "Libellé", "Type", "Montant (TND)", "Statut", "Date" };
            for (int i = 0; i < headers.length; i++)
                header.createCell(i).setCellValue(headers[i]);

            List<Frais> list = filterFrais(startDate, endDate, groupeId);
            for (int i = 0; i < list.size(); i++) {
                Frais f = list.get(i);
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(f.getAffaire().getDossier().getReference());
                row.createCell(1).setCellValue(f.getLibelle());
                row.createCell(2).setCellValue(f.getType().toString());
                row.createCell(3).setCellValue(f.getMontant().doubleValue());
                row.createCell(4).setCellValue(f.getStatut().toString());
                row.createCell(5).setCellValue(f.getCreatedAt().toString());
            }
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur Excel: " + e.getMessage());
        }
    }

    private List<Frais> filterFrais(java.time.LocalDate start, java.time.LocalDate end, Long gId) {
        return fraisRepository.findAll().stream()
                .filter(f -> start == null
                        || (f.getCreatedAt() != null && !f.getCreatedAt().toLocalDate().isBefore(start)))
                .filter(f -> end == null || (f.getCreatedAt() != null && !f.getCreatedAt().toLocalDate().isAfter(end)))
                .filter(f -> gId == null || (f.getAffaire().getDossier().getGroupValidateur() != null &&
                        f.getAffaire().getDossier().getGroupValidateur().getGroupe() != null &&
                        f.getAffaire().getDossier().getGroupValidateur().getGroupe().getId().equals(gId)))
                .collect(java.util.stream.Collectors.toList());
    }

    public byte[] exportAffaireListToPdf(User currentUser) {
        try (java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            com.lowagie.text.Document document = new com.lowagie.text.Document(com.lowagie.text.PageSize.A4.rotate());
            com.lowagie.text.pdf.PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font fontTitle = com.lowagie.text.FontFactory
                    .getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 18);
            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph("Registre des Affaires Judiciaires - BNA",
                    fontTitle);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(title);
            document.add(
                    new com.lowagie.text.Paragraph("Date d'édition : " + java.time.LocalDateTime.now().toString()));
            document.add(new com.lowagie.text.Chunk("\n"));

            com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(6);
            table.setWidthPercentage(100);
            String[] headers = { "Référence", "Titre", "Type", "Statut", "Dossier Libellé", "Date Ouverture" };
            for (String h : headers) {
                com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase(h));
                cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                table.addCell(cell);
            }

            boolean isSuper = currentUser != null && (currentUser.isSuperValidateur() || currentUser.getRoles().stream()
                    .anyMatch(r -> r.getName() == com.bna.defense.entity.Role.RoleType.ROLE_ADMIN ||
                            r.getName() == com.bna.defense.entity.Role.RoleType.ROLE_SUPER_VALIDATEUR));

            List<Affaire> list = affaireRepository.findAll().stream()
                    .filter(a -> isSuper || (a.getDossier() != null && ((a.getDossier().getAssignedCharge() != null && a
                            .getDossier().getAssignedCharge().getUsername().equalsIgnoreCase(currentUser.getUsername()))
                            ||
                            (a.getDossier().getCreatedBy() != null
                                    && a.getDossier().getCreatedBy().equalsIgnoreCase(currentUser.getUsername()))
                            ||
                            (a.getDossier().getCreatedBy() != null
                                    && a.getDossier().getCreatedBy().equalsIgnoreCase(currentUser.getEmail())))))
                    .collect(java.util.stream.Collectors.toList());

            for (Affaire a : list) {
                table.addCell(a.getReferenceJudiciaire());
                table.addCell(a.getTitre());
                table.addCell(a.getType() != null ? a.getType().toString() : "-");
                table.addCell(a.getStatut() != null ? a.getStatut().toString() : "-");
                table.addCell(a.getDossier() != null ? a.getDossier().getTitre() : "-");
                table.addCell(a.getDateOuverture() != null ? a.getDateOuverture().toString() : "-");
            }
            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur export PDF liste affaires: " + e.getMessage());
        }
    }

    public byte[] exportSingleAffaireToPdf(Long id) {
        Affaire a = affaireRepository.findById(id).orElseThrow();
        try (java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            com.lowagie.text.Document document = new com.lowagie.text.Document(com.lowagie.text.PageSize.A4);
            com.lowagie.text.pdf.PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font fontTitle = com.lowagie.text.FontFactory
                    .getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 22);
            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph("Fiche Individuelle d'Affaire",
                    fontTitle);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(title);
            document.add(new com.lowagie.text.Chunk("\n"));

            com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(2);
            table.setWidthPercentage(100);
            table.addCell("Référence Judiciaire");
            table.addCell(a.getReferenceJudiciaire());
            table.addCell("Titre / Objet");
            table.addCell(a.getTitre());
            table.addCell("Description");
            table.addCell(a.getDescription() != null ? a.getDescription() : "Aucune");
            table.addCell("Type");
            table.addCell(String.valueOf(a.getType()));
            table.addCell("Statut Actuel");
            table.addCell(String.valueOf(a.getStatut()));
            table.addCell("Date d'Ouverture");
            table.addCell(String.valueOf(a.getDateOuverture()));
            table.addCell("Dossier Parent");
            table.addCell(a.getDossier() != null ? a.getDossier().getReference() : "N/A");

            document.add(table);

            if (!a.getProcedures().isEmpty()) {
                document.add(new com.lowagie.text.Paragraph("\nHistorique des Procédures :",
                        com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 14)));
                for (var p : a.getProcedures()) {
                    document.add(new com.lowagie.text.Paragraph(
                            "- " + p.getTitre() + " [" + p.getType() + "] (" + p.getStatut() + ")"));
                }
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur export PDF affaire: " + e.getMessage());
        }
    }

    public DashboardStatsDTO getDashboardStats(User currentUser) {
                boolean isSuper = currentUser != null && (currentUser.isSuperValidateur() || currentUser.isAdmin());

                List<Dossier> dossiers;
                if (isSuper) {
                        dossiers = dossierRepository.findAll();
                } else if (currentUser != null) {
                        boolean isCharge    = currentUser.isChargeDossier();
                        boolean isPreVal    = currentUser.isPreValidateur();
                        boolean isValidateur = currentUser.isValidateur();
                        dossiers = dossierRepository.findAllWithRBAC(
                            currentUser, currentUser.getUsername(),
                            false, isCharge, isPreVal, isValidateur,
                            org.springframework.data.domain.Pageable.unpaged()
                        ).getContent();
                } else {
                        dossiers = java.util.Collections.emptyList();
                }

                java.util.Set<Long> dossierIds = dossiers.stream()
                        .map(Dossier::getId)
                        .collect(Collectors.toSet());

                List<Frais> allFrais = fraisRepository.findAll();
                List<Frais> filteredFrais = allFrais.stream()
                        .filter(f -> isSuper || (f.getAffaire() != null && 
                                               f.getAffaire().getDossier() != null && 
                                               dossierIds.contains(f.getAffaire().getDossier().getId())))
                        .collect(Collectors.toList());

                List<Auxiliaire> auxiliaires = auxiliaireRepository.findAll();
                
                List<Affaire> allAffaires = affaireRepository.findAll();
                List<Affaire> filteredAffaires = allAffaires.stream()
                        .filter(a -> {
                            if (isSuper) return true;
                            if (a.getDossier() == null) return false;
                            Long dId = a.getDossier().getId();
                            return dId != null && dossierIds.contains(dId);
                        })
                        .collect(Collectors.toList());

                long totalDossiers = dossiers.size();
                long openDossiers = dossiers.stream().filter(
                                d -> d.getStatut() == Dossier.StatutDossier.OUVERT
                                                || d.getStatut() == Dossier.StatutDossier.EN_COURS)
                                .count();
                long closedDossiers = dossiers.stream().filter(d -> d.getStatut() == Dossier.StatutDossier.CLOTURE)
                                .count();

                long totalFraisPending = filteredFrais.stream()
                                .filter(f -> f.getStatut() == Frais.StatutFrais.ATTENTE
                                                || f.getStatut() == Frais.StatutFrais.PRE_VALIDE)
                                .count();

                BigDecimal totalFraisAmountPending = filteredFrais.stream()
                                .filter(f -> f.getStatut() == Frais.StatutFrais.ATTENTE
                                                || f.getStatut() == Frais.StatutFrais.PRE_VALIDE)
                                .map(Frais::getMontant)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                long totalAvocats = auxiliaires.stream().filter(a -> a.getType() == Auxiliaire.TypeAuxiliaire.AVOCAT)
                                .count();
                long totalHuissiers = auxiliaires.stream()
                                .filter(a -> a.getType() == Auxiliaire.TypeAuxiliaire.HUISSIER).count();

                long totalProcedures = filteredAffaires.stream().map(Affaire::getType).distinct().count();
                if (totalProcedures == 0)
                        totalProcedures = Affaire.TypeAffaire.values().length; // fallback to enum size

                long totalAdversaires = partieLitigeRepository.count();

                // Success rate calculation
                long finishedAffaires = filteredAffaires.stream().filter(a -> a.getStatut() == Affaire.StatutAffaire.GAGNE
                                || a.getStatut() == Affaire.StatutAffaire.PERDU).count();
                long wonAffaires = filteredAffaires.stream().filter(a -> a.getStatut() == Affaire.StatutAffaire.GAGNE).count();
                double successRate = finishedAffaires > 0 ? (double) wonAffaires / finishedAffaires : 0.0;

                // Total budget
                BigDecimal totalBudgetProvisionne = dossiers.stream()
                                .map(Dossier::getBudgetProvisionne)
                                .filter(b -> b != null)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                DashboardStatsDTO stats = new DashboardStatsDTO();
                stats.setTotalDossiers(totalDossiers);
                stats.setOpenDossiers(openDossiers);
                stats.setClosedDossiers(closedDossiers);
                stats.setTotalFraisPending(totalFraisPending);
                stats.setTotalFraisAmountPending(totalFraisAmountPending);
                stats.setTotalAvocats(totalAvocats);
                stats.setTotalHuissiers(totalHuissiers);
                stats.setTotalProcedures(totalProcedures);
                stats.setTotalAdversaires(totalAdversaires);
                stats.setSuccessRate(successRate);
                stats.setTotalBudgetProvisionne(totalBudgetProvisionne);
                return stats;
        }
}
