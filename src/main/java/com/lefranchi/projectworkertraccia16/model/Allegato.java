package com.lefranchi.projectworkertraccia16.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "allegati_referto")
public class Allegato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeFile;

    @Column(nullable = false)
    private String tipoFile; // es. application/pdf, image/jpeg

    @Lob // Dice a Postgres di usare un tipo di dato "Large Object" (bytea)
    @Column(nullable = false)
    private byte[] dati;

    @ManyToOne
    @JoinColumn(name = "referto_id", nullable = false)
    @JsonIgnore // Evita loop infiniti quando Spring restituisce il JSON
    private Referto referto;

    public Allegato() {}

    public Allegato(String nomeFile, String tipoFile, byte[] dati, Referto referto) {
        this.nomeFile = nomeFile;
        this.tipoFile = tipoFile;
        this.dati = dati;
        this.referto = referto;
    }

    // --- GETTER E SETTER ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNomeFile() { return nomeFile; }
    public void setNomeFile(String nomeFile) { this.nomeFile = nomeFile; }
    public String getTipoFile() { return tipoFile; }
    public void setTipoFile(String tipoFile) { this.tipoFile = tipoFile; }
    public byte[] getDati() { return dati; }
    public void setDati(byte[] dati) { this.dati = dati; }
    public Referto getReferto() { return referto; }
    public void setReferto(Referto referto) { this.referto = referto; }
}
