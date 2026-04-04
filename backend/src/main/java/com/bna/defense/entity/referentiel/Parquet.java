package com.bna.defense.entity.referentiel;

import com.bna.defense.entity.BaseEntity;
import com.bna.defense.entity.Tribunal;
import jakarta.persistence.*;

@Entity
@Table(name = "ref_parquets")
public class Parquet extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tribunal_id")
    private Tribunal tribunal;

    @Column(nullable = false)
    private String chefParquet;

    private String telephone;

    private String email;

    public Parquet() {}

    public Tribunal getTribunal() { return tribunal; }
    public void setTribunal(Tribunal tribunal) { this.tribunal = tribunal; }
    public String getChefParquet() { return chefParquet; }
    public void setChefParquet(String chefParquet) { this.chefParquet = chefParquet; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
