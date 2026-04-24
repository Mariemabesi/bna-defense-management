package com.bna.defense.controller;

import com.bna.defense.dto.DashboardStatsDTO;
import com.bna.defense.entity.Dossier;
import com.bna.defense.entity.User;
import com.bna.defense.repository.UserRepository;
import com.bna.defense.service.DossierService;
import com.bna.defense.service.ExportService;
import com.bna.defense.service.ReportingService;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportingController {

    private final ReportingService reportingService;
    private final UserRepository userRepository;
    private final ExportService exportService;
    private final DossierService dossierService;

    public ReportingController(ReportingService reportingService,
                               UserRepository userRepository,
                               ExportService exportService,
                               DossierService dossierService) {
        this.reportingService = reportingService;
        this.userRepository = userRepository;
        this.exportService = exportService;
        this.dossierService = dossierService;
    }

    @GetMapping("/dashboard/export/pdf")
    public ResponseEntity<byte[]> exportDashboardStatsPdf(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        byte[] data = reportingService.exportDashboardStatsToPdf(user);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename("analyse_statistique_globale.pdf").build());
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @GetMapping("/frais/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) Long groupeId) {
        byte[] data = reportingService.exportFraisToPdf(start, end, groupeId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename("reporting_frais.pdf").build());
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @GetMapping("/frais/export/excel")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) Long groupeId) {
        byte[] data = reportingService.exportFraisToExcel(start, end, groupeId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(ContentDisposition.attachment().filename("reporting_frais.xlsx").build());
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @GetMapping("/dashboard-stats")
    public DashboardStatsDTO getStats(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        return reportingService.getDashboardStats(user);
    }

    @GetMapping("/dossiers/export/pdf")
    public ResponseEntity<byte[]> exportDossiersPdf(Principal principal) {
        try {
            User user = userRepository.findByUsername(principal.getName()).orElseThrow();
            List<Dossier> dossiers = dossierService.getAllDossiers(user, PageRequest.of(0, 500)).getContent();
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
    public ResponseEntity<byte[]> exportDossiersExcel(Principal principal) {
        try {
            User user = userRepository.findByUsername(principal.getName()).orElseThrow();
            List<Dossier> dossiers = dossierService.getAllDossiers(user, PageRequest.of(0, 500)).getContent();
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
