package com.lefranchi.projectworkertraccia16.controller;

import com.lefranchi.projectworkertraccia16.dto.StatisticheResponse;
import com.lefranchi.projectworkertraccia16.repository.PrenotazioneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/finanze")
@CrossOrigin(origins = "http://localhost:3000")
public class FinanzeController {

    @Autowired
    private PrenotazioneRepository prenotazioneRepository;

    @GetMapping("/statistiche")
    public StatisticheResponse getStatistiche(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate da,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate a) {

        // Se le date non arrivano, usiamo un range "tampone"
        LocalDateTime inizio = (da != null) ? da.atStartOfDay() : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime fine = (a != null) ? a.atTime(23, 59, 59) : LocalDateTime.of(2099, 12, 31, 23, 59);

        Double incassoTotale = prenotazioneRepository.calcolaIncassoTotaleByDate(inizio, fine);
        Long fattureInSospeso = prenotazioneRepository.contaVisiteInSospesoByDate(inizio, fine);
        Long totaleVisiteEffettuate = prenotazioneRepository.countByDate(inizio, fine);

        return new StatisticheResponse(incassoTotale, fattureInSospeso, totaleVisiteEffettuate);
    }
}
