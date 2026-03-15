package com.lefranchi.projectworkertraccia16.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "prenotazioni")
public class Prenotazione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- DATI DELLA VISITA ---
    @Column(name = "data_ora", nullable = false)
    private LocalDateTime dataOra;

    @Column(nullable = false, length = 20)
    private String stato; // "DA_REFERTARE", "COMPLETATA"

    @Column(nullable = false)
    private Double prezzoFinale; // Prezzo prestazione + 2€ marca da bollo

    // Relazioni (Creeremo questi Model nel prossimo step)
    @ManyToOne
    @JoinColumn(name = "sede_id", nullable = false)
    private Sede sede;

    @ManyToOne
    @JoinColumn(name = "prestazione_id", nullable = false)
    private Prestazione prestazione;

    @ManyToOne
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    // --- DATI ANAGRAFICI DEL PAZIENTE (Integrati nella prenotazione) ---
    @Column(nullable = false, length = 50)
    private String nome;

    @Column(nullable = false, length = 50)
    private String cognome;

    @Column(name = "data_nascita", nullable = false)
    private LocalDate dataNascita;

    @Column(name = "codice_fiscale", nullable = false, length = 16)
    private String codiceFiscale;

    @Column(nullable = false)
    private String indirizzo;

    @Column(nullable = false)
    private String statoAppartenenza;

    @Column(nullable = false)
    private String provincia;

    @Column(nullable = false)
    private String comune;

    @Column(nullable = false, length = 10)
    private String cap;

    // Contatti (La logica "almeno uno" la gestiremo nel Controller)
    private String cellulare;
    private String telefonoFisso;
    private String email;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "consenso_privacy", nullable = false)
    private Boolean consensoPrivacy;

    // --- GETTER E SETTER ---
    public LocalDateTime getDataOra() {
        return dataOra;
    }

    public void setDataOra(LocalDateTime dataOra) {
        this.dataOra = dataOra;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStato() {
        return stato;
    }

    public void setStato(String stato) {
        this.stato = stato;
    }

    public Double getPrezzoFinale() {
        return prezzoFinale;
    }

    public void setPrezzoFinale(Double prezzoFinale) {
        this.prezzoFinale = prezzoFinale;
    }

    public Sede getSede() {
        return sede;
    }

    public void setSede(Sede sede) {
        this.sede = sede;
    }

    public Prestazione getPrestazione() {
        return prestazione;
    }

    public void setPrestazione(Prestazione prestazione) {
        this.prestazione = prestazione;
    }

    public Medico getMedico() {
        return medico;
    }

    public void setMedico(Medico medico) {
        this.medico = medico;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCognome() {
        return cognome;
    }

    public void setCognome(String cognome) {
        this.cognome = cognome;
    }

    public LocalDate getDataNascita() {
        return dataNascita;
    }

    public void setDataNascita(LocalDate dataNascita) {
        this.dataNascita = dataNascita;
    }

    public String getCodiceFiscale() {
        return codiceFiscale;
    }

    public void setCodiceFiscale(String codiceFiscale) {
        this.codiceFiscale = codiceFiscale;
    }

    public String getIndirizzo() {
        return indirizzo;
    }

    public void setIndirizzo(String indirizzo) {
        this.indirizzo = indirizzo;
    }

    public String getStatoAppartenenza() {
        return statoAppartenenza;
    }

    public void setStatoAppartenenza(String statoAppartenenza) {
        this.statoAppartenenza = statoAppartenenza;
    }

    public String getProvincia() {
        return provincia;
    }

    public void setProvincia(String provincia) {
        this.provincia = provincia;
    }

    public String getComune() {
        return comune;
    }

    public void setComune(String comune) {
        this.comune = comune;
    }

    public String getCap() {
        return cap;
    }

    public void setCap(String cap) {
        this.cap = cap;
    }

    public String getCellulare() {
        return cellulare;
    }

    public void setCellulare(String cellulare) {
        this.cellulare = cellulare;
    }

    public String getTelefonoFisso() {
        return telefonoFisso;
    }

    public void setTelefonoFisso(String telefonoFisso) {
        this.telefonoFisso = telefonoFisso;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Boolean getConsensoPrivacy() {
        return consensoPrivacy;
    }

    public void setConsensoPrivacy(Boolean consensoPrivacy) {
        this.consensoPrivacy = consensoPrivacy;
    }
}
