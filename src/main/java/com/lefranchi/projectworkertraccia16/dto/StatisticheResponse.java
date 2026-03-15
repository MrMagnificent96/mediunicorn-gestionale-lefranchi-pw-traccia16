package com.lefranchi.projectworkertraccia16.dto;

public class StatisticheResponse {
    private Double incassoTotale;
    private Long fattureInSospeso;
    private Long totaleVisiteEffettuate;

    public StatisticheResponse(Double incassoTotale, Long fattureInSospeso, Long totaleVisiteEffettuate) {
        // Se non ci sono incassi, il DB potrebbe restituire null. Lo trasformiamo in 0.0 per sicurezza
        this.incassoTotale = incassoTotale != null ? incassoTotale : 0.0;
        this.fattureInSospeso = fattureInSospeso;
        this.totaleVisiteEffettuate = totaleVisiteEffettuate;
    }

    // --- GETTER ---
    public Double getIncassoTotale() { return incassoTotale; }
    public Long getFattureInSospeso() { return fattureInSospeso; }
    public Long getTotaleVisiteEffettuate() { return totaleVisiteEffettuate; }
}
