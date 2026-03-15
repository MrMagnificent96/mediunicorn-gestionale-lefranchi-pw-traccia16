package com.lefranchi.projectworkertraccia16.model;

import jakarta.persistence.*;

@Entity
@Table(name = "prestazioni")
public class Prestazione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String specializzazione; // Es. "Cardiologia", "Ortopedia"

    @Column(nullable = false)
    private String nomeVisita; // Es. "Visita Cardiologica di Controllo", "Elettrocardiogramma"

    @Column(nullable = false)
    private Double prezzo; // Il prezzo nudo e crudo (React poi aggiungerà i 2€ di bollo)

    public Prestazione() {}

    public Prestazione(String specializzazione, String nomeVisita, Double prezzo) {
        this.specializzazione = specializzazione;
        this.nomeVisita = nomeVisita;
        this.prezzo = prezzo;
    }

    // --- GETTER E SETTER ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSpecializzazione() { return specializzazione; }
    public void setSpecializzazione(String specializzazione) { this.specializzazione = specializzazione; }

    public String getNomeVisita() { return nomeVisita; }
    public void setNomeVisita(String nomeVisita) { this.nomeVisita = nomeVisita; }

    public Double getPrezzo() { return prezzo; }
    public void setPrezzo(Double prezzo) { this.prezzo = prezzo; }
}
