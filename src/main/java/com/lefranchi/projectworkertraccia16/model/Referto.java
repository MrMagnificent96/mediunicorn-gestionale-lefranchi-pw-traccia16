package com.lefranchi.projectworkertraccia16.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "referti")
public class Referto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Usiamo columnDefinition = "TEXT" per permettere testi molto lunghi
    @Column(name = "testo_diagnosi", nullable = false, columnDefinition = "TEXT")
    private String testoDiagnosi;

    @Column(name = "data_emissione", nullable = false)
    private LocalDate dataEmissione;

    // Relazione Uno-a-Uno: Ogni referto è associato a una e una sola prenotazione (visita)
    @OneToOne
    @JoinColumn(name = "prenotazione_id", nullable = false, unique = true)
    private Prenotazione prenotazione;

    public Referto() {}

    public Referto(String testoDiagnosi, LocalDate dataEmissione, Prenotazione prenotazione) {
        this.testoDiagnosi = testoDiagnosi;
        this.dataEmissione = dataEmissione;
        this.prenotazione = prenotazione;
    }

    // --- GETTER E SETTER ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTestoDiagnosi() { return testoDiagnosi; }
    public void setTestoDiagnosi(String testoDiagnosi) { this.testoDiagnosi = testoDiagnosi; }

    public LocalDate getDataEmissione() { return dataEmissione; }
    public void setDataEmissione(LocalDate dataEmissione) { this.dataEmissione = dataEmissione; }

    public Prenotazione getPrenotazione() { return prenotazione; }
    public void setPrenotazione(Prenotazione prenotazione) { this.prenotazione = prenotazione; }
}
