package com.bna.defense.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class WebSocketService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketService.class);

    @Autowired
    private AppWebSocketHandler webSocketHandler;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void sendChatMessage(String receiverUsername, Long senderId, String senderName, String content) {
        try {
            Map<String, Object> payload = Map.of(
                "type", "CHAT",
                "data", Map.of(
                    "senderId", senderId,
                    "senderName", senderName,
                    "content", content,
                    "timestamp", new java.util.Date()
                )
            );
            String json = objectMapper.writeValueAsString(payload);
            webSocketHandler.sendToUser(receiverUsername, json);
        } catch (Exception e) {
            logger.error("Failed to send WebSocket chat message", e);
        }
    }

    public void sendNotification(String receiverUsername, Long notifId, String message, String notifType) {
        try {
            Map<String, Object> payload = Map.of(
                "type", "NOTIFICATION",
                "data", Map.of(
                    "id", notifId,
                    "message", message,
                    "type", notifType,
                    "timestamp", new java.util.Date(),
                    "read", false
                )
            );
            String json = objectMapper.writeValueAsString(payload);
            webSocketHandler.sendToUser(receiverUsername, json);
        } catch (Exception e) {
            logger.error("Failed to send WebSocket notification", e);
        }
    }

    public void sendGlobalAlert(String message, String alertType) {
        try {
            Map<String, Object> payload = Map.of(
                "type", "ALERT",
                "data", Map.of(
                    "message", message,
                    "type", alertType,
                    "timestamp", new java.util.Date()
                )
            );
            String json = objectMapper.writeValueAsString(payload);
            webSocketHandler.broadcast(json);
        } catch (Exception e) {
            logger.error("Failed to broadcast WebSocket global alert", e);
        }
    }

    public void broadcastAuditLog(com.bna.defense.entity.AuditLog auditLog) {
        try {
            Map<String, Object> payload = Map.of(
                "type", "AUDIT_LOG",
                "data", Map.of(
                    "id", auditLog.getId() != null ? auditLog.getId() : 0L,
                    "userEmail", auditLog.getUserEmail() != null ? auditLog.getUserEmail() : "",
                    "action", auditLog.getAction() != null ? auditLog.getAction() : "",
                    "entityName", auditLog.getEntityName() != null ? auditLog.getEntityName() : "",
                    "entityId", auditLog.getEntityId() != null ? auditLog.getEntityId() : 0L,
                    "details", auditLog.getDetails() != null ? auditLog.getDetails() : "",
                    "timestamp", new java.util.Date()
                )
            );
            String json = objectMapper.writeValueAsString(payload);
            webSocketHandler.broadcast(json);
        } catch (Exception e) {
            logger.error("Failed to broadcast WebSocket audit log", e);
        }
    }
}
