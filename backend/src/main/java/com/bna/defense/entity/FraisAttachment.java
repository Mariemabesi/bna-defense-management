package com.bna.defense.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "frais_attachments")
public class FraisAttachment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "frais_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference
    private Frais frais;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String originalName;

    @Column(nullable = false)
    private String contentType;

    private Long fileSize;

    private LocalDateTime uploadDate;

    public FraisAttachment() {
        this.uploadDate = LocalDateTime.now();
    }

    public Frais getFrais() { return frais; }
    public void setFrais(Frais frais) { this.frais = frais; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getOriginalName() { return originalName; }
    public void setOriginalName(String originalName) { this.originalName = originalName; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }
}
