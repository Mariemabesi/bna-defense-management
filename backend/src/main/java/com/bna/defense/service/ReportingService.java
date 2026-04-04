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

    public byte[] exportFraisToPdf(java.time.LocalDate startDate, java.time.LocalDate endDate, Long groupeId) {
        try (java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            com.lowagie.text.Document document = new com.lowagie.text.Document(com.lowagie.text.PageSize.A4);
            com.lowagie.text.pdf.PdfWriter.getInstance(document, out);
            document.open();
            
            com.lowagie.text.Font fontTitle = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 18);
            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph("Rapport Filtré des Honoraires - BNA", fontTitle);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(title);
            document.add(new com.lowagie.text.Paragraph("Période: " + (startDate != null ? startDate : "Début") + " au " + (endDate != null ? endDate : "Fin")));
            document.add(new com.lowagie.text.Chunk("\n"));

            com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(5);
            table.setWidthPercentage(100);
            String[] headers = {"Référence", "Libellé", "Type", "Montant", "Statut"};
            for(String h : headers) {
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
            String[] headers = {"Référence Dossier", "Libellé", "Type", "Montant (TND)", "Statut", "Date"};
            for(int i=0; i<headers.length; i++) header.createCell(i).setCellValue(headers[i]);

            List<Frais> list = filterFrais(startDate, endDate, groupeId);
            for(int i=0; i<list.size(); i++) {
                Frais f = list.get(i);
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(i+1);
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
            .filter(f -> start == null || (f.getCreatedAt() != null && !f.getCreatedAt().toLocalDate().isBefore(start)))
            .filter(f -> end == null || (f.getCreatedAt() != null && !f.getCreatedAt().toLocalDate().isAfter(end)))
            .filter(f -> gId == null || (f.getAffaire().getDossier().getGroupValidateur() != null && 
                                       f.getAffaire().getDossier().getGroupValidateur().getGroupe() != null && 
                                       f.getAffaire().getDossier().getGroupValidateur().getGroupe().getId().equals(gId)))
            .collect(java.util.stream.Collectors.toList());
    }

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
