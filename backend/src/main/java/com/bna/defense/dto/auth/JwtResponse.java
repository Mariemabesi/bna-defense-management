package com.bna.defense.dto.auth;

import java.util.List;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private List<String> roles;
    private Long groupeId;
    private boolean isSuperValidateur;
    private String avatarUrl;

    public JwtResponse(String accessToken, Long id, String username, String email, List<String> roles, String avatarUrl, Long groupeId, boolean isSuperValidateur) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
        this.avatarUrl = avatarUrl;
        this.groupeId = groupeId;
        this.isSuperValidateur = isSuperValidateur;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public List<String> getRoles() { return roles; }
    public Long getGroupeId() { return groupeId; }
    public boolean isSuperValidateur() { return isSuperValidateur; }
    public String getAvatarUrl() { return avatarUrl; }
}
