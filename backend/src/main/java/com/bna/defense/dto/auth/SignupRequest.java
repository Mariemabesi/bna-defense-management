package com.bna.defense.dto.auth;

import java.util.List;
import jakarta.validation.constraints.*;

public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    private List<String> role;
    private String fullName;
    private Long groupeId;
    private Boolean isSuperValidateur = false;
    private Long auxiliaireId;
    private Long managerId;

    public SignupRequest() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public List<String> getRole() { return role; }
    public void setRole(List<String> role) { this.role = role; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Long getGroupeId() { return groupeId; }
    public void setGroupeId(Long groupeId) { this.groupeId = groupeId; }
    public Boolean getIsSuperValidateur() { return isSuperValidateur; }
    public void setIsSuperValidateur(Boolean isSuperValidateur) { this.isSuperValidateur = isSuperValidateur; }
    public Long getAuxiliaireId() { return auxiliaireId; }
    public void setAuxiliaireId(Long auxiliaireId) { this.auxiliaireId = auxiliaireId; }
    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }
}
