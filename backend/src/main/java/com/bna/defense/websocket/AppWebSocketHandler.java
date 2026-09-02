package com.bna.defense.websocket;

import com.bna.defense.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AppWebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(AppWebSocketHandler.class);

    // Keep track of active WebSocket sessions by Username
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String query = session.getUri().getQuery();
        String token = null;
        if (query != null && query.contains("token=")) {
            token = query.split("token=")[1].split("&")[0];
        }

        if (token != null && jwtUtils.validateJwtToken(token)) {
            String username = jwtUtils.getUserNameFromJwtToken(token);
            session.getAttributes().put("username", username);
            sessions.put(username, session);
            logger.info("WebSocket connection established for user: {}", username);
        } else {
            logger.warn("WebSocket connection attempt failed: invalid token.");
            session.close(CloseStatus.BAD_DATA);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String username = (String) session.getAttributes().get("username");
        if (username != null) {
            sessions.remove(username);
            logger.info("WebSocket connection closed for user: {}", username);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        if ("PING".equalsIgnoreCase(payload)) {
            session.sendMessage(new TextMessage("PONG"));
        }
    }

    public boolean sendToUser(String username, String payload) {
        WebSocketSession session = sessions.get(username);
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(payload));
                return true;
            } catch (IOException e) {
                logger.error("Error sending WebSocket message to user: {}", username, e);
            }
        }
        return false;
    }

    public void broadcast(String payload) {
        sessions.forEach((username, session) -> {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(payload));
                } catch (IOException e) {
                    logger.error("Error broadcasting WebSocket message to user: {}", username, e);
                }
            }
        });
    }
}
