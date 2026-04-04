package com.bna.defense.service;

import com.bna.defense.entity.AuditLog;
import com.bna.defense.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AuditLogService {
    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(String email, String action, String entityName, Long entityId, String details) {
        AuditLog log = new AuditLog();
        log.setUserEmail(email);
        log.setAction(action);
        log.setEntityName(entityName);
        log.setEntityId(entityId);
        log.setDetails(details);
        auditLogRepository.save(log);
    }

    public List<AuditLog> getHistory(String entityName, Long entityId) {
        return auditLogRepository.findByEntityNameAndEntityIdOrderByTimestampDesc(entityName, entityId);
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop10ByOrderByTimestampDesc();
    }
}
