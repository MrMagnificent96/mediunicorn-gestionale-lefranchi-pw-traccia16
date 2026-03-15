package com.lefranchi.projectworkertraccia16.dto;

public class RefertoRequest {

    private Long prenotazioneId;
    private String testoDiagnosi;

    // --- GETTER E SETTER ---
    public Long getPrenotazioneId() { return prenotazioneId; }
    public void setPrenotazioneId(Long prenotazioneId) { this.prenotazioneId = prenotazioneId; }

    public String getTestoDiagnosi() { return testoDiagnosi; }
    public void setTestoDiagnosi(String testoDiagnosi) { this.testoDiagnosi = testoDiagnosi; }
}