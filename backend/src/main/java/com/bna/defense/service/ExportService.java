package com.bna.defense.service;

import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.User;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {

    private static final Color BNA_GREEN = new Color(0, 98, 51);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private void addLogo(Document document) {
        try (java.io.InputStream is = getClass().getResourceAsStream("/images/cleanly.png")) {
            if (is != null) {
                byte[] bytes = is.readAllBytes();
                Image logo = Image.getInstance(bytes);
                logo.scaleToFit(140, 70);
                logo.setAlignment(Element.ALIGN_CENTER);
                logo.setSpacingAfter(10);
                document.add(logo);
            }
        } catch (Exception e) {
            System.err.println("Could not add PDF logo: " + e.getMessage());
        }
    }

    /**
     * Generate PDF export of dossier list for current user (RBAC-filtered)
     */
    public byte[] exportDossiersPdf(User currentUser, List<Dossier> dossiers) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate(), 30, 30, 50, 50);
        PdfWriter.getInstance(document, baos);
        document.open();

        // Add Logo
        addLogo(document);

        // Header
        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, BNA_GREEN);
        Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
        Font cellFont = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.DARK_GRAY);
        Font subtitleFont = new Font(Font.HELVETICA, 11, Font.ITALIC, Color.GRAY);

        Paragraph title = new Paragraph("Liste des Dossiers Juridiques", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Paragraph subtitle = new Paragraph(
            "Exporté le " + LocalDateTime.now().format(FMT) + " par " + currentUser.getUsername(),
            subtitleFont
        );
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(20);
        document.add(subtitle);

        // Table
        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{ 2.5f, 4f, 2f, 2.5f, 2.5f, 2.5f, 2f });

        String[] headers = { "Référence", "Titre", "Priorité", "Statut", "Frais Initial", "Frais Réel", "Dépassement" };
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(BNA_GREEN);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(8);
            table.addCell(cell);
        }

        Color altRow = new Color(240, 248, 244);
        int rowNum = 0;
        for (Dossier d : dossiers) {
            Color bg = (rowNum++ % 2 == 0) ? Color.WHITE : altRow;
            BigDecimal fraisInitial = d.getFraisInitial() != null ? d.getFraisInitial() : BigDecimal.ZERO;
            BigDecimal fraisReel = d.getFraisReel() != null ? d.getFraisReel() : BigDecimal.ZERO;
            BigDecimal depassement = fraisReel.subtract(fraisInitial);

            addCell(table, d.getReference(), cellFont, bg);
            addCell(table, d.getTitre(), cellFont, bg);
            addCell(table, d.getPriorite() != null ? d.getPriorite().name() : "—", cellFont, bg);
            addCell(table, d.getStatut() != null ? d.getStatut().name() : "—", cellFont, bg);
            addCell(table, formatAmount(fraisInitial), cellFont, bg);
            addCell(table, formatAmount(fraisReel), cellFont, bg);

            Font depFont = depassement.compareTo(BigDecimal.ZERO) > 0
                ? new Font(Font.HELVETICA, 9, Font.BOLD, Color.RED)
                : cellFont;
            PdfPCell depCell = new PdfPCell(new Phrase(
                depassement.compareTo(BigDecimal.ZERO) > 0 ? "+" + formatAmount(depassement) : "—", depFont));
            depCell.setBackgroundColor(bg);
            depCell.setPadding(6);
            table.addCell(depCell);
        }

        document.add(table);
        document.close();
        return baos.toByteArray();
    }

    /**
     * Generate Excel export of dossier list
     */
    public byte[] exportDossiersExcel(User currentUser, List<Dossier> dossiers) throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Dossiers BNA");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);

            // Alt row style
            CellStyle altStyle = workbook.createCellStyle();
            altStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            altStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Red style for depassement
            CellStyle redStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font redFont = workbook.createFont();
            redFont.setBold(true);
            redFont.setColor(IndexedColors.RED.getIndex());
            redStyle.setFont(redFont);

            // Add Logo to Excel
            try (java.io.InputStream is = getClass().getResourceAsStream("/images/cleanly.png")) {
                if (is != null) {
                    byte[] bytes = is.readAllBytes();
                    int pictureIdx = workbook.addPicture(bytes, Workbook.PICTURE_TYPE_PNG);
                    CreationHelper helper = workbook.getCreationHelper();
                    Drawing<?> drawing = sheet.createDrawingPatriarch();
                    ClientAnchor anchor = helper.createClientAnchor();
                    anchor.setCol1(0);
                    anchor.setRow1(0);
                    anchor.setCol2(2);
                    anchor.setRow2(3);
                    Picture pict = drawing.createPicture(anchor, pictureIdx);
                    pict.resize(0.85);
                }
            } catch (Exception e) {
                System.err.println("Could not add Excel logo: " + e.getMessage());
            }

            // Title row at Row 1 (Index 1) and Col 3
            org.apache.poi.ss.usermodel.Row titleRow = sheet.createRow(1);
            Cell titleCell = titleRow.createCell(3);
            titleCell.setCellValue("Liste des Dossiers Juridiques");
            CellStyle titleStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font excelTitleFont = workbook.createFont();
            excelTitleFont.setBold(true);
            excelTitleFont.setFontHeightInPoints((short) 16);
            excelTitleFont.setColor(IndexedColors.DARK_GREEN.getIndex());
            titleStyle.setFont(excelTitleFont);
            titleCell.setCellStyle(titleStyle);

            // Subtitle row at Row 2 (Index 2) and Col 3
            org.apache.poi.ss.usermodel.Row subRow = sheet.createRow(2);
            Cell subCell = subRow.createCell(3);
            subCell.setCellValue("Exporté le " + LocalDateTime.now().format(FMT) + " par " + currentUser.getUsername());
            CellStyle subStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font excelSubFont = workbook.createFont();
            excelSubFont.setItalic(true);
            excelSubFont.setFontHeightInPoints((short) 10);
            excelSubFont.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
            subStyle.setFont(excelSubFont);
            subCell.setCellStyle(subStyle);

            // Header row at Row 4 (Index 4)
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(4);
            String[] cols = { "Référence", "Titre", "Priorité", "Statut", "Chargé", "Frais Initial (TND)", "Frais Réel (TND)", "Dépassement (TND)" };
            for (int i = 0; i < cols.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(cols[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows starting from Row 5
            int rowIdx = 5;
            for (Dossier d : dossiers) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx);
                BigDecimal fraisInitial = d.getFraisInitial() != null ? d.getFraisInitial() : BigDecimal.ZERO;
                BigDecimal fraisReel    = d.getFraisReel() != null ? d.getFraisReel() : BigDecimal.ZERO;
                BigDecimal depassement  = fraisReel.subtract(fraisInitial);

                row.createCell(0).setCellValue(d.getReference());
                row.createCell(1).setCellValue(d.getTitre());
                row.createCell(2).setCellValue(d.getPriorite() != null ? d.getPriorite().name() : "");
                row.createCell(3).setCellValue(d.getStatut() != null ? d.getStatut().name() : "");
                row.createCell(4).setCellValue(d.getAssignedCharge() != null ? d.getAssignedCharge().getUsername() : "");
                row.createCell(5).setCellValue(fraisInitial.doubleValue());
                row.createCell(6).setCellValue(fraisReel.doubleValue());

                Cell depCell = row.createCell(7);
                if (depassement.compareTo(BigDecimal.ZERO) > 0) {
                    depCell.setCellValue(depassement.doubleValue());
                    depCell.setCellStyle(redStyle);
                } else {
                    depCell.setCellValue(0);
                }

                if (rowIdx % 2 == 0) {
                    for (int col = 0; col < 8; col++) {
                        if (row.getCell(col) != null && col != 7) row.getCell(col).setCellStyle(altStyle);
                    }
                }
                rowIdx++;
            }

            // Auto-size columns
            for (int i = 0; i <= 7; i++) sheet.autoSizeColumn(i);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    private void addCell(PdfPTable table, String value, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(value != null ? value : "—", font));
        cell.setBackgroundColor(bg);
        cell.setPadding(6);
        table.addCell(cell);
    }

    private String formatAmount(BigDecimal value) {
        if (value == null) return "0,00";
        return String.format("%,.2f", value).replace(",", " ").replace(".", ",") + " TND";
    }
}
