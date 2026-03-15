package com.lefranchi.projectworkertraccia16.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class PrenotazioneRequest {

    // Dati Visita
    private Long sedeId;
    private Long prestazioneId;
    private Long medicoId; // Sarà null se l'utente sceglie "Nessuna preferenza"
    private LocalDate dataVisita;
    private LocalTime oraVisita;

    // Dati Paziente
    private String nome;
    private String cognome;
    private LocalDate dataNascita;
    private String codiceFiscale;
    private String indirizzo;
    private String statoAppartenenza;
    private String provincia;
    private String comune;
    private String cap;
    private String cellulare;
    private String telefonoFisso;
    private String email;
    private String note;
    private Boolean consensoPrivacy;

    // --- GETTER E SETTER ---
   public Long getSedeId() {
        return sedeId;
    }

    public void setSedeId(Long sedeId) {
        this.sedeId = sedeId;
    }

    public Long getPrestazioneId() {
        return prestazioneId;
    }

    public void setPrestazioneId(Long prestazioneId) {
        this.prestazioneId = prestazioneId;
    }

    public Long getMedicoId() {
        return medicoId;
    }

    public void setMedicoId(Long medicoId) {
        this.medicoId = medicoId;
    }

    public LocalDate getDataVisita() {
        return dataVisita;
    }

    public void setDataVisita(LocalDate dataVisita) {
        this.dataVisita = dataVisita;
    }

    public LocalTime getOraVisita() {
        return oraVisita;
    }

    public void setOraVisita(LocalTime oraVisita) {
        this.oraVisita = oraVisita;
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