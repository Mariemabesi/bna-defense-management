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
    public com.bna.defense.dto.DashboardStatsDTO getStats() {
        return reportingService.getDashboardStats();
    }
}

