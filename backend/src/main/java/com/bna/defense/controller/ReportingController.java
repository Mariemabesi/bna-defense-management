package com.bna.defense.controller;

import com.bna.defense.service.ReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportingController {

    @Autowired
    private ReportingService reportingService;

    @Autowired
    private com.bna.defense.repository.UserRepository userRepository;

    @GetMapping("/dashboard/export/pdf")
    public ResponseEntity<byte[]> exportDashboardStatsPdf(java.security.Principal principal) {
        com.bna.defense.entity.User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        byte[] data = reportingService.exportDashboardStatsToPdf(user);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename("analyse_statistique_globale.pdf").build());
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @GetMapping("/frais/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate start,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate end,
            @RequestParam(required = false) Long groupeId) {
        byte[] data = reportingService.exportFraisToPdf(start, end, groupeId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename("reporting_frais.pdf").build());
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @GetMapping("/frais/export/excel")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate start,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate end,
            @RequestParam(required = false) Long groupeId) {
        byte[] data = reportingService.exportFraisToExcel(start, end, groupeId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(ContentDisposition.attachment().filename("reporting_frais.xlsx").build());
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @GetMapping("/dashboard-stats")
    public com.bna.defense.dto.DashboardStatsDTO getStats(java.security.Principal principal) {
        com.bna.defense.entity.User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        return reportingService.getDashboardStats(user);
    }

    // ── Dossier Exports (Point 9) ──
    @Autowired private com.bna.defense.service.ExportService exportService;
    @Autowired private com.bna.defense.service.DossierService dossierService;

    @GetMapping("/dossiers/export/pdf")
    public ResponseEntity<byte[]> exportDossiersPdf(java.security.Principal principal) {
        try {
            com.bna.defense.entity.User user = userRepository.findByUsername(principal.getName()).orElseThrow();
            java.util.List<com.bna.defense.entity.Dossier> dossiers =
                dossierService.getAllDossiers(user, org.springframework.data.domain.PageRequest.of(0, 500)).getContent();
            byte[] data = exportService.exportDossiersPdf(user, dossiers);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment().filename("dossiers_bna.pdf").build());
            return new ResponseEntity<>(data, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/dossiers/export/excel")
    public ResponseEntity<byte[]> exportDossiersExcel(java.security.Principal principal) {
        try {
            com.bna.defense.entity.User user = userRepository.findByUsername(principal.getName()).orElseThrow();
            java.util.List<com.bna.defense.entity.Dossier> dossiers =
                dossierService.getAllDossiers(user, org.springframework.data.domain.PageRequest.of(0, 500)).getContent();
            byte[] data = exportService.exportDossiersExcel(user, dossiers);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDisposition(ContentDisposition.attachment().filename("dossiers_bna.xlsx").build());
            return new ResponseEntity<>(data, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

