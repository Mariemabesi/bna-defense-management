package com.bna.defense.controller;

import com.bna.defense.dto.DashboardStatsDTO;
import com.bna.defense.service.ReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportingController {

    @Autowired
    private ReportingService reportingService;

    @GetMapping("/dashboard-stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CHARGE_DOSSIER') or hasRole('PRE_VALIDATEUR') or hasRole('VALIDATEUR')")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(reportingService.getDashboardStats());
    }
}
